'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, X, MessageSquare } from 'lucide-react';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    createdAt: number;
}

interface SafeChatProps {
    gameId: string;
    players: {
        white: { id: string; name: string };
        black: { id: string; name: string };
    };
}

export const SafeChat = ({ gameId, players }: SafeChatProps) => {
    const { data: session } = useSession();
    const [canChat, setCanChat] = useState<boolean | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Check if allowed to chat
    useEffect(() => {
        if (!session?.user?.id) return;

        const checkPermission = async () => {
            try {
                const res = await fetch(`/api/game/${gameId}/chat?check=true`);
                if (res.ok) {
                    const data = await res.json();
                    setCanChat(data.allowed);
                }
            } catch (e) {
                console.error("Chat check failed", e);
                setCanChat(false);
            }
        };
        checkPermission();
    }, [gameId, session]);

    // 2. Poll Messages
    useEffect(() => {
        if (!canChat || !isOpen) return;

        const poll = setInterval(async () => {
            try {
                const res = await fetch(`/api/game/${gameId}/chat`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages || []);
                }
            } catch (e) {
                console.error(e);
            }
        }, 3000);

        return () => clearInterval(poll);
    }, [canChat, isOpen, gameId]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;

        const tempMsg = newMessage;
        setNewMessage(''); // Optimistic clear

        try {
            await fetch(`/api/game/${gameId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: tempMsg })
            });
            // Fetch immediately
            const res = await fetch(`/api/game/${gameId}/chat`);
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (e) {
            console.error(e);
            setNewMessage(tempMsg); // Restore on error
        }
    };

    if (!canChat) return null; // Hide completely if not allowed

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
            {/* Toggle Button */}
            <div className="pointer-events-auto">
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-neonBlue/20 hover:bg-neonBlue/40 text-neonBlue p-3 rounded-full shadow-lg border border-neonBlue transition-all hover:scale-110"
                    >
                        <MessageSquare size={24} />
                    </button>
                )}
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-black/80 backdrop-blur-md border border-neonBlue/30 rounded-lg w-72 h-80 flex flex-col shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-bottom-4">
                    {/* Header */}
                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-lg">
                        <span className="text-neonBlue font-bold text-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Safe Chat
                        </span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="text-center text-xs text-gray-500 mt-10">
                                This chat is private & encrypted.<br />History disappears when you leave.
                            </div>
                        )}
                        {messages.map(msg => {
                            const isMe = msg.senderId === session?.user?.id;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] px-3 py-1.5 rounded-lg text-xs break-words ${isMe
                                            ? 'bg-neonBlue/20 text-white border border-neonBlue/30 rounded-br-none'
                                            : 'bg-white/10 text-gray-200 border border-white/5 rounded-bl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-gray-500 px-1 mt-0.5">{msg.senderName}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-2 border-t border-white/10 bg-white/5 rounded-b-lg">
                        <div className="relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Say something..."
                                className="w-full bg-black/50 border border-white/10 rounded-md py-1.5 pl-2 pr-8 text-xs text-white focus:outline-none focus:border-neonBlue"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1 text-neonBlue hover:text-white p-1"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
