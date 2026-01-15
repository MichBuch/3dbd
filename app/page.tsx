'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import { Board } from '@/components/Game/Board';
import { GameUI } from '@/components/Game/GameUI';
import { Header } from '@/components/Layout/Header';
import { LobbyDashboard } from '@/components/Lobby/LobbyDashboard';
import { CookieConsent } from '@/components/Layout/CookieConsent';
import { useGameStore } from '@/store/gameStore';
import Link from 'next/link';
import { useTranslation } from '@/lib/translations';

import { BackgroundSystem } from '@/components/Game/Backgrounds/BackgroundSystem';
import { SoundManager } from '@/components/Game/SoundManager';

import { PreferenceSync } from '@/components/Game/PreferenceSync';

export default function Home() {
    const preferences = useGameStore((state) => state.preferences);
    const { t } = useTranslation();

    // Adjust camera distance based on board scale
    const baseCameraDistance = 12;
    const cameraZ = baseCameraDistance / preferences.boardScale;
    const minDistance = 5 / preferences.boardScale;
    const maxDistance = 20 / preferences.boardScale;

    return (
        <>
            <Header />
            <main className="relative bg-black" style={{ width: '100vw', height: '100vh' }}>
                <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                    <div className="pointer-events-auto w-full max-w-6xl px-6">
                        {preferences.isLobbyVisible && <LobbyDashboard />}
                    </div>
                </div>
                <GameUI />
                <SoundManager />

                {/* Legal Footer */}
                <div className="absolute bottom-4 left-4 z-40 flex gap-4 text-[10px] md:text-xs text-white/30 hover:text-white/80 transition-colors pointer-events-auto">
                    <Link href="/terms" target="_blank" className="hover:text-white transition-colors">{t.terms}</Link>
                    <span>•</span>
                    <Link href="/privacy" target="_blank" className="hover:text-white transition-colors">{t.privacy}</Link>
                </div>

                <Canvas shadows>
                    <PerspectiveCamera makeDefault position={[0, 8, cameraZ]} fov={45} />
                    <OrbitControls
                        enablePan={false}
                        maxPolarAngle={Math.PI / 2.2}
                        minDistance={minDistance}
                        maxDistance={maxDistance}
                        target={[0, 0, 0]}
                    />

                    <ambientLight intensity={1.5} />
                    <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
                    <pointLight position={[-10, 5, -10]} intensity={1} color="#4444ff" />
                    <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} castShadow intensity={200} />

                    <Environment files="/potsdamer_platz_1k.hdr" />
                    <BackgroundSystem />
                    {preferences.boardDrift ? (
                        <Float speed={2} rotationIntensity={0.2} floatIntensity={1} floatingRange={[-0.5, 0.5]}>
                            <Board />
                        </Float>
                    ) : (
                        <Board />
                    )}
                </Canvas>
            </main>
            <CookieConsent />
        </>
    );
}
