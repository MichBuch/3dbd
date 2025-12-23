'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Board } from '@/components/Game/Board';
import { useGameStore } from '@/store/gameStore';

export default function Home() {
    return (
        <main style={{ width: '100vw', height: '100vh' }}>
            <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
                <color attach="background" args={['#101020']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                <Board />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <gridHelper args={[20, 20, 0x444444, 0x222222]} />
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
            </Canvas>

            <UIOverlay />
        </main>
    );
}

const UIOverlay = () => {
    const { currentPlayer, winner, resetGame } = useGameStore();

    return (
        <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', pointerEvents: 'auto', fontFamily: 'sans-serif', zIndex: 10 }}>
            <h1 style={{ margin: 0, fontSize: '2rem', textShadow: '0 0 10px #000' }}>3dBd</h1>
            {winner ? (
                <div style={{ marginTop: 20, background: 'rgba(0,0,0,0.8)', padding: 20, borderRadius: 10 }}>
                    <h2 style={{ color: '#44ff44', margin: '0 0 10px 0' }}>Winner: {winner.toUpperCase()}</h2>
                    <button
                        onClick={resetGame}
                        style={{
                            padding: '10px 20px',
                            fontSize: 16,
                            cursor: 'pointer',
                            background: '#44ff44',
                            border: 'none',
                            borderRadius: 5,
                            fontWeight: 'bold'
                        }}
                    >
                        Play Again
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: 10 }}>
                    <h3 style={{ textShadow: '0 0 5px #000' }}>
                        Current Turn: <span style={{ color: currentPlayer === 'white' ? '#fff' : '#aaa' }}>{currentPlayer.toUpperCase()}</span>
                    </h3>
                </div>
            )}
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                <p>V 0.1.0 - Use mouse/touch to rotate/zoom</p>
            </div>
        </div>
    );
}
