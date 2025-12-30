'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const CookieConsent = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setShowBanner(false);
    };

    const declineCookies = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/95 backdrop-blur-md border-t border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-white font-bold mb-2">🍪 Cookie Notice</h3>
                    <p className="text-gray-300 text-sm">
                        We use cookies and local storage to save your game preferences, settings, and provide essential functionality.
                        By continuing to use this site, you agree to our use of cookies.
                        <a href="/privacy" className="text-neonBlue hover:underline ml-1">Privacy Policy</a> •
                        <a href="/terms" className="text-neonBlue hover:underline ml-1">Terms of Service</a>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={declineCookies}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                    >
                        Decline
                    </button>
                    <button
                        onClick={acceptCookies}
                        className="px-6 py-2 bg-neonBlue text-black rounded-lg hover:bg-neonBlue/90 transition-colors font-bold"
                    >
                        Accept Cookies
                    </button>
                </div>
            </div>
        </div>
    );
};
