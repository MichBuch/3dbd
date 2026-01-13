'use client';

import { useGameStore } from '@/store/gameStore';
import { useMemo } from 'react';

export const SportsBackground = () => {
    const { theme } = useGameStore();
    const type = theme.id; // 'tennis', 'padel', 'pickleball', 'rugby'

    const config = useMemo(() => {
        switch (type) {
            case 'rugby':
                return { floor: '#2E8B57', lines: '#ffffff', net: false, goal: true, label: 'RUGBY UNION' };
            case 'pickleball':
                return { floor: '#1E90FF', lines: '#ffffff', net: true, goal: false, label: 'PICKLEBALL' };
            case 'padel':
                return { floor: '#4169E1', lines: '#ffffff', net: true, goal: false, label: 'PADEL' };
            case 'tennis':
            default:
                return { floor: '#2E8B57', lines: '#ffffff', net: true, goal: false, label: 'TENNIS' };
        }
    }, [type]);

    return (
        <group>
            {/* Daylight / Floodlights */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <fog attach="fog" args={[config.floor, 20, 90]} />

            {/* Stadium Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color={config.floor} roughness={0.8} />
            </mesh>

            {/* Court Lines (Simplified) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.99, 0]}>
                <ringGeometry args={[15, 15.5, 4]} /> {/* Square Ring */}
                <meshBasicMaterial color={config.lines} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.99, 0]}>
                <planeGeometry args={[0.5, 30]} />
                <meshBasicMaterial color={config.lines} />
            </mesh>

            {/* Net (Tennis/Padel/Pickleball) */}
            {config.net && (
                <group position={[0, -1, 0]}>
                    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                        <boxGeometry args={[32, 2, 0.1]} />
                        <meshStandardMaterial color="white" opacity={0.5} transparent />
                        {/* Net Mesh Pattern could be a texture, but opacity is fine for "Basic" */}
                    </mesh>
                    <mesh position={[16, 0, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 2]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[-16, 0, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 2]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>
            )}

            {/* Rugby Goal Posts */}
            {config.goal && (
                <group position={[0, 0, -30]}>
                    <mesh position={[-5, 5, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 10]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    <mesh position={[5, 5, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 10]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    <mesh position={[0, 3, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.2, 0.2, 10]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                </group>
            )}

            {/* Environmental "Stadium" Walls? */}
            {/* Just a simple far wall or audience text */}
        </group>
    );
};
