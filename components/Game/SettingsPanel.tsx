'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/lib/translations';
import { THEMES, THEME_CONFIG } from '@/lib/themeConfig';
import { X, Eye, Palette, ChevronDown, ChevronUp, Monitor, Gamepad2, Volume2, Settings as SettingsIcon, Check } from 'lucide-react';

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
        theme,
        setTheme,
        // Need setters for undo
        scores // We don't undo scores, only settings
    } = useGameStore();


    const { t } = useTranslation();
    const [openSection, setOpenSection] = useState<'gameplay' | 'audio' | 'appearance' | 'interface' | 'support' | null>('gameplay');

    // Report Issue State
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportMessage, setReportMessage] = useState('');
    const [reportType, setReportType] = useState<'bug' | 'feedback' | 'other'>('bug');
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [showReportSuccess, setShowReportSuccess] = useState(false);

    const handleReportSubmit = async () => {
        if (!reportMessage.trim()) return;

        setIsSubmittingReport(true);

        try {
            const formData = new FormData();
            formData.append('message', reportMessage);
            formData.append('type', reportType);
            formData.append('url', window.location.href);

            const { submitFeedback } = await import('@/app/actions/feedback');
            const result = await submitFeedback(formData);

            if (result.success) {
                setReportMessage('');
                setShowReportSuccess(true);
                setTimeout(() => {
                    setShowReportSuccess(false);
                    setReportModalOpen(false);
                }, 2000);
            } else {
                alert('Failed to send report. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmittingReport(false);
        }
    };


    // Undo Buffer
    const undoState = useRef<{
        prefs: typeof preferences;
        theme: typeof theme;
        difficulty: typeof difficulty;
        isAiEnabled: typeof isAiEnabled;
    } | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Snapshot state on open
            undoState.current = {
                prefs: JSON.parse(JSON.stringify(preferences)),
                theme: JSON.parse(JSON.stringify(theme)),
                difficulty,
                isAiEnabled
            };
        }
    }, [isOpen]);

    const handleCancel = () => {
        if (undoState.current) {
            // Restore State
            const { prefs, theme: savedTheme, difficulty: savedDiff, isAiEnabled: savedAi } = undoState.current;

            // Batch restore (would be better if store had bulk set, but individual is fine for now)
            Object.entries(prefs).forEach(([k, v]) => setPreference(k as any, v));
            setTheme(savedTheme);
            setDifficulty(savedDiff);
            setAiEnabled(savedAi);
        }
        onClose();
    };

    const handleSave = () => {
        // Changes are already applied live, so just close
        onClose();
    };

    if (!isOpen) return null;

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
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
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

                    {/* Top Top Right Controls (X and Tick) */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancel}
                            className="bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white p-2 rounded-full transition-colors"
                            title="Cancel / Close"
                        >
                            <X size={20} />
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-neonBlue/20 hover:bg-neonBlue/40 text-neonBlue p-2 rounded-full transition-colors shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                            title="Save"
                        >
                            <Check size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3 overflow-y-auto custom-scrollbar flex-1 pb-6">
                    {/* Removed extra padding since buttons are gone */}

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

                            {/* Difficulty Slider */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <label className="text-white font-bold text-xs uppercase tracking-wider block mb-2 flex justify-between">
                                    <span>{t.difficulty}</span>
                                    <span className={difficulty! > 80 ? "text-neonPink animate-pulse" : "text-neonBlue"}>
                                        {difficulty! < 30 ? "Easy" : difficulty! < 70 ? "Medium" : difficulty! < 95 ? "Hard" : "UNBEATABLE"} ({difficulty})
                                    </span>
                                </label>
                                <input
                                    type="range" min="0" max="100" step="5"
                                    value={difficulty ?? 50}
                                    onChange={(e) => setDifficulty(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neonBlue"
                                />
                                <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono uppercase">
                                    <span>Random</span>
                                    <span>Tactical</span>
                                    <span>Godlike</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Audio Section */}
                    <SectionHeader id="audio" label="Audio" icon={Volume2} />
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

                                {preferences.backgroundMode === 'theme' && (theme.id === 'space' || theme.id === 'toys' || theme.id === 'snow' || theme.id === 'area51') && (
                                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl space-y-3">
                                        <div className="flex items-center gap-2 text-neonBlue font-bold text-xs uppercase tracking-wider">
                                            <span>ADVANCED SETTINGS</span>
                                        </div>

                                        {/* Speed */}
                                        <div>
                                            <label className="text-gray-300 text-xs block mb-1 flex justify-between">
                                                <span>Speed / Intensity</span>
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
                                            <label className="text-gray-300 text-xs block mb-2">Density / Particles</label>
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
                                            <span className="text-gray-300 text-xs">Special Hazards/Events</span>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors ${preferences.themeEvents ? 'bg-red-500' : 'bg-gray-700'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${preferences.themeEvents ? 'left-4.5' : 'left-0.5'}`} />
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

                                {/* Custom URL Logic Simplified for brevity but kept functional */}
                            </div>

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


                    {/* 4. Support Section */}
                    <SectionHeader id="support" label="Support" icon={Eye} />
                    {openSection === 'support' && (
                        <div className="space-y-4 p-2 animate-in slide-in-from-top-2 duration-200">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
                                <p className="text-gray-400 text-sm">
                                    Encountered a bug or have feedback? Let us know!
                                </p>
                                <button
                                    onClick={() => setReportModalOpen(true)}
                                    className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <SettingsIcon size={16} /> Report Issue
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {reportModalOpen && (
                    <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/90 p-4">
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-md p-6 space-y-4">
                            <h3 className="text-xl font-bold text-white">Report a Bug / Feedback</h3>

                            {showReportSuccess ? (
                                <div className="py-8 text-center text-green-400">
                                    <p className="text-lg font-semibold">Thank you!</p>
                                    <p className="text-sm opacity-80">Your report has been sent.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Type</label>
                                        <div className="flex gap-2">
                                            {(['bug', 'feedback', 'other'] as const).map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setReportType(t)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${reportType === t
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Message</label>
                                        <textarea
                                            value={reportMessage}
                                            onChange={(e) => setReportMessage(e.target.value)}
                                            placeholder="Describe the issue or feedback..."
                                            className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            onClick={() => setReportModalOpen(false)}
                                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleReportSubmit}
                                            disabled={!reportMessage.trim() || isSubmittingReport}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSubmittingReport ? 'Sending...' : 'Send Report'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
