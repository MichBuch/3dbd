'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { User, Gamepad2, MessageCircle, X, UserPlus, Users, Swords, Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/lib/translations';
import { ConnectDialog } from './ConnectDialog';

interface OnlineUser {
    id: string;
    name: string;
    image?: string;
    rating: number;
    status: 'online' | 'playing' | 'offline';
    wins: number;
    losses: number;
}

interface OpenGame {
    id: string;
    whitePlayer: {
        name: string;
        image?: string;
        rating: number;
    };
    createdAt: string;
}

interface Challenge {
    id: string;
    fromId: string;
    fromName: string;
    message: string;
    status: 'pending' | 'accepted' | 'declined';
    gameId?: string;
}

export const LobbyDashboard = () => {
    const { data: session } = useSession();
    const { setPreference } = useGameStore();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'friends'>('all');
    const { t } = useTranslation();

    // SWR Fetcher
    const fetcher = (url: string) => fetch(url).then(r => r.json());

    // 1. Fetch Lobby Data
    const { data: lobbyData, error: lobbyError } = useSWR(
        `/api/lobby${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
        fetcher,
        { refreshInterval: 3000, revalidateOnFocus: true }
    );

    // 2. Fetch Friends
    const { data: friendsData, mutate: mutateFriends } = useSWR(
        session?.user ? '/api/friends' : null,
        fetcher,
        { refreshInterval: 10000 }
    );

    // Challenge System State
    const [guestId, setGuestId] = useState('');
    const [showChallengeModal, setShowChallengeModal] = useState<string | null>(null);
    const [challengeMessage, setChallengeMessage] = useState('Let\'s play!');
    const [sentChallengeStatus, setSentChallengeStatus] = useState<string>('');
    const [showConnectDialog, setShowConnectDialog] = useState(false);

    // Initialize Guest ID
    useEffect(() => {
        let id = localStorage.getItem('guest_id');
        if (!id) {
            id = 'guest-' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('guest_id', id);
        }
        setGuestId(id);
    }, []);

    // 3. Fetch Challenges (Incoming)
    const challengesUrl = session?.user
        ? `/api/challenges?toId=${session.user.id}`
        : guestId ? `/api/challenges?toId=${guestId}` : null;

    const { data: challengesData } = useSWR(
        challengesUrl,
        fetcher,
        { refreshInterval: 3000 }
    );

    // 4. Fetch Outgoing Challenges (For redirecting Sender)
    const outgoingUrl = `/api/challenges?fromId=${session?.user?.id || guestId}`;
    const { data: outgoingData } = useSWR(
        (session?.user?.id || guestId) ? outgoingUrl : null,
        fetcher,
        { refreshInterval: 3000 }
    );

    // Derived State
    const users: OnlineUser[] = lobbyData?.users || [];
    const games: OpenGame[] = lobbyData?.openGames || [];
    const friends: OnlineUser[] = friendsData || [];
    const activeChallenges: Challenge[] = challengesData || [];
    const mySentChallenges: Challenge[] = outgoingData || [];

    const loading = !lobbyData && !lobbyError;

    // Challenge Logic Side Effects (Redirect Sender)
    useEffect(() => {
        if (mySentChallenges.length > 0) {
            // Only redirect if "accepted" AND created recently (< 1 min ago)
            const accepted = mySentChallenges.find((c: Challenge) => {
                if (c.status !== 'accepted' || !c.gameId) return false;

                // Timestamp check (mock logic assuming we fetch timestamps, or just ignore if we are ALREADY in that game)
                // Better: If we are not currently on the game page?
                // But we are in Lobby.
                return true;
            });

            // Debugging
            console.log("My Sent Challenges:", mySentChallenges);

            if (accepted && accepted.gameId) {
                // Prevent infinite loop: Don't redirect if we ostensibly just came from there or if user manually navigated back?
                // For now, let's just show a button or "Join" link instead of forced redirect if sticking?
                // OR: Check if the accepted challenge is "fresh". 
                // Since we don't have timestamps easily here without schema update, let's use a local state latch.
                // Assuming the server cleans up old challenges or we filter them?
                // Simplified: Display "Game Ready" button instead of hard redirect loop, 
                // UNLESS it's the very first time we see it? Hard to track.

                // Force Redirect ONLY if not already redirecting
                if (sentChallengeStatus !== "Game Accepted! Joining...") {
                    console.log("Redirecting to game:", accepted.gameId);
                    setSentChallengeStatus("Game Accepted! Joining...");
                    router.push(`/game/${accepted.gameId}`);
                }
            } else {
                // Update status text
                const latest = mySentChallenges[0];
                setSentChallengeStatus(latest.status === 'pending' ? t.waitingResponse : t.challenge + ' ' + latest.status);
            }
        }
    }, [mySentChallenges, t, router, sentChallengeStatus]);

    const addFriend = async (friendId: string) => {
        try {
            await fetch('/api/friends', {
                method: 'POST',
                body: JSON.stringify({ friendId })
            });
            mutateFriends();
        } catch (e) {
            console.error(e);
        }
    };

    const sendChallenge = async () => {
        if (!showChallengeModal) return;
        try {
            const res = await fetch('/api/challenges', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'create',
                    fromId: session?.user?.id || guestId,
                    fromName: session?.user?.name || 'Guest',
                    toId: showChallengeModal,
                    message: challengeMessage
                })
            });

            const data = await res.json();

            if (data.error) {
                console.error("Challenge Error:", data.error);
                setSentChallengeStatus(`Error: ${data.error}`);
                alert(`Failed to send challenge: ${data.error}`);
                return;
            }

            if (data.success && data.gameId) {
                // Auto-accepted (e.g. Bot)
                window.location.href = `/game/${data.gameId}`;
                return;
            }

            setSentChallengeStatus(t.challengeSent);
            setShowChallengeModal(null);
            setChallengeMessage('Let\'s play!');
        } catch (e) {
            console.error(e);
        }
    };

    const respondToChallenge = async (challengeId: string, action: 'accept' | 'decline') => {
        try {
            const res = await fetch('/api/challenges', {
                method: 'POST',
                body: JSON.stringify({ action, challengeId })
            });
            if (action === 'accept') {
                const data = await res.json();
                if (data.gameId) {
                    window.location.href = `/game/${data.gameId}`;
                }
            } else {
                // SWR will update automatically on next poll
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Heartbeat logic
    useEffect(() => {
        const sendHeartbeat = () => {
            const body: any = {};
            if (!session?.user && guestId) {
                body.guestId = guestId;
                body.guestName = `Guest ${guestId.substring(6, 10)}`;
            }

            fetch('/api/heartbeat', {
                method: 'POST',
                body: JSON.stringify(body)
            });
        };

        // Send immediately on mount
        sendHeartbeat();

        // Then interval
        const beat = setInterval(sendHeartbeat, 30000);
        return () => clearInterval(beat);
    }, [session, guestId]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto p-4 md:p-0 relative">
            {/* Left Col: Online Players */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-black/60 relative">
                <button
                    onClick={() => setPreference('isLobbyVisible', false)}
                    className="absolute top-2 right-2 p-2 text-white/50 hover:text-white transition-colors z-50 rounded-full hover:bg-white/10 md:-top-12 md:right-0"
                    title="Close Lobby Overlay"
                >
                    <X size={24} />
                </button>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {t.onlinePlayers} ({activeTab === 'all' ? users.length : friends.length})
                </h3>

                {/* CHALLENGE NOTIFICATIONS (User Only) */}
                {activeChallenges.length > 0 && (
                    <div className="mb-4 bg-neonBlue/10 border border-neonBlue text-white p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-bold text-sm flex items-center gap-2 mb-2">
                            <Bell size={14} className="text-neonBlue animate-bounce" /> {t.challengeRequest}
                        </h4>
                        {activeChallenges.map(c => (
                            <div key={c.id} className="flex items-center justify-between text-xs bg-black/40 p-2 rounded-lg mb-2 last:mb-0">
                                <div>
                                    <span className="font-bold text-neonBlue">{c.fromName}</span>: "{c.message || 'Play?'}"
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => respondToChallenge(c.id, 'accept')} className="bg-green-500 text-white px-2 py-1 rounded font-bold hover:bg-green-400">Accept</button>
                                    <button onClick={() => respondToChallenge(c.id, 'decline')} className="bg-red-500 text-white px-2 py-1 rounded font-bold hover:bg-red-400">Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* GUEST STATUS FEEDBACK */}
                {!session && sentChallengeStatus && (
                    <div className="mb-4 bg-white/10 border border-white/20 text-gray-300 p-2 rounded-lg text-xs text-center font-mono">
                        STATUS: {sentChallengeStatus}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${activeTab === 'all' ? 'bg-neonBlue text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        {t.allPlayers}
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${activeTab === 'friends' ? 'bg-neonBlue text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        <Users size={12} /> {t.friends}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder={t.searchPlayers}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonBlue transition-colors placeholder:text-gray-600"
                    />
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-gray-500 text-center py-10">{t.scanning}</div>
                    ) : (activeTab === 'all' ? users : friends).length === 0 ? (
                        <div className="text-gray-500 text-center py-10">
                            {activeTab === 'friends' ? t.noFriends : t.noOnline}
                        </div>
                    ) : (
                        (activeTab === 'all' ? users : friends).map(u => (
                            <div key={u.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:border-neonBlue/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className={`w-3 h-3 rounded-full border-2 border-black ${u.status === 'playing' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{u.name}</div>
                                        <div className="text-[10px] text-neonPink font-mono">Rating: {u.rating}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Add Friend Button - Only show if not already friend and ensuring not self */}
                                    {activeTab === 'all' && !friends.some(f => f.id === u.id) && (
                                        <button
                                            onClick={() => addFriend(u.id)}
                                            className="p-2 text-white/30 hover:text-green-400 transition-colors rounded-lg hover:bg-white/5"
                                            title="Add Friend"
                                        >
                                            <UserPlus size={16} />
                                        </button>
                                    )}

                                    <button
                                        disabled={u.status === 'playing'}
                                        onClick={() => {
                                            if (session) {
                                                setShowChallengeModal(u.id);
                                            } else {
                                                setShowChallengeModal(u.id);
                                            }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-neonBlue/20 text-neonBlue px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neonBlue hover:text-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <Swords size={12} /> {t.challenge}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {session?.user && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="bg-gradient-to-r from-neonPink/10 to-neonBlue/10 rounded-xl p-4 border border-white/10 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neonPink to-neonBlue opacity-50" />
                            <div className="flex items-start gap-3 relative z-10">
                                <MessageCircle className="text-neonPink shrink-0 mt-1" size={20} />
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-sm mb-1">{t.makeFriends}</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed mb-3">
                                        Using Safe Chat? Connect with friends via email.
                                    </p>
                                    <button
                                        onClick={() => setShowConnectDialog(true)}
                                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-white/10"
                                    >
                                        Connect Friend
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Connect Dialog */}
                {showConnectDialog && <ConnectDialog onClose={() => setShowConnectDialog(false)} />}

                {/* CHALLENGE MODAL */}
                {showChallengeModal && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
                        <div className="w-full max-w-md bg-[#111] border border-white/20 p-6 rounded-xl shadow-2xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Swords className="text-neonBlue" /> {t.sendChallenge}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                {t.messageOpponent}
                            </p>
                            <input
                                type="text"
                                value={challengeMessage}
                                onChange={(e) => setChallengeMessage(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mb-4 focus:outline-none focus:border-neonBlue"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setShowChallengeModal(null)} className="flex-1 py-2 bg-white/10 text-gray-400 rounded-lg font-bold hover:bg-white/20">{t.cancel}</button>
                                <button onClick={sendChallenge} className="flex-1 py-2 bg-neonBlue/20 text-neonBlue rounded-lg font-bold hover:bg-neonBlue/30 transition-colors border border-neonBlue/50">{t.send}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Col: Open Games */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-black/60">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gamepad2 className="text-neonBlue" />
                    {t.availableGames} ({games.length})
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading && games.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">{t.scanning}</div>
                    ) : games.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">{t.noGames}</div>
                    ) : (
                        games.map(g => (
                            <div key={g.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-neonBlue/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-white border border-gray-600">
                                        3D
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">vs {g.whitePlayer?.name || 'Unknown'}</div>
                                        <div className="text-[10px] text-gray-400">Rating: {g.whitePlayer?.rating || 1200}</div>
                                    </div>
                                </div>
                                <a
                                    href={`/game/${g.id}`}
                                    className="bg-neonBlue text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white hover:scale-105 transition-all shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.6)]"
                                >
                                    {t.joinGame}
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
