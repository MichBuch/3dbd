'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export const HalloweenBackground = () => {
    // Generate spooky objects
    const objects = useMemo(() => {
        const items = [];

        // Pumpkins scattered around
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 15;
            items.push({
                id: `pumpkin-${i}`,
                type: 'pumpkin',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                scale: 0.8 + Math.random() * 0.5,
                rotation: Math.random() * Math.PI * 2
            });
        }

        // Dead trees
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 20;
            items.push({
                id: `tree-${i}`,
                type: 'tree',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                scale: 2 + Math.random() * 1.5,
                twist: (Math.random() - 0.5) * 0.3
            });
        }

        // Tombstones
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 12 + Math.random() * 10;
            items.push({
                id: `tomb-${i}`,
                type: 'tombstone',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                rotation: Math.random() * Math.PI * 2,
                tilt: (Math.random() - 0.5) * 0.2
            });
        }

        return items;
    }, []);

    return (
        <group>
            {/* Spooky Atmosphere */}
            <fog attach="fog" args={['#1a051a', 8, 90]} />
            <ambientLight intensity={0.1} color="#4b0082" />
            <pointLight position={[0, 10, 0]} intensity={1.5} color="#ff6600" distance={60} />

            {/* Sky dome */}
            <mesh>
                <sphereGeometry args={[200, 32, 32]} />
                <meshBasicMaterial side={THREE.BackSide} color="#0d0010" />
            </mesh>

            {/* Full Moon */}
            <group position={[-40, 35, -80]}>
                <mesh>
                    <sphereGeometry args={[12, 32, 32]} />
                    <meshBasicMaterial color="#FFFDE7" />
                </mesh>
                {/* Moon craters */}
                {[[-3, 2, 11], [4, -3, 11], [-1, -5, 11], [6, 4, 10], [-6, -1, 10]].map(([cx, cy, cz], i) => (
                    <mesh key={i} position={[cx, cy, cz]}>
                        <sphereGeometry args={[1 + i * 0.3, 8, 8]} />
                        <meshBasicMaterial color="#E8E0C8" />
                    </mesh>
                ))}
                <pointLight color="#FFFDE7" intensity={2} distance={200} decay={1} />
            </group>

            {/* Stars */}
            {Array.from({ length: 200 }, (_, i) => {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 0.7);
                const r = 180;
                return (
                    <mesh key={i} position={[Math.sin(phi) * Math.cos(theta) * r, Math.cos(phi) * r, Math.sin(phi) * Math.sin(theta) * r]}>
                        <sphereGeometry args={[0.3 + Math.random() * 0.4, 4, 4]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                );
            })}

            {/* Ground - dark purple grass */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[300, 300]} />
                <meshStandardMaterial color="#0d0515" roughness={1} />
            </mesh>

            {/* Spooky Objects */}
            {objects.map((obj) => {
                if (obj.type === 'pumpkin') {
                    return <Pumpkin key={obj.id} position={[obj.x, -1.2, obj.z]} scale={obj.scale} rotation={obj.rotation} />;
                } else if (obj.type === 'tree') {
                    return <DeadTree key={obj.id} position={[obj.x, -2, obj.z]} scale={obj.scale} twist={obj.twist} />;
                } else if (obj.type === 'tombstone') {
                    return <Tombstone key={obj.id} position={[obj.x, -2, obj.z]} rotation={obj.rotation} tilt={obj.tilt} />;
                }
                return null;
            })}

            {/* Floating Ghosts */}
            <FloatingGhost position={[10, 5, -10]} />
            <FloatingGhost position={[-15, 7, -20]} />
            <FloatingGhost position={[8, 6, -30]} />

            {/* Flying Bats */}
            <FlyingBats />

            {/* Lightning Effect */}
            <Lightning />

            {/* Fog Particles */}
            <FogParticles />

            {/* Cauldron */}
            <Cauldron position={[0, -2, -8]} />
        </group>
    );
};

// Pumpkin with glowing jack-o-lantern face
const Pumpkin = ({ position, scale, rotation }: any) => {
    const glowRef = useRef<THREE.PointLight>(null);

    useFrame((state) => {
        if (glowRef.current) {
            // Flickering candle effect
            glowRef.current.intensity = 8 + Math.sin(state.clock.elapsedTime * 5) * 0.5;
        }
    });

    return (
        <group position={position} rotation={[0, rotation, 0]} scale={scale}>
            {/* Pumpkin Body */}
            <mesh position={[0, 0.7, 0]}>
                <sphereGeometry args={[0.8, 16, 12]} />
                <meshStandardMaterial color="#ff6600" roughness={0.9} />
            </mesh>

            {/* Stem */}
            <mesh position={[0, 1.4, 0]} rotation={[0.2, 0, 0.1]}>
                <cylinderGeometry args={[0.1, 0.15, 0.3, 8]} />
                <meshStandardMaterial color="#2d5016" />
            </mesh>

            {/* Face - Eyes */}
            <mesh position={[-0.3, 0.8, 0.75]}>
                <boxGeometry args={[0.2, 0.25, 0.1]} />
                <meshBasicMaterial color="#ffaa00" />
            </mesh>
            <mesh position={[0.3, 0.8, 0.75]}>
                <boxGeometry args={[0.2, 0.25, 0.1]} />
                <meshBasicMaterial color="#ffaa00" />
            </mesh>

            {/* Face - Nose */}
            <mesh position={[0, 0.65, 0.77]}>
                <coneGeometry args={[0.1, 0.15, 3]} />
                <meshBasicMaterial color="#ffaa00" />
            </mesh>

            {/* Face - Mouth (jagged) */}
            {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
                <mesh key={i} position={[x, 0.35, 0.75]}>
                    <boxGeometry args={[0.1, i % 2 === 0 ? 0.15 : 0.25, 0.1]} />
                    <meshBasicMaterial color="#ffaa00" />
                </mesh>
            ))}

            {/* Inner Glow */}
            <pointLight ref={glowRef} position={[0, 0.7, 0]} color="#ffaa00" intensity={8} distance={4} />
        </group>
    );
};

// Twisted Dead Tree
const DeadTree = ({ position, scale, twist }: any) => {
    return (
        <group position={position} scale={scale}>
            {/* Trunk - twisted */}
            <mesh position={[0, 2, 0]} rotation={[0, 0, twist]}>
                <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
                <meshStandardMaterial color="#2d2d2d" roughness={1} />
            </mesh>

            {/* Branches - gnarled */}
            <mesh position={[-0.8, 3.5, 0]} rotation={[0, 0, -0.8]}>
                <cylinderGeometry args={[0.1, 0.15, 2, 6]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0.7, 3.8, 0]} rotation={[0, 0, 0.9]}>
                <cylinderGeometry args={[0.08, 0.12, 1.5, 6]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 4, 0.5]} rotation={[0.6, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 1.2, 6]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
        </group>
    );
};

// Tombstone
const Tombstone = ({ position, rotation, tilt }: any) => {
    return (
        <group position={position} rotation={[tilt, rotation, 0]}>
            <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.8, 1.2, 0.2]} />
                <meshStandardMaterial color="#666666" roughness={0.9} />
            </mesh>
            {/* Rounded top */}
            <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.2, 16, 1, false, 0, Math.PI]} />
                <meshStandardMaterial color="#666666" roughness={0.9} />
            </mesh>
            {/* RIP text simulation with dark marks */}
            <mesh position={[0, 0.7, 0.11]}>
                <boxGeometry args={[0.5, 0.3, 0.01]} />
                <meshBasicMaterial color="#222222" />
            </mesh>
        </group>
    );
};

// Floating Ghost
const FloatingGhost = ({ position }: any) => {
    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={2}>
            <group position={position}>
                {/* Head */}
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.8, 16, 16]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.6}
                        roughness={0.8}
                    />
                </mesh>

                {/* Body - sheet */}
                <mesh position={[0, -1, 0]}>
                    <coneGeometry args={[1.2, 2, 16]} />
                    <meshStandardMaterial
                        color="#f0f0f0"
                        transparent
                        opacity={0.5}
                        roughness={1}
                    />
                </mesh>

                {/* Eyes - dark holes */}
                <mesh position={[-0.3, 0.2, 0.7]}>
                    <sphereGeometry args={[0.15, 8, 8]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>
                <mesh position={[0.3, 0.2, 0.7]}>
                    <sphereGeometry args={[0.15, 8, 8]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>

                {/* Mouth */}
                <mesh position={[0, -0.1, 0.7]}>
                    <torusGeometry args={[0.2, 0.08, 8, 16, Math.PI]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>

                {/* Glow */}
                <pointLight color="#9D4EDD" intensity={2} distance={5} />
            </group>
        </Float>
    );
};

// Flying Bats
const FlyingBats = () => {
    const batCount = 6;
    return (
        <group>
            {[...Array(batCount)].map((_, i) => (
                <Bat key={i} index={i} />
            ))}
        </group>
    );
};

const Bat = ({ index }: { index: number }) => {
    const ref = useRef<THREE.Group>(null);
    const speed = 8 + Math.random() * 4;
    const yHeight = 8 + Math.random() * 10;
    const phase = Math.random() * Math.PI * 2;

    useFrame((state, delta) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime + phase;

        // Circular flight path
        const radius = 20;
        ref.current.position.x = Math.cos(t * 0.5 + index) * radius;
        ref.current.position.z = Math.sin(t * 0.5 + index) * radius;
        ref.current.position.y = yHeight + Math.sin(t * 2) * 2;

        // Face direction of movement
        ref.current.rotation.y = -t * 0.5 - index + Math.PI / 2;

        // Wing flap
        ref.current.children.forEach((child, i) => {
            if (i > 0) { // Wings
                (child as THREE.Mesh).rotation.z = Math.sin(t * 10) * 0.3;
            }
        });
    });

    return (
        <group ref={ref}>
            {/* Body */}
            <mesh>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Left Wing */}
            <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.3]}>
                <coneGeometry args={[0.4, 0.8, 3]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Right Wing */}
            <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.3]}>
                <coneGeometry args={[0.4, 0.8, 3]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
        </group>
    );
};

// Lightning Flashes
const Lightning = () => {
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame((state) => {
        if (!lightRef.current) return;
        const t = state.clock.elapsedTime;

        // Random lightning strikes
        if (Math.sin(t * 0.3) > 0.95) {
            lightRef.current.intensity = 100 + Math.random() * 50;
        } else {
            lightRef.current.intensity = 0;
        }
    });

    return <pointLight ref={lightRef} position={[0, 50, -50]} color="#ffffff" distance={150} />;
};

// Fog Particles
const FogParticles = () => {
    const particles = useMemo(() => {
        const points = [];
        for (let i = 0; i < 100; i++) {
            points.push(
                (Math.random() - 0.5) * 60,
                Math.random() * 5,
                (Math.random() - 0.5) * 60
            );
        }
        return new Float32Array(points);
    }, []);

    const ref = useRef<THREE.Points>(null);

    useFrame((state, delta) => {
        if (!ref.current) return;
        ref.current.rotation.y += delta * 0.05;
    });

    const geometry = useMemo(() => {
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(particles, 3));
        return geom;
    }, [particles]);

    return (
        <points ref={ref} geometry={geometry}>
            <pointsMaterial
                size={0.5}
                color="#9D4EDD"
                transparent
                opacity={0.3}
                sizeAttenuation
            />
        </points>
    );
};

// Bubbling cauldron
const Cauldron = ({ position }: any) => {
    const bubbleRef = useRef<THREE.Points>(null);
    const count = 40;
    const positions = useMemo(() => new Float32Array(count * 3), []);
    const bubbles = useMemo(() => Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 3,
        z: (Math.random() - 0.5) * 2,
        speed: 0.5 + Math.random() * 1.5
    })), []);

    useFrame((state, delta) => {
        if (!bubbleRef.current) return;
        bubbles.forEach((b, i) => {
            b.y += b.speed * delta;
            if (b.y > 4) { b.y = 0; b.x = (Math.random() - 0.5) * 2; b.z = (Math.random() - 0.5) * 2; }
            positions[i * 3] = b.x;
            positions[i * 3 + 1] = b.y;
            positions[i * 3 + 2] = b.z;
        });
        bubbleRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <group position={position} scale={[2, 2, 2]}>
            {/* Cauldron body */}
            <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[2, 16, 12, 0, Math.PI * 2, Math.PI / 6, Math.PI * 0.7]} />
                <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
            </mesh>
            {/* Rim */}
            <mesh position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2, 0.2, 8, 24]} />
                <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Legs */}
            {[0, 1, 2].map(i => {
                const a = (i / 3) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(a) * 1.5, 0, Math.sin(a) * 1.5]} rotation={[0.3, a, 0]}>
                        <cylinderGeometry args={[0.15, 0.2, 1.5, 6]} />
                        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
                    </mesh>
                );
            })}
            {/* Brew surface */}
            <mesh position={[0, 2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.9, 32]} />
                <meshStandardMaterial color="#00CC44" emissive="#00FF44" emissiveIntensity={0.8} roughness={0.3} transparent opacity={0.9} />
            </mesh>
            {/* Bubbles */}
            <points ref={bubbleRef} position={[0, 2, 0]}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.2} color="#00FF44" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
            </points>
            {/* Green glow */}
            <pointLight position={[0, 3, 0]} color="#00FF44" intensity={3} distance={15} decay={2} />
            {/* Fire underneath */}
            <pointLight position={[0, -0.5, 0]} color="#FF4500" intensity={2} distance={8} decay={2} />
        </group>
    );
};
