'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Swords, X, Check, Bell, Loader2 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface Challenge {
    id: string;
    fromId: string;
    fromName: string;
    message: string;
    status: 'pending' | 'accepted' | 'declined';
    gameId?: string;
}

export const GlobalGameListener = () => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [incomingChallenge, setIncomingChallenge] = useState<Challenge | null>(null);
    const [guestId, setGuestId] = useState<string | null>(null);
    const { gameId: activeGameId } = useGameStore();

    // 1. Initialize Guest ID
    useEffect(() => {
        if (!typeof window) return;
        let id = localStorage.getItem('guest_id');
        if (!id) {
            id = 'guest-' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('guest_id', id);
        }
        setGuestId(id);
    }, []);

    const myId = session?.user?.id || guestId;

    // 2. Poll for Challenges & Send Heartbeat
    useEffect(() => {
        if (!myId) return;

        const checkStatus = async () => {
            try {
                // A. Heartbeat (Presence)
                // If I am in a game, I am "playing", else "online"
                const isPlaying = !!activeGameId || pathname?.startsWith('/game/');

                await fetch('/api/heartbeat', {
                    method: 'POST',
                    body: JSON.stringify({
                        guestId: !session?.user ? myId : undefined,
                        status: isPlaying ? 'playing' : 'online'
                    })
                });

                // B. Check Challenges
                // Only if NOT currently in a game (unless we want to allow stacking challenges?)
                // For "best in class", we should probably buffer them or show a "Busy" auto-reply on server.
                // But let's fetch them and let the UI decide.
                const res = await fetch(`/api/challenges?toId=${myId}`);
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {
                    const newest = data[0];
                    // Only show if pending
                    if (newest.status === 'pending') {
                        setIncomingChallenge(newest);
                    }
                } else if (incomingChallenge) {
                    // Clear if it disappeared (e.g. cancelled/expired/accepted elsewhere)
                    setIncomingChallenge(null);
                }

            } catch (e) {
                console.error("Global Listener Error:", e);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 3000); // 3s polling
        return () => clearInterval(interval);
    }, [myId, activeGameId, pathname, session]);

    // 3. Handle Challenge Response
    const respond = async (action: 'accept' | 'decline') => {
        if (!incomingChallenge) return;

        // Optimistic UI
        const tempChallenge = incomingChallenge;
        setIncomingChallenge(null);

        try {
            const res = await fetch('/api/challenges', {
                method: 'POST',
                body: JSON.stringify({
                    action,
                    challengeId: tempChallenge.id
                })
            });

            if (action === 'accept') {
                const data = await res.json();
                if (data.gameId) {
                    router.push(`/game/${data.gameId}`);
                }
            }
        } catch (e) {
            console.error(e);
            // Revert on error?
        }
    };

    if (!incomingChallenge) return null;

    // 4. Render Global Notification (Toast/Overlay)
    return (
        <div className="fixed top-20 right-4 z-[9999] animate-in slide-in-from-right duration-300">
            <div className="bg-black/90 border border-neonBlue shadow-[0_0_20px_rgba(0,243,255,0.3)] p-4 rounded-xl w-80 text-white relative overflow-hidden group">
                {/* Decoration */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-neonBlue animate-pulse" />

                <div className="flex items-start gap-3">
                    <div className="bg-neonBlue/20 p-2 rounded-full text-neonBlue">
                        <Swords size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm text-neonBlue uppercase tracking-wider mb-1">
                            Challenge Received!
                        </h4>
                        <p className="text-sm font-bold text-white mb-1">
                            {incomingChallenge.fromName}
                        </p>
                        <p className="text-xs text-gray-400 italic mb-3">
                            "{incomingChallenge.message || 'Let\'s play 3D Four in a Row!'}"
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => respond('accept')}
                                className="flex-1 bg-black hover:bg-gray-900 text-white border border-white font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                                <Check size={14} /> Accept
                            </button>
                            <button
                                onClick={() => respond('decline')}
                                className="flex-1 bg-red-500/20 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/50 font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                                <X size={14} /> Decline
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
