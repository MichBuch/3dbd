'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

// Road & Environment Logic
export const Route66Background = () => {
    const { preferences } = useGameStore();

    // Load available sprites (Sign). Shack sprite might be missing, so we use fallback if needed or just 3D geometry.
    // We will just load the sign texture for now to be safe.
    const signTex = useTexture('/assets/sprites/r66_sign.png');

    // Generate random roadside objects (Shacks, Signs, Cactus)
    const objects = useMemo(() => {
        const items = [];
        for (let i = 0; i < 20; i++) {
            const type = Math.random() > 0.7 ? 'shack' : (Math.random() > 0.5 ? 'sign' : 'cactus');
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = side * (15 + Math.random() * 20); // Far side of road

            items.push({
                id: i,
                type,
                x,
                zStart: -(Math.random() * 400),
                scale: 1 + Math.random() * 0.5
            });
        }
        return items;
    }, []);

    return (
        <group>
            {/* 1. The Road (Moving Stripes) */}
            <RoadFloor />

            {/* 2. Environment (Desert Plane) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#E6C288" roughness={1} />
            </mesh>

            {/* 3. Sun/Sunset */}
            <mesh position={[0, 50, -300]}>
                <circleGeometry args={[60, 32]} />
                <meshBasicMaterial color="#FF4500" />
            </mesh>

            {/* 4. Moving Objects */}
            {objects.map((obj) => (
                <MovingRoadsideObject key={obj.id} data={obj} signTex={signTex} />
            ))}
        </group>
    );
};

// Moving Floor Logic
const RoadFloor = () => {
    const { preferences } = useGameStore();

    return (
        <group position={[0, -1.9, 0]}>
            {/* ASPHALT */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 1000]} />
                <meshStandardMaterial color="#333333" roughness={0.8} />
            </mesh>

            {/* MOVING STRIPES */}
            <RoadStripes />
        </group>
    );
};

const RoadStripes = () => {
    const { preferences } = useGameStore();
    const stripesRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (!stripesRef.current) return;
        const speed = (preferences.themeSpeed || 1) * 30; // 30 units/sec

        stripesRef.current.children.forEach((child) => {
            child.position.z += speed * delta;
            if (child.position.z > 20) {
                child.position.z = -200; // Loop back
            }
        });
    });

    const stripes = useMemo(() => {
        const items = [];
        for (let i = 0; i < 15; i++) {
            items.push(-i * 20); // Spaced every 20 units
        }
        return items;
    }, []);

    return (
        <group ref={stripesRef}>
            {stripes.map((z, i) => (
                <mesh key={i} position={[0, 0.1, z]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.5, 6]} />
                    <meshBasicMaterial color="#FFD700" />
                </mesh>
            ))}
        </group>
    );
};

const MovingRoadsideObject = ({ data, signTex }: { data: any, signTex: THREE.Texture }) => {
    const { preferences } = useGameStore();
    const ref = useRef<THREE.Group>(null);
    const zPos = useRef(data.zStart);

    useFrame((state, delta) => {
        if (!ref.current) return;
        const speed = (preferences.themeSpeed || 1) * 30;

        zPos.current += speed * delta;

        // Loop
        if (zPos.current > 50) {
            zPos.current = -300 - Math.random() * 100;
        }

        ref.current.position.z = zPos.current;
        ref.current.position.x = data.x;
    });

    return (
        <group ref={ref} position={[data.x, 0, data.zStart]}>
            {data.type === 'shack' && (
                <group scale={[data.scale * 3, data.scale * 3, data.scale * 3]}>
                    {/* House Body */}
                    <mesh position={[0, 1, 0]}>
                        <boxGeometry args={[2, 2, 2]} />
                        <meshStandardMaterial color="#8B4513" roughness={0.9} />
                    </mesh>
                    {/* Roof */}
                    <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]}>
                        <coneGeometry args={[2, 1.5, 4]} />
                        <meshStandardMaterial color="#5D4037" roughness={0.9} />
                    </mesh>
                </group>
            )}

            {data.type === 'sign' && (
                <Billboard follow={false} lockX={false} lockY={false} lockZ={false}>
                    <mesh position={[0, 2.5, 0]} scale={[2, 2, 1]}>
                        <planeGeometry />
                        <meshBasicMaterial map={signTex} transparent side={THREE.DoubleSide} alphaTest={0.5} />
                    </mesh>
                    {/* Post */}
                    <mesh position={[0, 1, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 2]} />
                        <meshStandardMaterial color="#555" />
                    </mesh>
                </Billboard>
            )}

            {data.type === 'cactus' && (
                <group scale={[data.scale * 1.5, data.scale * 1.5, data.scale * 1.5]}>
                    <mesh position={[0, 1, 0]}>
                        <cylinderGeometry args={[0.3, 0.3, 2]} />
                        <meshStandardMaterial color="#2E8B57" />
                    </mesh>
                    <mesh position={[0.5, 1.5, 0]} rotation={[0, 0, -0.5]}>
                        <cylinderGeometry args={[0.2, 0.2, 1]} />
                        <meshStandardMaterial color="#2E8B57" />
                    </mesh>
                    <mesh position={[-0.5, 1.2, 0]} rotation={[0, 0, 0.5]}>
                        <cylinderGeometry args={[0.2, 0.2, 0.8]} />
                        <meshStandardMaterial color="#2E8B57" />
                    </mesh>
                </group>
            )}
        </group>
    );
};
