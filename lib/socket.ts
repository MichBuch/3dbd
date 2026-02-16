import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

let io: SocketIOServer | null = null;

export async function initializeSocketServer(httpServer: HTTPServer) {
    if (io) return io;

    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            credentials: true
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Redis adapter for horizontal scaling (optional for MVP, critical for production)
    if (process.env.REDIS_URL) {
        try {
            const pubClient = createClient({ url: process.env.REDIS_URL });
            const subClient = pubClient.duplicate();

            await Promise.all([pubClient.connect(), subClient.connect()]);

            io.adapter(createAdapter(pubClient, subClient));
            console.log('✅ Socket.IO using Redis adapter for horizontal scaling');
        } catch (error) {
            console.warn('⚠️  Redis not available, running in single-server mode:', error);
        }
    }

    // Connection handling
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Join game room
        socket.on('join-game', async ({ gameId, userId }) => {
            socket.join(`game:${gameId}`);
            socket.data.gameId = gameId;
            socket.data.userId = userId;

            // Notify other players
            socket.to(`game:${gameId}`).emit('player-joined', { userId });

            console.log(`👤 User ${userId} joined game ${gameId}`);
        });

        // Handle moves
        socket.on('make-move', async ({ gameId, move }) => {
            // Broadcast to all players in the game
            io?.to(`game:${gameId}`).emit('move-made', { move });
        });

        // Handle chat messages
        socket.on('chat-message', async ({ gameId, message }) => {
            io?.to(`game:${gameId}`).emit('chat-message', message);
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

    return io;
}

export function getSocketServer(): SocketIOServer | null {
    return io;
}

// Helper to broadcast game updates
export function broadcastGameUpdate(gameId: string, data: any) {
    if (!io) return;
    io.to(`game:${gameId}`).emit('game-updated', data);
}
