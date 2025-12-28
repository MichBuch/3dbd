'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { X, Eye, Palette } from 'lucide-react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const THEMES = [
    { id: 'dark', name: 'Dark' },
    { id: 'xmas', name: 'Christmas' },
    { id: 'easter', name: 'Easter' },
    { id: 'winter', name: 'Winter' },
    { id: 'snow', name: 'Snow' },
    { id: 'starry', name: 'Starry Night' },
    { id: 'space', name: 'Space' },
    { id: 'beach', name: 'Beach' },
    { id: 'halloween', name: 'Halloween' }
];

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
    const {
        preferences,
        setPreference,
        resetPreferences,
        difficulty,
        setDifficulty,
        isAiEnabled,
        setAiEnabled
    } = useGameStore();

    const [selectedTheme, setSelectedTheme] = React.useState('dark');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-neonBlue rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,243,255,0.3)]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="p-8 border-b border-white/10">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPink">
                        Settings
                    </h2>
                    <p className="text-gray-400 mt-2">Changes save automatically</p>
                </div>

                {/* Settings Content */}
                <div className="p-8 space-y-8">
                    {/* UI Visibility Section */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Eye size={20} className="text-neonBlue" />
                            UI Visibility
                        </h3>
                        <div className="space-y-3">
                            {/* Show Scoreboard */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                <div>
                                    <label className="text-white font-semibold">Show Scoreboard</label>
                                    <p className="text-gray-400 text-sm">Display player scores</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold ${preferences.showScoreboard ? 'text-gray-500' : 'text-white'}`}>OFF</span>
                                    <button
                                        onClick={() => setPreference('showScoreboard', !preferences.showScoreboard)}
                                        className={`relative w-14 h-8 rounded-full transition-colors ${preferences.showScoreboard ? 'bg-neonBlue' : 'bg-gray-600'
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${preferences.showScoreboard ? 'translate-x-6' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                    <span className={`text-xs font-bold ${preferences.showScoreboard ? 'text-neonBlue' : 'text-gray-500'}`}>ON</span>
                                </div>
                            </div>

                            {/* Show Leaderboard */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                <div>
                                    <label className="text-white font-semibold">Show Leaderboard</label>
                                    <p className="text-gray-400 text-sm">Display top players</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold ${preferences.showLeaderboard ? 'text-gray-500' : 'text-white'}`}>OFF</span>
                                    <button
                                        onClick={() => setPreference('showLeaderboard', !preferences.showLeaderboard)}
                                        className={`relative w-14 h-8 rounded-full transition-colors ${preferences.showLeaderboard ? 'bg-neonBlue' : 'bg-gray-600'
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${preferences.showLeaderboard ? 'translate-x-6' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                    <span className={`text-xs font-bold ${preferences.showLeaderboard ? 'text-neonBlue' : 'text-gray-500'}`}>ON</span>
                                </div>
                            </div>

                            {/* Show Turn Indicator */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                <div>
                                    <label className="text-white font-semibold">Show Turn Indicator</label>
                                    <p className="text-gray-400 text-sm">Show whose turn (PVP)</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold ${preferences.showTurnIndicator ? 'text-gray-500' : 'text-white'}`}>OFF</span>
                                    <button
                                        onClick={() => setPreference('showTurnIndicator', !preferences.showTurnIndicator)}
                                        className={`relative w-14 h-8 rounded-full transition-colors ${preferences.showTurnIndicator ? 'bg-neonBlue' : 'bg-gray-600'
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${preferences.showTurnIndicator ? 'translate-x-6' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                    <span className={`text-xs font-bold ${preferences.showTurnIndicator ? 'text-neonBlue' : 'text-gray-500'}`}>ON</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Game Settings Section */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Game Settings</h3>
                        <div className="space-y-4">
                            {/* Board Scale Slider */}
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <label className="text-white font-semibold block mb-2">
                                    Board Scale: {preferences.boardScale.toFixed(1)}x
                                </label>
                                <input
                                    type="range"
                                    min="0.4"
                                    max="1.5"
                                    step="0.1"
                                    value={preferences.boardScale}
                                    onChange={(e) => setPreference('boardScale', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #00f3ff 0%, #00f3ff ${((preferences.boardScale - 0.4) / 1.1) * 100}%, #374151 ${((preferences.boardScale - 0.4) / 1.1) * 100}%, #374151 100%)`
                                    }}
                                />
                                <p className="text-gray-400 text-sm mt-2">Smaller for mobile, larger for desktop</p>
                            </div>

                            {/* Theme Selector */}
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <label className="text-white font-semibold block mb-3 flex items-center gap-2">
                                    <Palette size={18} className="text-neonPink" />
                                    Theme
                                </label>
                                <select
                                    value={selectedTheme}
                                    onChange={(e) => setSelectedTheme(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-medium focus:outline-none focus:border-neonBlue transition-colors cursor-pointer"
                                >
                                    {THEMES.map(theme => (
                                        <option key={theme.id} value={theme.id}>{theme.name}</option>
                                    ))}
                                </select>
                                <p className="text-gray-400 text-sm mt-2">Changes bead colors, shapes & backdrop</p>
                            </div>

                            {/* Difficulty Selector - IMPROVED CONTRAST */}
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <label className="text-white font-semibold block mb-3">AI Difficulty</label>
                                <div className="flex gap-2">
                                    {(['easy', 'medium', 'hard'] as const).map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d)}
                                            className={`flex-1 px-4 py-3 rounded-lg font-bold uppercase text-sm transition-all border-2 ${difficulty === d
                                                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.5)]'
                                                : 'bg-transparent text-white border-white/20 hover:border-white/40 hover:bg-white/5'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AI vs PVP Toggle - IMPROVED CONTRAST */}
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <label className="text-white font-semibold block mb-3">Game Mode</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAiEnabled(true)}
                                        className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 border-2 ${isAiEnabled
                                            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.5)]'
                                            : 'bg-transparent text-white border-white/20 hover:border-white/40 hover:bg-white/5'
                                            }`}
                                    >
                                        VS AI
                                    </button>
                                    <button
                                        onClick={() => setAiEnabled(false)}
                                        className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 border-2 ${!isAiEnabled
                                            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.5)]'
                                            : 'bg-transparent text-white border-white/20 hover:border-white/40 hover:bg-white/5'
                                            }`}
                                    >
                                        PVP
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions - CLEAR BUTTONS */}
                <div className="p-6 border-t border-white/10 space-y-3">
                    <p className="text-xs text-center text-gray-400">Settings are saved automatically</p>
                    <div className="flex gap-3">
                        <button
                            onClick={resetPreferences}
                            className="flex-1 px-6 py-3 bg-transparent text-white rounded-lg font-bold border-2 border-white/30 hover:border-white/60 hover:bg-white/5 transition-all"
                        >
                            Reset Defaults
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-lg border-2 border-white"
                        >
                            Save & Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
