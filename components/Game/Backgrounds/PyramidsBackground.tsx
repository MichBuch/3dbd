'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// A single pyramid with configurable size
const Pyramid = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => {
    const vertices = useMemo(() => {
        const h = 6 * scale;
        const b = 5 * scale;
        // 4 triangular faces
        const geo = new THREE.BufferGeometry();
        const pts = [
            // Front
            -b, 0, b,   b, 0, b,   0, h, 0,
            // Right
            b, 0, b,   b, 0, -b,   0, h, 0,
            // Back
            b, 0, -b,  -b, 0, -b,  0, h, 0,
            // Left
            -b, 0, -b,  -b, 0, b,  0, h, 0,
            // Bottom 1
            -b, 0, b,   b, 0, -b,  b, 0, b,
            // Bottom 2
            -b, 0, b,  -b, 0, -b,  b, 0, -b,
        ];
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        geo.computeVertexNormals();
        return geo;
    }, [scale]);

    return (
        <mesh geometry={vertices} position={position} castShadow receiveShadow>
            <meshStandardMaterial color="#D4A843" roughness={0.9} metalness={0.05} />
        </mesh>
    );
};

// Sphinx — simplified geometric shape
const Sphinx = ({ position }: { position: [number, number, number] }) => (
    <group position={position} rotation={[0, -0.3, 0]}>
        {/* Body */}
        <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[6, 2.4, 2.5]} />
            <meshStandardMaterial color="#C4993B" roughness={0.85} />
        </mesh>
        {/* Head */}
        <mesh position={[3.2, 3, 0]} castShadow>
            <boxGeometry args={[1.8, 2.2, 1.8]} />
            <meshStandardMaterial color="#C4993B" roughness={0.85} />
        </mesh>
        {/* Front paws */}
        <mesh position={[4.5, 0.4, 0]} castShadow>
            <boxGeometry args={[3, 0.8, 2]} />
            <meshStandardMaterial color="#C4993B" roughness={0.85} />
        </mesh>
    </group>
);

// Obelisk
const Obelisk = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        <mesh position={[0, 4, 0]} castShadow>
            <boxGeometry args={[0.8, 8, 0.8]} />
            <meshStandardMaterial color="#B8860B" roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Tip */}
        <mesh position={[0, 8.3, 0]} castShadow>
            <coneGeometry args={[0.6, 1.2, 4]} />
            <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.6} />
        </mesh>
    </group>
);

// Animated camel caravan
const CamelCaravan = () => {
    const group = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!group.current) return;
        const t = state.clock.elapsedTime * 0.3;
        group.current.position.x = -60 + (t % 1) * 120;
        group.current.position.y = Math.sin(t * 2) * 0.15; // gentle bob
    });

    return (
        <group ref={group} position={[0, -4.5, 30]}>
            {[0, 3.5, 7].map((offset, i) => (
                <group key={i} position={[offset, 0, 0]}>
                    {/* Body */}
                    <mesh position={[0, 1.5, 0]} castShadow>
                        <boxGeometry args={[2, 1.4, 1]} />
                        <meshStandardMaterial color="#C4A35A" roughness={0.9} />
                    </mesh>
                    {/* Hump */}
                    <mesh position={[0, 2.5, 0]} castShadow>
                        <sphereGeometry args={[0.5, 8, 8]} />
                        <meshStandardMaterial color="#B8963E" roughness={0.9} />
                    </mesh>
                    {/* Head */}
                    <mesh position={[1.2, 2.2, 0]} castShadow>
                        <boxGeometry args={[0.6, 0.8, 0.5]} />
                        <meshStandardMaterial color="#C4A35A" roughness={0.9} />
                    </mesh>
                    {/* Legs */}
                    {[[-0.5, 0, 0.3], [-0.5, 0, -0.3], [0.5, 0, 0.3], [0.5, 0, -0.3]].map((pos, j) => (
                        <mesh key={j} position={pos as [number, number, number]} castShadow>
                            <boxGeometry args={[0.25, 1.6, 0.25]} />
                            <meshStandardMaterial color="#B8963E" roughness={0.9} />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
};

// Sand dunes with gentle wave animation
const SandDunes = () => {
    const mesh = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.elapsedTime;
        const pos = mesh.current.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            pos.setY(i, Math.sin(x * 0.04 + time * 0.1) * 1.5 + Math.cos(z * 0.06) * 1.2);
        }
        pos.needsUpdate = true;
    });

    return (
        <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.5, 0]} receiveShadow>
            <planeGeometry args={[600, 600, 60, 60]} />
            <meshStandardMaterial color="#E8C872" roughness={1} />
        </mesh>
    );
};

// Floating dust/sand particles
const SandParticles = () => {
    const points = useRef<THREE.Points>(null);
    const positions = useMemo(() => {
        const arr = new Float32Array(300 * 3);
        for (let i = 0; i < 300; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 120;
            arr[i * 3 + 1] = Math.random() * 20 - 3;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 120;
        }
        return arr;
    }, []);

    useFrame((state) => {
        if (!points.current) return;
        const pos = points.current.geometry.attributes.position;
        const t = state.clock.elapsedTime;
        for (let i = 0; i < 300; i++) {
            const ix = i * 3;
            pos.array[ix] += Math.sin(t + i) * 0.01;
            pos.array[ix + 1] += Math.cos(t * 0.5 + i) * 0.005;
        }
        pos.needsUpdate = true;
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} count={300} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial color="#D4A843" size={0.15} transparent opacity={0.4} />
        </points>
    );
};

// Main exported component
export const PyramidsBackground = () => {
    return (
        <group>
            {/* Warm desert lighting */}
            <ambientLight intensity={0.6} color="#FFD59E" />
            <directionalLight position={[-80, 30, -40]} intensity={2.2} color="#FF8C00" castShadow />
            <directionalLight position={[40, 20, 40]} intensity={0.3} color="#FFD700" />

            {/* Sun */}
            <mesh position={[-80, 25, -80]}>
                <sphereGeometry args={[14, 32, 32]} />
                <meshBasicMaterial color="#FF6600" />
            </mesh>
            <mesh position={[-80, 25, -80]}>
                <sphereGeometry args={[18, 16, 16]} />
                <meshBasicMaterial color="#FF8800" transparent opacity={0.12} />
            </mesh>

            {/* Sky dome */}
            <mesh>
                <sphereGeometry args={[250, 32, 32]} />
                <meshBasicMaterial side={THREE.BackSide} color="#C47A2A" />
            </mesh>

            <fog attach="fog" args={['#D4A843', 20, 160]} />

            {/* Sand ground */}
            <SandDunes />

            {/* The three Great Pyramids of Giza */}
            <Pyramid position={[0, -5, -30]} scale={2.2} />
            <Pyramid position={[-18, -5, -22]} scale={1.8} />
            <Pyramid position={[-30, -5, -14]} scale={1.3} />

            {/* Sphinx */}
            <Sphinx position={[15, -5, -12]} />

            {/* Obelisks */}
            <Obelisk position={[30, -5, -20]} />
            <Obelisk position={[-45, -5, -8]} />

            {/* Camel caravan */}
            <CamelCaravan />

            {/* Sand particles */}
            <SandParticles />

            {/* Stars (visible in the warm sky) */}
            <Stars radius={200} depth={60} count={500} factor={2} saturation={0} fade speed={0.3} />
        </group>
    );
};
