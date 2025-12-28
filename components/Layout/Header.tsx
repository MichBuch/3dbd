'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AuthDialog } from '@/components/Auth/AuthDialog';

export function Header() {
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-neonBlue to-neonPink rounded-lg flex items-center justify-center">
                            <span className="text-black font-black text-lg">3D</span>
                        </div>
                        <span className="text-white font-bold text-xl">3dBd</span>
                    </Link>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-4">
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
                    </div>
                </div>
            </header>

            <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
        </>
    );
}
