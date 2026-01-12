'use client';

import { useGameStore } from '@/store/gameStore';
import { SpaceObjects } from './SpaceObjects';
import { StarField } from './StarField';
import { RubiksCubeBackground } from './RubiksCubeBackground';
import { useEffect } from 'react';

export const BackgroundSystem = () => {
    const { preferences, theme } = useGameStore();

    // Reset background color on body/main when switching modes
    useEffect(() => {
        const main = document.querySelector('main');
        if (main) {
            if (preferences.backgroundMode === 'color') {
                main.style.background = preferences.backgroundColor;
                main.style.backgroundImage = 'none';
            } else if (preferences.backgroundMode === 'custom' && preferences.customBackgroundUrl) {
                main.style.background = 'black'; // fallback
                main.style.backgroundImage = `url(${preferences.customBackgroundUrl})`;
                main.style.backgroundSize = 'cover';
                main.style.backgroundPosition = 'center';
            } else {
                // Theme Mode
                if (theme.id === 'space') {
                    main.style.background = '#000000'; // Black void for space
                    main.style.backgroundImage = 'none';
                } else if (theme.id === 'rubik') {
                    main.style.background = '#1a1a1a'; // Dark grey for cube contrast
                    main.style.backgroundImage = 'none';
                } else {
                    // Default gradients or theme base
                    main.style.background = theme.base;
                    main.style.backgroundImage = 'none';
                }
            }
        }
    }, [preferences.backgroundMode, preferences.backgroundColor, preferences.customBackgroundUrl, theme]);

    // Render 3D Backgrounds ONLY if in Theme mode and not reduced motion
    if (preferences.backgroundMode !== 'theme') return null;

    switch (theme.id) {
        case 'space':
            return (
                <>
                    <StarField />
                    <SpaceObjects />
                </>
            );
        case 'rubik':
            return <RubiksCubeBackground />;
        default:
            return null;
    }
};
