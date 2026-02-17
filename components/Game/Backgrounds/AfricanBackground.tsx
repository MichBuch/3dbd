import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Low-poly Baobab Tree
const BaobabTree = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
    return (
        <group position={position} scale={[scale, scale, scale]}>
            {/* Trunk - Thick and bulbous */}
            <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[1.5, 2.5, 6, 8]} />
                <meshStandardMaterial color="#5C4033" roughness={0.9} />
            </mesh>
            {/* Branches - Small and spindly on top */}
            <group position={[0, 5, 0]}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <mesh key={i} rotation={[Math.random(), Math.random() * Math.PI, Math.random()]} position={[0, 1, 0]}>
                        <cylinderGeometry args={[0.1, 0.4, 3, 4]} />
                        <meshStandardMaterial color="#5C4033" roughness={0.9} />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

// Acacia Tree (Flat top)
const AcaciaTree = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
    return (
        <group position={position} scale={[scale, scale, scale]}>
            {/* Trunk */}
            <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.2, 0.4, 4, 6]} />
                <meshStandardMaterial color="#4A3C31" />
            </mesh>
            {/* Canopy (Flat) */}
            <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[3, 0.5, 0.5, 7]} />
                <meshStandardMaterial color="#228B22" roughness={0.8} />
            </mesh>
        </group>
    );
};

// Simple Distant Animal Silhouette (Billboard style or low poly)
// Representing a Giraffe or generic quadruped
const AnimalSilhouette = ({ position, type = 'giraffe', rotation = 0 }: { position: [number, number, number], type?: 'giraffe' | 'elephant', rotation?: number }) => {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {type === 'giraffe' && (
                <>
                    <mesh position={[0, 1.5, 0]}>
                        <boxGeometry args={[0.8, 1.5, 1.5]} />
                        <meshStandardMaterial color="#1a1a1a" /> {/* Silhouette */}
                    </mesh>
                    <mesh position={[0.5, 3, 0]}>
                        <cylinderGeometry args={[0.15, 0.2, 3, 4]} />
                        <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                </>
            )}
            {type === 'elephant' && (
                <>
                    <mesh position={[0, 1.2, 0]}>
                        <boxGeometry args={[2, 2.2, 3]} />
                        <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                    {/* Head/Trunk */}
                    <mesh position={[0, 0.8, 1.8]} rotation={[Math.PI / 4, 0, 0]}>
                        <cylinderGeometry args={[0.2, 0.1, 2, 4]} />
                        <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                </>
            )}
        </group>
    );
};

export const AfricanBackground = () => {
    // Generate scattered positions for trees
    const trees = useMemo(() => {
        const items = [];
        for (let i = 0; i < 15; i++) {
            const isBaobab = Math.random() > 0.6;
            const r = 25 + Math.random() * 40; // Distance from center
            const theta = Math.random() * Math.PI * 2;
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            items.push({
                Component: isBaobab ? BaobabTree : AcaciaTree,
                position: [x, -5, z] as [number, number, number],
                scale: 1 + Math.random(),
            });
        }
        return items;
    }, []);

    const animals = useMemo(() => {
        const items = [];
        for (let i = 0; i < 5; i++) {
            const r = 35 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            items.push({
                type: Math.random() > 0.5 ? 'giraffe' : 'elephant',
                position: [r * Math.cos(theta), -5, r * Math.sin(theta)] as [number, number, number],
                rotation: Math.random() * Math.PI
            })
        }
        return items;
    }, [])

    return (
        <group>
            {/* Sunrise/Sunset Lighting */}
            <ambientLight intensity={0.4} color="#FFD700" />
            <directionalLight
                position={[-50, 20, -50]}
                intensity={1.5}
                color="#FF4500" // Orange-Red Sun
                castShadow
            />

            {/* The Sun */}
            <mesh position={[-80, 10, -80]}>
                <sphereGeometry args={[15, 32, 32]} />
                <meshBasicMaterial color="#FF4500" />
            </mesh>

            {/* Sky (Gradient) */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[200, 32, 32]} />
                <meshBasicMaterial side={THREE.BackSide} color="#87CEEB">
                    {/* We rely on CSS background for the gradient mostly, but this acts as fog catcher */}
                </meshBasicMaterial>
            </mesh>
            <fog attach="fog" args={['#FFA07A', 10, 120]} /> {/* LightSalmon fog for distance */}

            {/* Ground (Savanna) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#DAA520" roughness={1} /> {/* GoldenRod */}
            </mesh>

            {/* Trees */}
            {trees.map((tree, i) => (
                <tree.Component key={i} position={tree.position} scale={tree.scale} />
            ))}

            {/* Animals */}
            {animals.map((anim, i) => (
                <AnimalSilhouette key={`anim-${i}`} position={anim.position} type={anim.type as any} rotation={anim.rotation} />
            ))}

            <Stars radius={150} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
};
