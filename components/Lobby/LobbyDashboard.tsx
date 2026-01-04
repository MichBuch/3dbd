'use client';

import { useEffect, useState } from 'react';
import { User, Gamepad2, MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface OnlineUser {
    id: string;
    name: string;
    image: string | null;
    rating: number;
    status: 'online' | 'playing' | 'offline';
}

interface OpenGame {
    id: string;
    whitePlayer: {
        name: string;
        rating: number;
        image: string | null;
    };
    createdAt: string;
}

export const LobbyDashboard = () => {
    const { data: session } = useSession();
    const [users, setUsers] = useState<OnlineUser[]>([]);
    const [games, setGames] = useState<OpenGame[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLobby = async () => {
        try {
            const res = await fetch('/api/lobby');
            const data = await res.json();
            if (data.users) setUsers(data.users);
            if (data.openGames) setGames(data.openGames);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLobby();
        const interval = setInterval(fetchLobby, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    // Heartbeat logic
    useEffect(() => {
        if (session) {
            const beat = () => fetch('/api/heartbeat', { method: 'POST' });
            beat();
            const interval = setInterval(beat, 30000); // Ping every 30s
            return () => clearInterval(interval);
        }
    }, [session]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto p-4 md:p-0">
            {/* Left Col: Online Players */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-black/60">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Online Players ({users.length})
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading && users.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">Scanning...</div>
                    ) : users.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">No other players online</div>
                    ) : (
                        users.map(u => (
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
                        ))
                    )}
                </div>
            </div>

            {/* Right Col: Open Games */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-black/60">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gamepad2 className="text-neonPink" /> Available Games ({games.length})
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading && games.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">Loading games...</div>
                    ) : games.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">No open games found</div>
                    ) : (
                        games.map(g => (
                            <div key={g.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:border-neonPink/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-900 flex items-center justify-center font-bold text-white text-xs">P1</div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{g.whitePlayer?.name || 'Unknown'}</div>
                                        <div className="text-[10px] text-gray-400">Rating: {g.whitePlayer?.rating || 1200}</div>
                                    </div>
                                </div>
                                <a
                                    href={`/game/${g.id}`}
                                    className="bg-neonPink/20 text-neonPink px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neonPink hover:text-black transition-colors"
                                >
                                    Join Game
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
