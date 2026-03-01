'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, MessageSquare, Minus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getSocket } from '@/lib/socketClient';

interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    createdAt: number;
}

export const ChatWindow = ({ gameId }: { gameId: string }) => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isOpenRef = useRef(isOpen);
    isOpenRef.current = isOpen;

    // Load history once on open
    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch(`/api/game/${gameId}/chat`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (e) {
            console.error('Chat fetch error', e);
        }
    }, [gameId]);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
            setUnread(0);
        }
    }, [isOpen, fetchHistory]);

    // Subscribe to real-time chat via socket
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleMessage = (msg: ChatMessage) => {
            setMessages(prev => {
                // Deduplicate by id
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            if (!isOpenRef.current) {
                setUnread(n => n + 1);
            }
        };

        socket.on('chat-message', handleMessage);
        return () => { socket.off('chat-message', handleMessage); };
    }, []);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;
        setInput('');

        // Optimistic local message
        const optimistic: ChatMessage = {
            id: `temp-${Date.now()}`,
            senderId: session?.user?.id || '',
            senderName: session?.user?.name || 'Me',
            text,
            createdAt: Date.now()
        };
        setMessages(prev => [...prev, optimistic]);

        try {
            const res = await fetch(`/api/game/${gameId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            if (res.ok) {
                const data = await res.json();
                // Replace optimistic with real message
                setMessages(prev =>
                    prev.map(m => m.id === optimistic.id ? { ...data.message } : m)
                );
            }
        } catch (e) {
            console.error('Send error', e);
            setInput(text); // Restore on failure
            setMessages(prev => prev.filter(m => m.id !== optimistic.id));
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => { setIsOpen(true); setUnread(0); }}
                className="fixed bottom-4 right-4 z-50 bg-neonPink text-white p-3 rounded-full shadow-[0_0_15px_rgba(255,0,128,0.5)] hover:scale-110 transition-transform"
                aria-label="Open chat"
            >
                <MessageSquare size={24} />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                <span className="font-bold text-white flex items-center gap-2">
                    <MessageSquare size={16} className="text-neonPink" /> Game Chat
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Minimize chat">
                    <Minus size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 text-xs mt-10">No messages yet. Say hi! 👋</div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.senderId === session?.user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-xl p-2 px-3 text-sm ${isMe
                                ? 'bg-neonPink/20 text-white border border-neonPink/30'
                                : 'bg-white/10 text-gray-200 border border-white/10'
                            }`}>
                                {!isMe && <div className="text-[10px] text-gray-400 mb-1">{msg.senderName}</div>}
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-white/10 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={500}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neonPink"
                />
                <button
                    type="submit"
                    className="bg-neonPink hover:bg-neonPink/80 text-white p-2 rounded-lg transition-colors"
                    aria-label="Send message"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
};
