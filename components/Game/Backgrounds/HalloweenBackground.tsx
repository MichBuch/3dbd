'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export const HalloweenBackground = () => {
    // Removed 2D Sprite loading
    const objects = useMemo(() => [], []);

    return (
        <group>
            {/* Spooky Atmosphere */}
            <fog attach="fog" args={['#2a0a2a', 10, 80]} />
            <ambientLight intensity={0.1} color="#4b0082" />
            <pointLight position={[0, 10, 0]} intensity={1} color="#ff6600" distance={50} />

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#1a051a" roughness={1} />
            </mesh>

            {/* Objects - Removed 2D Sprites */}
        </group>
    );
};
