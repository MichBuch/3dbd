'use client';

import { useState } from 'react';
import { Save, Play, Square, ExternalLink } from 'lucide-react';
import { THEMES } from '@/lib/themeConfig';

interface MusicManagerProps {
    initialSettings: Record<string, string>;
}

export const MusicManager = ({ initialSettings }: MusicManagerProps) => {
    const [settings, setSettings] = useState(initialSettings);
    const [saving, setSaving] = useState<string | null>(null);
    const [playing, setPlaying] = useState<string | null>(null);
    const audioRef = useState(new Audio())[0];

    const handleSave = async (themeId: string, url: string) => {
        setSaving(themeId);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: `theme_music_${themeId}`,
                    value: url
                })
            });
            if (!res.ok) throw new Error("Failed");

            // Success indicator?
        } catch (error) {
            alert("Failed to save");
        } finally {
            setSaving(null);
        }
    };

    const togglePreview = (url: string) => {
        if (playing === url) {
            audioRef.pause();
            setPlaying(null);
        } else {
            audioRef.src = url;
            audioRef.play().catch(e => alert("Could not play URL. Check CORS/Format."));
            setPlaying(url);
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {THEMES.map(theme => {
                const key = `theme_music_${theme.id}`;
                return (
                    <div key={theme.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-neonBlue capitalize">{theme.id.replace(/_/g, ' ')}</h3>
                            {settings[key] && (
                                <button
                                    onClick={() => togglePreview(settings[key])}
                                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"
                                >
                                    {playing === settings[key] ? <Square size={14} fill="white" /> : <Play size={14} fill="white" />}
                                </button>
                            )}
                        </div>

                        <input
                            type="text"
                            placeholder="https://example.com/music.mp3"
                            className="bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-gray-300 focus:text-white focus:border-neonBlue w-full outline-none"
                            value={settings[key] || ''}
                            onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                        />

                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSave(theme.id, settings[key])}
                                disabled={saving === theme.id}
                                className="flex items-center gap-2 bg-neonBlue/20 text-neonBlue px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-neonBlue hover:text-black transition-all disabled:opacity-50"
                            >
                                <Save size={14} />
                                {saving === theme.id ? 'Saving...' : 'Save Override'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
