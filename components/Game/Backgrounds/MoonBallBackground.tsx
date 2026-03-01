'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// Neon arena floor grid
const ArenaFloor = () => {
    const gridRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!gridRef.current) return;
        // Pulse the grid glow
        const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
        gridRef.current.children.forEach((child) => {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
                (mesh.material as THREE.MeshBasicMaterial).opacity = pulse;
            }
        });
    });

    const lines = useMemo(() => {
        const items = [];
        const size = 120;
        const step = 10;
        for (let i = -size / 2; i <= size / 2; i += step) {
            // X lines
            items.push({ x1: -size / 2, z1: i, x2: size / 2, z2: i });
            // Z lines
            items.push({ x1: i, z1: -size / 2, x2: i, z2: size / 2 });
        }
        return items;
    }, []);

    return (
        <group ref={gridRef} position={[0, -2.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {lines.map((line, i) => {
                const dx = line.x2 - line.x1;
                const dz = line.z2 - line.z1;
                const len = Math.sqrt(dx * dx + dz * dz);
                const cx = (line.x1 + line.x2) / 2;
                const cz = (line.z1 + line.z2) / 2;
                const angle = Math.atan2(dz, dx);
                return (
                    <mesh key={i} position={[cx, cz, 0]} rotation={[0, 0, angle]}>
                        <planeGeometry args={[len, 0.15]} />
                        <meshBasicMaterial color="#FFD700" transparent opacity={0.4} />
                    </mesh>
                );
            })}
        </group>
    );
};

// Neon stadium ring lights
const StadiumLights = () => {
    const colors = ['#FF0000', '#FFD700', '#FF4500', '#FF6600'];
    return (
        <group>
            {/* Ring of spotlights high up */}
            {Array.from({ length: 12 }, (_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const r = 55;
                return (
                    <group key={i} position={[Math.cos(angle) * r, 25, Math.sin(angle) * r]}>
                        <mesh>
                            <sphereGeometry args={[1.2, 8, 8]} />
                            <meshBasicMaterial color={colors[i % colors.length]} />
                        </mesh>
                        <pointLight color={colors[i % colors.length]} intensity={3} distance={40} decay={2} />
                    </group>
                );
            })}
            {/* Central overhead light */}
            <pointLight position={[0, 30, 0]} color="#ffffff" intensity={2} distance={60} decay={1} />
        </group>
    );
};

// Ball with trail effect
const NeonBall = ({ ball, index }: { ball: any, index: number }) => {
    const ref = useRef<THREE.Mesh>(null);
    const trailRef = useRef<THREE.Points>(null);
    const trailPositions = useRef(new Float32Array(30 * 3));
    const trailHistory = useRef<[number, number, number][]>(Array(30).fill([0, 0, 0]));

    useFrame((state, delta) => {
        if (!ref.current) return;

        ball.x += ball.vx * delta * 60;
        ball.y += ball.vy * delta * 60;
        ball.z += ball.vz * delta * 60;

        if (ball.x > 30 || ball.x < -30) ball.vx *= -1;
        if (ball.y > 20 || ball.y < -20) ball.vy *= -1;
        if (ball.z > 10 || ball.z < -30) ball.vz *= -1;

        ref.current.position.set(ball.x, ball.y, ball.z);
        ref.current.rotation.x += delta * 2;
        ref.current.rotation.y += delta * 1.5;

        // Update trail
        trailHistory.current.unshift([ball.x, ball.y, ball.z]);
        trailHistory.current.pop();
        for (let i = 0; i < 30; i++) {
            trailPositions.current[i * 3] = trailHistory.current[i][0];
            trailPositions.current[i * 3 + 1] = trailHistory.current[i][1];
            trailPositions.current[i * 3 + 2] = trailHistory.current[i][2];
        }
        if (trailRef.current) {
            trailRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <group>
            <mesh ref={ref}>
                <sphereGeometry args={[ball.scale, 24, 24]} />
                <meshStandardMaterial
                    color={ball.color}
                    emissive={ball.color}
                    emissiveIntensity={0.6}
                    roughness={0.1}
                    metalness={0.8}
                />
            </mesh>
            {/* Trail */}
            <points ref={trailRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={30} array={trailPositions.current} itemSize={3} args={[trailPositions.current, 3]} />
                </bufferGeometry>
                <pointsMaterial size={ball.scale * 0.4} color={ball.color} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
            </points>
        </group>
    );
};

// Crowd silhouettes in stands
const CrowdStands = () => {
    const stands = useMemo(() => Array.from({ length: 120 }, (_, i) => {
        const angle = (i / 120) * Math.PI * 2;
        const r = 45 + Math.random() * 8;
        const row = Math.floor(i / 40);
        return { x: Math.cos(angle) * r, z: Math.sin(angle) * r, y: row * 1.5 };
    }), []);

    const crowdRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!crowdRef.current) return;
        // Wave effect
        crowdRef.current.children.forEach((child, i) => {
            const wave = Math.sin(state.clock.elapsedTime * 3 + i * 0.3) * 0.3;
            child.position.y = stands[i].y + wave;
        });
    });

    return (
        <group ref={crowdRef}>
            {stands.map((s, i) => (
                <mesh key={i} position={[s.x, s.y, s.z]}>
                    <capsuleGeometry args={[0.3, 0.8, 4, 6]} />
                    <meshStandardMaterial color={i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF0000' : '#ffffff'} roughness={0.9} />
                </mesh>
            ))}
        </group>
    );
};

export const MoonBallBackground = () => {
    const balls = useMemo(() => Array.from({ length: 25 }, (_, i) => ({
        x: (Math.random() - 0.5) * 50,
        y: (Math.random() - 0.5) * 30,
        z: (Math.random() - 0.5) * 30 - 5,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        vz: (Math.random() - 0.5) * 0.12,
        scale: 0.8 + Math.random() * 1.8,
        color: i % 2 === 0 ? '#FFD700' : '#FF2200'
    })), []);

    return (
        <group>
            <ambientLight intensity={0.2} color="#111111" />
            <fog attach="fog" args={['#000000', 20, 100]} />

            {/* Dark arena floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
            </mesh>

            {/* Neon grid overlay */}
            <ArenaFloor />

            {/* Stadium walls (cylinder) */}
            <mesh position={[0, 10, 0]}>
                <cylinderGeometry args={[60, 60, 30, 32, 1, true]} />
                <meshStandardMaterial color="#111111" side={THREE.BackSide} roughness={0.9} />
            </mesh>

            <StadiumLights />
            <CrowdStands />

            {/* Balls */}
            {balls.map((ball, i) => (
                <NeonBall key={i} ball={ball} index={i} />
            ))}
        </group>
    );
};
