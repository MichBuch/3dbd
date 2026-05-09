'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function Heartbeat() {
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user) return;

        const sendHeartbeat = async () => {
            try {
                await fetch('/api/heartbeat', { method: 'POST' });
            } catch (error) {
                console.error('Heartbeat failed:', error);
            }
        };

        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 90000); // Every 90s — enough for presence tracking

        return () => clearInterval(interval);
    }, [session]);

    return null;
}
