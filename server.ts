import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3050', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.IO
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050',
            credentials: true
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Store io instance globally for API routes to access
    (global as any).io = io;

    // Connection handling
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Join game room
        socket.on('join-game', async ({ gameId, userId }) => {
            socket.join(`game:${gameId}`);
            socket.data.gameId = gameId;
            socket.data.userId = userId;

            // Notify other players
            socket.to(`game:${gameId}`).emit('player-joined', { userId, socketId: socket.id });

            console.log(`👤 User ${userId} joined game ${gameId}`);
        });

        // Leave game room
        socket.on('leave-game', ({ gameId }) => {
            socket.leave(`game:${gameId}`);
            console.log(`👋 User left game ${gameId}`);
        });

        // Handle moves (will be validated server-side in Day 2)
        socket.on('make-move', async ({ gameId, move }) => {
            console.log(`🎮 Move in game ${gameId}:`, move);
            // For now, just broadcast - Day 2 will add server validation
            io.to(`game:${gameId}`).emit('move-made', { move });
        });

        // Handle chat messages
        socket.on('chat-message', async ({ gameId, message }) => {
            console.log(`💬 Chat in game ${gameId}:`, message);
            io.to(`game:${gameId}`).emit('chat-message', message);
        });

        // Ping/pong for connection testing
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            const { gameId, userId } = socket.data;
            if (gameId && userId) {
                socket.to(`game:${gameId}`).emit('player-disconnected', { userId });
                console.log(`👋 User ${userId} disconnected from game ${gameId}`);
            }
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
