'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { RealisticCrab, RealisticSeagull, RealisticPalmTree, SandCastle, FlipFlops, BeachUmbrellaChairs, SeaLion, KillerWhale, SpermWhale } from './ModelLoader';

export const BeachBackground = () => {
    // Generate beach objects
    const objects = useMemo(() => {
        const items = [];

        // Seashells scattered on sand
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 8 + Math.random() * 20;
            items.push({
                id: `shell-${i}`,
                type: 'shell',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                rotation: Math.random() * Math.PI * 2,
                shellType: Math.floor(Math.random() * 3)
            });
        }

        // Crabs removed - using realistic GLB models instead

        // Beach towels
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 12;
            items.push({
                id: `towel-${i}`,
                type: 'towel',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                rotation: Math.random() * Math.PI * 2,
                color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'][i % 5]
            });
        }

        // Surfboards stuck in sand
        for (let i = 0; i < 4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 10;
            items.push({
                id: `surfboard-${i}`,
                type: 'surfboard',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                rotation: Math.random() * Math.PI * 2,
                color: ['#00CED1', '#FF4500', '#FFD700', '#FF1493'][i % 4]
            });
        }

        // Improved palm trees (fewer, better looking)
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 25 + Math.random() * 15;
            items.push({
                id: `palm-${i}`,
                type: 'palm',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                rotation: Math.random() * Math.PI * 2
            });
        }

        // Beach umbrellas
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 18 + Math.random() * 10;
            items.push({
                id: `umbrella-${i}`,
                type: 'umbrella',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                rotation: Math.random() * Math.PI * 2,
                color: ['#FF6B6B', '#4ECDC4', '#FFE66D'][i % 3]
            });
        }

        // Inflatable lilos (floating)
        for (let i = 0; i < 3; i++) {
            items.push({
                id: `lilo-${i}`,
                type: 'lilo',
                x: -20 + i * 15,
                z: -40 - Math.random() * 10,
                color: ['#FF69B4', '#00CED1', '#FFD700'][i]
            });
        }

        // Sunglasses on sand
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 8 + Math.random() * 18;
            items.push({
                id: `sunglasses-${i}`,
                type: 'sunglasses',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                rotation: Math.random() * Math.PI * 2
            });
        }

        return items;
    }, []);

    return (
        <group>
            {/* Sunny Sky */}
            <fog attach="fog" args={['#87CEEB', 20, 120]} />
            <ambientLight intensity={1.0} color="#FFD700" />
            <directionalLight position={[50, 100, 50]} intensity={2.0} castShadow />

            {/* Bright yellow sun with rays */}
            <YellowSunWithRays position={[70, 60, -100]} />

            {/* Animated Ocean with waves */}
            <AnimatedOcean />

            {/* Sandy beach floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[200, 200, 100, 100]} />
                <meshStandardMaterial color="#F4A460" roughness={0.95} />
            </mesh>

            {/* Sand dunes in background */}
            <SandDunes />

            {/* Beach Objects */}
            {objects.map((obj) => {
                switch (obj.type) {
                    case 'shell':
                        return <Seashell key={obj.id} position={[obj.x, -1.9, obj.z]} rotation={obj.rotation} shellType={obj.shellType} />;

                    case 'towel':
                        return <BeachTowel key={obj.id} position={[obj.x, -1.95, obj.z]} rotation={obj.rotation} color={obj.color} />;
                    case 'surfboard':
                        return <Surfboard key={obj.id} position={[obj.x, -1.5, obj.z]} rotation={obj.rotation} color={obj.color} />;
                    case 'palm':
                        return <ImprovedPalmTree key={obj.id} position={[obj.x, -2, obj.z]} rotation={obj.rotation} />;
                    case 'umbrella':
                        return <BeachUmbrella key={obj.id} position={[obj.x, -2, obj.z]} rotation={obj.rotation} color={obj.color} />;
                    case 'lilo':
                        return <FloatingLilo key={obj.id} position={[obj.x, -1, obj.z]} color={obj.color} />;
                    default:
                        return null;
                }
            })}

            {/* Volleyball net and ball */}
            <VolleyballNet position={[15, -2, -5]} />
            <Float speed={3} rotationIntensity={1} floatIntensity={2}>
                <Volleyball position={[14, 3, -4]} />
            </Float>

            {/* More beach balls - 5 total */}
            <Float speed={4} rotationIntensity={1} floatIntensity={3}>
                <BeachBall position={[10, 2, 8]} />
            </Float>
            <Float speed={3.5} rotationIntensity={1.5} floatIntensity={4}>
                <BeachBall position={[-12, 3, 12]} />
            </Float>
            <Float speed={3.8} rotationIntensity={1.2} floatIntensity={3.5}>
                <BeachBall position={[5, 2.5, -8]} />
            </Float>
            <Float speed={4.2} rotationIntensity={1.3} floatIntensity={3.2}>
                <BeachBall position={[-8, 3.2, 6]} />
            </Float>
            <Float speed={3.3} rotationIntensity={1.4} floatIntensity={3.8}>
                <BeachBall position={[15, 2.3, -5]} />
            </Float>

            {/* Seagulls */}
            <FlyingSeagulls />

            {/* REALISTIC GLB MODELS */}
            <SeaLion position={[-18, -1.8, -25]} />
            <SeaLion position={[12, -1.8, -30]} />
            <KillerWhale position={[-35, 0, -60]} delay={1} />
            <SpermWhale position={[30, 0, -70]} delay={3} />
            <SandCastle position={[8, -2, 6]} rotation={0.5} scale={0.128} />
            <SandCastle position={[-15, -2, 10]} rotation={1.2} scale={0.128} />

            {/* Realistic 3D Crabs on the ground */}
            <RealisticCrab position={[10, -1.95, 8]} phase={0} />
            <RealisticCrab position={[-12, -1.95, 12]} phase={1.5} />
            <RealisticCrab position={[6, -1.95, -5]} phase={0.8} />
            <RealisticCrab position={[-9, -1.95, 5]} phase={2.2} />
            <RealisticCrab position={[15, -1.95, -8]} phase={1.1} />
            <FlipFlops position={[5, -1.95, 3]} rotation={0.3} />
            <FlipFlops position={[-8, -1.95, 7]} rotation={2.1} />
        </group>
    );
};

// Improved Palm Tree with bushier fronds
const ImprovedPalmTree = ({ position, rotation }: any) => {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Trunk - curved and textured */}
            <mesh position={[0, 3, 0]} rotation={[0, 0, 0.05]}>
                <cylinderGeometry args={[0.35, 0.45, 6, 12]} />
                <meshStandardMaterial color="#8B7355" roughness={0.95} />
            </mesh>

            {/* Coconuts cluster */}
            {[0, 1, 2].map((i) => (
                <mesh key={i} position={[Math.cos(i) * 0.3, 5.8 + Math.sin(i) * 0.2, Math.sin(i) * 0.3]}>
                    <sphereGeometry args={[0.28, 10, 10]} />
                    <meshStandardMaterial color="#654321" roughness={0.9} />
                </mesh>
            ))}

            {/* Bushy palm fronds - 12 leaves */}
            {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const droop = -0.4 - (i % 2) * 0.1;
                return (
                    <group key={i} position={[0, 6, 0]} rotation={[droop, angle, 0]}>
                        {/* Main leaf blade */}
                        <mesh position={[0, 0, 1.8]} rotation={[0, 0, 0]}>
                            <boxGeometry args={[0.4, 0.1, 3.5]} />
                            <meshStandardMaterial color="#228B22" roughness={0.7} />
                        </mesh>
                        {/* Leaf segments for realism */}
                        {[...Array(6)].map((_, j) => (
                            <mesh key={j} position={[Math.sin(j * 0.5) * 0.3, 0, 0.5 + j * 0.6]} rotation={[0, 0, j % 2 ? 0.1 : -0.1]}>
                                <boxGeometry args={[0.15, 0.05, 0.5]} />
                                <meshStandardMaterial color="#2E8B57" roughness={0.7} />
                            </mesh>
                        ))}
                    </group>
                );
            })}
        </group>
    );
};

// Detailed Seashell with ridges and texture
const Seashell = ({ position, rotation, shellType }: any) => {
    const colors = ['#FFE4C4', '#FFC0CB', '#F5DEB3'];
    const accentColors = ['#DEB887', '#FFB6C1', '#D2B48C'];

    const shapes = [
        // Spiral nautilus shell with ridges
        () => (
            <group>
                {[...Array(8)].map((_, i) => {
                    const scale = 1 - i * 0.12;
                    const offset = i * 0.05;
                    return (
                        <mesh key={i} rotation={[Math.PI / 2, i * 0.3, 0]} position={[offset, 0, -offset]}>
                            <torusGeometry args={[0.3 * scale, 0.08, 12, 16, Math.PI * 1.8]} />
                            <meshStandardMaterial
                                color={i % 2 === 0 ? colors[0] : accentColors[0]}
                                roughness={0.4}
                            />
                        </mesh>
                    );
                })}
            </group>
        ),
        // Scallop shell with ridges
        () => (
            <group>
                <mesh>
                    <sphereGeometry args={[0.28, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
                    <meshStandardMaterial color={colors[1]} roughness={0.4} />
                </mesh>
                {/* Ridges */}
                {[...Array(12)].map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    return (
                        <mesh key={i} position={[Math.cos(angle) * 0.15, 0.1, Math.sin(angle) * 0.15]} rotation={[0, angle, 0]}>
                            <boxGeometry args={[0.02, 0.25, 0.3]} />
                            <meshStandardMaterial color={accentColors[1]} roughness={0.5} />
                        </mesh>
                    );
                })}
            </group>
        ),
        // Conch shell with texture
        () => (
            <group rotation={[-Math.PI / 2, 0, 0]}>
                {/* Main cone */}
                <mesh>
                    <coneGeometry args={[0.22, 0.5, 16]} />
                    <meshStandardMaterial color={colors[2]} roughness={0.5} />
                </mesh>
                {/* Spiral ridges */}
                {[...Array(6)].map((_, i) => (
                    <mesh key={i} position={[0, -0.25 + i * 0.08, 0]} rotation={[0, i * 0.5, 0]}>
                        <torusGeometry args={[0.22 - i * 0.03, 0.015, 8, 16]} />
                        <meshStandardMaterial color={accentColors[2]} roughness={0.4} />
                    </mesh>
                ))}
                {/* Lip/opening */}
                <mesh position={[0, 0.27, 0]}>
                    <torusGeometry args={[0.1, 0.04, 8, 16]} />
                    <meshStandardMaterial color="#FFA07A" roughness={0.3} />
                </mesh>
            </group>
        )
    ];

    return (
        <group position={position} rotation={[0, rotation, 0]} scale={0.8}>
            {shapes[shellType]()}
        </group>
    );
};

// Crab
const Crab = ({ position, phase }: any) => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime + phase;

        // Sideways scuttling motion
        ref.current.position.x = position[0] + Math.sin(t * 0.5) * 3;
        ref.current.rotation.y = Math.sin(t * 0.5) * 0.3;

        // Claw animation
        ref.current.children.forEach((child, i) => {
            if (i > 2) { // Claws
                (child as THREE.Mesh).rotation.z = Math.sin(t * 3) * 0.2;
            }
        });
    });

    return (
        <group ref={ref} position={position}>
            {/* Body */}
            <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[0.5, 0.3, 0.6]} />
                <meshStandardMaterial color="#FF4500" roughness={0.7} />
            </mesh>

            {/* Eyes on stalks */}
            <mesh position={[-0.15, 0.35, 0.2]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[0.15, 0.35, 0.2]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#000000" />
            </mesh>

            {/* Left claw */}
            <mesh position={[-0.4, 0.1, 0]}>
                <boxGeometry args={[0.3, 0.15, 0.15]} />
                <meshStandardMaterial color="#DC143C" />
            </mesh>

            {/* Right claw */}
            <mesh position={[0.4, 0.1, 0]}>
                <boxGeometry args={[0.3, 0.15, 0.15]} />
                <meshStandardMaterial color="#DC143C" />
            </mesh>
        </group>
    );
};

// Beach Towel with folds and texture
const BeachTowel = ({ position, rotation, color }: any) => {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Main towel with slight height variation for folds */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2, 3, 10, 15]} />
                <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>

            {/* Multiple stripes */}
            {[0, 0.6, -0.6].map((offset, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, offset]}>
                    <planeGeometry args={[2, 0.25]} />
                    <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
                </mesh>
            ))}

            {/* Folded corner for realism */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.7, 0.02, 1.2]}>
                <planeGeometry args={[0.6, 0.6]} />
                <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>

            {/* Fringe/tassels on edges */}
            {[...Array(8)].map((_, i) => (
                <mesh key={`fringe-${i}`} position={[-1.1, 0.01, -1.5 + i * 0.4]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.15, 4]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            ))}
        </group>
    );
};

// Detailed Surfboard with fins and wax
const Surfboard = ({ position, rotation, color }: any) => {
    return (
        <group position={position} rotation={[0, rotation, 0.3]}>
            {/* Main board - rounded */}
            <mesh>
                <boxGeometry args={[0.55, 2.4, 0.08]} />
                <meshStandardMaterial color={color} roughness={0.15} metalness={0.4} />
            </mesh>

            {/* Rounded nose */}
            <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={color} roughness={0.15} metalness={0.4} />
            </mesh>

            {/* Rounded tail */}
            <mesh position={[0, -1.2, 0]} rotation={[Math.PI, 0, 0]}>
                <sphereGeometry args={[0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={color} roughness={0.15} metalness={0.4} />
            </mesh>

            {/* Wax pattern on deck (front side) */}
            {[...Array(8)].map((_, i) => (
                <mesh key={i} position={[0, -0.6 + i * 0.3, 0.05]}>
                    <boxGeometry args={[0.4, 0.15, 0.01]} />
                    <meshStandardMaterial color="#FFFFFF" roughness={0.9} opacity={0.6} transparent />
                </mesh>
            ))}

            {/* Tri-fin setup */}
            {/* Center fin */}
            <mesh position={[0, -1, -0.04]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.02, 0.35, 0.25]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
            </mesh>

            {/* Side fins */}
            <mesh position={[-0.18, -0.95, -0.04]} rotation={[0, -0.1, 0]}>
                <boxGeometry args={[0.02, 0.28, 0.2]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
            </mesh>
            <mesh position={[0.18, -0.95, -0.04]} rotation={[0, 0.1, 0]}>
                <boxGeometry args={[0.02, 0.28, 0.2]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
            </mesh>

            {/* Leash plug */}
            <mesh position={[0, -1.1, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.06, 8]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
        </group>
    );
};

// Beach Umbrella
const BeachUmbrella = ({ position, rotation, color }: any) => {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Pole */}
            <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Umbrella canopy */}
            <mesh position={[0, 4, 0]} rotation={[0, 0, 0]}>
                <coneGeometry args={[1.5, 1, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>

            {/* Segments for detail */}
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(angle) * 0.7, 4, Math.sin(angle) * 0.7]} rotation={[0.3, angle, 0]}>
                        <boxGeometry args={[0.1, 0.05, 1]} />
                        <meshStandardMaterial color="#FFFFFF" />
                    </mesh>
                );
            })}
        </group>
    );
};

// Floating Lilo
const FloatingLilo = ({ position, color }: any) => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;
        ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    });

    return (
        <group ref={ref} position={position}>
            <mesh>
                <boxGeometry args={[2, 0.3, 4]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            {/* Pillow part */}
            <mesh position={[0, 0.2, 1.5]}>
                <boxGeometry args={[1.8, 0.3, 0.8]} />
                <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
        </group>
    );
};

// Volleyball Net
const VolleyballNet = ({ position }: any) => {
    return (
        <group position={position}>
            {/* Poles */}
            <mesh position={[-4, 2, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
            <mesh position={[4, 2, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
                <meshStandardMaterial color="#333333" />
            </mesh>

            {/* Net */}
            <mesh position={[0, 2, 0]}>
                <planeGeometry args={[8, 2]} />
                <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

// Volleyball
const Volleyball = ({ position }: any) => {
    return (
        <mesh position={position}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
    );
};

// Beach Ball with colored segments
const BeachBall = ({ position }: any) => {
    return (
        <group position={position}>
            {/* Main white sphere */}
            <mesh>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
            </mesh>

            {/* 6 colored panels */}
            {(
                [
                    { color: '#FF0000', rotation: [0, 0, 0] },
                    { color: '#0000FF', rotation: [0, Math.PI / 3, 0] },
                    { color: '#FFFF00', rotation: [0, Math.PI * 2 / 3, 0] },
                    { color: '#00FF00', rotation: [0, Math.PI, 0] },
                    { color: '#FF00FF', rotation: [0, Math.PI * 4 / 3, 0] },
                    { color: '#FFA500', rotation: [0, Math.PI * 5 / 3, 0] }
                ] as { color: string; rotation: [number, number, number] }[]
            ).map((panel, i) => (
                <mesh key={i} rotation={panel.rotation}>
                    <sphereGeometry args={[1.01, 32, 32, 0, Math.PI / 3]} />
                    <meshStandardMaterial color={panel.color} roughness={0.2} />
                </mesh>
            ))}
        </group>
    );
};

// Sand Dunes
const SandDunes = () => {
    const dunes = useMemo(() => {
        const items = [];
        for (let i = 0; i < 8; i++) {
            items.push({
                x: (Math.random() - 0.5) * 100,
                z: -60 - Math.random() * 40,
                scaleX: 10 + Math.random() * 15,
                scaleY: 2 + Math.random() * 3,
                scaleZ: 8 + Math.random() * 12
            });
        }
        return items;
    }, []);

    return (
        <group>
            {dunes.map((dune, i) => (
                <mesh key={i} position={[dune.x, -2, dune.z]}>
                    <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#E6C794" roughness={1} />
                    <group scale={[dune.scaleX, dune.scaleY, dune.scaleZ]} />
                </mesh>
            ))}
        </group>
    );
};

// Animated Ocean
const AnimatedOcean = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const positions = meshRef.current.geometry.attributes.position;
        const t = state.clock.elapsedTime;

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const waveHeight = Math.sin(x * 0.05 + t * 1.5) * 0.4 + Math.sin(y * 0.03 + t * 2) * 0.3;
            positions.setZ(i, waveHeight);
        }
        positions.needsUpdate = true;
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, -60]}>
            <planeGeometry args={[500, 200, 100, 50]} />
            <meshStandardMaterial color="#0077BE" roughness={0.1} metalness={0.7} />
        </mesh>
    );
};

// Flying Seagulls
const FlyingSeagulls = () => {
    return (
        <group>
            {[...Array(5)].map((_, i) => (
                <Seagull key={i} index={i} />
            ))}
        </group>
    );
};

const Seagull = ({ index }: { index: number }) => {
    const ref = useRef<THREE.Group>(null);
    const phase = Math.random() * Math.PI * 2;

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime + phase;

        const radius = 40 + index * 10;
        ref.current.position.x = Math.cos(t * 0.3 + index * 1.5) * radius;
        ref.current.position.z = Math.sin(t * 0.3 + index * 1.5) * radius - 30;
        ref.current.position.y = 15 + Math.sin(t * 0.5) * 5 + index * 3;

        ref.current.rotation.y = -t * 0.3 - index * 1.5 + Math.PI / 2;

        // Wing flap
        ref.current.children.forEach((child, i) => {
            if (i > 0) {
                (child as THREE.Mesh).rotation.z = Math.sin(t * 5) * 0.4;
            }
        });
    });

    return (
        <group ref={ref}>
            <mesh>
                <sphereGeometry args={[0.4, 8, 8]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>

            <mesh position={[-0.5, 0, 0]} rotation={[0, 0, 0.2]}>
                <boxGeometry args={[1.5, 0.1, 0.5]} />
                <meshStandardMaterial color="#EEEEEE" />
            </mesh>

            <mesh position={[0.5, 0, 0]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[1.5, 0.1, 0.5]} />
                <meshStandardMaterial color="#EEEEEE" />
            </mesh>

            <mesh position={[0, -0.1, 0.4]}>
                <coneGeometry args={[0.1, 0.2, 4]} />
                <meshStandardMaterial color="#FFA500" />
            </mesh>
        </group>
    );
};
// Yellow Sun with Rays
const YellowSunWithRays = ({ position }: any) => {
    const raysRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (raysRef.current) {
            raysRef.current.rotation.z = state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <group position={position}>
            <mesh>
                <circleGeometry args={[20, 64]} />
                <meshBasicMaterial color="#FFD700" />
            </mesh>
            <pointLight color="#FFD700" intensity={20} distance={250} />
            <group ref={raysRef}>
                {[...Array(16)].map((_, i) => {
                    const angle = (i / 16) * Math.PI * 2;
                    return (
                        <mesh
                            key={i}
                            position={[Math.cos(angle) * 26, Math.sin(angle) * 26, -1]}
                            rotation={[0, 0, angle]}
                        >
                            <coneGeometry args={[2, 12, 4]} />
                            <meshBasicMaterial color="#FFD700" />
                        </mesh>
                    );
                })}
            </group>
        </group>
    );
};

// Sunglasses on the sand
const Sunglasses = ({ position, rotation }: any) => {
    return (
        <group position={position} rotation={[0, rotation, Math.PI / 2]}>
            <mesh position={[-0.25, 0.05, 0]}>
                <boxGeometry args={[0.35, 0.25, 0.02]} />
                <meshStandardMaterial color="#1a1a1a" opacity={0.7} transparent roughness={0.1} metalness={0.8} />
            </mesh>
            <mesh position={[0.25, 0.05, 0]}>
                <boxGeometry args={[0.35, 0.25, 0.02]} />
                <meshStandardMaterial color="#1a1a1a" opacity={0.7} transparent roughness={0.1} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.15, 0.05, 0.02]} />
                <meshStandardMaterial color="#333333" metalness={0.5} />
            </mesh>
            <mesh position={[-0.25, 0.05, 0]}>
                <torusGeometry args={[0.175, 0.015, 8, 16]} />
                <meshStandardMaterial color="#333333" metalness={0.6} />
            </mesh>
            <mesh position={[0.25, 0.05, 0]}>
                <torusGeometry args={[0.175, 0.015, 8, 16]} />
                <meshStandardMaterial color="#333333" metalness={0.6} />
            </mesh>
            <mesh position={[-0.45, 0.05, -0.25]} rotation={[0, -Math.PI / 6, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
                <meshStandardMaterial color="#333333" metalness={0.5} />
            </mesh>
            <mesh position={[0.45, 0.05, -0.25]} rotation={[0, Math.PI / 6, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
                <meshStandardMaterial color="#333333" metalness={0.5} />
            </mesh>
        </group>
    );
};
