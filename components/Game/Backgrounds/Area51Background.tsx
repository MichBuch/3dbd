'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const Area51Background = () => {
    // Generate Objects: Aliens, Agents, Hangars
    // Removed Sprites for cleaner look

    // Generate Objects: Aliens, Agents, Hangars
    const objects = useMemo(() => {
        const items = [];
        for (let i = 0; i < 30; i++) {
            const r = Math.random();
            const type = r > 0.6 ? 'agent' : (r > 0.3 ? 'alien' : 'hangar');
            const side = Math.random() > 0.5 ? 1 : -1;

            // Hangars are rare and far back
            const zStart = type === 'hangar' ? -(Math.random() * 500) : -(Math.random() * 300);

            items.push({
                id: i,
                type,
                x: side * (20 + Math.random() * 30),
                zStart
            });
        }
        return items;
    }, []);

    return (
        <group>
            {/* Eerie Atmosphere */}
            <fog attach="fog" args={['#0f1c0f', 10, 200]} />
            <ambientLight intensity={0.2} color="#39FF14" /> {/* Toxic Green Ambient */}

            {/* Desert Floor - Darker */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#2b2b2b" roughness={1} />
            </mesh>

            {/* Moving Objects */}
            {objects.map((obj) => (
                <Area51Object
                    key={obj.id}
                    data={obj}
                />
            ))}

            {/* Flying UFOs Overhead */}
            <PatrolUFOs />
        </group>
    );
};

const PatrolUFOs = () => {
    const group = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (!group.current) return;
        group.current.rotation.y += delta * 0.2; // Circle overhead
    });

    return (
        <group ref={group} position={[0, 40, -50]}>
            {[0, 1, 2].map(i => (
                <group key={i} position={[Math.cos(i * 2) * 50, 0, Math.sin(i * 2) * 50]}>
                    <mesh>
                        <cylinderGeometry args={[3, 1, 0.5, 16]} />
                        <meshStandardMaterial color="#555" metalness={0.9} />
                    </mesh>
                    <mesh position={[0, 0.5, 0]}>
                        <sphereGeometry args={[1.2]} />
                        <meshStandardMaterial color="#39FF14" transparent opacity={0.8} />
                    </mesh>
                    <pointLight color="#39FF14" intensity={2} distance={50} />
                </group>
            ))}
        </group>
    )
}

// Simplified Area 51 Object rendering (No Sprites)
const Area51Object = ({ data }: { data: any }) => {
    const { preferences } = useGameStore();
    const ref = useRef<THREE.Group>(null);
    const zPos = useRef(data.zStart);

    useFrame((state, delta) => {
        if (!ref.current) return;
        const speed = (preferences.themeSpeed || 1) * 20;

        // Move Forward
        zPos.current += speed * delta;
        if (zPos.current > 50) {
            zPos.current = -300 - Math.random() * 100;
        }

        ref.current.position.z = zPos.current;
        ref.current.position.x = data.x;
    });

    return (
        <group ref={ref} position={[data.x, 0, data.zStart]}>
            {/* --- HANGAR ONLY --- */}
            {data.type === 'hangar' && (
                <group scale={[8, 8, 8]}>
                    <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[2, 2, 4, 32, 1, false, 0, Math.PI]} />
                        <meshStandardMaterial color="#444" metalness={0.6} />
                    </mesh>
                    {/* Warning Sign */}
                    <mesh position={[0, 1, 2.1]}>
                        <boxGeometry args={[1, 1, 0.1]} />
                        <meshBasicMaterial color="yellow" />
                    </mesh>
                </group>
            )}
        </group>
    );
};
