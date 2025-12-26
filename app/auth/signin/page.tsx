'use client';

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SignInContent() {
    const [email, setEmail] = useState("");
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode");
    const isSignup = mode === "signup";

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        signIn("nodemailer", { email, callbackUrl: "/" });
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'black',
            backgroundImage: 'radial-gradient(ellipse at center, #1a1a1a 0%, #000000 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            fontFamily: 'sans-serif'
        }}>
            {/* Main Card */}
            <div style={{
                width: '100%',
                maxWidth: '360px',
                backgroundColor: 'rgba(20, 20, 20, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                zIndex: 10
            }}>
                <Link href="/" style={{ position: 'absolute', top: '20px', left: '20px', color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}>
                    <ArrowLeft size={18} />
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '0px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00f3ff, #ff00ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '12px', fontWeight: '900', color: 'white', fontSize: '28px',
                        boxShadow: '0 0 30px rgba(0, 243, 255, 0.4)'
                    }}>3dBd</div>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                        {isSignup ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p style={{ fontSize: '13px', color: '#888' }}>
                        {isSignup ? "Sign up" : "Sign in"} or <Link href={isSignup ? "/auth/signin" : "/signup"} style={{ color: '#00f3ff', textDecoration: 'none', fontWeight: 'bold' }}>
                            {isSignup ? "Sign in" : "Sign up"}
                        </Link>
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        style={{
                            width: '100%', height: '40px', borderRadius: '8px', border: 'none',
                            backgroundColor: 'white', color: '#333', fontWeight: '600', fontSize: '13px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                    <button
                        onClick={() => signIn("github", { callbackUrl: "/" })}
                        style={{
                            width: '100%', height: '40px', borderRadius: '8px',
                            backgroundColor: '#24292F', color: 'white', fontWeight: '600', fontSize: '13px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                        Continue with GitHub
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ fontSize: '10px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={14} />
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%', height: '40px', backgroundColor: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                paddingLeft: '36px', paddingRight: '12px', color: 'white', fontSize: '13px',
                                outline: 'none'
                            }}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            width: '100%', height: '40px', borderRadius: '8px', border: 'none',
                            background: 'linear-gradient(90deg, #00f3ff, #0099ff)', color: 'black', fontWeight: 'bold',
                            fontSize: '13px', cursor: 'pointer', boxShadow: '0 0 15px rgba(0, 243, 255, 0.2)'
                        }}
                    >
                        {isSignup ? "Create Account via Email" : "Sign in with Email"}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '10px', color: '#666' }}>
                    Protected by reCAPTCHA and subject to the Privacy Policy.
                </p>
            </div>
        </div>
    );
}

export default function SignIn() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInContent />
        </Suspense>
    );
}
