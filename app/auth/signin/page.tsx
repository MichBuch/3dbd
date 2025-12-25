'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { loadEnvConfig } from "@next/env";

export default function SignIn() {
    const [email, setEmail] = useState("");

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        signIn("resend", { email, callbackUrl: "/" });
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,100,255,0.1),transparent_70%)]" />

            <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/10 relative z-10">
                <Link href="/" className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>

                <div className="text-center mb-10 mt-4">
                    <h1 className="text-3xl font-black tracking-tighter mb-2">Welcome Back</h1>
                    <p className="text-gray-400 text-sm">Sign in to track your victory</p>
                </div>

                {/* Social Logins */}
                <div className="space-y-3">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
                    >
                        <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5" alt="Google" />
                        Continue with Google
                    </button>
                    <button
                        onClick={() => signIn("github", { callbackUrl: "/" })}
                        className="w-full py-3 rounded-xl bg-[#24292F] text-white font-bold hover:bg-[#24292F]/90 transition-colors flex items-center justify-center gap-3 border border-white/10"
                    >
                        <img src="https://authjs.dev/img/providers/github.svg" className="w-5 h-5 invert" alt="GitHub" />
                        Continue with GitHub
                    </button>
                    {/* Facebook & X placeholders - keys needed to work */}
                    <button
                        onClick={() => signIn("facebook", { callbackUrl: "/" })}
                        className="w-full py-3 rounded-xl bg-[#1877F2] text-white font-bold hover:bg-[#1877F2]/90 transition-colors flex items-center justify-center gap-3"
                    >
                        {/* SVG Icon would go here */}
                        <span>Continue with Facebook</span>
                    </button>
                </div>

                <div className="my-8 flex items-center gap-4">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-xs text-gray-500 font-bold uppercase">Or with Email</span>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neonBlue transition-colors"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-neonBlue to-neonPink text-black font-bold hover:scale-[1.02] transition-transform"
                    >
                        Sign in with Email
                    </button>
                </form>
            </div>
        </div>
    );
}
