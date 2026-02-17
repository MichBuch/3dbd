'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const FestiveBackground = () => {
    const { theme } = useGameStore();
    const type = theme.id; // 'chinese_new_year', 'diwali', 'easter'

    // Generate Objects
    const objects = useMemo(() => {
        const items = [];
        if (type === 'chinese_new_year') {
            for (let i = 0; i < 30; i++) {
                items.push({
                    id: i, type: 'lantern',
                    x: (Math.random() - 0.5) * 100,
                    y: -20 + Math.random() * 50,
                    z: (Math.random() - 0.5) * 60,
                    speed: 0.5 + Math.random() * 1,
                    scale: 2 + Math.random()
                });
            }
        } else if (type === 'diwali') {
            for (let i = 0; i < 40; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = 20 + Math.random() * 40;
                items.push({
                    id: i, type: 'diya',
                    x: Math.cos(angle) * r,
                    z: Math.sin(angle) * r,
                    scale: 1.5 + Math.random()
                });
            }
        } else if (type === 'easter') {
            // Bunnies
            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = 15 + Math.random() * 40;
                items.push({
                    id: `bun-${i}`, type: 'rabbit',
                    x: Math.cos(angle) * r,
                    z: Math.sin(angle) * r,
                    scale: 1.5,
                    speed: 1 + Math.random()
                });
            }
            // Eggs (Geometric)
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = 20 + Math.random() * 50;
                items.push({
                    id: `egg-${i}`, type: 'egg',
                    x: Math.cos(angle) * r,
                    z: Math.sin(angle) * r,
                    color: ['#FFB7B2', '#B5EAD7', '#E2F0CB', '#FFDAC1'][Math.floor(Math.random() * 4)]
                });
            }
        }
        return items;
    }, [type]);

    const bgColors = {
        chinese_new_year: '#8B0000', // Dark Red
        diwali: '#2a0a2a', // Dark Purple
        easter: '#E0F7FA' // Pastel Blue/Green
    };

    return (
        <group>
            <fog attach="fog" args={[bgColors[type as keyof typeof bgColors] || 'black', 10, 80]} />
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* Chinese New Year Extras */}
            {type === 'chinese_new_year' && (
                <>
                    <FireworkParticles />
                    {/* Distant fog glow */}
                    <pointLight position={[0, 20, -20]} color="#FF0000" intensity={2} distance={100} />
                </>
            )}

            {/* Diwali Extras */}
            {type === 'diwali' && (
                <>
                    <RangoliFloor />
                    <SparkleParticles />
                    {/* Warm ambient glow */}
                    <pointLight position={[0, 5, 0]} color="#FFD700" intensity={1} distance={50} />
                </>
            )}

            {/* Ground (Default for others) */}
            {type === 'easter' && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                    <planeGeometry args={[200, 200]} />
                    <meshStandardMaterial
                        color="#90EE90"
                        roughness={1}
                    />
                </mesh>
            )}

            {objects.map((obj) => (
                <FestiveObject key={obj.id} data={obj} />
            ))}
        </group>
    );
};

// 3D Lantern Component
const Lantern3D = ({ color = '#ff0000', scale = 1 }) => (
    <group scale={[scale, scale, scale]}>
        {/* Paper Body - Glowing */}
        <mesh castShadow>
            <capsuleGeometry args={[0.5, 1, 4, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.0} transparent opacity={0.9} />
        </mesh>
        {/* Rims */}
        <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
            <meshStandardMaterial color="#330000" />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
            <meshStandardMaterial color="#330000" />
        </mesh>
        {/* Tassel */}
        <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.1, 0.2, 1, 4]} />
            <meshStandardMaterial color="#ffcc00" />
        </mesh>
        {/* Internal Light */}
        <pointLight color="orange" intensity={3} distance={15} decay={2} />
    </group>
);

// 3D Diya Component
const Diya3D = ({ scale = 1 }) => (
    <group scale={[scale, scale, scale]}>
        {/* Clay Bowl */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
            <meshStandardMaterial color="#8B4513" roughness={1} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.05, 8, 16]} />
            <meshStandardMaterial color="#DAA520" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Flame - Animated via shader or simple geometry for now */}
        <mesh position={[0, 0.5, 0]}>
            <coneGeometry args={[0.15, 0.5, 8]} />
            <meshStandardMaterial color="#FF4500" emissive="#FFD700" emissiveIntensity={3} transparent opacity={0.9} />
        </mesh>
        <pointLight position={[0, 0.8, 0]} color="#FFD700" intensity={1.5} distance={5} decay={2} />
    </group>
);

// Particle Systems
const FireworkParticles = () => {
    // Simple burst effect using points
    const count = 200;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 100; // Spread wide
            pos[i * 3 + 1] = Math.random() * 50 + 10; // High in sky
            pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        return pos;
    }, []);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.5} color="#FFD700" transparent opacity={0.8} sizeAttenuation />
        </points>
    );
}

const SparkleParticles = () => {
    const count = 300;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 80;
            pos[i * 3 + 1] = Math.random() * 20; // Lower to ground
            pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
        }
        return pos;
    }, []);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.2} color="#FFFFFF" transparent opacity={0.6} sizeAttenuation />
        </points>
    );
}

// Rangoli Ground Pattern
const RangoliFloor = () => {
    // Procedural ring pattern for ground
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]} receiveShadow>
            <circleGeometry args={[40, 64]} />
            <meshStandardMaterial
                color="#4B0082" // Indigo base
                emissive="#FF1493" // Pink glow
                emissiveIntensity={0.2}
                roughness={0.8}
            />
        </mesh>
    );
}

const FestiveObject = ({ data }: { data: any }) => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime;

        if (data.type === 'lantern') {
            // Float Up
            ref.current.position.y += data.speed * 0.01;
            if (ref.current.position.y > 60) ref.current.position.y = -20;
            // Sway
            ref.current.rotation.z = Math.sin(t + data.id) * 0.1;
            ref.current.rotation.y += 0.005;
        } else if (data.type === 'diya') {
            // Gentle flicker/bob
            ref.current.position.y = 0.5 + Math.sin(t * 3 + data.id) * 0.05;
        } else if (data.type === 'rabbit') {
            // Hop
            const hop = Math.abs(Math.sin(t * data.speed));
            ref.current.position.y = hop * 1;
        }
    });

    return (
        <group ref={ref} position={[data.x, data.type === 'lantern' ? data.y : 0, data.z]}>
            {data.type === 'lantern' && (
                <Lantern3D color={data.id % 2 === 0 ? '#ff0000' : '#d42426'} scale={data.scale * 0.8} />
            )}
            {data.type === 'diya' && (
                <Diya3D scale={data.scale * 0.8} />
            )}
            {/* Keeping Rabbit as 2D for now as user only complained about Diwali, and rabbits are harder to model procedurally */}
            {/* User requested removal of ALL 2D placards. Removing rabbits. Less is more. */}

            {data.type === 'egg' && (
                <mesh position={[0, 1, 0]} scale={[1, 1.5, 1]}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial color={data.color} roughness={0.5} />
                </mesh>
            )}
        </group>
    );
};

