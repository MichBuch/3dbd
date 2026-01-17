'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 border-t border-white/10 z-50 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md animate-in slide-in-from-bottom">
            <div className="text-sm text-gray-300 text-center md:text-left">
                <p>
                    We use cookies to enhance your experience, analyze traffic, and personalize content (including Ads).
                    By playing, you agree to our use of cookies.
                </p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={accept}
                    className="bg-neonBlue text-black px-6 py-2 rounded-full font-bold hover:bg-white transition-colors"
                >
                    Got it!
                </button>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-2 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
