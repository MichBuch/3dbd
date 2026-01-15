'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export const SoundManager = () => {
    const { board, winner, preferences } = useGameStore();

    // Track previous state to detect changes
    const prevBeadCount = useRef(0);
    const prevWinner = useRef<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize Audio Context interaction
    useEffect(() => {
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
        };
        window.addEventListener('click', initAudio, { once: true });
        return () => window.removeEventListener('click', initAudio);
    }, []);

    // Helper: Play Synthesized Sound
    const playTone = (freq: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle', duration: number, volMultiplier: number = 1) => {
        if (!audioContextRef.current) return;
        if (preferences.soundVolume === 0) return;

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

        const volume = preferences.soundVolume * volMultiplier;
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
    };

    const playDropSound = () => {
        // "Clack" sound
        playTone(400, 'triangle', 0.1, 0.5);
        setTimeout(() => playTone(300, 'sine', 0.1, 0.3), 50);
    };

    const playWinSound = () => {
        // "Ta-da!" arpeggio
        playTone(523.25, 'sine', 0.2, 0.5); // C5
        setTimeout(() => playTone(659.25, 'sine', 0.2, 0.5), 100); // E5
        setTimeout(() => playTone(783.99, 'sine', 0.4, 0.5), 200); // G5
        setTimeout(() => playTone(1046.50, 'sine', 0.6, 0.5), 300); // C6
    };

    // 1. Detect Bead Drop
    useEffect(() => {
        let count = 0;
        board.forEach(plane => plane.forEach(row => row.forEach(cell => {
            if (cell !== null) count++;
        })));

        if (count > prevBeadCount.current) {
            // Bead Added
            if (prevBeadCount.current > 0) { // Don't play on initial load
                playDropSound();
            }
        }
        prevBeadCount.current = count;
    }, [board]);

    // 2. Detect Win
    useEffect(() => {
        if (winner && winner !== prevWinner.current) {
            playWinSound();
        }
        prevWinner.current = (winner as string) || null;
    }, [winner]);

    return null; // Logic only
};
