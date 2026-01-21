import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/lib/translations';
import { useSession } from "next-auth/react";
import { Trophy, Settings, X, Flag } from 'lucide-react';
import { AdContainer } from '@/components/Ads/AdContainer';
import { Lobby } from '@/components/Game/Lobby';
import { saveGameResult } from '@/app/actions/game';
import { SafeChat } from './SafeChat';

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

    const { t } = useTranslation();

    const [showWinnerDialog, setShowWinnerDialog] = useState(false);
    const [showResignDialog, setShowResignDialog] = useState(false);
    const [resignReason, setResignReason] = useState('');
    const params = useParams();
    const gameId = params?.id;

    useEffect(() => {
        if (winner) {
            setShowWinnerDialog(true);
        }
    }, [winner]);

    // Save Game Result
    useEffect(() => {
        if (winner && session?.user) {
            saveGameResult(
                scores.white,
                scores.black,
                winner as 'white' | 'black' | 'draw',
                difficulty >= 80 ? 'hard' : difficulty <= 30 ? 'easy' : 'medium',
                isAiEnabled ? 'ai' : 'pvp'
            );
        }
    }, [winner, session, scores]);

    const handleResign = async () => {
        if (!gameId) return;
        try {
            // 1. Resign API
            const res = await fetch(`/api/game/${gameId}/resign`, {
                method: 'POST',
                body: JSON.stringify({ reason: resignReason })
            });
            const data = await res.json();

            if (data.success) {
                // 2. Chat Message
                const message = `🏳️ I resigned: ${resignReason || 'Good game!'}`;
                await fetch(`/api/game/${gameId}/chat`, {
                    method: 'POST',
                    body: JSON.stringify({ text: message })
                });

                setShowResignDialog(false);
                setResignReason('');
                // Game store polling (or socket) should pick up the "ended" state soon.
                // For immediate feedback, we could force a reload or store update, 
                // but let's trust the polling/heartbeat mechanism of the game store first.
                // Actually, best to reload to ensure state sync if polling is slow.
                window.location.reload();
            } else {
                alert(data.error || "Failed to resign");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpgrade = async (plan: 'monthly' | 'yearly' = 'yearly') => {
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan })
            });
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
            {/* Settings Button Removed - Moved to Header */}
            {/* Resign Button */}
            {!winner && (
                <button
                    onClick={() => setShowResignDialog(true)}
                    className="fixed top-24 left-6 z-40 bg-red-500/10 hover:bg-red-500/30 text-red-500 p-2 rounded-lg backdrop-blur-md border border-red-500/20 transition-all hover:scale-105 flex items-center gap-2 group"
                    title="Resign / End Game"
                >
                    <Flag size={16} />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-bold uppercase">
                        {t.resign || "Resign"}
                    </span>
                </button>
            )}

            {/* Compact Scoreboard - Top Center - 20% Smaller */}
            {preferences.showScoreboard && (
                <div style={{ position: 'fixed', top: '0', left: '24px', zIndex: 60 }} className="h-16 flex items-center pointer-events-none">
                    <div className="glass-panel px-3 md:px-5 py-1 md:py-2 rounded-2xl flex items-center gap-3 md:gap-5 border border-white/10 pointer-events-auto">
                        {/* Player 1 / White */}
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: theme.white, color: theme.white }} />
                            <span className="hidden md:inline text-base font-bold text-white">
                                {session?.user?.name || t.player1}
                            </span>
                            <span className="text-xl md:text-2xl font-mono font-black min-w-[24px] md:min-w-[32px] text-center" style={{ color: theme.white, textShadow: `0 0 12px ${theme.white}80` }}>
                                {scores.white}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="h-4 md:h-6 w-px bg-white/20" />

                        {/* Player 2 / Black */}
                        <div className="flex items-center gap-2">
                            <span className="text-xl md:text-2xl font-mono font-black min-w-[24px] md:min-w-[32px] text-center" style={{ color: theme.black, textShadow: `0 0 12px ${theme.black}80` }}>
                                {scores.black}
                            </span>
                            <span className="hidden md:inline text-base font-bold text-white">
                                {isAiEnabled ? t.computer : (preferences.opponentName || t.player2)}
                            </span>
                            <div className="w-3 h-3 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: theme.black, color: theme.black }} />
                        </div>

                        {/* Turn Indicator - Only show in PVP mode if enabled */}
                        {preferences.showTurnIndicator && !isAiEnabled && (
                            <>
                                <div className="h-6 w-px bg-white/20" />
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full transition-colors duration-500"
                                        style={{
                                            backgroundColor: currentPlayer === 'white' ? theme.white : theme.black,
                                            boxShadow: `0 0 8px ${currentPlayer === 'white' ? theme.white : theme.black}`
                                        }}
                                    />
                                    <span className="text-xs font-bold text-white/90">
                                        {currentPlayer === 'white' ? `${session?.user?.name || t.player1}${t.turn}` : `${t.player2}${t.turn}`}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Right Panel - Leaderboard - HIDDEN ON MOBILE */}
            {preferences.showLeaderboard && (
                <div className="hidden md:block" style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 50 }}>
                    <div className="mb-4 text-right">
                        <button
                            onClick={async () => {
                                const res = await fetch('/api/games/create', { method: 'POST', body: JSON.stringify({ difficulty: difficulty }) });
                                const game = await res.json();
                                if (game.id) window.location.href = `/game/${game.id}`;
                            }}
                            className="bg-neonBlue/20 hover:bg-neonBlue/40 text-neonBlue border border-neonBlue px-4 py-2 rounded-lg font-bold transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)] hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] text-xs uppercase tracking-widest"
                        >
                            ⚔️ {t.playAlgo || 'Play Bot'}
                        </button>
                    </div>
                    {isPremium && !isAiEnabled ? (
                        <Lobby />
                    ) : (
                        <div className="glass-panel p-4 rounded-xl w-60 opacity-90 transition-opacity border border-white/10 bg-black/80">
                            <div className="flex items-center gap-2 mb-3 text-neonPink text-[10px] font-bold uppercase tracking-widest border-b border-white/10 pb-2">
                                <Trophy size={14} /> {t.topPlayers}
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
                                        onClick={() => handleUpgrade('yearly')}
                                        className="w-full bg-gradient-to-r from-neonBlue to-neonPink text-black font-bold py-2 rounded-lg text-xs hover:scale-105 transition-transform"
                                    >
                                        {t.unlockPremium}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Resign Dialog */}
            {showResignDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Flag className="text-red-500" /> Resign Game?
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            You will lose this game. You can leave a message optionally.
                        </p>
                        <input
                            type="text"
                            placeholder='Reason (e.g. "Late for work", "Good game")'
                            value={resignReason}
                            onChange={(e) => setResignReason(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mb-6 focus:outline-none focus:border-red-500 transition-colors"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResignDialog(false)}
                                className="flex-1 py-2 bg-white/5 text-gray-400 rounded-lg font-bold hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResign}
                                className="flex-1 py-2 bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-colors"
                            >
                                Confirm Resign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Winner Overlay */}
            {winner && showWinnerDialog && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="relative bg-black/40 p-12 rounded-3xl border border-white/10 text-center shadow-[0_0_50px_rgba(0,243,255,0.2)]">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowWinnerDialog(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 mb-4 tracking-tighter">
                            {winner === 'draw'
                                ? t.draw
                                : winner === 'white'
                                    ? `${(session?.user?.name || t.player1).toUpperCase()} ${t.wins}`
                                    : isAiEnabled ? t.computer : `${t.player2} ${t.wins}`
                            }
                        </h2>
                        <div className="text-gray-400 mb-10 font-mono text-xl">
                            Red <span className="text-white font-bold text-2xl mx-1">{scores.white}</span> - <span className="text-white font-bold text-2xl mx-1">{scores.black}</span> Green
                        </div>
                        <button
                            onClick={resetGame}
                            className="bg-white text-black px-10 py-4 rounded-full font-bold text-xl hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all"
                        >
                            {t.playAgain}
                        </button>
                    </div>
                </div>
            )}

            {/* Ads & Pricing - Bottom Centered (Hidden for Premium) */}
            {/* Ads & Pricing - Bottom Centered (Hidden for Premium) */}
            {!isPremium && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-md border-t border-white/10 px-4 md:px-6 py-2 rounded-t-xl pointer-events-auto flex flex-col xl:flex-row gap-4 items-center justify-center flex-wrap">
                        {/* Pricing Section Removed */}

                        {/* Ad Banner - Secondary */}
                        <div className="hidden md:flex w-[728px] h-[90px] bg-white/5 items-center justify-center text-white/20 text-xs uppercase tracking-widest border border-dashed border-white/10 overflow-hidden order-2 xl:order-1">
                            <AdContainer slotId="PLACEHOLDER_SLOT_ID" />
                        </div>

                        {/* Mobile Ad Placeholder */}
                        <div className="md:hidden text-[10px] text-white/20 uppercase tracking-widest pb-2 border-b border-white/10 w-full text-center order-3">
                            Support us or Go Pro
                        </div>
                    </div>
                </div>
            )}

            {/* Safe Chat - Only renders if connected */}
            {gameId && (
                <SafeChat
                    gameId={gameId as string}
                    players={{
                        white: { id: 'unknown', name: 'White' }, // IDs not easily available in store yet without fetch, but chat API validates session vs DB
                        black: { id: 'unknown', name: 'Black' }  // The component fetches messages itself
                    }}
                />
            )}
        </>
    );
};
