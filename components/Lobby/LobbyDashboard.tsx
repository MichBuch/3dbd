'use client';

import { useEffect, useState } from 'react';
import { User, Gamepad2, MessageCircle, X, UserPlus, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useGameStore } from '@/store/gameStore';

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

export const LobbyDashboard = () => {
    const { data: session } = useSession();
    const { setPreference } = useGameStore();
    const [users, setUsers] = useState<OnlineUser[]>([]);
    const [games, setGames] = useState<OpenGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<OnlineUser[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'friends'>('all');

    const fetchLobby = async () => {
        try {
            const queryParam = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
            const res = await fetch(`/api/lobby${queryParam}`);
            const data = await res.json();
            if (data.users) setUsers(data.users);
            if (data.openGames) setGames(data.openGames);

            // Fetch Friends
            const friendsRes = await fetch('/api/friends');
            if (friendsRes.ok) {
                const friendsData = await friendsRes.json();
                setFriends(friendsData);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const addFriend = async (friendId: string) => {
        try {
            await fetch('/api/friends', {
                method: 'POST',
                body: JSON.stringify({ friendId })
            });
            fetchLobby(); // Refresh to update list
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchLobby();
        const interval = setInterval(fetchLobby, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [searchQuery]); // Re-fetch when search changes

    // Heartbeat logic
    useEffect(() => {
        if (session?.user) {
            const beat = setInterval(() => {
                fetch('/api/heartbeat', { method: 'POST' });
            }, 30000);
            return () => clearInterval(beat);
        }
    }, [session]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto p-4 md:p-0 relative">
            <button
                onClick={() => setPreference('isLobbyVisible', false)}
                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors z-50 rounded-full hover:bg-white/10"
                title="Close Lobby Overlay"
            >
                <X size={24} />
            </button>
            {/* Left Col: Online Players */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-black/60">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Online Players ({activeTab === 'all' ? users.length : friends.length})
                </h3>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${activeTab === 'all' ? 'bg-neonBlue text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        All Players
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${activeTab === 'friends' ? 'bg-neonBlue text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        <Users size={12} /> Friends
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonBlue transition-colors placeholder:text-gray-600"
                    />
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-gray-500 text-center py-10">Scanning...</div>
                    ) : (activeTab === 'all' ? users : friends).length === 0 ? (
                        <div className="text-gray-500 text-center py-10">
                            {activeTab === 'friends' ? 'No friends online' : 'No others online'}
                        </div>
                    ) : (
                        (activeTab === 'all' ? users : friends).map(u => (
                            <div key={u.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:border-neonBlue/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        {u.image ? (
                                            <img src={u.image} className="w-10 h-10 rounded-full border border-gray-600" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                                                <User size={16} className="text-gray-400" />
                                            </div>
                                        )}
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${u.status === 'playing' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{u.name}</div>
                                        <div className="text-[10px] text-neonPink font-mono">Rating: {u.rating}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Add Friend Button - Only show if not already friend and ensuring not self (though list excludes self) */}
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
                                        onClick={async () => {
                                            // 1. Create a PVP Game
                                            const res = await fetch('/api/games/create', {
                                                method: 'POST',
                                                body: JSON.stringify({ difficulty: 'medium' })
                                            });
                                            const game = await res.json();

                                            // 2. Redirect to it
                                            if (game.id) {
                                                window.location.href = `/game/${game.id}`;
                                            }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-neonBlue/20 text-neonBlue px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neonBlue hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {u.status === 'playing' ? 'In Game' : 'Invite'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Col: Open Games */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-black/60">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gamepad2 className="text-neonBlue" />
                    Available Games ({games.length})
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading && games.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">Scanning...</div>
                    ) : games.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">No open games found</div>
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
                                    Join Game
                                </a>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="bg-gradient-to-r from-neonPink/10 to-neonBlue/10 rounded-xl p-4 border border-white/10">
                        <div className="flex items-start gap-3">
                            <MessageCircle className="text-neonPink shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-white text-sm mb-1">Make New Friends!</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Click the <UserPlus size={12} className="inline mx-1 text-green-400" /> icon to add players to your friend list.
                                    Filtering by "Friends" makes it easier to challenge them later!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
