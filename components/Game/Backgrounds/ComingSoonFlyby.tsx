'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

export const ComingSoonFlyby = () => {
    const group = useRef<THREE.Group>(null);
    const [startDelay] = useState(Math.random() * 5); // Add random start so it doesn't appear instantly on load

    useFrame((state) => {
        if (!group.current) return;
        const speed = 15; // Speed of flyby
        const distance = 300; // Travel distance
        const loopTime = distance / speed;

        // Loop Logic
        const t = state.clock.elapsedTime + startDelay;
        // Position X moves from -distance/2 to distance/2
        const rawPos = (t * speed) % (distance * 2);
        group.current.position.x = rawPos - distance; // -300 to 300

        // Optional: Bobbing motion for "air turbulence"
        group.current.position.y = 20 + Math.sin(t) * 2;
    });

    return (
        <group ref={group} position={[-200, 20, -50]}>
            {/* The Plane (Low Poly Styled) */}
            <group rotation={[0, Math.PI / 2, 0]}> {/* Face Forward (X axis) */}
                {/* Fuselage */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[1.5, 8, 4, 8]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                {/* Wings */}
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[14, 0.2, 3]} />
                    <meshStandardMaterial color="#cc0000" />
                </mesh>
                {/* Tail */}
                <mesh position={[0, 1, -3.5]}>
                    <boxGeometry args={[4, 0.2, 1.5]} />
                    <meshStandardMaterial color="#cc0000" />
                </mesh>
                <mesh position={[0, 2, -3.5]}>
                    <boxGeometry args={[0.2, 2.5, 2]} />
                    <meshStandardMaterial color="#cc0000" />
                </mesh>
                {/* Propeller (Spinning) */}
                <Propeller />
            </group>

            {/* Tow Line */}
            <mesh position={[-12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, 16]} />
                <meshBasicMaterial color="#333" />
            </mesh>

            {/* The Banner */}
            <group position={[-28, 0, 0]}>
                {/* Banner Cloth */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[16, 4]} />
                    <meshBasicMaterial color="white" side={THREE.DoubleSide} transparent opacity={0.9} />
                </mesh>
                {/* Banner Text */}
                <Text
                    position={[0, 0, 0.1]}
                    fontSize={1.5}
                    color="#cc0000"
                    anchorX="center"
                    anchorY="middle"
                // font="/fonts/Inter-Bold.ttf" // Removed to fix 404, using default
                >
                    COMING SOON
                </Text>
                {/* Backside Text (Mirrored) */}
                <Text
                    position={[0, 0, -0.1]}
                    rotation={[0, Math.PI, 0]}
                    fontSize={1.5}
                    color="#cc0000"
                    anchorX="center"
                    anchorY="middle"
                >
                    COMING SOON
                </Text>
            </group>
        </group>
    );
};

const Propeller = () => {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, delta) => {
        if (ref.current) ref.current.rotation.z += delta * 20;
    });
    return (
        <group ref={ref} position={[0, 0, 4.2]}>
            <mesh>
                <boxGeometry args={[6, 0.2, 0.1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[6, 0.2, 0.1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    );
}
