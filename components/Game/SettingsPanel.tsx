'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/lib/translations';
import { X, Eye, Palette, ChevronDown, ChevronUp, Monitor, Gamepad2, Settings as SettingsIcon } from 'lucide-react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const THEMES = [
    { id: 'beach', translationKey: 'themeBeach' },
    { id: 'black_white', translationKey: 'themeBlackWhite' },
    { id: 'chinese_new_year', translationKey: 'themeChineseNewYear' },
    { id: 'diwali', translationKey: 'themeDiwali' },
    { id: 'xmas', translationKey: 'themeXmas' },
    { id: 'dark', translationKey: 'themeDark' },
    { id: 'easter', translationKey: 'themeEaster' },
    { id: 'halloween', translationKey: 'themeHalloween' },
    { id: 'rubik', translationKey: 'themeRubik' },
    { id: 'snow', translationKey: 'themeSnow' },
    { id: 'space', translationKey: 'themeSpace' },
    { id: 'starry', translationKey: 'themeStarry' },
    { id: 'tennis', translationKey: 'themeTennis' },
    { id: 'winter', translationKey: 'themeWinter' },
    { id: 'wood', translationKey: 'themeWood' },
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
    rubik: { base: '#000000', white: '#ffffff', black: '#ff0000', skin: 'rubik' },
    chinese_new_year: { base: '#8B0000', white: '#FFD700', black: '#FF0000', skin: 'default' }, // Red & Gold
    diwali: { base: '#FF6F00', white: '#FFD54F', black: '#FF6F00', skin: 'default' }, // Orange & Yellow
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

    const { t } = useTranslation();

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
                        <SettingsIcon className="text-neonBlue" /> {t.settings}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3 overflow-y-auto custom-scrollbar flex-1">

                    {/* 1. Gameplay Section */}
                    <SectionHeader id="gameplay" label={t.gameplay} icon={Gamepad2} />
                    {openSection === 'gameplay' && (
                        <div className="space-y-4 p-2 animate-in slide-in-from-top-2 duration-200">
                            {/* AI vs PVP */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <label className="text-white font-bold text-xs uppercase tracking-wider block mb-3">{t.gameMode}</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setAiEnabled(true)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isAiEnabled ? 'bg-black text-neonBlue border-2 border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>{t.vsAi}</button>
                                    <button onClick={() => setAiEnabled(false)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isAiEnabled ? 'bg-black text-neonPink border-2 border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>{t.pvp}</button>
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <label className="text-white font-bold text-xs uppercase tracking-wider block mb-3">{t.difficulty}</label>
                                <div className="flex gap-2">
                                    {(['easy', 'medium', 'hard'] as const).map(d => (
                                        <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-all ${difficulty === d ? 'bg-black text-white border-2 border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>{t[d]}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Appearance Section */}
                    <SectionHeader id="appearance" label={t.appearance} icon={Palette} />
                    {openSection === 'appearance' && (
                        <div className="space-y-4 p-2 animate-in slide-in-from-top-2 duration-200">
                            {/* Theme */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
                                <div>
                                    <label className="text-white font-bold text-xs uppercase tracking-wider block mb-3">{t.backgroundMode || 'Background Mode'}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['theme', 'custom', 'color'] as const).map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => setPreference('backgroundMode', mode)}
                                                className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${preferences.backgroundMode === mode ? 'bg-black text-neonBlue border-2 border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {preferences.backgroundMode === 'theme' && (
                                    <div>
                                        <label className="text-white font-bold text-xs uppercase tracking-wider block mb-2">{t.theme}</label>
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
                                            {THEMES.map(theme => (
                                                <option key={theme.id} value={theme.id} className="bg-[#222] text-white">
                                                    {t[theme.translationKey as keyof typeof t]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {preferences.backgroundMode === 'color' && (
                                    <div>
                                        <label className="text-white font-bold text-xs uppercase tracking-wider block mb-2">Color</label>
                                        <input
                                            type="color"
                                            value={preferences.backgroundColor}
                                            onChange={(e) => setPreference('backgroundColor', e.target.value)}
                                            className="w-full h-10 rounded cursor-pointer"
                                        />
                                    </div>
                                )}

                                {preferences.backgroundMode === 'custom' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-white font-bold text-xs uppercase tracking-wider block mb-2">Upload Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setPreference('customBackgroundUrl', reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-white font-bold text-xs uppercase tracking-wider block mb-2">Or Image URL</label>
                                            <input
                                                type="text"
                                                placeholder="https://..."
                                                value={preferences.customBackgroundUrl || ''}
                                                onChange={(e) => setPreference('customBackgroundUrl', e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-xs"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-white/5">
                                    <div onClick={() => setPreference('reduceMotion', !preferences.reduceMotion)} className="flex items-center justify-between cursor-pointer">
                                        <span className="text-white font-bold text-xs uppercase tracking-wider">Reduce Motion (Static)</span>
                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.reduceMotion ? 'bg-neonBlue' : 'bg-white/10'}`}>
                                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${preferences.reduceMotion ? 'left-6' : 'left-1'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bead Skin Removed */}

                            {/* Board Scale */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <label className="text-white font-bold text-xs uppercase tracking-wider block mb-3 flex justify-between">
                                    <span>{t.boardScale}</span>
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
                    <SectionHeader id="interface" label={t.interface} icon={Monitor} />
                    {openSection === 'interface' && (
                        <div className="space-y-2 p-2 animate-in slide-in-from-top-2 duration-200">
                            {(['showScoreboard', 'showLeaderboard', 'showTurnIndicator'] as const).map((key) => {
                                const label = key === 'showScoreboard' ? t.scoreboard : key === 'showLeaderboard' ? t.leaderboard : t.turnIndicator;
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
                <div className="p-6 border-t border-white/10 grid grid-cols-2 gap-4 bg-black/40 rounded-b-2xl">
                    <button onClick={resetPreferences} className="w-full py-3 rounded-xl border border-white/10 text-gray-400 font-extrabold text-sm uppercase tracking-wider hover:text-white hover:bg-white/5 transition-colors flex justify-center items-center">
                        {t.reset}
                    </button>
                    <button onClick={onClose} className="w-full py-3 rounded-xl bg-neonBlue text-black font-extrabold text-sm uppercase tracking-wider hover:bg-white transition-colors flex justify-center items-center">
                        {t.done}
                    </button>
                </div>

            </div>
        </div>
    );
};
