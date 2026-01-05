'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { X, Eye, Palette, ChevronDown, ChevronUp, Monitor, Gamepad2, Settings as SettingsIcon } from 'lucide-react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const THEMES = [
    { id: 'beach', name: 'Beach' },
    { id: 'black_white', name: 'Black & White' },
    { id: 'xmas', name: 'Christmas' },
    { id: 'dark', name: 'Dark' },
    { id: 'easter', name: 'Easter' },
    { id: 'halloween', name: 'Halloween' },
    { id: 'rubik', name: "Rubik's Cube" },
    { id: 'snow', name: 'Snow' },
    { id: 'space', name: 'Space' },
    { id: 'starry', name: 'Starry Night' },
    { id: 'tennis', name: 'Tennis' },
    { id: 'winter', name: 'Winter' },
    { id: 'wood', name: 'Wood' },
];

// Export Theme Config for use in other components (e.g. Sync)
export const THEME_CONFIG: Record<string, { base: string, white: string, black: string, skin?: 'default' | 'tennis' | 'easter' | 'xmas' | 'wood' | 'rubik' }> = {
    dark: { base: '#222222', white: '#ffffff', black: '#444444', skin: 'default' },
    black_white: { base: '#1a1a1a', white: '#ffffff', black: '#000000', skin: 'default' },
    wood: { base: '#5D4037', white: '#D7CCC8', black: '#3E2723', skin: 'wood' },
    tennis: { base: '#2E8B57', white: '#ccff00', black: '#ffffff', skin: 'tennis' },
    xmas: { base: '#1a472a', white: '#ff0000', black: '#00ff00', skin: 'xmas' },
    easter: { base: '#FFF8E7', white: '#FFB7B2', black: '#B5EAD7', skin: 'easter' },
    winter: { base: '#F0F8FF', white: '#87CEFA', black: '#4682B4', skin: 'default' },
    snow: { base: '#FFFFFF', white: '#E0FFFF', black: '#B0E0E6', skin: 'default' },
    starry: { base: '#0B1026', white: '#FFFFD4', black: '#4B0082', skin: 'default' },
    space: { base: '#000000', white: '#E6E6FAB0', black: '#800080', skin: 'default' },
    beach: { base: '#FFE5B4', white: '#FF6F61', black: '#40E0D0', skin: 'default' },
    halloween: { base: '#1C1C1C', white: '#FF7518', black: '#5C2C90', skin: 'default' },
    rubik: { base: '#000000', white: '#ffffff', black: '#ff0000', skin: 'rubik' }, // Rubik's cube grid base?
};

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
    const {
        preferences,
        setPreference,
        resetPreferences,
        difficulty,
        setDifficulty,
        isAiEnabled,
        setAiEnabled,
        theme,     // Get current theme
        setTheme   // Action to set theme
    } = useGameStore();

    // Removed local selectedTheme state since we use store now
    // Collapsible Sections State
    const [openSection, setOpenSection] = useState<'gameplay' | 'appearance' | 'interface' | null>('gameplay');

    if (!isOpen) return null;

    // ... (SectionHeader remains same, skipping for brevity in this replace block if possible, but easier to include context)
    const SectionHeader = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => setOpenSection(openSection === id ? null : id as any)}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${openSection === id ? 'bg-neonBlue/10 border-neonBlue text-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                } border`}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} className={openSection === id ? 'text-neonBlue' : 'text-gray-500'} />
                <span className="font-bold">{label}</span>
            </div>
            {openSection === id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <SettingsIcon className="text-neonBlue" /> Settings
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3 overflow-y-auto custom-scrollbar flex-1">

                    {/* 1. Gameplay Section */}
                    <SectionHeader id="gameplay" label="Gameplay" icon={Gamepad2} />
                    {openSection === 'gameplay' && (
                        <div className="space-y-4 p-2 animate-in slide-in-from-top-2 duration-200">
                            {/* AI vs PVP */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <label className="text-white font-bold text-xs uppercase tracking-wider block mb-3">Game Mode</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setAiEnabled(true)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isAiEnabled ? 'bg-neonBlue text-black' : 'bg-black/40 text-gray-500'}`}>VS AI</button>
                                    <button onClick={() => setAiEnabled(false)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isAiEnabled ? 'bg-neonPink text-black' : 'bg-black/40 text-gray-500'}`}>PVP</button>
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <label className="text-white font-bold text-xs uppercase tracking-wider block mb-3">Difficulty</label>
                                <div className="flex gap-2">
                                    {(['easy', 'medium', 'hard'] as const).map(d => (
                                        <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-all ${difficulty === d ? 'bg-white text-black' : 'bg-black/40 text-gray-500'}`}>{d}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Appearance Section */}
                    <SectionHeader id="appearance" label="Appearance" icon={Palette} />
                    {openSection === 'appearance' && (
                        <div className="space-y-4 p-2 animate-in slide-in-from-top-2 duration-200">
                            {/* Theme */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <label className="text-white font-bold text-xs uppercase tracking-wider block mb-3">Theme</label>
                                <select
                                    value={theme.id || 'dark'}
                                    onChange={(e) => {
                                        const newId = e.target.value;
                                        setTheme({
                                            id: newId,
                                            ...THEME_CONFIG[newId]
                                        });
                                    }}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-neonBlue"
                                >
                                    {THEMES.map(t => (
                                        <option key={t.id} value={t.id} className="bg-[#222] text-white">
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Bead Skin Removed */}

                            {/* Board Scale */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <label className="text-white font-bold text-xs uppercase tracking-wider block mb-3 flex justify-between">
                                    <span>Board Scale</span>
                                    <span>{preferences.boardScale.toFixed(1)}x</span>
                                </label>
                                <input
                                    type="range" min="0.5" max="1.5" step="0.1"
                                    value={preferences.boardScale}
                                    onChange={(e) => setPreference('boardScale', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neonBlue"
                                />
                            </div>
                        </div>
                    )}

                    {/* 3. Interface Section */}
                    <SectionHeader id="interface" label="Interface" icon={Monitor} />
                    {openSection === 'interface' && (
                        <div className="space-y-2 p-2 animate-in slide-in-from-top-2 duration-200">
                            {(['showScoreboard', 'showLeaderboard', 'showTurnIndicator'] as const).map((key) => {
                                const label = key === 'showScoreboard' ? 'Scoreboard' : key === 'showLeaderboard' ? 'Leaderboard' : 'Turn Indicator';
                                return (
                                    <div key={key} onClick={() => setPreference(key, !preferences[key])} className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                                        <span className="text-sm font-medium text-gray-300">{label}</span>
                                        <div className={`w-10 h-6 rounded-full relative transition-colors ${preferences[key] ? 'bg-neonBlue' : 'bg-gray-700'}`}>
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex gap-3 bg-black/40 rounded-b-2xl">
                    <button onClick={resetPreferences} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold text-sm hover:text-white hover:bg-white/5 transition-colors">
                        Reset
                    </button>
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-[1.02] transition-transform">
                        Done
                    </button>
                </div>

            </div>
        </div>
    );
};
