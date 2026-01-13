'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export const BeachBackground = () => {
    // Objects removed for polish
    // const objects = useMemo(() => [], []);

    // Generate Objects around the board
    const objects = useMemo(() => {
        const items = [];
        // Palm Trees
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 25 + Math.random() * 30; // 25-55 units away
            items.push({
                id: `palm-${i}`,
                type: 'palm',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                scale: 3 + Math.random() * 2
            });
        }
        // Chairs
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 10; // Closer
            items.push({
                id: `chair-${i}`,
                type: 'chair',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                rot: Math.random() * Math.PI * 2,
                scale: 1.5
            });
        }
        return items;
    }, []);

    return (
        <group>
            {/* Sunny Sky & Fog */}
            <fog attach="fog" args={['#87CEEB', 20, 120]} />
            <ambientLight intensity={0.8} color="#FFD700" />
            <directionalLight position={[50, 100, 50]} intensity={1.5} castShadow />

            {/* Sun */}
            <mesh position={[0, 60, -100]}>
                <circleGeometry args={[15, 32]} />
                <meshBasicMaterial color="#FDB813" />
            </mesh>

            {/* Ocean (Far) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, -100]}>
                <planeGeometry args={[500, 200]} />
                <meshStandardMaterial color="#006994" roughness={0.1} metalness={0.5} />
            </mesh>

            {/* Sand Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#F4A460" roughness={1} />
            </mesh>

            {/* Beach Ball (Bouncing) */}
            <Float speed={5} rotationIntensity={2} floatIntensity={5}>
                <mesh position={[10, 2, 10]}>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshStandardMaterial color="white" map={null} />
                    <meshStandardMaterial color="red" />
                </mesh>
            </Float>
        </group>
    );
};
