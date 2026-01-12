'use client';

import { useState } from 'react';
import { upsertThemeAsset } from '@/app/actions/admin';

export const UploadClient = ({ themeId }: { themeId: string }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!url) return;
        setLoading(true);
        const res = await upsertThemeAsset(themeId, url, 'image'); // Default to image for now
        setLoading(false);
        if (res.success) {
            alert('Updated!');
            setUrl('');
            // In a real app we'd trigger a router refresh here, but Server Action revalidatePath handles it mostly
            window.location.reload();
        } else {
            alert('Error: ' + res.error);
        }
    };

    return (
        <div className="flex gap-2">
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste Image URL..."
                className="flex-1 bg-black border border-gray-700 rounded px-2 py-1 text-xs text-white"
            />
            <button
                onClick={handleSubmit}
                className="bg-neonBlue text-black font-bold text-xs px-2 py-1 rounded disabled:opacity-50"
                disabled={loading}
            >
                {loading ? '...' : 'Set'}
            </button>
        </div>
    );
};
