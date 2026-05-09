import { createServer } from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3050', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Track disconnect timers for grace period
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

app.prepare().then(async () => {
    const { db } = await import('./db/index');
    const { games, users } = await import('./db/schema');
    const { eq, and } = await import('drizzle-orm');

    const httpServer = createServer(async (req, res) => {
        try {
            await handle(req, res);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050',
            credentials: true
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Expose io globally so API routes can emit events
    (global as any).io = io;

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // ── Join game room ──────────────────────────────────────────────
        socket.on('join-game', ({ gameId, userId }: { gameId: string; userId: string }) => {
            socket.join(`game:${gameId}`);
            socket.data.gameId = gameId;
            socket.data.userId = userId;

            // Cancel any pending abandon timer for this user/game
            const timerKey = `${gameId}:${userId}`;
            if (disconnectTimers.has(timerKey)) {
                clearTimeout(disconnectTimers.get(timerKey)!);
                disconnectTimers.delete(timerKey);
                console.log(`♻️  Reconnect grace period cancelled for ${userId} in game ${gameId}`);
                // Notify opponent that player reconnected
                socket.to(`game:${gameId}`).emit('player-reconnected', { userId });
            }

            socket.to(`game:${gameId}`).emit('player-joined', { userId, socketId: socket.id });
            console.log(`👤 User ${userId} joined game ${gameId}`);
        });

        // ── Leave game room ─────────────────────────────────────────────
        socket.on('leave-game', ({ gameId }: { gameId: string }) => {
            socket.leave(`game:${gameId}`);
            socket.data.gameId = undefined;
            socket.data.userId = undefined;
            console.log(`� User left game ${gameId}`);
        });

        // ── Real-time move broadcast ────────────────────────────────────
        // API route saves to DB then emits 'game-state-update' via global io.
        // This handler is a fallback for direct client emissions (not used in primary flow).
        socket.on('make-move', ({ gameId, move }: { gameId: string; move: any }) => {
            socket.to(`game:${gameId}`).emit('move-made', { move });
        });

        // ── Real-time chat ──────────────────────────────────────────────
        socket.on('send-chat', ({ gameId, message }: { gameId: string; message: any }) => {
            // Broadcast to everyone in the room including sender
            io.to(`game:${gameId}`).emit('chat-message', message);
        });

        // ── Ping/pong ───────────────────────────────────────────────────
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });

        // ── Disconnect with 30-second grace period ──────────────────────
        socket.on('disconnect', async () => {
            const { gameId, userId } = socket.data;
            if (!gameId || !userId) return;

            console.log(`⚠️  User ${userId} disconnected from game ${gameId} — starting 30s grace period`);

            // Notify opponent immediately so they see the warning
            socket.to(`game:${gameId}`).emit('player-disconnected', { userId });

            const timerKey = `${gameId}:${userId}`;
            const timer = setTimeout(async () => {
                disconnectTimers.delete(timerKey);

                try {
                    const game = await db.query.games.findFirst({
                        where: and(eq(games.id, gameId), eq(games.isFinished, false)),
                        columns: { id: true, whitePlayerId: true, blackPlayerId: true }
                    });

                    if (!game) return;

                    const survivorId = game.whitePlayerId === userId
                        ? game.blackPlayerId
                        : game.whitePlayerId;

                    await db.update(games)
                        .set({
                            isFinished: true,
                            status: 'abandoned',
                            winnerId: survivorId || null,
                            updatedAt: new Date(),
                        })
                        .where(eq(games.id, gameId));

                    console.log(`🏆 Game ${gameId} abandoned. Survivor: ${survivorId}`);

                    io.to(`game:${gameId}`).emit('game-abandoned', {
                        disconnectedUserId: userId,
                        winnerId: survivorId,
                        message: 'Your opponent disconnected. You win!'
                    });
                } catch (err) {
                    console.error('Error persisting disconnect:', err);
                }
            }, 30_000); // 30-second grace period

            disconnectTimers.set(timerKey, timer);
        });
    });

    httpServer
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
            console.log(`> Socket.IO server running`);
        });
});
