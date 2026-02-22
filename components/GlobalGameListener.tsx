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
    const [resumeGameId, setResumeGameId] = useState<string | null>(null);
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

    // 1.5. Validate Game State (Prevent Phantom Games)
    useEffect(() => {
        if (!activeGameId) return;

        const validateGame = async () => {
            try {
                const res = await fetch(`/api/games/${activeGameId}`);
                if (res.status === 404) {
                    console.log("👻 Phantom game detected (404). Resetting...");
                    useGameStore.getState().forceReset();
                    return;
                }
                const data = await res.json();
                if (data.isFinished) {
                    console.log("🏁 Game finished on server. Resetting local state...");
                    // Optional: If we want to show the winner, we might NOT want to reset immediately?
                    // BUT user reported "reloads old game on board". 
                    // If it's finished, we should probably clear it or show "Game Over" screen.
                    // If the user is on the HOME page and sees a board, it's a bug.
                    if (!pathname?.startsWith('/game/')) {
                        useGameStore.getState().forceReset();
                    }
                }
            } catch (e) {
                console.error("Game validation failed", e);
            }
        };
        validateGame();
    }, [activeGameId, pathname]);

    // 2. Poll for Challenges & Send Heartbeat
    useEffect(() => {
        if (!myId) return;

        const checkStatus = async () => {
            try {
                // A. Heartbeat (Presence) & Sync Check
                // If I am in a game, I am "playing", else "online"
                const isPlaying = !!activeGameId || pathname?.startsWith('/game/');

                const heartbeatRes = await fetch('/api/heartbeat', {
                    method: 'POST',
                    body: JSON.stringify({
                        guestId: !session?.user ? myId : undefined,
                        status: isPlaying ? 'playing' : 'online'
                    })
                });

                const heartbeatData = await heartbeatRes.json();

                // SYNC ENFORCEMENT: Server says we are in an unfinished game.
                // NEVER force-redirect — show a prompt instead so the user can choose.
                if (heartbeatData.activeGameId) {
                    const targetPath = `/game/${heartbeatData.activeGameId}`;
                    // Don't show prompt if we are already on that page
                    if (pathname !== targetPath && !resumeGameId) {
                        setResumeGameId(heartbeatData.activeGameId);
                    }
                } else {
                    // Server says no active game — clear any stale prompt
                    setResumeGameId(null);
                }

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

    const dismissResume = () => setResumeGameId(null);

    if (!incomingChallenge && !resumeGameId) return null;

    // 4. Render Global Notifications
    return (
        <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3">

            {/* Resume Game Prompt */}
            {resumeGameId && (
                <div className="animate-in slide-in-from-right duration-300 bg-black/90 border border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.2)] p-4 rounded-xl w-80 text-white relative overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-yellow-500" />
                    <div className="flex items-start gap-3">
                        <div className="bg-yellow-500/20 p-2 rounded-full text-yellow-400">
                            <Loader2 size={20} className="animate-spin" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-yellow-400 uppercase tracking-wider mb-1">
                                Active Game Found
                            </h4>
                            <p className="text-xs text-gray-400 mb-3">
                                You have an unfinished multiplayer game. Resume it?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { router.push(`/game/${resumeGameId}`); setResumeGameId(null); }}
                                    className="flex-1 bg-yellow-500/20 hover:bg-yellow-500 hover:text-black text-yellow-400 border border-yellow-500/50 font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                                >
                                    <Check size={14} /> Resume
                                </button>
                                <button
                                    onClick={dismissResume}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                                >
                                    <X size={14} /> Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Incoming Challenge Notification */}
            {incomingChallenge && (
                <div className="animate-in slide-in-from-right duration-300">
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
            )}
        </div>
    );
};
