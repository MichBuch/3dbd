'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Low-Poly Mountain
const Mountain = ({ position, scale, color }: any) => (
    <group position={position} scale={scale}>
        <mesh castShadow receiveShadow>
            <coneGeometry args={[10, 20, 4]} /> {/* Pyramid shape */}
            <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        {/* Snow Cap */}
        <mesh position={[0, 5, 0]} scale={[1.01, 0.5, 1.01]}>
            <coneGeometry args={[10, 20, 4]} />
            <meshStandardMaterial color="white" roughness={0.1} />
        </mesh>
    </group>
);

// Snow-Covered Tree
const PineTree = ({ position, scale }: any) => (
    <group position={position} scale={scale}>
        {/* Trunk */}
        <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.5, 0.8, 2, 8]} />
            <meshStandardMaterial color="#3E2723" />
        </mesh>
        {/* Layers */}
        <mesh position={[0, 3, 0]}>
            <coneGeometry args={[3, 4, 8]} />
            <meshStandardMaterial color="#2F4F4F" />
        </mesh>
        <mesh position={[0, 5, 0]}>
            <coneGeometry args={[2.5, 3.5, 8]} />
            <meshStandardMaterial color="#2F4F4F" />
        </mesh>
        <mesh position={[0, 7, 0]}>
            <coneGeometry args={[2, 3, 8]} />
            <meshStandardMaterial color="#2F4F4F" />
        </mesh>
        {/* Snow on branches */}
        <mesh position={[0, 7.1, 0]} scale={[0.9, 0.9, 0.9]}>
            <coneGeometry args={[2, 3, 8]} />
            <meshStandardMaterial color="white" />
        </mesh>
    </group>
);

// Falling Snow System
const SnowParticles = () => {
    const count = 1000;
    const mesh = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = Math.random() * 100;
            const z = (Math.random() - 0.5) * 200;
            const speed = 0.5 + Math.random();
            temp.push({ x, y, z, speed, originalY: y });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Vector3(), []);
    const positions = useMemo(() => new Float32Array(count * 3), []);

    useFrame((state) => {
        if (!mesh.current) return;

        const t = state.clock.elapsedTime;

        for (let i = 0; i < count; i++) {
            const p = particles[i];
            // Falls down
            p.y -= p.speed * 0.1;
            // Wind drift
            p.x += Math.sin(t + p.z) * 0.02;

            // Reset
            if (p.y < -10) {
                p.y = 100;
                p.x = (Math.random() - 0.5) * 200;
            }

            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
        }

        mesh.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.5} color="white" transparent opacity={0.8} />
        </points>
    );
}

// Snowman
const Snowman = ({ position, rotation }: any) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Bottom */}
            <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[2, 16, 16]} />
                <meshStandardMaterial color="white" roughness={0.1} />
            </mesh>
            {/* Middle */}
            <mesh position={[0, 4, 0]}>
                <sphereGeometry args={[1.5, 16, 16]} />
                <meshStandardMaterial color="white" roughness={0.1} />
            </mesh>
            {/* Scarf */}
            <mesh position={[0, 5.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.55, 0.28, 8, 20]} />
                <meshStandardMaterial color="#CC0000" roughness={0.9} />
            </mesh>
            {/* Scarf knot tail */}
            <mesh position={[1.2, 4.7, 0]} rotation={[0, 0, 0.5]}>
                <boxGeometry args={[0.25, 1.0, 0.25]} />
                <meshStandardMaterial color="#CC0000" roughness={0.9} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 6, 0]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color="white" roughness={0.1} />
            </mesh>
            {/* Carrot Nose */}
            <mesh position={[0, 6, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.2, 1, 8]} />
                <meshStandardMaterial color="orange" />
            </mesh>
            {/* Hat */}
            <mesh position={[0, 7, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[0, 6.5, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 0.1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    )
}

export const WinterBackground = () => {

    return (
        <group>
            {/* Cool Lighting */}
            <ambientLight intensity={0.5} color="#E0FFFF" />
            <directionalLight position={[20, 50, 20]} intensity={1.5} color="#FFFFFF" castShadow />
            <directionalLight position={[-20, 30, -20]} intensity={0.4} color="#B0C4DE" />
            <fog attach="fog" args={['#D0E8F5', 10, 160]} />

            {/* Sky dome */}
            <mesh>
                <sphereGeometry args={[250, 32, 32]} />
                <meshBasicMaterial side={THREE.BackSide} color="#B0D4F0" />
            </mesh>

            {/* Aurora Borealis */}
            <AuroraBorealis />

            {/* Snow Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#EEF5FF" roughness={0.05} metalness={0.05} />
            </mesh>

            {/* Frozen lake */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 10]}>
                <circleGeometry args={[18, 64]} />
                <meshStandardMaterial color="#A8D8EA" roughness={0.02} metalness={0.3} transparent opacity={0.85} />
            </mesh>
            {/* Lake cracks */}
            {[0, 1, 2, 3].map(i => {
                const a = (i / 4) * Math.PI * 2;
                return (
                    <mesh key={i} rotation={[-Math.PI / 2, 0, a]} position={[Math.cos(a) * 5, -1.97, 10 + Math.sin(a) * 5]}>
                        <planeGeometry args={[8, 0.05]} />
                        <meshBasicMaterial color="#7ab8d4" transparent opacity={0.6} />
                    </mesh>
                );
            })}

            <SnowParticles />

            {/* Mountains Background */}
            <Mountain position={[-60, 0, -80]} scale={[3, 4, 3]} color="#8899AA" />
            <Mountain position={[0, 0, -100]} scale={[5, 5, 5]} color="#7788AA" />
            <Mountain position={[80, 0, -60]} scale={[4, 4, 4]} color="#8899AA" />
            <Mountain position={[-30, 0, -70]} scale={[2.5, 3, 2.5]} color="#99AABB" />

            {/* Pine forest */}
            <PineTree position={[-30, 0, -30]} scale={[1, 1, 1]} />
            <PineTree position={[40, 0, -40]} scale={[1.5, 1.5, 1.5]} />
            <PineTree position={[-50, 0, -20]} scale={[1.2, 1.2, 1.2]} />
            <PineTree position={[25, 0, -50]} scale={[1.3, 1.3, 1.3]} />
            <PineTree position={[-40, 0, -50]} scale={[0.9, 0.9, 0.9]} />
            <PineTree position={[55, 0, -25]} scale={[1.1, 1.1, 1.1]} />

            {/* Snowmen */}
            <Snowman position={[25, 0.5, -20]} rotation={[0, -0.5, 0]} />
            <Snowman position={[-20, 0.5, -15]} rotation={[0, 1.2, 0]} />

            {/* Log cabin */}
            <LogCabin position={[-35, -2, -35]} rotation={[0, 0.4, 0]} />

            {/* Frozen pond skater silhouette */}
            <IceSkater position={[5, -1.9, 12]} />

            {/* Reindeer silhouettes crossing the sky */}
            <ReindeerHerd />
        </group>
    );
};

// Log Cabin
const LogCabin = ({ position, rotation }: any) => (
    <group position={position} rotation={rotation}>
        {/* Walls — stacked logs */}
        {[0, 1, 2, 3, 4].map(y => (
            <mesh key={y} position={[0, y * 1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.55, 0.55, 10, 8]} />
                <meshStandardMaterial color="#6B3A2A" roughness={0.95} />
            </mesh>
        ))}
        {[0, 1, 2, 3, 4].map(y => (
            <mesh key={y} position={[0, y * 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.55, 0.55, 8, 8]} />
                <meshStandardMaterial color="#7A4535" roughness={0.95} />
            </mesh>
        ))}
        {/* Roof */}
        <mesh position={[0, 7, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[7, 4, 4]} />
            <meshStandardMaterial color="#3d2010" roughness={0.9} />
        </mesh>
        {/* Snow on roof */}
        <mesh position={[0, 8.5, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.05, 0.3, 1.05]}>
            <coneGeometry args={[7, 4, 4]} />
            <meshStandardMaterial color="white" roughness={0.1} />
        </mesh>
        {/* Door */}
        <mesh position={[0, 1.5, 4.1]}>
            <boxGeometry args={[1.5, 2.5, 0.2]} />
            <meshStandardMaterial color="#4a2800" roughness={0.9} />
        </mesh>
        {/* Window with warm glow */}
        <mesh position={[2.5, 3, 4.1]}>
            <boxGeometry args={[1.5, 1.5, 0.2]} />
            <meshStandardMaterial color="#FFD700" emissive="#FF8C00" emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[-2.5, 3, 4.1]}>
            <boxGeometry args={[1.5, 1.5, 0.2]} />
            <meshStandardMaterial color="#FFD700" emissive="#FF8C00" emissiveIntensity={1.5} />
        </mesh>
        {/* Chimney */}
        <mesh position={[2, 10, 0]}>
            <boxGeometry args={[1.5, 3, 1.5]} />
            <meshStandardMaterial color="#5a3020" roughness={0.9} />
        </mesh>
        {/* Smoke */}
        <pointLight position={[0, 3, 3]} color="#FF8C00" intensity={1.5} distance={12} decay={2} />
    </group>
);

// Ice skater
const IceSkater = ({ position }: any) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime * 0.4;
        ref.current.position.x = position[0] + Math.cos(t) * 6;
        ref.current.position.z = position[2] + Math.sin(t) * 4;
        ref.current.rotation.y = -t + Math.PI / 2;
    });
    return (
        <group ref={ref}>
            {/* Body */}
            <mesh position={[0, 1.2, 0]}>
                <capsuleGeometry args={[0.25, 0.8, 4, 8]} />
                <meshStandardMaterial color="#CC0000" roughness={0.8} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 2.1, 0]}>
                <sphereGeometry args={[0.28, 8, 8]} />
                <meshStandardMaterial color="#FDBCB4" roughness={0.8} />
            </mesh>
            {/* Skates */}
            <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, 0.1]}>
                <boxGeometry args={[0.15, 0.1, 0.7]} />
                <meshStandardMaterial color="#333" metalness={0.5} />
            </mesh>
            <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, -0.1]}>
                <boxGeometry args={[0.15, 0.1, 0.7]} />
                <meshStandardMaterial color="#333" metalness={0.5} />
            </mesh>
        </group>
    );
};

// Aurora Borealis — multiple rippling semi-transparent curtains
const AuroraBorealis = () => {
    const groupRef = useRef<THREE.Group>(null);
    const curtains = useMemo(() => [
        { x: -30, z: -120, color: '#00FF88', width: 60, phase: 0 },
        { x: 0, z: -110, color: '#00FFCC', width: 80, phase: 1.5 },
        { x: 40, z: -130, color: '#88FF44', width: 55, phase: 3 },
    ], []);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.children.forEach((child, i) => {
            const t = state.clock.elapsedTime + curtains[i].phase;
            // Make curtains ripple by rotating slightly around Y and pulsing opacity
            child.rotation.y = Math.sin(t * 0.3 + i) * 0.12;
            (child as THREE.Mesh).material && ((child as THREE.Mesh).material as any) &&
                ((child as THREE.Mesh).children.forEach(sub => {
                    if ((sub as THREE.Mesh).material) {
                        ((sub as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity =
                            0.15 + Math.sin(t * 0.5 + i * 2) * 0.08;
                    }
                }));
        });
    });

    return (
        <group ref={groupRef} position={[0, 60, -100]}>
            {curtains.map((c, i) => (
                <group key={i} position={[c.x, 0, c.z - (-100)]}>
                    {/* Multiple vertical bands */}
                    {Array.from({ length: 5 }, (_, j) => (
                        <mesh key={j} position={[(j - 2) * (c.width / 5), -15 + Math.sin(j * 0.8 + i) * 8, 0]}>
                            <planeGeometry args={[c.width / 5 - 1, 40 + Math.sin(j) * 10]} />
                            <meshBasicMaterial
                                color={c.color}
                                transparent
                                opacity={0.12 + j * 0.02}
                                side={THREE.DoubleSide}
                                depthWrite={false}
                                blending={THREE.AdditiveBlending}
                            />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
};

// Reindeer herd silhouette crossing the sky
const ReindeerHerd = () => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;
        // Slowly drift from left to right, looping
        const t = state.clock.elapsedTime * 0.8;
        ref.current.position.x = -120 + ((t * 4) % 250);
        ref.current.position.y = 55 + Math.sin(state.clock.elapsedTime * 0.2) * 3;
    });

    return (
        <group ref={ref} position={[-120, 55, -90]}>
            {/* Santa's sleigh */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, 0.05]}>
                <boxGeometry args={[5, 1, 2]} />
                <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} />
            </mesh>
            {/* Reindeer - 8 in a row */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <group key={i} position={[-8 - i * 5.5, 1 + Math.sin(i * 0.8) * 0.5, 0]}>
                    {/* Body */}
                    <mesh>
                        <boxGeometry args={[2, 0.8, 0.6]} />
                        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.75} />
                    </mesh>
                    {/* Head */}
                    <mesh position={[1.2, 0.6, 0]}>
                        <sphereGeometry args={[0.4, 6, 6]} />
                        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.75} />
                    </mesh>
                    {/* Antlers */}
                    <mesh position={[1.2, 1.1, 0]} rotation={[0, 0, 0.3]}>
                        <boxGeometry args={[0.08, 0.7, 0.08]} />
                        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.75} />
                    </mesh>
                    <mesh position={[1.35, 1.2, 0]} rotation={[0, 0, 0.8]}>
                        <boxGeometry args={[0.06, 0.35, 0.06]} />
                        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.75} />
                    </mesh>
                    {/* Legs animating */}
                    {[-0.5, 0.5].map((x, li) => (
                        <mesh key={li} position={[x, -0.7, 0]} rotation={[Math.sin(i * 1.2 + li) * 0.4, 0, 0]}>
                            <boxGeometry args={[0.1, 0.7, 0.1]} />
                            <meshBasicMaterial color="#1a1a1a" transparent opacity={0.75} />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
};
