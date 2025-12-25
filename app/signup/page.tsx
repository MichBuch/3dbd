'use client';
import { signIn } from "next-auth/react";
import { Check, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function Signup() {
    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,243,255,0.1),transparent_50%)]" />

            <Link href="/" className="z-10 absolute top-6 left-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Back to Game
            </Link>

            <div className="z-10 max-w-5xl mx-auto w-full mt-12">
                <div className="text-center mb-16">
                    <h1 className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPink">
                        LEVEL UP YOUR GAME
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Create an account to track your stats, or go Premium to dominate the global leaderboards.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <div className="glass-panel p-8 rounded-3xl border-t border-white/10 hover:border-white/20 transition-all flex flex-col">
                        <h2 className="text-2xl font-bold mb-2">Player Account</h2>
                        <div className="text-4xl font-black mb-6">$0<span className="text-lg font-normal text-gray-500">/forever</span></div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-gray-300"><Check className="text-neonBlue" /> Play vs AI (Easy)</li>
                            <li className="flex items-center gap-3 text-gray-300"><Check className="text-neonBlue" /> Save Local Stats</li>
                            <li className="flex items-center gap-3 text-gray-300"><Check className="text-neonBlue" /> Customizable Themes</li>
                        </ul>

                        <button
                            onClick={() => signIn()}
                            className="w-full py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        >
                            Create Free Account
                        </button>
                    </div>

                    {/* Premium Tier */}
                    <div className="glass-panel p-8 rounded-3xl border border-neonBlue/30 relative flex flex-col overflow-hidden bg-neonBlue/5">
                        <div className="absolute top-0 right-0 bg-neonBlue text-black text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>

                        <h2 className="text-2xl font-bold mb-2 text-neonBlue">Pro Competitor</h2>
                        <div className="text-4xl font-black mb-6 flex items-baseline gap-1">
                            $9.99<span className="text-lg font-normal text-gray-500">/year</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-white"><Check className="text-neonPink" /> Everything in Free</li>
                            <li className="flex items-center gap-3 text-white"><Check className="text-neonPink" /> <b>Online Multiplayer</b></li>
                            <li className="flex items-center gap-3 text-white"><Check className="text-neonPink" /> Global Leaderboards</li>
                            <li className="flex items-center gap-3 text-white"><Check className="text-neonPink" /> Advanced AI (Hard Mode)</li>
                        </ul>

                        <button
                            onClick={() => signIn(undefined, { callbackUrl: '/?upgrade=true' })}
                            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-neonBlue to-neonPink text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                        >
                            Get Premium
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
