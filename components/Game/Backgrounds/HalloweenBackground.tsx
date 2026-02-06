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
            <fog attach="fog" args={['#2a0a2a', 10, 80]} />
            <ambientLight intensity={0.15} color="#4b0082" />
            <pointLight position={[0, 10, 0]} intensity={1} color="#ff6600" distance={50} />

            {/* Ground - dark purple grass */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#1a051a" roughness={1} />
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
