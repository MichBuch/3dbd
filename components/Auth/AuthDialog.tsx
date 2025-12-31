'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, X } from 'lucide-react';

type AuthView = 'initial' | 'signup' | 'login' | 'pricing';
type PlanType = 'free' | 'pro';

interface AuthDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
    const [view, setView] = useState<AuthView>('initial');
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('free');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleOAuthSignIn = async (provider: string) => {
        setLoading(true);
        await signIn(provider, { callbackUrl: '/' });
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await signIn('nodemailer', { email, callbackUrl: '/' });
        setLoading(false);
    };

    const resetDialog = () => {
        setView('initial');
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setLoading(false);
    };

    const handleClose = () => {
        resetDialog();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                >
                    <X size={24} />
                </button>

                {/* Initial View - Login or Signup Choice */}
                {view === 'initial' && (
                    <div className="p-12 text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">Welcome to 3D4BD</h1>
                        <p className="text-gray-400 mb-8">Sign up to play against other users (no AI bots)</p>

                        <div className="flex gap-4 max-w-md mx-auto mb-6">
                            <button
                                onClick={() => setView('pricing')}
                                className="flex-1 bg-gradient-to-r from-neonBlue to-neonPink text-white font-bold py-4 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity shadow-lg"
                            >
                                Sign Up
                            </button>
                            <button
                                onClick={() => setView('login')}
                                className="flex-1 bg-white/10 border-2 border-white/20 text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-white/20 transition-colors"
                            >
                                Log In
                            </button>
                        </div>
                    </div>
                )}

                {/* Pricing View */}
                {view === 'pricing' && (
                    <div className="p-12">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Choose Your Plan</h2>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Free Plan */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                                <div className="text-5xl font-bold text-white mb-4">$0</div>
                                <p className="text-gray-400 mb-6">Play the algorithm</p>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <span className="text-green-400">✓</span>
                                        <span>Play vs Algorithm (Easy-Hard)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <span className="text-green-400">✓</span>
                                        <span>Local Stats</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedPlan('free');
                                        setView('signup');
                                    }}
                                    className="w-full bg-white/10 border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    Create Free Account
                                </button>
                            </div>

                            {/* Pro Plan */}
                            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-neonBlue rounded-2xl p-8">
                                <div className="absolute -top-3 right-6 bg-gradient-to-r from-neonBlue to-neonPink text-black text-xs font-bold px-4 py-1 rounded-full">
                                    RECOMMENDED
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                                <div className="text-5xl font-bold text-white mb-1">
                                    $9.99
                                    <span className="text-lg text-gray-400">/year</span>
                                </div>
                                <p className="text-gray-400 mb-6">Play other people globally</p>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <span className="text-neonBlue">✓</span>
                                        <span className="font-semibold">Online Multiplayer</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedPlan('pro');
                                        setView('signup');
                                    }}
                                    className="w-full bg-gradient-to-r from-neonBlue to-neonPink text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity text-lg shadow-lg"
                                >
                                    Upgrade Now
                                </button>
                            </div>
                        </div>

                        <p className="text-center text-gray-500 text-sm">
                            Already have an account?{' '}
                            <button onClick={() => setView('login')} className="text-neonBlue hover:underline">
                                Log in
                            </button>
                        </p>
                    </div>
                )}

                {/* Signup View */}
                {view === 'signup' && (
                    <div className="p-8 max-h-[80vh] overflow-y-auto">
                        <button onClick={() => setView('pricing')} className="text-gray-400 hover:text-white mb-4">
                            ← Back
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
                        <p className="text-gray-400 mb-6">
                            Sign up for the {selectedPlan === 'pro' ? 'Pro Competitor' : 'Casual Player'} plan
                        </p>

                        {/* OAuth Providers - Modern Icon Grid */}
                        <div className="mb-6">
                            <p className="text-gray-400 text-sm mb-4 text-center">Sign in with</p>
                            <div className="grid grid-cols-3 gap-3">
                                {/* Google - Enabled */}
                                <button
                                    onClick={() => handleOAuthSignIn('google')}
                                    disabled={loading}
                                    className="relative p-4 bg-white hover:bg-gray-100 rounded-xl transition-all group"
                                    title="Google"
                                >
                                    <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </button>

                                {/* GitHub - Enabled */}
                                <button
                                    onClick={() => handleOAuthSignIn('github')}
                                    disabled={loading}
                                    className="relative p-4 bg-[#24292e] hover:bg-[#1b1f23] rounded-xl transition-all group"
                                    title="GitHub"
                                >
                                    <svg className="w-8 h-8 mx-auto fill-white" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </button>

                                {/* Facebook - Enabled */}
                                <button
                                    onClick={() => handleOAuthSignIn('facebook')}
                                    disabled={loading}
                                    className="relative p-4 bg-[#1877F2] hover:bg-[#166FE5] rounded-xl transition-all group"
                                    title="Facebook"
                                >
                                    <svg className="w-8 h-8 mx-auto fill-white" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </button>

                                {/* Discord - Coming Soon */}
                                <button
                                    disabled
                                    className="relative p-4 bg-[#5865F2]/20 rounded-xl cursor-not-allowed opacity-50"
                                    title="Discord - Coming Soon"
                                >
                                    <svg className="w-8 h-8 mx-auto fill-[#5865F2]" viewBox="0 0 24 24">
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                                    </svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>

                                {/* Twitter/X - Coming Soon */}
                                <button
                                    disabled
                                    className="relative p-4 bg-black/20 rounded-xl cursor-not-allowed opacity-50"
                                    title="X (Twitter) - Coming Soon"
                                >
                                    <svg className="w-8 h-8 mx-auto fill-white" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>

                                {/* Apple - Coming Soon */}
                                <button
                                    disabled
                                    className="relative p-4 bg-black/20 rounded-xl cursor-not-allowed opacity-50"
                                    title="Apple - Coming Soon"
                                >
                                    <svg className="w-8 h-8 mx-auto fill-white" viewBox="0 0 24 24">
                                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                    </svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>

                                {/* Microsoft - Coming Soon */}
                                <button
                                    disabled
                                    className="relative p-4 bg-white/20 rounded-xl cursor-not-allowed opacity-50"
                                    title="Microsoft - Coming Soon"
                                >
                                    <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                                        <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z" />
                                        <path fill="#00A4EF" d="M24 11.4H12.6V0H24v11.4z" />
                                        <path fill="#7FBA00" d="M11.4 24H0V12.6h11.4V24z" />
                                        <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z" />
                                    </svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>

                                {/* TikTok - Coming Soon */}
                                <button
                                    disabled
                                    className="relative p-4 bg-black/20 rounded-xl cursor-not-allowed opacity-50"
                                    title="TikTok - Coming Soon"
                                >
                                    <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                                        <path fill="#25F4EE" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                        <path fill="#FE2C55" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>

                                {/* Instagram - Coming Soon */}
                                <button
                                    disabled
                                    className="relative p-4 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 opacity-50 rounded-xl cursor-not-allowed"
                                    title="Instagram - Coming Soon"
                                >
                                    <svg className="w-8 h-8 mx-auto fill-white" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>
                            </div>
                        </div>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-black px-2 text-gray-400">Or continue with email</span>
                            </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailSignIn} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="youremail@email.com"
                                    required
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter a unique password"
                                        required
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-neonBlue to-neonPink text-white font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg text-base mt-6"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                Email verification will be sent after signup
                            </p>
                        </form>

                        <p className="text-xs text-gray-500 mt-6 text-center border-t border-gray-700 pt-4">
                            By creating an account you agree to the Terms of Service and Privacy Policy
                        </p>
                    </div>
                )}

                {/* Login View */}
                {view === 'login' && (
                    <div className="p-12">
                        <button onClick={() => setView('initial')} className="text-gray-400 hover:text-white mb-6">
                            ← Back
                        </button>

                        <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
                        <p className="text-gray-400 mb-6">Log in to continue playing</p>

                        {/* OAuth Providers - Same Modern Icon Grid */}
                        <div className="mb-6">
                            <p className="text-gray-400 text-sm mb-4 text-center">Sign in with</p>
                            <div className="grid grid-cols-3 gap-3">
                                {/* Google */}
                                <button onClick={() => handleOAuthSignIn('google')} disabled={loading} className="relative p-4 bg-white hover:bg-gray-100 rounded-xl transition-all" title="Google">
                                    <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </button>
                                {/* GitHub */}
                                <button onClick={() => handleOAuthSignIn('github')} disabled={loading} className="relative p-4 bg-[#24292e] hover:bg-[#1b1f23] rounded-xl transition-all" title="GitHub">
                                    <svg className="w-8 h-8 mx-auto fill-white" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </button>
                                {/* Facebook */}
                                <button onClick={() => handleOAuthSignIn('facebook')} disabled={loading} className="relative p-4 bg-[#1877F2] hover:bg-[#166FE5] rounded-xl transition-all" title="Facebook">
                                    <svg className="w-8 h-8 mx-auto fill-white" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </button>
                                {/* Discord - Coming Soon */}
                                <button disabled className="relative p-4 bg-[#5865F2]/20 rounded-xl cursor-not-allowed opacity-50" title="Discord - Coming Soon">
                                    <svg className="w-8 h-8 mx-auto fill-[#5865F2]" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" /></svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>
                                {/* Twitter/X - Coming Soon */}
                                <button disabled className="relative p-4 bg-black/20 rounded-xl cursor-not-allowed opacity-50" title="X (Twitter) - Coming Soon">
                                    <svg className="w-8 h-8 mx-auto fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>
                                {/* Apple - Coming Soon */}
                                <button disabled className="relative p-4 bg-black/20 rounded-xl cursor-not-allowed opacity-50" title="Apple - Coming Soon">
                                    <svg className="w-8 h-8 mx-auto fill-white" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>
                                {/* Microsoft - Coming Soon */}
                                <button disabled className="relative p-4 bg-white/20 rounded-xl cursor-not-allowed opacity-50" title="Microsoft - Coming Soon">
                                    <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24"><path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z" /><path fill="#00A4EF" d="M24 11.4H12.6V0H24v11.4z" /><path fill="#7FBA00" d="M11.4 24H0V12.6h11.4V24z" /><path fill="#FFB900" d="M24 24H12.6V12.6H24V24z" /></svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>
                                {/* TikTok - Coming Soon */}
                                <button disabled className="relative p-4 bg-black/20 rounded-xl cursor-not-allowed opacity-50" title="TikTok - Coming Soon">
                                    <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24"><path fill="#25F4EE" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /><path fill="#FE2C55" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>
                                {/* Instagram - Coming Soon */}
                                <button disabled className="relative p-4 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 opacity-50 rounded-xl cursor-not-allowed" title="Instagram - Coming Soon">
                                    <svg className="w-8 h-8 mx-auto fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
                                </button>
                            </div>
                        </div>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-black px-2 text-gray-400">Or continue with email</span>
                            </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailSignIn} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="youremail@email.com"
                                    required
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-lg border-2 border-white text-lg mt-6"
                            >
                                {loading ? 'Logging in...' : 'Log In'}
                            </button>
                        </form>

                        <p className="text-sm text-gray-400 mt-6 text-center">
                            Don't have an account?{' '}
                            <button onClick={() => setView('pricing')} className="text-neonBlue hover:underline">
                                Sign up
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
