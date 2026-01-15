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
// --- REPLACING PLANE WITH SATELLITE GLOBALLY ---
            {/* Satellite Body */}
            <group rotation={[0, Math.PI / 2, 0]}> {/* Face Forward */}
                <mesh>
                    <boxGeometry args={[4, 2, 2]} />
                    <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.3} />
                </mesh>
                {/* Solar Panels */}
                <mesh position={[0, 0, 3]}>
                    <boxGeometry args={[2, 0.1, 8]} />
                    <meshStandardMaterial color="blue" metalness={0.8} />
                </mesh>
                <mesh position={[0, 0, -3]}>
                    <boxGeometry args={[2, 0.1, 8]} />
                    <meshStandardMaterial color="blue" metalness={0.8} />
                </mesh>
                {/* Antenna */}
                <mesh position={[0, 1.5, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 3]} />
                    <meshBasicMaterial color="#888" />
                </mesh>
                <mesh position={[0, 3, 0]}>
                    <sphereGeometry args={[0.5]} />
                    <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
                </mesh>
            </group>

            {/* Tow Line */}
            <mesh position={[-12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, 16]} />
                <meshBasicMaterial color="#888" />
            </mesh>

            {/* The Banner */}
            <group position={[-28, 0, 0]}>
                {/* Banner Cloth */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[20, 5]} />
                    <meshBasicMaterial color="black" side={THREE.DoubleSide} transparent opacity={0.8} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[20.2, 5.2]} />
                    <meshBasicMaterial color="#00FF00" side={THREE.DoubleSide} wireframe />
                </mesh>
                {/* Banner Text */}
                <Text
                    position={[0, 0, 0.1]}
                    fontSize={2}
                    color="#00FF00"
                    anchorX="center"
                    anchorY="middle"
                >
                    COMING SOON
                </Text>
                {/* Backside Text (Mirrored) */}
                <Text
                    position={[0, 0, -0.1]}
                    rotation={[0, Math.PI, 0]}
                    fontSize={2}
                    color="#00FF00"
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
