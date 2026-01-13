'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { useTexture, Billboard, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const FestiveBackground = () => {
    const { theme } = useGameStore();
    const type = theme.id; // 'chinese_new_year', 'diwali', 'easter'

    // Load Textures
    const lanternTex = useTexture('/assets/sprites/lantern.png');
    const diyaTex = useTexture('/assets/sprites/diya.png');
    const rabbitTex = useTexture('/assets/sprites/rabbit.png');

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

            {/* Ground (only for Diwali/Easter) */}
            {type !== 'chinese_new_year' && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                    <planeGeometry args={[200, 200]} />
                    <meshStandardMaterial
                        color={type === 'easter' ? '#90EE90' : '#3E2723'}
                        roughness={1}
                    />
                </mesh>
            )}

            {objects.map((obj) => (
                <FestiveObject key={obj.id} data={obj} tex={{ lantern: lanternTex, diya: diyaTex, rabbit: rabbitTex }} />
            ))}
        </group>
    );
};

const FestiveObject = ({ data, tex }: { data: any, tex: any }) => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime;

        if (data.type === 'lantern') {
            // Float Up
            ref.current.position.y += data.speed * 0.02;
            if (ref.current.position.y > 40) ref.current.position.y = -20;
            // Sway
            ref.current.rotation.z = Math.sin(t + data.id) * 0.05;
        } else if (data.type === 'rabbit') {
            // Hop
            const hop = Math.abs(Math.sin(t * data.speed));
            ref.current.position.y = hop * 1;
            // Move forward slowly?? Just hop in place for now.
        }
    });

    return (
        <group ref={ref} position={[data.x, data.type === 'lantern' ? data.y : 0, data.z]}>
            {data.type === 'lantern' && (
                <Billboard follow={true}>
                    <mesh scale={[data.scale, data.scale, 1]}>
                        <planeGeometry />
                        <meshBasicMaterial map={tex.lantern} transparent side={THREE.DoubleSide} alphaTest={0.5} />
                    </mesh>
                </Billboard>
            )}
            {data.type === 'diya' && (
                <Billboard follow={true}>
                    <mesh position={[0, 0.5, 0]} scale={[data.scale, data.scale, 1]}>
                        <planeGeometry />
                        <meshBasicMaterial map={tex.diya} transparent side={THREE.DoubleSide} alphaTest={0.5} />
                    </mesh>
                    {/* Add point light for glow */}
                    <pointLight position={[0, 0.5, 0.1]} distance={3} intensity={2} color="orange" />
                </Billboard>
            )}
            {data.type === 'rabbit' && (
                <Billboard follow={true}>
                    <mesh position={[0, 1, 0]} scale={[data.scale, data.scale, 1]}>
                        <planeGeometry />
                        <meshBasicMaterial map={tex.rabbit} transparent side={THREE.DoubleSide} alphaTest={0.5} />
                    </mesh>
                </Billboard>
            )}
            {data.type === 'egg' && (
                <mesh position={[0, 1, 0]} scale={[1, 1.5, 1]}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial color={data.color} />
                </mesh>
            )}
        </group>
    );
};
