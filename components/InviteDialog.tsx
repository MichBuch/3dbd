'use client';

import { useState } from 'react';
import { X, Mail, MessageCircle, Copy, Check, Smartphone, Share2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface InviteDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InviteDialog({ isOpen, onClose }: InviteDialogProps) {
    const { data: session } = useSession();
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    // Generate a generic invite link (landing page)
    // For specific game invites, we'd need game context, but Header is usually global.
    // If we want a specific "Connect" invite, we use the code flow.
    // user requested "Invite via email, whatsapp, sms or cut and paste".

    // Let's assume this is a generic "Come play with me" link for now, 
    // unless we are in a game context. 
    // Given it's in the Header, it's likely a global app invite or friend connection invite.

    // Ideally, this should generate a unique invite CODE for friend connection.
    // But for a simple "Invite", the homepage URL is safest if no specific feature is triggered.
    // However, the user mentioned "copy invite link does not work... leads to hydration error", 
    // implying there IS an existing link logic.

    // We'll fetch the invite code on mount or use a static one?
    // Let's implement the UI first and fetch logic inside.

    const inviteUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(`Come play 3DBD with me! It's an awesome 3D Connect 4 game. Play here: ${inviteUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handleSMS = () => {
        const text = encodeURIComponent(`Come play 3DBD with me! ${inviteUrl}`);
        window.open(`sms:?body=${text}`, '_blank');
    };

    const handleEmail = (e: React.FormEvent) => {
        e.preventDefault();
        // Use mailto for simplicity, or backend API if needed. 
        // Mailto is safer for "client-side only" interaction without backend spam risk.
        const subject = encodeURIComponent("Play 3DBD with me!");
        const body = encodeURIComponent(`Hey,\n\nI'm playing 3DBD, a cool 3D strategy game. Come join me!\n\n${inviteUrl}`);
        window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Mail className="text-neonPink" /> Invite Friends
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                    Share the link to challenge friends to a game of 3DBD!
                </p>

                {/* Copy Link Section */}
                <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10 flex items-center gap-3">
                    <code className="flex-1 text-neonBlue text-sm truncate font-mono">
                        {inviteUrl}
                    </code>
                    <button
                        onClick={handleCopy}
                        className={`p-2 rounded-lg transition-all ${copied
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        title="Copy to Clipboard"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                        onClick={handleWhatsApp}
                        className="flex flex-col items-center gap-2 p-3 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-colors"
                    >
                        <MessageCircle size={24} />
                        <span className="text-xs font-bold">WhatsApp</span>
                    </button>
                    <button
                        onClick={handleSMS}
                        className="flex flex-col items-center gap-2 p-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors"
                    >
                        <Smartphone size={24} />
                        <span className="text-xs font-bold">SMS</span>
                    </button>
                    <button
                        onClick={() => window.open(`mailto:?subject=Play 3DBD&body=${inviteUrl}`, '_self')}
                        className="flex flex-col items-center gap-2 p-3 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                    >
                        <Mail size={24} />
                        <span className="text-xs font-bold">Email App</span>
                    </button>
                    {typeof navigator !== 'undefined' && navigator.share && (
                        <button
                            onClick={() => navigator.share({ title: 'Play 3DBD', text: 'Come play 3DBD with me!', url: inviteUrl })}
                            className="flex flex-col items-center gap-2 p-3 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                        >
                            <Share2 size={24} />
                            <span className="text-xs font-bold">Share</span>
                        </button>
                    )}
                </div>

                {/* Direct Email Form (Optional) */}
                <form onSubmit={handleEmail} className="relative">
                    <div className="text-xs text-uppercase text-gray-500 font-bold mb-2">SEND VIA EMAIL</div>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            required
                            placeholder="friend@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-neonPink outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-neonPink hover:bg-neonPink/80 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
