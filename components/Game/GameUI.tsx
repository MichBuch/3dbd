import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export const GameUI = () => {
    const {
        currentPlayer,
        winner,
        resetGame,
        isAiEnabled,
        setAiEnabled,
        theme,
        setTheme,
        scores
    } = useGameStore();

    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            {/* Minimal Status - Top Left */}
            <div className="absolute top-4 left-4 pointer-events-auto z-10 flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-white/80 drop-shadow-md m-0">3dBd</h1>

                {/* Turn Indicator */}
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${currentPlayer === 'white' ? 'bg-white' : 'bg-gray-800 border border-white'}`} />
                    <span className="text-white/80 font-sans text-sm font-bold">
                        {currentPlayer === 'white' ? "White's Turn" : "Black's Turn"}
                    </span>
                </div>

                {/* Scoreboard */}
                <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-white/10 flex gap-4 mt-2">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400">White</span>
                        <span className="text-xl font-mono font-bold text-white">{scores.white}</span>
                    </div>
                    <div className="w-px bg-white/20"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Black</span>
                        <span className="text-xl font-mono font-bold text-white">{scores.black}</span>
                    </div>
                </div>
            </div>

            {/* Controls - Top Right */}
            <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto z-10">
                <button
                    onClick={() => setAiEnabled(!isAiEnabled)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-sm font-bold backdrop-blur-sm transition-colors border border-white/10"
                >
                    {isAiEnabled ? 'AI: On' : 'PVP'}
                </button>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-sm font-bold backdrop-blur-sm transition-colors border border-white/10"
                >
                    Settings
                </button>
            </div>

            {/* Winner Overlay */}
            {winner && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50 bg-black/60 backdrop-blur-md">
                    <div className="bg-black/80 p-10 rounded-2xl border border-white/20 text-center shadow-2xl animate-fade-in">
                        <h2 className="text-6xl font-black text-white mb-2">
                            {winner === 'draw' ? 'DRAW' : `${winner.toUpperCase()} WINS`}
                        </h2>
                        <div className="text-gray-300 mb-8 font-mono text-lg">
                            Final Score: White <span className="text-white font-bold">{scores.white}</span> - <span className="text-white font-bold">{scores.black}</span> Black
                        </div>
                        <button
                            onClick={resetGame}
                            className="bg-white text-black px-8 py-3 rounded-lg font-bold text-lg hover:scale-105 transition-transform"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* Minimal Settings Panel - Bottom Right */}
            {showSettings && (
                <div className="absolute bottom-4 right-4 w-60 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 pointer-events-auto z-10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-bold text-sm">Theme</span>
                        <button onClick={resetGame} className="text-red-400 text-xs hover:underline">Reset Board</button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">Base</span>
                            <input
                                type="color"
                                value={theme.base}
                                onChange={(e) => setTheme({ base: e.target.value })}
                                className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">White</span>
                            <input
                                type="color"
                                value={theme.white}
                                onChange={(e) => setTheme({ white: e.target.value })}
                                className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">Black</span>
                            <input
                                type="color"
                                value={theme.black}
                                onChange={(e) => setTheme({ black: e.target.value })}
                                className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
