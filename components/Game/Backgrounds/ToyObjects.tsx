import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

// Cheerful Palette
const TOY_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

const ToyBlock = ({ position, rotationSpeed, color, type }: any) => {
    const mesh = useRef<THREE.Group>(null);
    const { preferences } = useGameStore();

    useFrame((state, delta) => {
        if (!preferences.reduceMotion && mesh.current) {
            mesh.current.rotation.x += rotationSpeed * delta;
            mesh.current.rotation.y += rotationSpeed * delta;
        }
    });

    return (
        <group ref={mesh} position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh castShadow receiveShadow>
                    {type === 'cube' && <boxGeometry args={[4, 4, 4]} />}
                    {type === 'sphere' && <sphereGeometry args={[2.5, 32, 32]} />}
                    {type === 'cone' && <coneGeometry args={[2.5, 5, 32]} />}
                    {type === 'torus' && <torusGeometry args={[2, 0.8, 16, 32]} />}
                    <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
                </mesh>
            </Float>
        </group>
    );
};

export const ToyObjects = () => {
    const { preferences } = useGameStore();

    // Determine count based on density
    const count = useMemo(() => {
        if (preferences.themeDensity === 'low') return 10;
        if (preferences.themeDensity === 'high') return 40;
        return 20;
    }, [preferences.themeDensity]);

    const objects = useMemo(() => {
        const shapes = ['cube', 'sphere', 'cone', 'torus'];
        return new Array(50).fill(null).map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 180,
                (Math.random() - 0.5) * 80,
                -20 + Math.random() * -60
            ] as [number, number, number],
            color: TOY_COLORS[Math.floor(Math.random() * TOY_COLORS.length)],
            type: shapes[Math.floor(Math.random() * shapes.length)],
            rotationSpeed: (Math.random() - 0.5) * 1,
            key: i
        }));
    }, []);

    const activeObjects = objects.slice(0, count);

    return (
        <group>
            {/* Happy Lighting */}
            <ambientLight intensity={0.8} color="#ffffff" />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffd700" />

            {/* Clouds for Fluffiness */}
            <Cloud position={[-40, 20, -50]} opacity={0.5} speed={0.4} width={10} depth={1.5} segments={20} />
            <Cloud position={[40, -10, -60]} opacity={0.5} speed={0.4} width={10} depth={1.5} segments={20} />

            {activeObjects.map((obj) => (
                <ToyBlock
                    key={obj.key}
                    position={obj.position}
                    color={obj.color}
                    type={obj.type}
                    rotationSpeed={obj.rotationSpeed}
                />
            ))}
        </group>
    );
}
