import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSession } from "next-auth/react";
import { Trophy, Settings } from 'lucide-react';
import { AdContainer } from '@/components/Ads/AdContainer';
import { Lobby } from '@/components/Game/Lobby';
import { saveGameResult } from '@/app/actions/game';
import { SettingsPanel } from '@/components/Game/SettingsPanel';

export const GameUI = () => {
    const { data: session } = useSession();
    const {
        currentPlayer,
        winner,
        resetGame,
        isAiEnabled,
        theme,
        scores,
        preferences,
        difficulty
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
            {/* Settings Button - Top Left */}
            <div style={{ position: 'fixed', top: '100px', left: '24px', zIndex: 50 }}>
                <button
                    onClick={() => setShowSettings(true)}
                    className="glass-panel p-3 rounded-xl transition-all border border-white/10 text-white hover:bg-white/10"
                    title="Settings"
                >
                    <Settings size={24} />
                </button>
            </div>

            {/* Compact Scoreboard - Top Center - 20% Smaller */}
            {preferences.showScoreboard && (
                <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
                    <div className="glass-panel px-5 py-2 rounded-2xl flex items-center gap-5 border border-white/10">
                        {/* Player 1 / White */}
                        <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white">
                                {session?.user?.name || 'Player 1'}
                            </span>
                            <span className="text-2xl font-mono font-black text-red-500 drop-shadow-[0_0_12px_rgba(255,0,0,0.5)] min-w-[32px] text-center">
                                {scores.white}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="h-6 w-px bg-white/20" />

                        {/* Player 2 / Black */}
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-mono font-black text-green-500 drop-shadow-[0_0_12px_rgba(0,255,0,0.5)] min-w-[32px] text-center">
                                {scores.black}
                            </span>
                            <span className="text-base font-bold text-white">
                                {isAiEnabled ? 'Computer' : 'Player 2'}
                            </span>
                        </div>

                        {/* Turn Indicator - Only show in PVP mode if enabled */}
                        {preferences.showTurnIndicator && !isAiEnabled && (
                            <>
                                <div className="h-6 w-px bg-white/20" />
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500 ${currentPlayer === 'white' ? 'bg-[red] shadow-[0_0_8px_red]' : 'bg-[green] shadow-[0_0_8px_green]'}`} />
                                    <span className="text-xs font-bold text-white/90">
                                        {currentPlayer === 'white' ? `${session?.user?.name || "Player 1"}'s Turn` : "Player 2's Turn"}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Right Panel - Leaderboard */}
            {preferences.showLeaderboard && (
                <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 50 }}>
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
                </div>
            )}

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

            {/* Ad Banner - Free Tier Only */}
            {!isPremium && (
                <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', height: '90px', zIndex: 40, pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'end', paddingBottom: '10px' }}>
                    <div className="pointer-events-auto bg-black/80 backdrop-blur-md border-t border-white/10 w-full max-w-3xl h-full rounded-t-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <AdContainer slotId="PLACEHOLDER_SLOT_ID" />
                    </div>
                </div>
            )}

            {/* Settings Panel */}
            <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </>
    );
};
