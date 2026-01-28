'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from 'next/link';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (password) {
            await signIn('credentials', { email, password, callbackUrl: '/' });
        } else {
            await signIn('nodemailer', { email, callbackUrl: '/' });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Link href="/signup" className="absolute top-4 left-4 text-gray-500 hover:text-white text-sm">
                ← Back
            </Link>

            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold text-white mb-2">Create your free account</h1>
                <p className="text-gray-400 text-sm mb-6">Connect to Neon with:</p>

                {/* Primary Providers (The Big Three) */}
                <div className="space-y-3 mb-6">
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <button
                        onClick={() => signIn('facebook', { callbackUrl: '/' })}
                        className="w-full bg-[#1877F2] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#1864D9] transition-colors flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v2.225l-.338.006c-2.969 0-3.434 1.87-3.434 3.443v1.586h3.91l-.582 3.667h-3.328v7.98h-4.7z" />
                        </svg>
                        Continue with Facebook
                    </button>

                    <button
                        onClick={() => signIn('apple', { callbackUrl: '/' })}
                        className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.24-.93 3.69-.71 1.52.25 2.67.84 3.42 2.17-2.82 1.25-3.08 6.43.02 7.84-.57 1.46-1.34 2.87-2.21 2.93M12.98 5.16c.71-.97.62-2.31.06-3.46-1.12.18-2.47.88-2.92 1.98-.59 1.48.2 2.95 1.34 2.95.83-.02 1.25-.66 1.52-1.47z" />
                        </svg>
                        Continue with Apple
                    </button>
                </div>

                {/* Secondary Providers Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => signIn('tiktok', { callbackUrl: '/' })}
                        className="bg-[#111111] border border-gray-800 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.588 0C12.588 0 12.588 0 12.588 0H16.29C16.29 2.03 17.93 3.69 19.98 3.69V7.4C18.15 7.4 16.48 6.57 15.34 5.23C15.34 5.23 15.34 12.79 15.34 13.06C15.09 17.65 11.23 21.05 6.63 20.65C2.52 20.3 0 16.92 0 12.82C0 8.71 3.35 5.37 7.45 5.37C7.88 5.37 8.3 5.42 8.7 5.52V9.3C8.35 9.19 7.98 9.13 7.6 9.13C5.56 9.13 3.91 10.78 3.91 12.82C3.91 14.86 5.56 16.51 7.6 16.51C9.64 16.51 11.29 14.86 11.29 12.82V0H12.588Z" />
                        </svg>
                        TikTok
                    </button>

                    <button
                        onClick={() => signIn('twitter', { callbackUrl: '/' })}
                        className="bg-[#111111] border border-gray-800 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        X / Twitter
                    </button>

                    <button
                        onClick={() => signIn('discord', { callbackUrl: '/' })}
                        className="bg-[#5865F2] text-white font-medium py-2.5 px-4 rounded-lg hover:bg-[#4752C4] transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" /></svg>
                        Discord
                    </button>

                    <button
                        onClick={() => signIn('microsoft-entra-id', { callbackUrl: '/' })}
                        className="bg-[#2F2F2F] border border-gray-800 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-[#3F3F3F] transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill="#f25022" d="M1 1h10v10H1z" /><path fill="#00a4ef" d="M13 1h10v10H13z" /><path fill="#7fba00" d="M1 13h10v10H1z" /><path fill="#ffb900" d="M13 13h10v10H13z" /></svg>
                        Microsoft
                    </button>

                    <button
                        onClick={() => signIn('linkedin', { callbackUrl: '/' })}
                        className="bg-[#0077b5] text-white font-medium py-2.5 px-4 rounded-lg hover:bg-[#006396] transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        LinkedIn
                    </button>

                    <button
                        onClick={() => signIn('github', { callbackUrl: '/' })}
                        className="bg-[#24292F] text-white font-medium py-2.5 px-4 rounded-lg hover:bg-[#24292F]/90 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                    </button>

                    <button
                        onClick={() => signIn('wechat', { callbackUrl: '/' })}
                        className="bg-[#07C160] text-white font-medium py-2.5 px-4 rounded-lg hover:bg-[#06ad56] transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.69 13.916c3.87 0 6.666-2.583 6.666-6.104 0-3.238-2.97-5.96-6.666-5.96-3.87 0-6.908 2.583-6.908 5.96 0 1.928.98 3.657 2.505 4.766-.11.833-.352 1.928-.397 2.274 0 0 .97-.132 2.05-.847a6.764 6.764 0 002.75.16zm9.332 7.749c-.21.011-.42.016-.632.016-2.905 0-5.433-1.685-5.433-4.28 0-2.43 2.247-4.551 5.313-4.551 3.204 0 5.46 2.011 5.46 4.39 0 2.541-2.42 4.425-4.709 4.425zm5.73-3.79c.002-.132.004-.263.004-.396 0-3.665-3.567-6.521-7.568-6.521-4.148 0-7.397 2.822-7.397 6.36 0 3.682 3.407 6.541 7.397 6.541.868 0 1.708-.124 2.493-.356 1.05.717 1.99.782 1.99.782-.043-.376-.28-1.442-.387-2.185 1.764-1.325 2.768-2.96 2.768-4.225z" /></svg>
                        WeChat
                    </button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-black px-2 text-gray-400">Or sign in with email</span>
                    </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Email address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="youremail@email.com"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm text-gray-300">Password (Optional)</label>
                            <Link href="/auth/forgot-password" className="text-xs text-blue-400 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="........"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Leave blank to use Magic Link</p>
                    </div>

                    {!password ? (
                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-200 mb-4">
                            We'll send you a magic link to sign in instantly. No password required.
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-neonBlue to-purple-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 hover:scale-[1.02]"
                    >
                        {loading ? 'Processing...' : (password ? 'Log In' : 'Send Magic Link')}
                    </button>
                </form>

                <p className="text-xs text-gray-500 mt-6">
                    By creating an account you agree to the <Link href="#" className="text-blue-400 hover:underline">Terms of Service</Link> and our <Link href="#" className="text-blue-400 hover:underline">Privacy Policy</Link>. We'll occasionally send you emails about news, products, and services; you can opt-out anytime.
                </p>

                <p className="text-sm text-gray-400 mt-6 text-center">
                    Already have an account? <Link href="/auth/login" className="text-blue-400 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}
