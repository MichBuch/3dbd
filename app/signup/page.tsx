'use client';
import { signIn } from "next-auth/react";
import { Check, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function Signup() {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'black',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Gradient Fallback */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #000000 100%)',
                zIndex: 0
            }} />

            {/* Back Link */}
            <Link href="/" style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: '#888',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 20,
                fontSize: '14px',
                fontWeight: 'bold'
            }}>
                ← Back to Game
            </Link>

            {/* Main Card Container */}
            <div style={{
                width: '100%',
                maxWidth: '800px',
                backgroundColor: 'rgba(20, 20, 20, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                zIndex: 10,
                flexWrap: 'wrap'
            }}>

                {/* Left Column: Casual */}
                <div style={{
                    flex: '1',
                    minWidth: '280px',
                    padding: '32px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <h2 className="text-xl font-bold mb-2 text-white">Casual Player</h2>
                    <div className="text-3xl font-black mb-4 text-white/50">$0</div>

                    <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                        Perfect for learning the ropes. Play against the AI and track your local progress.
                    </p>

                    <ul className="space-y-3 mb-6 text-xs cursor-default">
                        <li className="flex items-center gap-2 text-gray-300"><Check size={14} className="text-neonBlue" /> Play vs AI (Easy/Hard)</li>
                        <li className="flex items-center gap-2 text-gray-300"><Check size={14} className="text-neonBlue" /> Local Stats</li>
                    </ul>

                    <Link
                        href="/auth/signin?mode=signup"
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textAlign: 'center',
                            textDecoration: 'none',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }}
                    >
                        Create Free Account
                    </Link>
                </div>

                {/* Right Column: Premium */}
                <div style={{
                    flex: '1',
                    minWidth: '280px',
                    padding: '32px',
                    background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.05) 0%, rgba(200, 0, 255, 0.05) 100%)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: '#00f3ff',
                        color: 'black',
                        fontSize: '9px',
                        fontWeight: '900',
                        padding: '4px 10px',
                        borderBottomLeftRadius: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Recommended
                    </div>

                    <h2 className="text-xl font-bold mb-2 text-white">Pro Competitor</h2>
                    <div className="text-3xl font-black mb-4 text-white">
                        $9.99 <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>/year</span>
                    </div>

                    <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                        Unlock the full SaaS experience. Challenge real players worldwide and climb the ranks.
                    </p>

                    <ul className="space-y-3 mb-6 text-xs cursor-default">
                        <li className="flex items-center gap-2 text-white"><Check size={14} className="text-neonPink" /> <b>Online Multiplayer</b></li>
                        <li className="flex items-center gap-2 text-white"><Check size={14} className="text-neonPink" /> Global Leaderboards</li>
                        <li className="flex items-center gap-2 text-white"><Check size={14} className="text-neonPink" /> Priority Support</li>
                    </ul>

                    <button
                        onClick={() => signIn(undefined, { callbackUrl: '/?upgrade=true' })}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'linear-gradient(90deg, #00f3ff, #ff00ff)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'black',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '14px',
                            boxShadow: '0 0 20px rgba(0, 243, 255, 0.3)',
                            marginTop: 'auto'
                        }}
                    >
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
}
