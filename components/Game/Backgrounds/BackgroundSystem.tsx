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
import { ComingSoonFlyby } from './ComingSoonFlyby';
import { MoonBallBackground } from './MoonBallBackground';
import { AfricanBackground } from './AfricanBackground';
import { PlayroomBackground } from './PlayroomBackground';


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
                } else if (theme.id === 'african') {
                    main.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #FF4500 50%, #DAA520 100%)'; // Sky -> Sunset -> Savanna
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

    // Coming Soon Banner Logic
    // User requested "Coming Soon" on most themes except Space
    const showComingSoon = ![
        'space', // Specifically excluded
        'dark',  // Default/Classic
        'wood',  // Classic
        'black_white' // Minimalist
    ].includes(theme.id);

    return (
        <>
            {theme.id === 'space' && <><StarField /><SpaceObjects /></>}
            {theme.id === 'rubik' && <RubiksCubeBackground />}
            {theme.id === 'area51' && <Area51Background />}
            {theme.id === 'beach' && <BeachBackground />}
            {theme.id === 'halloween' && <HalloweenBackground />}

            {/* Sports Pack */}
            {['tennis', 'padel', 'pickleball', 'rugby'].includes(theme.id) && <SportsBackground />}

            {/* Festive Pack */}
            {['chinese_new_year', 'diwali', 'easter'].includes(theme.id) && <FestiveBackground />}

            {theme.id === 'snow' && <WinterBackground />}
            {theme.id === 'starry' && <StarField />}
            {theme.id === 'moonball' && <MoonBallBackground />}
            {theme.id === 'african' && <AfricanBackground />}
            {theme.id === 'toys' && <PlayroomBackground />}
            {theme.id === 'route66' && <Route66Background />}

            {/* Flyby Banner for incomplete themes */}
            {showComingSoon && <ComingSoonFlyby />}
        </>
    );
};
