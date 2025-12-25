'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Board } from '@/components/Game/Board';
import { GameUI } from '@/components/Game/GameUI';

export default function Home() {
    return (
        <main className="relative bg-black" style={{ width: '100vw', height: '100vh' }}>
            <GameUI />

            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={45} />
                <OrbitControls
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={5}
                    maxDistance={20}
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
    );
}
