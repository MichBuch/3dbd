'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from 'next/link';

export default function SignUpModePage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await signIn('nodemailer', { email, callbackUrl: '/' });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Link href="/signup" className="absolute top-4 left-4 text-gray-500 hover:text-white">
                ← Back
            </Link>

            <div className="glass-panel p-8 rounded-xl max-w-md w-full">
                <h1 className="text-2xl font-black text-white mb-6 text-center">
                    Create Account
                </h1>

                {/* Email Form */}
                <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-neonBlue"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-neonBlue to-neonPink text-black font-bold py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Sign in with Email'}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-black text-white/50">Or continue with</span>
                    </div>
                </div>

                {/* OAuth Providers */}
                <div className="space-y-3">
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="w-full bg-white/10 border border-white/20 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform"
                    >
                        Google
                    </button>
                    <button
                        onClick={() => signIn('github', { callbackUrl: '/' })}
                        className="w-full bg-white/10 border border-white/20 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform"
                    >
                        GitHub
                    </button>
                </div>
            </div>
        </div>
    );
}
