'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export const SoundManager = () => {
    const { preferences, theme, moveHistory, winner } = useGameStore();

    // Audio Refs
    const bgmRef = useRef<HTMLAudioElement | null>(null);
    const sfxRef = useRef<HTMLAudioElement | null>(null);
    const previousThemeId = useRef<string>(theme.id);
    const previousMoveCount = useRef<number>(moveHistory.length);

    // --- Music Logic ---
    useEffect(() => {
        // If theme changed, switch track
        const playMusic = async () => {
            if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current = null;
            }

            let src = '';
            if (theme.id === 'space') src = '/assets/audio/space_theme.mp3';
            else if (theme.id === 'cozy') src = '/assets/audio/cozy_theme.mp3';
            else if (['chinese_new_year', 'diwali', 'easter'].includes(theme.id)) src = '/assets/audio/festive_theme.mp3';
            else src = '/assets/audio/main_theme.mp3'; // Default

            if (!src) return;

            const audio = new Audio(src);
            audio.loop = true;
            audio.volume = preferences.musicVolume;
            bgmRef.current = audio;

            try {
                await audio.play();
            } catch (e) {
                // Autoplay policy might block this until user interaction
                console.log("Audio autoplay blocked or file missing", e);
            }
        };

        playMusic();

        return () => {
            if (bgmRef.current) bgmRef.current.pause();
        };
    }, [theme.id]);

    // Volume Update
    useEffect(() => {
        if (bgmRef.current) {
            bgmRef.current.volume = preferences.musicVolume;
        }
    }, [preferences.musicVolume]);

    // --- SFX Logic ---
    useEffect(() => {
        // Did a move happen?
        if (moveHistory.length > previousMoveCount.current) {
            // Play Drop Sound
            const audio = new Audio('/assets/audio/bead_drop.mp3');
            audio.volume = preferences.soundVolume;
            audio.play().catch(() => { });

            // If winner just happened, maybe fanfair?
            if (winner) {
                const winAudio = new Audio('/assets/audio/win_sound.mp3');
                winAudio.volume = preferences.soundVolume;
                setTimeout(() => winAudio.play().catch(() => { }), 500);
            }
        }
        previousMoveCount.current = moveHistory.length;
    }, [moveHistory.length, winner, preferences.soundVolume]);

    return null; // Headless component
};
