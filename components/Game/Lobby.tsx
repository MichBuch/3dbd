'use client';

import React, { useEffect, useState } from 'react';
import { getOnlineUsers } from '@/app/actions/lobby';
import { User, Trophy, Circle } from 'lucide-react';
import Link from 'next/link';

interface OnlineUser {
    id: string;
    name: string | null;
    image: string | null;
    rankTier: string | null;
    points: number;
    status?: 'online' | 'playing';
}

export const Lobby = () => {
    const [users, setUsers] = useState<OnlineUser[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await getOnlineUsers();
            setUsers(data);
        };

        fetchUsers();
        const interval = setInterval(fetchUsers, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    if (users.length === 0) return null;

    return (
        <div className="bg-black/80 border border-white/10 rounded-xl p-4 w-60">
            <div className="flex items-center gap-2 mb-3 text-neonBlue text-[10px] font-bold uppercase tracking-widest border-b border-white/10 pb-2">
                <Circle size={8} className="fill-green-500 text-green-500 animate-pulse" /> Live Players
            </div>
            <ul className="space-y-2">
                {users.map((u) => (
                    <li key={u.id} className="flex justify-between items-center group cursor-pointer hover:bg-white/5 p-1 rounded transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="relative">
                                {u.image ? (
                                    <img src={u.image} className="w-6 h-6 rounded-full border border-white/20" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                        <User size={12} />
                                    </div>
                                )}
                                {/* Status dot */}
                                <span
                                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black"
                                    style={{ backgroundColor: u.status === 'playing' ? '#EAB308' : '#22C55E' }}
                                    title={u.status === 'playing' ? 'In a game' : 'Available'}
                                />
                            </div>
                            <div className="flex flex-col">
                                <Link href={`/lobby/invite/${u.id}`} className="text-sm font-bold truncate max-w-[100px] text-white group-hover:text-neonPink transition-colors">
                                    {u.name || 'Anonymous'}
                                </Link>
                                <span className="text-[10px] text-white/50">{u.rankTier} • {u.points} pts</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                window.location.href = `/lobby/invite/${u.id}`;
                            }}
                            disabled={u.status === 'playing'}
                            className="text-[10px] bg-white/10 hover:bg-neonBlue hover:text-black px-2 py-1 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {u.status === 'playing' ? 'BUSY' : 'CHALLENGE'}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <button
                    onClick={async () => {
                        const res = await fetch('/api/portal', { method: 'POST' });
                        if (res.ok) {
                            const data = await res.json();
                            window.location.href = data.url;
                        }
                    }}
                    className="text-[10px] text-gray-500 hover:text-white underline transition-colors"
                >
                    Manage Subscription / Cancel
                </button>
            </div>
        </div>
    );
};
