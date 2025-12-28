'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Board } from '@/components/Game/Board';
import { GameUI } from '@/components/Game/GameUI';
import { Header } from '@/components/Layout/Header';
import { useGameStore } from '@/store/gameStore';

export default function Home() {
    const { preferences } = useGameStore();

    // Adjust camera distance based on board scale
    const baseCameraDistance = 12;
    const cameraZ = baseCameraDistance / preferences.boardScale;
    const minDistance = 5 / preferences.boardScale;
    const maxDistance = 20 / preferences.boardScale;

    return (
        <>
            <Header />
            <main className="relative bg-black" style={{ width: '100vw', height: '100vh' }}>
                <GameUI />

                <Canvas shadows>
                    <PerspectiveCamera makeDefault position={[0, 8, cameraZ]} fov={45} />
                    <OrbitControls
                        enablePan={false}
                        maxPolarAngle={Math.PI / 2.2}
                        minDistance={minDistance}
                        maxDistance={maxDistance}
                        target={[0, 0, 0]}
                    />

                    {/* <Environment preset="studio" /> - Removing to prevent fetch errors */}
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
                    <pointLight position={[-10, 5, -10]} intensity={1} color="#4444ff" />
                    <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} castShadow intensity={200} />

                    <Board />
                </Canvas>
            </main>
        </>
    );
}
