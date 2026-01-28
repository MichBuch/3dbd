'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    if (!token || !email) {
        return (
            <div className="text-red-500 text-center">
                Invalid reset link. Please try requesting a new one.
                <br />
                <Link href="/auth/forgot-password" className="text-blue-400 hover:underline mt-2 inline-block">
                    Request Reset
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage("Password must be at least 6 characters.");
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, identifier: email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    router.push('/auth/login');
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to connect to the server.');
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center">
                <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-lg text-sm mb-4">
                    {message}
                </div>
                <Link href="/auth/login" className="text-white hover:text-gray-300 font-bold">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm text-gray-300 mb-2">New Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                />
            </div>
            <div>
                <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                />
            </div>

            {status === 'error' && (
                <div className="text-red-500 text-sm">{message}</div>
            )}

            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-neonBlue to-purple-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h1>
                <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
