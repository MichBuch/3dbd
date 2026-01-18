'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export const SoundManager = () => {
    const { board, winner, preferences, theme } = useGameStore();

    // Track state
    const prevBeadCount = useRef(0);
    const prevWinner = useRef<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const musicOscillators = useRef<any[]>([]); // Store active music notes
    const isPlayingMusic = useRef(false);
    const customAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize HTML5 Audio
    useEffect(() => {
        customAudioRef.current = new Audio();
        return () => {
            if (customAudioRef.current) {
                customAudioRef.current.pause();
                customAudioRef.current = null;
            }
        }
    }, []);

    // Initialize Audio Context interaction
    useEffect(() => {
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume();
            }
        };
        // Initialize on any interaction
        window.addEventListener('click', initAudio, { once: true });
        window.addEventListener('touchstart', initAudio, { once: true });
        window.addEventListener('keydown', initAudio, { once: true });
        return () => {
            window.removeEventListener('click', initAudio);
            window.removeEventListener('touchstart', initAudio);
            window.removeEventListener('keydown', initAudio);
        }
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

    // --- MUSIC SYSTEM ---
    const [systemSettings, setSystemSettings] = useState<Record<string, string>>({});

    // Fetch Settings on Mount
    useEffect(() => {
        fetch('/api/admin/settings').then(res => res.json()).then(setSystemSettings).catch(console.error);
    }, []);

    useEffect(() => {
        if (!preferences.musicVolume || preferences.musicVolume === 0) {
            stopMusic();
            return;
        }

        const playMusic = () => {
            if (!audioContextRef.current) return;
            // Check for Custom URL Override
            const customUrl = systemSettings[`theme_music_${theme.id}`];

            if (customUrl) {
                // Play Custom Audio File logic would go here
                // For now, let's just log it or implement a HTML5 Audio element fallback?
                // Actually, SoundManager uses WebAudio. We can just use an <audio> element or fetch/decode.
                // Let's use a simpler HTML5 Audio ref for MP3s to avoid decoding complexity for now.
                if (customAudioRef.current) {
                    customAudioRef.current.src = customUrl;
                    customAudioRef.current.volume = preferences.musicVolume;
                    customAudioRef.current.loop = true;
                    customAudioRef.current.play().catch(e => console.error("Audio Play Error", e));
                    isPlayingMusic.current = true;
                }
                return;
            }

            // Fallback to Procedural
            if (isPlayingMusic.current) return;
            isPlayingMusic.current = true;

            // Simple Ambient Loop
            const scheduleNextNote = () => {
                if (!isPlayingMusic.current || customAudioRef.current?.paused === false) return; // Stop if custom music playing
                const ctx = audioContextRef.current!;

                // Frequencies for a spacey/ambient chord (C Maj 7 usually generic)
                // Area 51: Spooky Thermin sounds? 
                let notes = [261.63, 329.63, 392.00, 493.88]; // C E G B
                let type: any = 'sine';

                if (theme.id === 'area51') {
                    notes = [329.63, 392.00, 466.16, 587.33]; // E G Bb D (Diminished/Spooky)
                    type = 'triangle';
                }

                // Pick a random note from scale
                const freq = notes[Math.floor(Math.random() * notes.length)];
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = type;
                osc.frequency.value = freq;

                // Long attack and release
                const now = ctx.currentTime;
                const duration = 2 + Math.random() * 2;

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(preferences.musicVolume * 0.2, now + 1);
                gain.gain.linearRampToValueAtTime(0, now + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(now + duration);

                setTimeout(scheduleNextNote, 1500); // Overlap slightly
            };

            scheduleNextNote();
        };

        // Start if context exists
        const interval = setInterval(() => {
            // Resume procedural only if NO custom music
            const customUrl = systemSettings[`theme_music_${theme.id}`];
            if (customUrl) {
                playMusic();
                clearInterval(interval);
                return;
            }

            if (audioContextRef.current && audioContextRef.current.state === 'running') {
                playMusic();
                clearInterval(interval);
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            stopMusic();
        }
    }, [preferences.musicVolume, theme.id, systemSettings]);

    const stopMusic = () => {
        isPlayingMusic.current = false;
        // Logic to kill all nodes if tracked
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
