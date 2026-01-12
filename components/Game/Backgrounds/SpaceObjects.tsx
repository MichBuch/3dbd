'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// Object Types
const OBJECTS = [
    { icon: '☄️', type: 'asteroid', scale: 2 },
    { icon: '🪨', type: 'rock', scale: 1.5 },
    { icon: '🛸', type: 'ufo', scale: 2.5 },
    { icon: '👾', type: 'alien', scale: 2 },
    { icon: '🛰️', type: 'satellite', scale: 1.8 },
    { icon: '🚀', type: 'rocket', scale: 2 },
    { icon: '⭐', type: 'star', scale: 1 },
];

const ELON_ROADSTER = { icon: '🏎️', type: 'roadster', scale: 3 };

function FloatingObject({ data, position, velocity, rotationSpeed }: any) {
    const ref = useRef<THREE.Group>(null);
    const [dead, setDead] = useState(false);

    useFrame((state, delta) => {
        if (!ref.current || dead) return;

        // Move
        ref.current.position.x += velocity.x * delta;
        ref.current.position.y += velocity.y * delta;
        ref.current.position.z += velocity.z * delta;

        // Rotate
        ref.current.rotation.x += rotationSpeed.x * delta;
        ref.current.rotation.y += rotationSpeed.y * delta;
        ref.current.rotation.z += rotationSpeed.z * delta;

        // Reset if too far
        if (ref.current.position.z > 50 || ref.current.position.z < -100) {
            // Reset logic handled by parent usually, but here we just loop
            ref.current.position.z = -100;
            ref.current.position.x = (Math.random() - 0.5) * 100;
            ref.current.position.y = (Math.random() - 0.5) * 100;
        }
    });

    return (
        <group ref={ref} position={position}>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <Text
                    fontSize={data.scale}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    fillOpacity={0.9}
                >
                    {data.icon}
                </Text>
            </Float>
        </group>
    );
}

export const SpaceObjects = () => {
    // Generate initial objects
    const initialObjects = useMemo(() => {
        const items = [];
        // Regular debris
        for (let i = 0; i < 30; i++) {
            const type = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
            items.push({
                id: i,
                data: type,
                position: [
                    (Math.random() - 0.5) * 120, // X: Wide spread
                    (Math.random() - 0.5) * 80,  // Y: Height
                    (Math.random() - 0.5) * 100 - 50 // Z: Depth (-100 to 0)
                ],
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2,
                    z: 5 + Math.random() * 10 // Flying TOWARDS camera (Standard starfield move)
                },
                rotationSpeed: {
                    x: Math.random(),
                    y: Math.random(),
                    z: Math.random()
                }
            });
        }

        // Elon's Roadster (Rare/Specific)
        items.push({
            id: 'elon',
            data: ELON_ROADSTER,
            position: [20, 10, -80],
            velocity: { x: -0.5, y: -0.2, z: 8 }, // Cruising across
            rotationSpeed: { x: 0.2, y: 0.5, z: 0 } // Slow tumble
        });

        return items;
    }, []);

    return (
        <group>
            {/* Distant Sun */}
            <group position={[50, 30, -100]}>
                <Text fontSize={30} color="#FDB813">☀️</Text>
                <pointLight intensity={2} distance={200} color="#FDB813" />
            </group>

            {/* Black Hole (Void) */}
            <group position={[-40, -20, -120]}>
                <mesh>
                    <sphereGeometry args={[15, 32, 32]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>
                {/* Accretion Disk Ring */}
                <mesh rotation={[1.5, 0, 0]}>
                    <ringGeometry args={[16, 25, 64]} />
                    <meshBasicMaterial color="#a020f0" side={THREE.DoubleSide} transparent opacity={0.4} />
                </mesh>
            </group>

            {initialObjects.map((obj) => (
                <FloatingObject
                    key={obj.id}
                    data={obj.data}
                    position={obj.position}
                    velocity={obj.velocity}
                    rotationSpeed={obj.rotationSpeed}
                />
            ))}
        </group>
    );
};
