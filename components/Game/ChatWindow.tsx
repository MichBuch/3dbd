'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, MessageSquare, X, Minus } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ChatMessage {
    id: string;
    senderId: string;
    message: string;
    createdAt: string;
    sender: {
        name: string;
        image: string | null;
    }
}

export const ChatWindow = ({ gameId }: { gameId: string }) => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        const res = await fetch(`/api/chats?gameId=${gameId}`);
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const tempMsg: ChatMessage = {
            id: 'temp-' + Date.now(),
            senderId: session?.user?.id || 'me',
            message: input,
            createdAt: new Date().toISOString(),
            sender: {
                name: session?.user?.name || 'Me',
                image: session?.user?.image || null
            }
        };

        setMessages(prev => [...prev, tempMsg]);
        setInput('');

        await fetch('/api/chats', {
            method: 'POST',
            body: JSON.stringify({ gameId, message: tempMsg.message })
        });

        fetchMessages();
    };

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [gameId, isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-neonPink text-white p-3 rounded-full shadow-[0_0_15px_rgba(255,0,128,0.5)] hover:scale-110 transition-transform"
            >
                <MessageSquare size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                <span className="font-bold text-white flex items-center gap-2">
                    <MessageSquare size={16} className="text-neonPink" /> Game Chat
                </span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
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
                                {!isMe && <div className="text-[10px] text-gray-400 mb-1">{msg.sender.name}</div>}
                                {msg.message}
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
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neonPink"
                />
                <button
                    type="submit"
                    className="bg-neonPink hover:bg-neonPink/80 text-white p-2 rounded-lg transition-colors"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
};
