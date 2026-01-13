'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

// Components
import { SpaceObjects } from './SpaceObjects';
import { StarField } from './StarField';
import { RubiksCubeBackground } from './RubiksCubeBackground';
import { ToyObjects } from './ToyObjects';
import { Route66Background } from './Route66Background';
import { Area51Background } from './Area51Background';
import { BeachBackground } from './BeachBackground';
import { HalloweenBackground } from './HalloweenBackground';
import { SportsBackground } from './SportsBackground';
import { WinterBackground } from './WinterBackground';
import { FestiveBackground } from './FestiveBackground';
import { CozyBackground } from './CozyBackground';

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
                    main.style.background = '#000000';
                } else if (theme.id === 'rubik') {
                    main.style.background = '#1a1a1a';
                } else if (theme.id === 'toys' || theme.id === 'beach') {
                    main.style.background = '#87CEEB';
                } else if (theme.id === 'route66') {
                    main.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #E6C288 100%)';
                } else if (theme.id === 'area51') {
                    main.style.background = '#0f1c0f';
                } else if (theme.id === 'halloween') {
                    main.style.background = '#1a051a';
                } else if (theme.id === 'rugby') {
                    main.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #006400 40%)';
                } else if (theme.id === 'pickleball' || theme.id === 'padel') {
                    main.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #4169E1 50%)';
                } else if (['chinese_new_year'].includes(theme.id)) {
                    main.style.background = '#2b0000'; // Deep Red
                } else if (['diwali'].includes(theme.id)) {
                    main.style.background = '#1a0a1a'; // Dark festive
                } else if (['easter'].includes(theme.id)) {
                    main.style.background = '#F0F8FF'; // AliceBlue
                } else {
                    // Default gradients or theme base
                    main.style.background = theme.base;
                }
                main.style.backgroundImage = 'none';
            }
        }
    }, [preferences.backgroundMode, preferences.backgroundColor, preferences.customBackgroundUrl, theme]);

    // Render 3D Backgrounds ONLY if in Theme mode
    if (preferences.backgroundMode !== 'theme') return null;

    if (theme.id === 'space') return <><StarField /><SpaceObjects /></>;
    if (theme.id === 'rubik') return <RubiksCubeBackground />;
    if (theme.id === 'toys') return <ToyObjects />;
    if (theme.id === 'route66') return <Route66Background />;
    if (theme.id === 'area51') return <Area51Background />;
    if (theme.id === 'beach') return <BeachBackground />;
    if (theme.id === 'halloween') return <HalloweenBackground />;

    // Sports Pack
    if (['tennis', 'padel', 'pickleball', 'rugby'].includes(theme.id)) {
        return <SportsBackground />;
    }

    // Festive Pack
    if (['chinese_new_year', 'diwali', 'easter'].includes(theme.id)) {
        return <FestiveBackground />;
    }

    if (theme.id === 'cozy') return <CozyBackground />;

    return null;
};
