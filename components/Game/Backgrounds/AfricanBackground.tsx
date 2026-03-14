'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// Low-poly Baobab Tree
const BaobabTree = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => (
    <group position={position} scale={[scale, scale, scale]}>
        <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[1.8, 2.8, 7, 8]} />
            <meshStandardMaterial color="#6B4C3B" roughness={0.95} />
        </mesh>
        {/* Bulge in middle */}
        <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[2.2, 8, 6]} />
            <meshStandardMaterial color="#7A5C4A" roughness={0.95} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            const tilt = 0.6 + Math.random() * 0.4;
            return (
                <group key={i} position={[0, 6.5, 0]} rotation={[tilt * Math.cos(a), a, tilt * Math.sin(a)]}>
                    <mesh position={[0, 1.2, 0]}>
                        <cylinderGeometry args={[0.15, 0.4, 2.5, 5]} />
                        <meshStandardMaterial color="#5C4033" roughness={0.9} />
                    </mesh>
                    {/* Sparse leaf cluster */}
                    <mesh position={[0, 2.5, 0]}>
                        <sphereGeometry args={[0.8, 6, 6]} />
                        <meshStandardMaterial color="#4a7c3f" roughness={0.9} />
                    </mesh>
                </group>
            );
        })}
    </group>
);

// Acacia Tree (Flat top)
const AcaciaTree = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => (
    <group position={position} scale={[scale, scale, scale]}>
        <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.25, 0.5, 5, 6]} />
            <meshStandardMaterial color="#5C4A3A" roughness={0.9} />
        </mesh>
        {/* Flat canopy */}
        <mesh position={[0, 5.2, 0]} scale={[1, 0.25, 1]}>
            <sphereGeometry args={[3.5, 10, 8]} />
            <meshStandardMaterial color="#3d6b2e" roughness={0.85} />
        </mesh>
        {/* Canopy top layer */}
        <mesh position={[0, 5.5, 0]} scale={[1, 0.2, 1]}>
            <sphereGeometry args={[2.8, 10, 8]} />
            <meshStandardMaterial color="#4a7c38" roughness={0.85} />
        </mesh>
    </group>
);

// Giraffe with proper coloring
const Giraffe = ({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) => (
    <group position={position} rotation={[0, rotation, 0]}>
        {/* Body */}
        <mesh position={[0, 3.5, 0]}>
            <boxGeometry args={[1.2, 2, 2]} />
            <meshStandardMaterial color="#C8860A" roughness={0.8} />
        </mesh>
        {/* Neck */}
        <mesh position={[0.3, 6, 0.2]} rotation={[0.3, 0, 0.15]}>
            <cylinderGeometry args={[0.3, 0.45, 4, 6]} />
            <meshStandardMaterial color="#C8860A" roughness={0.8} />
        </mesh>
        {/* Head */}
        <mesh position={[0.7, 8.2, 0.5]}>
            <boxGeometry args={[0.6, 0.7, 1.1]} />
            <meshStandardMaterial color="#C8860A" roughness={0.8} />
        </mesh>
        {/* Ossicones (horns) */}
        <mesh position={[0.6, 8.8, 0.3]}>
            <cylinderGeometry args={[0.06, 0.1, 0.5, 5]} />
            <meshStandardMaterial color="#8B6914" roughness={0.9} />
        </mesh>
        <mesh position={[0.9, 8.8, 0.3]}>
            <cylinderGeometry args={[0.06, 0.1, 0.5, 5]} />
            <meshStandardMaterial color="#8B6914" roughness={0.9} />
        </mesh>
        {/* Legs */}
        {[[-0.4, 0.5], [0.4, 0.5], [-0.4, -0.5], [0.4, -0.5]].map(([lx, lz], i) => (
            <mesh key={i} position={[lx, 1.5, lz]}>
                <cylinderGeometry args={[0.18, 0.15, 3, 6]} />
                <meshStandardMaterial color="#B8760A" roughness={0.8} />
            </mesh>
        ))}
        {/* Spots */}
        {[
            [0, 3.5, 0.6], [0.3, 4.5, 0.6], [-0.3, 3, 0.6],
            [0, 3.5, -0.6], [0.3, 4.5, -0.6]
        ].map(([sx, sy, sz], i) => (
            <mesh key={`spot-${i}`} position={[sx, sy, sz]}>
                <sphereGeometry args={[0.25, 6, 6]} />
                <meshStandardMaterial color="#7B4F00" roughness={0.9} />
            </mesh>
        ))}
        {/* Tail */}
        <mesh position={[-0.1, 3.2, -1.1]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.02, 1.2, 4]} />
            <meshStandardMaterial color="#C8860A" roughness={0.9} />
        </mesh>
    </group>
);

// Elephant with proper coloring
const Elephant = ({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) => (
    <group position={position} rotation={[0, rotation, 0]}>
        {/* Body */}
        <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[2, 10, 8]} />
            <meshStandardMaterial color="#7a7a7a" roughness={0.9} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 4.2, 1.5]}>
            <sphereGeometry args={[1.3, 10, 8]} />
            <meshStandardMaterial color="#7a7a7a" roughness={0.9} />
        </mesh>
        {/* Trunk */}
        <mesh position={[0, 3.2, 2.6]} rotation={[0.6, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.4, 2.5, 8]} />
            <meshStandardMaterial color="#6e6e6e" roughness={0.9} />
        </mesh>
        {/* Trunk tip curl */}
        <mesh position={[0, 2.2, 3.5]} rotation={[1.2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.25, 0.8, 8]} />
            <meshStandardMaterial color="#6e6e6e" roughness={0.9} />
        </mesh>
        {/* Ears */}
        <mesh position={[-1.5, 4.2, 1.2]} rotation={[0, 0.3, 0]} scale={[0.4, 1, 1]}>
            <sphereGeometry args={[1.8, 8, 8]} />
            <meshStandardMaterial color="#6e6e6e" roughness={0.9} />
        </mesh>
        <mesh position={[1.5, 4.2, 1.2]} rotation={[0, -0.3, 0]} scale={[0.4, 1, 1]}>
            <sphereGeometry args={[1.8, 8, 8]} />
            <meshStandardMaterial color="#6e6e6e" roughness={0.9} />
        </mesh>
        {/* Tusks */}
        <mesh position={[-0.4, 3.4, 2.5]} rotation={[0.8, 0.2, 0]}>
            <cylinderGeometry args={[0.1, 0.05, 1.5, 6]} />
            <meshStandardMaterial color="#FFFFF0" roughness={0.3} />
        </mesh>
        <mesh position={[0.4, 3.4, 2.5]} rotation={[0.8, -0.2, 0]}>
            <cylinderGeometry args={[0.1, 0.05, 1.5, 6]} />
            <meshStandardMaterial color="#FFFFF0" roughness={0.3} />
        </mesh>
        {/* Legs */}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([lx, lz], i) => (
            <mesh key={i} position={[lx, 0.8, lz]}>
                <cylinderGeometry args={[0.5, 0.45, 2, 6]} />
                <meshStandardMaterial color="#7a7a7a" roughness={0.9} />
            </mesh>
        ))}
        {/* Tail */}
        <mesh position={[0, 2.5, -2]} rotation={[-0.5, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.04, 1.5, 4]} />
            <meshStandardMaterial color="#6e6e6e" roughness={0.9} />
        </mesh>
    </group>
);

// Animated zebra herd in distance
const ZebraHerd = () => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!ref.current) return;
        ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.05) * 5;
    });
    return (
        <group ref={ref}>
            {[0, 1, 2, 3].map(i => (
                <group key={i} position={[i * 4 - 6, -5, -55 + i * 2]}>
                    {/* Zebra body */}
                    <mesh position={[0, 1.5, 0]}>
                        <boxGeometry args={[0.8, 1.2, 1.8]} />
                        <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
                    </mesh>
                    {/* Stripes */}
                    {[0, 1, 2].map(s => (
                        <mesh key={s} position={[0, 1.5, -0.5 + s * 0.5]}>
                            <boxGeometry args={[0.82, 1.22, 0.15]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
                        </mesh>
                    ))}
                    {/* Head */}
                    <mesh position={[0, 2.2, 1.1]}>
                        <boxGeometry args={[0.5, 0.6, 0.9]} />
                        <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
                    </mesh>
                    {/* Legs */}
                    {[[-0.25, -0.5], [0.25, -0.5], [-0.25, 0.5], [0.25, 0.5]].map(([lx, lz], li) => (
                        <mesh key={li} position={[lx, 0.4, lz]}>
                            <cylinderGeometry args={[0.1, 0.09, 1.2, 5]} />
                            <meshStandardMaterial color="#e0e0e0" roughness={0.8} />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
};

// Animated vultures circling overhead
const CirclingVultures = () => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!ref.current) return;
        ref.current.rotation.y = state.clock.elapsedTime * 0.15;
    });
    return (
        <group ref={ref} position={[0, 20, -30]}>
            {[0, 1, 2].map(i => {
                const a = (i / 3) * Math.PI * 2;
                return (
                    <group key={i} position={[Math.cos(a) * 15, i * 2, Math.sin(a) * 15]}>
                        {/* Wings */}
                        <mesh rotation={[0, 0, 0.3]}>
                            <boxGeometry args={[3, 0.1, 0.5]} />
                            <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
                        </mesh>
                        {/* Body */}
                        <mesh>
                            <sphereGeometry args={[0.3, 6, 6]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
};

export const AfricanBackground = () => {
    const trees = useMemo(() => {
        const items = [];
        for (let i = 0; i < 18; i++) {
            const isBaobab = Math.random() > 0.55;
            const r = 28 + Math.random() * 45;
            const theta = Math.random() * Math.PI * 2;
            items.push({
                Component: isBaobab ? BaobabTree : AcaciaTree,
                position: [r * Math.cos(theta), -5, r * Math.sin(theta)] as [number, number, number],
                scale: 0.8 + Math.random() * 0.8,
            });
        }
        return items;
    }, []);

    const animals = useMemo(() => {
        const items = [];
        const positions = [
            { type: 'giraffe', pos: [40, -5, -20] as [number, number, number], rot: 0.5 },
            { type: 'giraffe', pos: [50, -5, 10] as [number, number, number], rot: -0.3 },
            { type: 'elephant', pos: [-45, -5, -15] as [number, number, number], rot: 1.2 },
            { type: 'elephant', pos: [-35, -5, 20] as [number, number, number], rot: -0.8 },
            { type: 'giraffe', pos: [20, -5, -50] as [number, number, number], rot: 2.1 },
        ];
        return positions;
    }, []);

    return (
        <group>
            {/* Warm sunset lighting */}
            <ambientLight intensity={0.5} color="#FFB347" />
            <directionalLight position={[-60, 15, -60]} intensity={2.0} color="#FF6B35" castShadow />
            {/* Fill light from opposite side */}
            <directionalLight position={[40, 10, 40]} intensity={0.4} color="#FFD700" />

            {/* Large setting sun */}
            <mesh position={[-90, 8, -90]}>
                <sphereGeometry args={[18, 32, 32]} />
                <meshBasicMaterial color="#FF4500" />
            </mesh>
            {/* Sun glow halo */}
            <mesh position={[-90, 8, -90]}>
                <sphereGeometry args={[22, 16, 16]} />
                <meshBasicMaterial color="#FF6600" transparent opacity={0.15} />
            </mesh>

            {/* Sky dome — warm gradient */}
            <mesh>
                <sphereGeometry args={[250, 32, 32]} />
                <meshBasicMaterial side={THREE.BackSide} color="#E8722A" />
            </mesh>

            <fog attach="fog" args={['#D2691E', 15, 130]} />

            {/* Savanna ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
                <planeGeometry args={[600, 600]} />
                <meshStandardMaterial color="#C8A84B" roughness={1} />
            </mesh>
            {/* Dry grass patches */}
            {Array.from({ length: 30 }, (_, i) => {
                const a = (i / 30) * Math.PI * 2;
                const r = 10 + Math.random() * 40;
                return (
                    <mesh key={i} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]} position={[Math.cos(a) * r, -4.9, Math.sin(a) * r]}>
                        <planeGeometry args={[3 + Math.random() * 4, 3 + Math.random() * 4]} />
                        <meshStandardMaterial color="#A0784A" roughness={1} transparent opacity={0.7} />
                    </mesh>
                );
            })}

            {/* Trees */}
            {trees.map((tree, i) => (
                <tree.Component key={i} position={tree.position} scale={tree.scale} />
            ))}

            {/* Animals */}
            {animals.map((anim, i) => (
                anim.type === 'giraffe'
                    ? <Giraffe key={i} position={anim.pos} rotation={anim.rot} />
                    : <Elephant key={i} position={anim.pos} rotation={anim.rot} />
            ))}

            <ZebraHerd />
            <CirclingVultures />

            {/* Animated lion stalking */}
            <AnimatedLion />

            {/* Shooting stars across the sky */}
            <ShootingStars />

            <Stars radius={200} depth={60} count={800} factor={3} saturation={0} fade speed={0.5} />
        </group>
    );
};

// Low-poly lion slowly stalking across the savanna
const AnimatedLion = () => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime * 0.15;
        // Walk left to right then loop
        ref.current.position.x = -70 + ((t * 15) % 160);
        // Subtle up-down walking motion
        ref.current.position.y = -5 + Math.abs(Math.sin(t * 8)) * 0.2;
        // Leg animation
        ref.current.children.forEach((child, i) => {
            if (child.name.startsWith('leg')) {
                child.rotation.x = Math.sin(t * 8 + i * 0.8) * 0.35;
            }
        });
    });

    return (
        <group ref={ref} position={[-70, -5, -20]} rotation={[0, -Math.PI / 2, 0]}>
            {/* Body */}
            <mesh position={[0, 1.5, 0]} scale={[1.5, 1, 1]}>
                <sphereGeometry args={[1.2, 8, 6]} />
                <meshStandardMaterial color="#C8860A" roughness={0.8} />
            </mesh>
            {/* Chest */}
            <mesh position={[1.2, 1.2, 0]} scale={[0.9, 1, 1]}>
                <sphereGeometry args={[1.0, 8, 6]} />
                <meshStandardMaterial color="#C8860A" roughness={0.8} />
            </mesh>
            {/* Head */}
            <mesh position={[2.5, 1.8, 0]}>
                <sphereGeometry args={[0.75, 8, 8]} />
                <meshStandardMaterial color="#C8860A" roughness={0.8} />
            </mesh>
            {/* Mane */}
            <mesh position={[2.3, 1.9, 0]}>
                <sphereGeometry args={[0.95, 8, 8]} />
                <meshStandardMaterial color="#7B4700" roughness={1} transparent opacity={0.85} />
            </mesh>
            {/* Ears */}
            <mesh position={[2.6, 2.55, 0.4]}>
                <coneGeometry args={[0.18, 0.35, 4]} />
                <meshStandardMaterial color="#B87030" roughness={0.9} />
            </mesh>
            <mesh position={[2.6, 2.55, -0.4]}>
                <coneGeometry args={[0.18, 0.35, 4]} />
                <meshStandardMaterial color="#B87030" roughness={0.9} />
            </mesh>
            {/* Legs */}
            {[[-0.6, 0, 0.5], [0.6, 0, 0.5], [-0.6, 0, -0.5], [0.6, 0, -0.5]].map(([lx, ly, lz], i) => (
                <mesh
                    key={i}
                    name={`leg${i}`}
                    position={[lx, 0.4, lz]}
                >
                    <capsuleGeometry args={[0.22, 1.2, 4, 8]} />
                    <meshStandardMaterial color="#B87030" roughness={0.9} />
                </mesh>
            ))}
            {/* Tail */}
            <mesh position={[-1.5, 1.6, 0]} rotation={[0, 0, -0.6]}>
                <capsuleGeometry args={[0.1, 1.5, 4, 6]} />
                <meshStandardMaterial color="#C8860A" roughness={0.9} />
            </mesh>
            {/* Tail tuft */}
            <mesh position={[-2.5, 2.4, 0]}>
                <sphereGeometry args={[0.22, 6, 6]} />
                <meshStandardMaterial color="#7B4700" roughness={1} />
            </mesh>
        </group>
    );
};

// Shooting stars across the sky
const ShootingStars = () => {
    const count = 4;
    return (
        <group>
            {Array.from({ length: count }, (_, i) => (
                <ShootingStar key={i} index={i} />
            ))}
        </group>
    );
};

const ShootingStar = ({ index }: { index: number }) => {
    const ref = useRef<THREE.Group>(null);
    const phase = useMemo(() => index * 4.5 + Math.random() * 3, [index]);

    useFrame((state) => {
        if (!ref.current) return;
        const t = (state.clock.elapsedTime + phase) % 8; // 8 second cycle
        if (t < 1.5) {
            // Streak across sky
            const progress = t / 1.5;
            ref.current.position.x = 80 - progress * 180;
            ref.current.position.y = 40 + index * 12 - progress * 20;
            ref.current.position.z = -80 - index * 10;
            ref.current.visible = true;
        } else {
            ref.current.visible = false;
        }
    });

    return (
        <group ref={ref}>
            <mesh rotation={[0, 0, Math.PI / 6]}>
                <capsuleGeometry args={[0.15, 6, 4, 6]} />
                <meshBasicMaterial color="#FFD700" transparent opacity={0.9} />
            </mesh>
            {/* Glow trail */}
            <mesh rotation={[0, 0, Math.PI / 6]} position={[-3, -1.5, 0]}>
                <capsuleGeometry args={[0.06, 4, 4, 6]} />
                <meshBasicMaterial color="#FFA500" transparent opacity={0.4} />
            </mesh>
        </group>
    );
};
