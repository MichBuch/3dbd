import React from 'react';

interface AdContainerProps {
    slotId: string; // Google AdSense Slot ID
    format?: 'auto' | 'fluid' | 'rectangle';
}

export const AdContainer: React.FC<AdContainerProps> = ({ slotId, format = 'auto' }) => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-black/20 border border-white/10 rounded-lg overflow-hidden relative">
            {/* Placeholder for AdSense Script */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 text-xs font-mono select-none">
                <span className="mb-1">ADVERTISEMENT</span>
                <span className="text-[10px] opacity-50">Free Tier Support</span>
            </div>

            {/* Actual AdSense Code would go here */}
            {/* <ins className="adsbygoogle" ... /> */}
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        </div>
    );
};
