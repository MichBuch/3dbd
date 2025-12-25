import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSession, signOut } from "next-auth/react";
import { User, Trophy, Settings, LogOut, Cpu, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export const GameUI = () => {
    const { data: session } = useSession();
    const {
        currentPlayer,
        winner,
        resetGame,
        isAiEnabled,
        setAiEnabled,
        theme,
        setTheme,
        scores,
        // @ts-ignore - added to store strictly now
        difficulty, setDifficulty
    } = useGameStore();

    const [showSettings, setShowSettings] = useState(false);

    const handleUpgrade = async () => {
        try {
            const res = await fetch('/api/checkout', { method: 'POST' });
            if (!res.ok) throw new Error('Checkout failed');
            const data = await res.json();
            window.location.href = data.url;
        } catch (err) {
            console.error(err);
            // Verify if user is logged in first
            if (!session) {
                window.location.href = "/signup";
            } else {
                alert("Could not start checkout. Please try again.");
            }
        }
    };

    return (
        <>
            {/* Top Bar (Glass) */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-10">

                {/* Left: Brand & Status */}
                <div className="pointer-events-auto flex flex-col gap-4">
                    <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4">
                        <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPink drop-shadow-sm">
                            3dBd
                        </h1>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 ${currentPlayer === 'white' ? 'bg-[red] shadow-[0_0_10px_red]' : 'bg-[green] shadow-[0_0_10px_green]'}`} />
                            <span className="text-sm font-bold text-white/90">
                                {currentPlayer === 'white' ? "Red's Turn" : "Green's Turn"}
                            </span>
                        </div>
                    </div>

                    {/* Score Widget */}
                    <div className="glass-panel p-4 rounded-2xl flex gap-6 min-w-[200px] justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white via-transparent to-gray-900 opacity-50" />
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest mb-1">Red</span>
                            <span className="text-3xl font-mono font-black text-white drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                                {scores.white}
                            </span>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest mb-1">Green</span>
                            <span className="text-3xl font-mono font-black text-white drop-shadow-[0_0_15px_rgba(0,255,0,0.5)]">
                                {scores.black}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Auth & Leaderboard Placeholder */}
                <div className="pointer-events-auto flex flex-col gap-2 items-end">
                    {session ? (
                        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
                            {session.user?.image ? (
                                <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-neonBlue shadow-[0_0_10px_#00f3ff]" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-neonBlue/20 flex items-center justify-center border border-neonBlue text-neonBlue">
                                    <User size={16} />
                                </div>
                            )}
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-sm font-bold text-white">{session.user?.name || 'Player'}</span>
                                {/* @ts-ignore */}
                                <span className="text-[10px] text-neonPink font-bold uppercase tracking-wider">{session.user?.plan === 'premium' ? 'PREMIUM' : 'FREE'}</span>
                            </div>
                            <button onClick={() => signOut()} className="ml-2 hover:bg-white/10 p-2 rounded-lg transition-colors">
                                <LogOut size={16} className="text-white/50" />
                            </button>
                        </div>
                    ) : (
                        <Link href="/signup">
                            <button className="glass-panel px-6 py-2 rounded-xl text-sm font-bold hover:bg-neonBlue/20 hover:border-neonBlue transition-all duration-300 flex items-center gap-2 group cursor-pointer">
                                <User size={16} className="group-hover:text-neonBlue transition-colors" />
                                Login / Sign Up
                            </button>
                        </Link>
                    )}

                    {/* Mode Toggles */}
                    <div className="flex gap-2 mt-2">
                        <div className="glass-panel p-1 rounded-lg flex items-center">
                            {['easy', 'medium', 'hard'].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${difficulty === d ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setAiEnabled(!isAiEnabled)}
                            className={`glass-panel px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isAiEnabled ? 'bg-neonBlue/10 border-neonBlue text-neonBlue' : 'text-white/70 hover:text-white'}`}
                        >
                            {isAiEnabled ? <Cpu size={14} /> : <Users size={14} />}
                            {isAiEnabled ? 'VS AI' : 'PVP'}
                        </button>

                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`glass-panel p-2 rounded-lg transition-all ${showSettings ? 'bg-white/10' : 'text-white/70 hover:text-white'}`}
                        >
                            <Settings size={16} />
                        </button>
                    </div>

                    {/* Fake Leaderboard with Margins */}
                    <div className="glass-panel p-5 rounded-xl mt-4 w-64 opacity-90 transition-opacity">
                        <div className="flex items-center gap-2 mb-4 text-neonPink text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2">
                            <Trophy size={14} /> Top Players
                        </div>
                        <ul className="space-y-3">
                            {[
                                { name: "MainBoss", score: 1450 },
                                { name: "NeonKing", score: 1200 },
                                { name: "BeadMaster", score: 980 }
                            ].map((p, i) => (
                                <li key={i} className="flex justify-between text-xs items-center">
                                    <span className="text-white/80 flex items-center gap-2">
                                        <span className="text-gray-500 font-mono w-4">{i + 1}.</span>
                                        {p.name}
                                    </span>
                                    <span className="font-mono text-neonBlue bg-neonBlue/10 px-2 py-0.5 rounded ml-4">{p.score}</span>
                                </li>
                            ))}
                        </ul>
                        {/* @ts-ignore */}
                        {session?.user?.plan !== 'premium' && (
                            <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                <p className="text-[10px] text-gray-400 mb-2">Want to compete?</p>
                                <button
                                    onClick={handleUpgrade}
                                    className="w-full bg-gradient-to-r from-neonBlue to-neonPink text-black font-bold py-2 rounded-lg text-xs hover:scale-105 transition-transform"
                                >
                                    UNLOCK PREMIUM
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Winner Overlay */}
            {winner && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-black/40 p-12 rounded-3xl border border-white/10 text-center shadow-[0_0_50px_rgba(0,243,255,0.2)]">
                        <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 mb-4 tracking-tighter">
                            {winner === 'draw' ? 'DRAW' : `${winner.toUpperCase()} WINS`}
                        </h2>
                        <div className="text-gray-400 mb-10 font-mono text-xl">
                            Red <span className="text-white font-bold text-2xl mx-1">{scores.white}</span> - <span className="text-white font-bold text-2xl mx-1">{scores.black}</span> Green
                        </div>
                        <button
                            onClick={resetGame}
                            className="bg-white text-black px-10 py-4 rounded-full font-bold text-xl hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* Settings Components */}
            {showSettings && (
                <div className="absolute bottom-4 right-4 w-60 glass-panel p-4 rounded-xl pointer-events-auto z-10">
                    {/* ... Settings ... */}
                    <p className="text-white text-xs">Settings Placeholder</p>
                </div>
            )}
        </>
    );
};
