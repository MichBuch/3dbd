'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AuthDialog } from '@/components/Auth/AuthDialog';
import { User, LogOut } from 'lucide-react';

export function Header() {
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const { data: session } = useSession();
    // @ts-ignore
    const isPremium = session?.user?.plan === 'premium';

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-neonBlue to-neonPink rounded-lg flex items-center justify-center">
                            <span className="text-black font-black text-lg">3D</span>
                        </div>
                        <span className="text-white font-bold text-xl">3DBD</span>
                    </Link>

                    {/* User Panel or Auth Buttons */}
                    <div className="flex items-center gap-4">
                        {session ? (
                            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 justify-between">
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
                            <>
                                <button
                                    onClick={() => setIsAuthDialogOpen(true)}
                                    className="text-white/80 hover:text-white font-medium text-sm"
                                >
                                    Log in
                                </button>
                                <button
                                    onClick={() => setIsAuthDialogOpen(true)}
                                    className="bg-neonBlue hover:bg-neonBlue/90 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
        </>
    );
}
