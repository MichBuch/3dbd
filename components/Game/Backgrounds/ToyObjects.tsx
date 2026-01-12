import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

const TOY_EMOJIS = ['🧸', '🚂', '🚗', '🦆', '⚽', '🎸', '🧩', '🎨', '🪁', '🤖', '🎮', '🦕'];

function Toy({ position, initialRotation, emoji, speed, rotationSpeed }: any) {
    const mesh = useRef<THREE.Group>(null);
    const { preferences } = useGameStore();

    useFrame((state, delta) => {
        if (!mesh.current || preferences.reduceMotion) return;

        const effectiveSpeed = speed * (preferences.themeSpeed || 1);

        // Move across screen (Right to Left or mixed)
        mesh.current.position.x -= effectiveSpeed * delta * 5;

        // Loop
        if (mesh.current.position.x < -80) {
            mesh.current.position.x = 80;
            mesh.current.position.y = (Math.random() - 0.5) * 60;
            mesh.current.position.z = -20 + Math.random() * -40; // Background depth
        }

        // Rotate
        mesh.current.rotation.z += rotationSpeed * delta;
        mesh.current.rotation.y += rotationSpeed * 0.5 * delta;
    });

    return (
        <group ref={mesh} position={position} rotation={initialRotation}>
            <Text
                fontSize={4}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.1}
                outlineColor="white"
            >
                {emoji}
            </Text>
        </group>
    );
}

export const ToyObjects = () => {
    const { preferences } = useGameStore();

    // Determine count based on density
    const count = useMemo(() => {
        if (preferences.themeDensity === 'low') return 5;
        if (preferences.themeDensity === 'high') return 30;
        return 15;
    }, [preferences.themeDensity]);

    const toys = useMemo(() => {
        return new Array(30).fill(null).map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 160, // Wide spread X
                (Math.random() - 0.5) * 60,  // Y
                -20 + Math.random() * -40    // Z depth
            ],
            initialRotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
            emoji: TOY_EMOJIS[Math.floor(Math.random() * TOY_EMOJIS.length)],
            speed: 0.5 + Math.random() * 2,
            rotationSpeed: (Math.random() - 0.5) * 2,
            key: i
        }));
    }, []);

    // Only render subset based on count
    const activeToys = toys.slice(0, count);

    return (
        <>
            {activeToys.map((toy) => (
                <Toy
                    key={toy.key}
                    position={toy.position}
                    initialRotation={toy.initialRotation}
                    emoji={toy.emoji}
                    speed={toy.speed}
                    rotationSpeed={toy.rotationSpeed}
                />
            ))}
        </>
    );
}
