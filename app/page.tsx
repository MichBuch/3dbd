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
                <PerspectiveCamera makeDefault position={[6, 6, 6]} fov={45} />
                <OrbitControls
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={3}
                    maxDistance={15}
                    target={[0, 1, 0]}
                />

                <Environment preset="studio" />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} castShadow intensity={200} />

                <Board />
            </Canvas>
        </main>
    );
}
