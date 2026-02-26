'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
    // Never run on the server (SSR) — WebSocket connections only work in the browser
    if (typeof window === 'undefined') return null;

    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050', {
            // Start with polling so the HTTP upgrade handshake works correctly,
            // then Socket.IO automatically upgrades to WebSocket.
            transports: ['polling', 'websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socket.on('connect', () => {
            console.log('✅ Socket.IO connected:', socket?.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket.IO disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
        });
    }

    return socket;
}

export function useSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const [socket] = useState(() => getSocket());

    useEffect(() => {
        // SSR guard — socket is null on the server
        if (!socket) return;

        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // Connect if not already connected
        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, [socket]);

    return { socket, isConnected };
}

// Test connection with ping/pong
export function testSocketConnection(): Promise<number> {
    return new Promise((resolve, reject) => {
        const socket = getSocket();
        if (!socket) {
            reject(new Error('Socket not available (server-side)'));
            return;
        }
        const startTime = Date.now();

        socket.once('pong', ({ timestamp }: { timestamp: number }) => {
            const latency = Date.now() - startTime;
            console.log(`🏓 Pong received! Latency: ${latency}ms`);
            resolve(latency);
        });

        socket.emit('ping');

        // Timeout after 5 seconds
        setTimeout(() => {
            reject(new Error('Ping timeout'));
        }, 5000);
    });
}
