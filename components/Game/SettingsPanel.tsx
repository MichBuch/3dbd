'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/lib/translations';
import { THEMES, THEME_CONFIG } from '@/lib/themeConfig';
import { X, Eye, Palette, ChevronDown, ChevronUp, Monitor, Gamepad2, Volume2, Settings as SettingsIcon } from 'lucide-react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

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
    const [openSection, setOpenSection] = useState<'gameplay' | 'audio' | 'appearance' | 'interface' | null>('gameplay');

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
            <div className="
                relative 
                bg-[#111] 
                border-t md:border border-white/10 
                rounded-t-2xl md:rounded-2xl 
                w-full md:w-auto md:min-w-[480px] max-w-lg 
                shadow-2xl 
                flex flex-col 
                max-h-[85vh] md:max-h-[90vh] 
                animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200
            ">

                {/* Header */}
                <div className="p-5 md:p-6 border-b border-white/10 flex justify-between items-center bg-[#111] sticky top-0 z-10 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <SettingsIcon className="text-neonBlue" /> {t.settings}
                    </h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
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

                    {/* 2. Audio Section */}
                    <SectionHeader id="audio" label="AUDIO" icon={Volume2} />
                    {openSection === 'audio' && (
                        <div className="space-y-4 p-2 animate-in slide-in-from-top-2 duration-200">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
                                <div>
                                    <label className="text-white font-bold text-xs uppercase tracking-wider block mb-2 flex justify-between">
                                        <span>Music Volume</span>
                                        <span>{Math.round(preferences.musicVolume * 100)}%</span>
                                    </label>
                                    <input
                                        type="range" min="0" max="1" step="0.1"
                                        value={preferences.musicVolume}
                                        onChange={(e) => setPreference('musicVolume', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neonBlue"
                                    />
                                </div>
                                <div>
                                    <label className="text-white font-bold text-xs uppercase tracking-wider block mb-2 flex justify-between">
                                        <span>Sound Effects</span>
                                        <span>{Math.round(preferences.soundVolume * 100)}%</span>
                                    </label>
                                    <input
                                        type="range" min="0" max="1" step="0.1"
                                        value={preferences.soundVolume}
                                        onChange={(e) => setPreference('soundVolume', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neonBlue"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. Appearance Section */}
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

                                {preferences.backgroundMode === 'theme' && (theme.id === 'space' || theme.id === 'toys') && (
                                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl space-y-3">
                                        <div className="flex items-center gap-2 text-neonBlue font-bold text-xs uppercase tracking-wider">
                                            <span>{theme.id === 'space' ? '🚀 Space Settings' : '🧸 Theme Settings'}</span>
                                        </div>

                                        {/* Speed */}
                                        <div>
                                            <label className="text-gray-300 text-xs block mb-1 flex justify-between">
                                                <span>{theme.id === 'space' ? 'Warp Speed' : 'Animation Speed'}</span>
                                                <span>{preferences.themeSpeed}x</span>
                                            </label>
                                            <input
                                                type="range" min="0.1" max="10" step="0.1"
                                                value={preferences.themeSpeed ?? 1}
                                                onChange={(e) => setPreference('themeSpeed', parseFloat(e.target.value))}
                                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neonBlue"
                                            />
                                        </div>

                                        {/* Density */}
                                        <div>
                                            <label className="text-gray-300 text-xs block mb-2">{theme.id === 'space' ? 'Star Density' : 'Object Density'}</label>
                                            <div className="flex gap-2">
                                                {(['low', 'medium', 'high'] as const).map(d => (
                                                    <button
                                                        key={d}
                                                        onClick={() => setPreference('themeDensity', d)}
                                                        className={`flex-1 py-1 rounded text-xs font-bold uppercase transition-all ${preferences.themeDensity === d ? 'bg-black text-neonBlue border-2 border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'bg-black/40 text-gray-500 hover:bg-white/20'}`}
                                                    >
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Events */}
                                        <div onClick={() => setPreference('themeEvents', !preferences.themeEvents)} className="flex items-center justify-between cursor-pointer">
                                            <span className="text-gray-300 text-xs">{theme.id === 'space' ? 'Enable Asteroid Hazards' : 'Enable Special Events'}</span>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors ${preferences.themeEvents ? 'bg-red-500' : 'bg-gray-700'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${preferences.themeEvents ? 'left-4.5' : 'left-0.5'}`} />
                                            </div>
                                        </div>

                                        {/* Drift */}
                                        <div onClick={() => setPreference('boardDrift', !preferences.boardDrift)} className="flex items-center justify-between cursor-pointer">
                                            <span className="text-gray-300 text-xs">Enable Board Drift</span>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors ${preferences.boardDrift ? 'bg-neonBlue' : 'bg-gray-700'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${preferences.boardDrift ? 'left-4.5' : 'left-0.5'}`} />
                                            </div>
                                        </div>
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
                <div className="p-6 border-t border-white/10 flex justify-center gap-4 bg-black/40 rounded-b-2xl">
                    <button onClick={resetPreferences} className="px-8 py-3 rounded-xl border border-white/10 text-gray-400 font-extrabold text-sm uppercase tracking-wider hover:text-white hover:bg-white/5 transition-colors">
                        {t.reset}
                    </button>
                    <button onClick={onClose} className="px-8 py-3 rounded-xl bg-neonBlue text-black font-extrabold text-sm uppercase tracking-wider hover:bg-white transition-colors">
                        {t.done}
                    </button>
                </div>

            </div>
        </div>
    );
};
