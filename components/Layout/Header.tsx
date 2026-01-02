
import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AuthDialog } from '@/components/Auth/AuthDialog';
import { User, LogOut, Settings, RotateCcw, Trophy } from 'lucide-react';
import { SettingsPanel } from '@/components/Game/SettingsPanel';
import { useGameStore } from '@/store/gameStore';

export function Header() {
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false);
    const { data: session } = useSession();
    // @ts-ignore
    const isPremium = session?.user?.plan === 'premium';

    // Reuse the leaderboard content logic
    const LeaderboardContent = () => (
        <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="text-neonPink" /> Leaderboard
            </h3>
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                    {[
                        { name: "MainBoss", score: 1450 },
                        { name: "NeonKing", score: 1200 },
                        { name: "BeadMstr", score: 980 }
                    ].map((p, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                            <span className="flex items-center gap-3 text-white">
                                <span className="text-neonBlue font-mono font-bold">#{i + 1}</span>
                                {p.name}
                            </span>
                            <span className="font-mono text-neonPink font-bold">{p.score}</span>
                        </div>
                    ))}
                </div>
            </div>
            {!isPremium && (
                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-gray-400 text-sm mb-4 text-center">Unlock Premium to see live global rankings!</p>
                    <button className="w-full bg-gradient-to-r from-neonBlue to-neonPink text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                        UNLOCK PREMIUM
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    {/* Logo - Top Left */}
                    <Link href="/" className="flex items-center gap-1.5 z-50">
                        <div className="w-8 h-8 md:w-6 md:h-6 bg-gradient-to-br from-neonBlue to-neonPink rounded-md flex items-center justify-center">
                            <span className="text-black font-black text-xs">3D</span>
                        </div>
                        <span className="logo-neon font-bold text-lg md:text-base block">3DBD</span>
                    </Link>

                    {/* Mobile: Space for Scoreboard in Center */}
                    <div className="flex-1" />

                    {/* User Panel or Auth Buttons */}
                    <div className="flex items-center gap-2 md:gap-4 z-50">
                        {/* Mobile Leaderboard Toggle */}
                        <button
                            onClick={() => setShowMobileLeaderboard(true)}
                            className="md:hidden p-2 text-white/50 hover:text-white transition-colors"
                            title="Leaderboard"
                        >
                            <Trophy size={20} />
                        </button>

                        {/* Replay / Reset Button */}
                        <button
                            onClick={() => useGameStore.getState().resetGame()}
                            className="p-2 text-white/50 hover:text-white transition-colors"
                            title="Replay / Reset Game"
                        >
                            <RotateCcw size={20} />
                        </button>

                        {/* Settings Button */}
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 text-white/50 hover:text-white transition-colors"
                            title="Settings"
                        >
                            <Settings size={20} />
                        </button>

                        {session ? (
                            <div className="hidden md:flex glass-panel px-4 py-2 rounded-xl items-center gap-3 justify-between">
                                <div className="flex items-center gap-3">
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-neonBlue shadow-[0_0_10px_#00f3ff]" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-neonBlue/20 flex items-center justify-center border border-neonBlue text-neonBlue">
                                            <User size={16} />
                                        </div>
                                    )}
                                    <div className="flex flex-col items-start leading-none text-left">
                                        <span className="text-sm font-bold text-white max-w-[120px] truncate">{session.user?.name || 'Player'}</span>
                                        <span className="text-[10px] text-neonPink font-bold uppercase tracking-wider">{isPremium ? 'PREMIUM' : 'FREE'}</span>
                                    </div>
                                </div>
                                <button onClick={() => signOut()} className="hover:bg-white/10 p-2 rounded-lg transition-colors border-0" title="Sign Out">
                                    <LogOut size={16} className="text-white/50" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsAuthDialogOpen(true)}
                                    className="hidden md:block text-white/80 hover:text-white font-medium text-sm"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setIsAuthDialogOpen(true)}
                                    className="bg-neonBlue hover:bg-neonBlue/90 text-black font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm transition-colors whitespace-nowrap"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Leaderboard Modal */}
            {showMobileLeaderboard && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                        onClick={() => setShowMobileLeaderboard(false)}
                    />
                    <div className="relative bg-[#111] border-t sm:border border-white/10 w-full sm:w-[400px] h-[70vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl p-6 pointer-events-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-700 rounded-full sm:hidden" />
                        <LeaderboardContent />
                    </div>
                </div>
            )}

            <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
            <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </>
    );
}
