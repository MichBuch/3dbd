'use client';

import { useParams, useRouter } from 'next/navigation';
import { Gift, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';

export default function InvitePage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;
    const [claimed, setClaimed] = useState(false);

    const handleClaim = () => {
        setClaimed(true);
        // Simulate API check or just redirect with code
        setTimeout(() => {
            router.push(`/signup?referral=${code}`);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neonBlue/20 via-black to-black opacity-40 animate-pulse-slow" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20" />

            <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-white/10 relative z-10 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-gradient-to-br from-neonBlue to-neonPink rounded-full mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                    <Gift size={40} className="text-white animate-bounce" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">You've Been Invited!</h1>
                <p className="text-gray-400 mb-8">
                    A friend wants you to join <span className="text-neonBlue font-bold">3D Bead Drop</span>.
                </p>

                <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
                    <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">Your Exclusive Offer</div>
                    <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                        <span className="text-neonPink">24 Hours</span> Free Premium
                    </div>
                    <ul className="mt-4 space-y-2 text-left">
                        <li className="flex items-center gap-2 text-sm text-gray-300">
                            <Check size={16} className="text-green-400" /> Unlock all bead skins
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-300">
                            <Check size={16} className="text-green-400" /> No ads
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-300">
                            <Check size={16} className="text-green-400" /> Detailed stats
                        </li>
                    </ul>
                </div>

                <button
                    onClick={handleClaim}
                    disabled={claimed}
                    className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                    {claimed ? 'Claiming...' : 'Accept Invitation'}
                    {!claimed && <ArrowRight size={20} />}
                </button>

                <p className="mt-4 text-xs text-gray-600">
                    Invite Code: <span className="font-mono text-gray-500">{code}</span>
                </p>
            </div>
        </div>
    );
}
