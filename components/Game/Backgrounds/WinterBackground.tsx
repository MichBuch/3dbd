'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Low-Poly Mountain
const Mountain = ({ position, scale, color }: any) => (
    <group position={position} scale={scale}>
        <mesh castShadow receiveShadow>
            <coneGeometry args={[10, 20, 4]} /> {/* Pyramid shape */}
            <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        {/* Snow Cap */}
        <mesh position={[0, 5, 0]} scale={[1.01, 0.5, 1.01]}>
            <coneGeometry args={[10, 20, 4]} />
            <meshStandardMaterial color="white" roughness={0.1} />
        </mesh>
    </group>
);

// Snow-Covered Tree
const PineTree = ({ position, scale }: any) => (
    <group position={position} scale={scale}>
        {/* Trunk */}
        <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.5, 0.8, 2, 8]} />
            <meshStandardMaterial color="#3E2723" />
        </mesh>
        {/* Layers */}
        <mesh position={[0, 3, 0]}>
            <coneGeometry args={[3, 4, 8]} />
            <meshStandardMaterial color="#2F4F4F" />
        </mesh>
        <mesh position={[0, 5, 0]}>
            <coneGeometry args={[2.5, 3.5, 8]} />
            <meshStandardMaterial color="#2F4F4F" />
        </mesh>
        <mesh position={[0, 7, 0]}>
            <coneGeometry args={[2, 3, 8]} />
            <meshStandardMaterial color="#2F4F4F" />
        </mesh>
        {/* Snow on branches */}
        <mesh position={[0, 7.1, 0]} scale={[0.9, 0.9, 0.9]}>
            <coneGeometry args={[2, 3, 8]} />
            <meshStandardMaterial color="white" />
        </mesh>
    </group>
);

// Falling Snow System
const SnowParticles = () => {
    const count = 1000;
    const mesh = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = Math.random() * 100;
            const z = (Math.random() - 0.5) * 200;
            const speed = 0.5 + Math.random();
            temp.push({ x, y, z, speed, originalY: y });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Vector3(), []);
    const positions = useMemo(() => new Float32Array(count * 3), []);

    useFrame((state) => {
        if (!mesh.current) return;

        const t = state.clock.elapsedTime;

        for (let i = 0; i < count; i++) {
            const p = particles[i];
            // Falls down
            p.y -= p.speed * 0.1;
            // Wind drift
            p.x += Math.sin(t + p.z) * 0.02;

            // Reset
            if (p.y < -10) {
                p.y = 100;
                p.x = (Math.random() - 0.5) * 200;
            }

            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
        }

        mesh.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.5} color="white" transparent opacity={0.8} />
        </points>
    );
}

// Snowman
const Snowman = ({ position, rotation }: any) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Bottom */}
            <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[2, 16, 16]} />
                <meshStandardMaterial color="white" roughness={0.1} />
            </mesh>
            {/* Middle */}
            <mesh position={[0, 4, 0]}>
                <sphereGeometry args={[1.5, 16, 16]} />
                <meshStandardMaterial color="white" roughness={0.1} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 6, 0]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color="white" roughness={0.1} />
            </mesh>
            {/* Carrot Nose */}
            <mesh position={[0, 6, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.2, 1, 8]} />
                <meshStandardMaterial color="orange" />
            </mesh>
            {/* Hat */}
            <mesh position={[0, 7, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[0, 6.5, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 0.1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    )
}

export const WinterBackground = () => {

    return (
        <group>
            {/* Cool Lighting */}
            <ambientLight intensity={0.5} color="#E0FFFF" />
            <directionalLight position={[20, 50, 20]} intensity={1.5} color="#FFFFFF" castShadow />
            <fog attach="fog" args={['#F0F8FF', 10, 150]} />

            {/* Snow Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="white" roughness={0.1} metalness={0.1} />
            </mesh>

            <SnowParticles />

            {/* Mountains Background */}
            <Mountain position={[-60, 0, -80]} scale={[3, 4, 3]} color="#708090" />
            <Mountain position={[0, 0, -100]} scale={[5, 5, 5]} color="#778899" />
            <Mountain position={[80, 0, -60]} scale={[4, 4, 4]} color="#708090" />

            {/* Trees */}
            <PineTree position={[-30, 0, -30]} scale={[1, 1, 1]} />
            <PineTree position={[40, 0, -40]} scale={[1.5, 1.5, 1.5]} />
            <PineTree position={[-50, 0, -20]} scale={[1.2, 1.2, 1.2]} />

            {/* Snowman */}
            <Snowman position={[25, 0.5, -20]} rotation={[0, -0.5, 0]} />

        </group>
    );
};
