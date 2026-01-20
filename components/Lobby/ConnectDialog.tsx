'use client';

import { useState } from 'react';
import { Mail, Check, AlertCircle, X } from 'lucide-react';
import { useTranslation } from '@/lib/translations';

export const ConnectDialog = ({ onClose }: { onClose: () => void }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSend = async () => {
        if (!email.includes('@')) return; // Basic validation
        setStatus('sending');
        setErrorMessage('');

        try {
            const res = await fetch('/api/connect/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send request');
            }

            setStatus('success');
        } catch (e: any) {
            setStatus('error');
            setErrorMessage(e.message);
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200 rounded-2xl">
            <div className="w-full max-w-md bg-[#111] border border-white/20 p-6 rounded-xl shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Mail className="text-neonBlue" /> {t.connectFriend || 'Connect Friend'}
                </h3>

                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Enter your friend's email address to unlock <strong>Safe Chat</strong>.
                    They will receive an email to approve the connection.
                </p>

                {status === 'idle' || status === 'sending' || status === 'error' ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Friend's Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="friend@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neonBlue transition-colors"
                            />
                        </div>

                        {status === 'error' && (
                            <div className="text-red-500 text-sm flex items-center gap-2 bg-red-500/10 p-2 rounded">
                                <AlertCircle size={14} /> {errorMessage}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={status === 'sending' || !email}
                                className="flex-1 py-3 bg-neonBlue/20 text-neonBlue border border-neonBlue/50 hover:bg-neonBlue/30 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {status === 'sending' ? (
                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Send Request</>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                            <Check size={32} />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2">Request Sent!</h4>
                        <p className="text-gray-400 text-sm mb-6">
                            We've sent an approval email to <strong>{email}</strong>.
                            <br />Once they click the link, your chat will be unlocked.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-white text-black font-bold px-6 py-2 rounded-full hover:scale-105 transition-transform"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
