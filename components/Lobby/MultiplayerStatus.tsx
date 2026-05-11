'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, ExternalLink } from 'lucide-react';

interface Props {
    isMultiplayerEnabled: boolean;
    railwayUrl: string;
}

/**
 * Two-part multiplayer status:
 * 1. A top toast that fades out after 8 seconds on first load
 * 2. A persistent small icon in the corner with tooltip for ongoing awareness
 */
export const MultiplayerStatus = ({ isMultiplayerEnabled, railwayUrl }: Props) => {
    const [showToast, setShowToast] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);

    useEffect(() => {
        if (isMultiplayerEnabled) return; // No need to show anything
        // Show toast on mount
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 8000);
        return () => clearTimeout(timer);
    }, [isMultiplayerEnabled]);

    if (isMultiplayerEnabled) {
        // Show a subtle "live" indicator when multiplayer works
        return (
            <div
                className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-300 text-xs backdrop-blur-sm cursor-default"
                title="Multiplayer server connected"
            >
                <Wifi size={12} />
                <span className="hidden sm:inline">Live</span>
            </div>
        );
    }

    return (
        <>
            {/* Fading toast at the top */}
            {showToast && (
                <div
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-500"
                    style={{ animation: 'fadeOut 1s ease-in 7s forwards' }}
                >
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-xs text-white/80 flex items-center gap-2 shadow-lg">
                        <WifiOff size={12} className="text-amber-400" />
                        <span>Offline mode — AI only.</span>
                        <a
                            href={railwayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neonBlue hover:text-white transition-colors flex items-center gap-1"
                        >
                            Play live
                            <ExternalLink size={10} />
                        </a>
                    </div>
                </div>
            )}

            {/* Persistent corner indicator */}
            <div
                className="fixed bottom-4 right-4 z-40"
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
            >
                <a
                    href={railwayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-xs backdrop-blur-sm transition-colors"
                    title="Multiplayer unavailable on this deployment"
                >
                    <WifiOff size={12} />
                    <span className="hidden sm:inline">AI only</span>
                </a>

                {tooltipVisible && (
                    <div className="absolute bottom-full right-0 mb-2 w-56 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-3 text-xs text-white/80 shadow-xl animate-in fade-in duration-200">
                        <p className="font-semibold text-white mb-1">Multiplayer unavailable</p>
                        <p className="text-white/60 mb-2 leading-relaxed">
                            This deployment runs serverless and can&apos;t host Socket.IO. Click to play live on the game server.
                        </p>
                        <span className="text-neonBlue flex items-center gap-1">
                            Open live server <ExternalLink size={10} />
                        </span>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; visibility: hidden; }
                }
            `}</style>
        </>
    );
};
