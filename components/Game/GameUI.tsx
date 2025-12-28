import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSession, signOut } from "next-auth/react";
import { User, Trophy, Settings, LogOut, Cpu, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { AdContainer } from '@/components/Ads/AdContainer';
import { Lobby } from '@/components/Game/Lobby';
import { saveGameResult } from '@/app/actions/game';

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
        // @ts-ignore
        difficulty, setDifficulty
    } = useGameStore();

    const [showSettings, setShowSettings] = useState(false);

    // Save Game Result
    useEffect(() => {
        if (winner && session?.user) {
            saveGameResult(
                scores.white,
                scores.black,
                winner as 'white' | 'black' | 'draw',
                difficulty,
                isAiEnabled ? 'ai' : 'pvp'
            );
        }
    }, [winner, session, scores]);

    const handleUpgrade = async () => {
        try {
            const res = await fetch('/api/checkout', { method: 'POST' });
            if (!res.ok) throw new Error('Checkout failed');
            const data = await res.json();
            window.location.href = data.url;
        } catch (err) {
            console.error(err);
            if (!session) {
                window.location.href = "/signup";
            } else {
                alert("Could not start checkout. Please try again.");
            }
        }
    };

    // @ts-ignore
    const isPremium = session?.user?.plan === 'premium';

    return (
        <>
            {/* 1. BRAND / TURN INDICATOR (Fixed Top-Left) */}
            <div style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 50, pointerEvents: 'none' }}>
                <div className="pointer-events-auto bg-black px-5 py-3 rounded-2xl flex items-center gap-2" style={{ border: 'none' }}>
                    <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPink drop-shadow-sm">
                        3dBd
                    </h1>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-2 justify-center">
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 ${currentPlayer === 'white' ? 'bg-[red] shadow-[0_0_10px_red]' : 'bg-[green] shadow-[0_0_10px_green]'}`} />
                        <span className="text-sm font-bold text-white/90 text-center">
                            {currentPlayer === 'white'
                                ? `${session?.user?.name || "Player 1"}'s Turn`
                                : `${isAiEnabled ? "AI" : "Player 2"}'s Turn`}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. SCORE BOARD (Fixed Top-Center) */}
            <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, pointerEvents: 'none' }}>
                <div className="glass-panel p-4 rounded-2xl flex gap-12 min-w-[350px] justify-center relative overflow-hidden items-center" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '40px' }}>
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-2xl font-black text-white tracking-tight mb-1 whitespace-nowrap drop-shadow-md">
                            {session?.user?.name || 'Player 1'}
                        </span>
                        <span className="text-4xl font-mono font-black text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)] flex items-center gap-3">
                            {scores.white}
                        </span>
                    </div>

                    <div className="h-12 w-px bg-white/10" />

                    <div className="flex flex-col items-center flex-1">
                        <span className="text-2xl font-black text-white tracking-tight mb-1 whitespace-nowrap drop-shadow-md">
                            {isAiEnabled ? 'AI' : 'Player 2'}
                        </span>
                        <span className="text-4xl font-mono font-black text-green-500 drop-shadow-[0_0_15px_rgba(0,255,0,0.5)] flex items-center gap-3">
                            {scores.black}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 justify-center mt-2 pointer-events-auto">
                    <button
                        onClick={() => {
                            if (!isPremium && isAiEnabled) {
                                // Default to AI if free, but if they try to toggle...
                                const allow = confirm("Multiplayer is a Premium feature. Upgrade?");
                                if (allow) handleUpgrade();
                                return;
                            }
                            setAiEnabled(!isAiEnabled);
                        }}
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        className={`glass-panel px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${isAiEnabled ? 'bg-neonBlue/10 border-neonBlue text-neonBlue' : 'text-white/70 hover:text-white'}`}
                    >
                        {isAiEnabled ? <Cpu size={16} /> : <Users size={16} />}
                        {isAiEnabled ? 'VS AI' : 'PVP'}
                    </button>

                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`glass-panel p-2 rounded-xl transition-all border border-white/10 text-white${showSettings ? ' bg-white/10' : ' hover:text-white'}`}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* 3. RIGHT PANEL (Fixed Top-Right) */}
            <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 50, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <div className="flex flex-col items-center gap-3 pointer-events-auto">

                    {/* Premium Lobby or Leaderboard */}
                    {isPremium && !isAiEnabled ? (
                        <Lobby />
                    ) : (
                        <div className="glass-panel p-4 rounded-xl w-60 opacity-90 transition-opacity border border-white/10 bg-black/80">
                            <div className="flex items-center gap-2 mb-3 text-neonPink text-[10px] font-bold uppercase tracking-widest border-b border-white/10 pb-2">
                                <Trophy size={14} /> Top Players
                            </div>
                            <ul className="space-y-3">
                                {[
                                    { name: "MainBoss", score: 1450 },
                                    { name: "NeonKing", score: 1200 },
                                    { name: "BeadMstr", score: 980 }
                                ].map((p, i) => (
                                    <li key={i} className="flex justify-between text-xs items-center w-full">
                                        <span className="text-white/80 flex items-center gap-2 flex-1">
                                            <span className="text-gray-500 font-mono w-4">{i + 1}.</span>
                                            {p.name}
                                        </span>
                                        <span className="font-mono text-neonBlue bg-neonBlue/10 px-2 py-0.5 rounded min-w-[50px] text-center">{p.score}</span>
                                    </li>
                                ))}
                            </ul>
                            {!isPremium && (
                                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                    <button
                                        onClick={handleUpgrade}
                                        className="w-full bg-gradient-to-r from-neonBlue to-neonPink text-black font-bold py-2 rounded-lg text-xs hover:scale-105 transition-transform"
                                    >
                                        UNLOCK PREMIUM
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Login / Auth */}
                    <div className="w-full flex justify-center">
                        {session ? (
                            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 w-60 justify-between">
                                <div className="flex items-center gap-3">
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-neonBlue shadow-[0_0_10px_#00f3ff]" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-neonBlue/20 flex items-center justify-center border border-neonBlue text-neonBlue">
                                            <User size={16} />
                                        </div>
                                    )}
                                    <div className="flex flex-col items-start leading-none text-left">
                                        <span className="text-sm font-bold text-white max-w-[80px] truncate">{session.user?.name || 'Player'}</span>
                                        <span className="text-[10px] text-neonPink font-bold uppercase tracking-wider">{isPremium ? 'PREMIUM' : 'FREE'}</span>
                                    </div>
                                </div>
                                <button onClick={() => signOut()} className="hover:bg-white/10 p-2 rounded-lg transition-colors border-0">
                                    <LogOut size={16} className="text-white/50" />
                                </button>
                            </div>
                        ) : (
                            <Link href="/auth/signin" className="no-underline block w-full">
                                <button
                                    style={{ background: 'rgba(0, 243, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                    className="w-60 px-8 py-3 rounded-xl text-base font-black hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer shadow-[0_0_20px_rgba(0,243,255,0.2)] mx-auto"
                                >
                                    <User size={20} color="white" />
                                    Login
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* Divider and Difficulty */}
                    <div className="w-full h-px bg-white/10 my-2" />
                    <div className="flex justify-center w-60">
                        <div className="glass-panel p-2 rounded-lg flex items-center border border-white/10 bg-black/50 justify-center flex-1">
                            {(['easy', 'medium', 'hard'] as const).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    style={{
                                        border: 'none',
                                        background: difficulty === d ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        color: difficulty === d ? 'white' : '#888',
                                        margin: '0 4px'
                                    }}
                                    className={`px-2 py-2 text-[10px] uppercase font-bold rounded-md transition-all cursor-pointer`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
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

            {/* 4. AD BANNER (Fixed Bottom - Free Tier Only) */}
            {!isPremium && (
                <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', height: '90px', zIndex: 40, pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'end', paddingBottom: '10px' }}>
                    <div className="pointer-events-auto bg-black/80 backdrop-blur-md border-t border-white/10 w-full max-w-3xl h-full rounded-t-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <AdContainer slotId="PLACEHOLDER_SLOT_ID" />
                    </div>
                </div>
            )}

            {/* Settings Components */}
            {showSettings && (
                <div className="absolute bottom-24 right-4 w-60 glass-panel p-4 rounded-xl pointer-events-auto z-50">
                    <p className="text-white text-xs">Settings Placeholder</p>
                </div>
            )}
        </>
    );
};
