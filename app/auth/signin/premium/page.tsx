'use client';
import { signIn } from "next-auth/react";
import Link from 'next/link';

export default function PremiumSignUpPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Link href="/signup" className="absolute top-4 left-4 text-gray-500 hover:text-white">
                ← Back
            </Link>

            <div className="glass-panel p-8 rounded-xl max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="inline-block bg-gradient-to-r from-neonBlue to-neonPink text-black text-xs font-black px-3 py-1 rounded-full mb-4">
                        PREMIUM
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">
                        Upgrade to Pro
                    </h1>
                    <p className="text-white/60 text-sm">
                        $9.99/year • Sign in to complete upgrade
                    </p>
                </div>

                {/* OAuth Providers */}
                <div className="space-y-3">
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/?upgrade=true' })}
                        className="w-full bg-white/10 border border-white/20 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform"
                    >
                        Continue with Google
                    </button>
                    <button
                        onClick={() => signIn('github', { callbackUrl: '/?upgrade=true' })}
                        className="w-full bg-white/10 border border-white/20 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform"
                    >
                        Continue with GitHub
                    </button>
                </div>

                <p className="text-white/40 text-xs text-center mt-6">
                    You'll be redirected to Stripe to complete payment
                </p>
            </div>
        </div>
    );
}
