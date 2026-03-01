'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud, Float } from '@react-three/drei';
import * as THREE from 'three';

// Animated ocean with waves
const Ocean = () => {
    const mesh = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.elapsedTime;
        const pos = mesh.current.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            pos.setY(i, Math.sin(x * 0.15 + time * 1.2) * 0.6 + Math.sin(z * 0.08 + time * 0.8) * 0.4 + Math.sin((x + z) * 0.05 + time) * 0.3);
        }
        pos.needsUpdate = true;
    });
    return (
        <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 20]} receiveShadow>
            <planeGeometry args={[300, 200, 80, 80]} />
            <meshStandardMaterial color="#1a7abf" roughness={0.05} metalness={0.2} transparent opacity={0.92} />
        </mesh>
    );
};

// Sandy beach shore
const Shore = () => (
    <group>
        {/* Main sand */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[300, 60]} />
            <meshStandardMaterial color="#F4D03F" roughness={1} />
        </mesh>
        {/* Wet sand near water */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.99, 22]}>
            <planeGeometry args={[300, 16]} />
            <meshStandardMaterial color="#C9A227" roughness={0.9} />
        </mesh>
    </group>
);

// Palm tree with curved trunk
const PalmTree = ({ position, lean = 0.15, rotation = 0 }: any) => (
    <group position={position} rotation={[0, rotation, 0]}>
        {/* Trunk segments — curved */}
        {[0, 1, 2, 3, 4, 5].map(i => (
            <mesh key={i} position={[Math.sin(i * 0.12) * lean * i, 1 + i * 1.4, 0]} rotation={[0, 0, lean * i * 0.08]}>
                <cylinderGeometry args={[0.35 - i * 0.04, 0.42 - i * 0.03, 1.6, 8]} />
                <meshStandardMaterial color="#8B6914" roughness={0.95} />
            </mesh>
        ))}
        {/* Fronds */}
        {[0, 1, 2, 3, 4, 5, 6].map(i => {
            const a = (i / 7) * Math.PI * 2;
            return (
                <group key={i} position={[Math.sin(i * 0.12) * lean * 5, 9.5, 0]} rotation={[0, a, 0]}>
                    <mesh position={[1.5, -0.3, 0]} rotation={[0, 0, -0.5]}>
                        <boxGeometry args={[3.5, 0.08, 0.6]} />
                        <meshStandardMaterial color="#2d7a1f" roughness={0.8} />
                    </mesh>
                    {/* Leaflets */}
                    {[0, 1, 2, 3].map(j => (
                        <mesh key={j} position={[0.8 + j * 0.7, -0.4 - j * 0.1, 0]} rotation={[0, 0, -0.4 - j * 0.05]}>
                            <boxGeometry args={[0.6, 0.06, 0.4]} />
                            <meshStandardMaterial color="#3a9428" roughness={0.8} />
                        </mesh>
                    ))}
                </group>
            );
        })}
        {/* Coconuts */}
        {[0, 1, 2].map(i => {
            const a = (i / 3) * Math.PI * 2;
            return (
                <mesh key={i} position={[Math.sin(i * 0.12) * lean * 5 + Math.cos(a) * 0.6, 9, Math.sin(a) * 0.6]}>
                    <sphereGeometry args={[0.35, 8, 8]} />
                    <meshStandardMaterial color="#5C3317" roughness={0.9} />
                </mesh>
            );
        })}
    </group>
);

// Beach umbrella + lounger
const BeachUmbrella = ({ position, color }: any) => (
    <group position={position}>
        {/* Pole */}
        <mesh position={[0, 1.5, 0]} rotation={[0.1, 0, 0.05]}>
            <cylinderGeometry args={[0.06, 0.06, 3, 8]} />
            <meshStandardMaterial color="#888" metalness={0.6} />
        </mesh>
        {/* Canopy */}
        <mesh position={[0, 3.1, 0]} rotation={[0.1, 0, 0.05]}>
            <coneGeometry args={[2.5, 1.2, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Canopy stripes */}
        {[0, 1, 2, 3].map(i => (
            <mesh key={i} position={[0, 3.1, 0]} rotation={[0.1, (i / 4) * Math.PI * 2, 0.05]}>
                <coneGeometry args={[2.52, 1.22, 8, 1, true, (i / 4) * Math.PI * 2, Math.PI / 4]} />
                <meshStandardMaterial color="white" roughness={0.8} side={THREE.DoubleSide} />
            </mesh>
        ))}
        {/* Lounger */}
        <mesh position={[0.5, -1.7, 1.5]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[0.7, 0.12, 2.2]} />
            <meshStandardMaterial color="#DEB887" roughness={0.9} />
        </mesh>
        <mesh position={[0.5, -1.55, 2.4]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[0.7, 0.12, 0.8]} />
            <meshStandardMaterial color="#DEB887" roughness={0.9} />
        </mesh>
        {/* Towel on lounger */}
        <mesh position={[0.5, -1.62, 1.5]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[0.65, 0.04, 2]} />
            <meshStandardMaterial color={color} roughness={1} />
        </mesh>
    </group>
);

// Sandcastle
const Sandcastle = ({ position }: any) => (
    <group position={position}>
        {/* Base */}
        <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[1.5, 1.8, 0.6, 8]} />
            <meshStandardMaterial color="#C8A84B" roughness={1} />
        </mesh>
        {/* Main tower */}
        <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.8, 1.0, 1.8, 8]} />
            <meshStandardMaterial color="#D4A843" roughness={1} />
        </mesh>
        {/* Battlements */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
            const a = (i / 8) * Math.PI * 2;
            return (
                <mesh key={i} position={[Math.cos(a) * 0.8, 2.3, Math.sin(a) * 0.8]}>
                    <boxGeometry args={[0.25, 0.35, 0.25]} />
                    <meshStandardMaterial color="#C8A84B" roughness={1} />
                </mesh>
            );
        })}
        {/* Flag */}
        <mesh position={[0, 2.8, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 4]} />
            <meshStandardMaterial color="#888" />
        </mesh>
        <mesh position={[0.2, 3.1, 0]}>
            <boxGeometry args={[0.4, 0.25, 0.02]} />
            <meshStandardMaterial color="#FF0000" />
        </mesh>
        {/* Side towers */}
        {[[-1.5, 0.8], [1.5, 0.8], [-1.5, -0.8], [1.5, -0.8]].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
                <mesh position={[0, 0.6, 0]}>
                    <cylinderGeometry args={[0.4, 0.5, 1.2, 6]} />
                    <meshStandardMaterial color="#C8A84B" roughness={1} />
                </mesh>
                <mesh position={[0, 1.3, 0]}>
                    <coneGeometry args={[0.45, 0.5, 6]} />
                    <meshStandardMaterial color="#B8860B" roughness={1} />
                </mesh>
            </group>
        ))}
    </group>
);

// Surfboard stuck in sand
const Surfboard = ({ position, rotation }: any) => (
    <group position={position} rotation={rotation}>
        <mesh>
            <capsuleGeometry args={[0.25, 2.2, 4, 12]} />
            <meshStandardMaterial color="#FF6B35" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Stripe */}
        <mesh position={[0, 0, 0.26]}>
            <capsuleGeometry args={[0.08, 1.8, 4, 8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
    </group>
);

// Animated whale
const Whale = ({ position }: any) => {
    const ref = useRef<THREE.Group>(null);
    const spoutRef = useRef<THREE.Points>(null);
    const spoutPositions = useMemo(() => {
        const pos = new Float32Array(60 * 3);
        for (let i = 0; i < 60; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 0.8;
            pos[i * 3 + 1] = Math.random() * 3;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime * 0.3;
        ref.current.position.x = position[0] + Math.sin(t) * 8;
        ref.current.position.y = position[1] + Math.sin(t * 2) * 0.3;
        ref.current.rotation.y = Math.cos(t) * 0.3;
        if (spoutRef.current) {
            spoutRef.current.visible = Math.sin(t * 2) > 0.7;
        }
    });

    return (
        <group ref={ref}>
            {/* Body */}
            <mesh rotation={[0, 0, 0]}>
                <capsuleGeometry args={[1.5, 5, 8, 16]} />
                <meshStandardMaterial color="#2c3e50" roughness={0.6} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0, 3.5]}>
                <sphereGeometry args={[1.6, 12, 10]} />
                <meshStandardMaterial color="#2c3e50" roughness={0.6} />
            </mesh>
            {/* Belly */}
            <mesh position={[0, -1.2, 1]} rotation={[0.2, 0, 0]}>
                <capsuleGeometry args={[1.0, 4, 6, 12]} />
                <meshStandardMaterial color="#ecf0f1" roughness={0.7} />
            </mesh>
            {/* Tail flukes */}
            <mesh position={[0, 0.3, -3.5]} rotation={[0, 0, 0]}>
                <boxGeometry args={[4, 0.3, 1.5]} />
                <meshStandardMaterial color="#2c3e50" roughness={0.6} />
            </mesh>
            {/* Dorsal fin */}
            <mesh position={[0, 1.8, -0.5]} rotation={[0, 0, 0.2]}>
                <coneGeometry args={[0.4, 1.5, 6]} />
                <meshStandardMaterial color="#2c3e50" roughness={0.6} />
            </mesh>
            {/* Spout */}
            <points ref={spoutRef} position={[0, 1.8, 3.2]}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={60} array={spoutPositions} itemSize={3} args={[spoutPositions, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.2} color="white" transparent opacity={0.7} />
            </points>
        </group>
    );
};

// Animated seagull
const Seagull = ({ position, speed, offset }: any) => {
    const ref = useRef<THREE.Group>(null);
    const wingRef1 = useRef<THREE.Mesh>(null);
    const wingRef2 = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime + offset;
        ref.current.position.x = position[0] + Math.cos(t * speed * 0.08) * 35;
        ref.current.position.z = position[2] + Math.sin(t * speed * 0.08) * 35;
        ref.current.position.y = position[1] + Math.sin(t * 1.5) * 1.5;
        ref.current.rotation.y = -(t * speed * 0.08) + Math.PI / 2;
        if (wingRef1.current) wingRef1.current.rotation.z = Math.sin(t * 6) * 0.4;
        if (wingRef2.current) wingRef2.current.rotation.z = -Math.sin(t * 6) * 0.4;
    });
    return (
        <group ref={ref}>
            <mesh>
                <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
                <meshStandardMaterial color="white" roughness={0.8} />
            </mesh>
            <mesh ref={wingRef1} position={[-0.4, 0, 0]}>
                <boxGeometry args={[0.7, 0.04, 0.2]} />
                <meshStandardMaterial color="white" roughness={0.8} />
            </mesh>
            <mesh ref={wingRef2} position={[0.4, 0, 0]}>
                <boxGeometry args={[0.7, 0.04, 0.2]} />
                <meshStandardMaterial color="white" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.05, 0.22]}>
                <coneGeometry args={[0.04, 0.15, 4]} />
                <meshStandardMaterial color="#FFD700" roughness={0.5} />
            </mesh>
        </group>
    );
};

// Distant island with palm
const Island = ({ position, scale }: any) => (
    <group position={position} scale={scale}>
        <mesh receiveShadow>
            <coneGeometry args={[5, 2.5, 12]} />
            <meshStandardMaterial color="#F4A460" roughness={1} />
        </mesh>
        <PalmTree position={[0.5, 1.5, 0]} lean={0.2} />
    </group>
);

export const BeachBackground = () => {
    const umbrellaData = useMemo(() => [
        { pos: [-12, -1.8, -8], color: '#FF6B35' },
        { pos: [8, -1.8, -12], color: '#3498DB' },
        { pos: [-25, -1.8, -5], color: '#E74C3C' },
        { pos: [22, -1.8, -10], color: '#9B59B6' },
    ], []);

    return (
        <group>
            {/* Warm sunny lighting */}
            <ambientLight intensity={0.7} color="#FFF5E0" />
            <directionalLight position={[-40, 30, -40]} intensity={2.0} color="#FFD580" castShadow />
            <directionalLight position={[30, 20, 10]} intensity={0.4} color="#87CEEB" />
            <fog attach="fog" args={['#87CEEB', 20, 180]} />

            {/* Sky dome */}
            <mesh>
                <sphereGeometry args={[250, 32, 32]} />
                <meshBasicMaterial side={THREE.BackSide} color="#5BB8F5" />
            </mesh>

            {/* Sun */}
            <mesh position={[-60, 35, -80]}>
                <sphereGeometry args={[10, 24, 24]} />
                <meshBasicMaterial color="#FFE066" />
            </mesh>
            <mesh position={[-60, 35, -80]}>
                <sphereGeometry args={[13, 16, 16]} />
                <meshBasicMaterial color="#FFD700" transparent opacity={0.12} />
            </mesh>

            {/* Shore + ocean */}
            <Shore />
            <Ocean />

            {/* Palm trees */}
            <PalmTree position={[-18, -2, -15]} lean={0.18} rotation={0.3} />
            <PalmTree position={[15, -2, -18]} lean={0.22} rotation={-0.5} />
            <PalmTree position={[-30, -2, -8]} lean={0.12} rotation={1.2} />
            <PalmTree position={[28, -2, -12]} lean={0.2} rotation={2.1} />
            <PalmTree position={[5, -2, -25]} lean={0.25} rotation={0.8} />

            {/* Beach umbrellas + loungers */}
            {umbrellaData.map((u, i) => (
                <BeachUmbrella key={i} position={u.pos} color={u.color} />
            ))}

            {/* Sandcastle */}
            <Sandcastle position={[3, -1.9, -6]} />

            {/* Surfboards in sand */}
            <Surfboard position={[-8, -1.2, -4]} rotation={[1.4, 0.3, 0.2]} />
            <Surfboard position={[18, -1.2, -7]} rotation={[1.4, -0.4, -0.15]} />

            {/* Whale */}
            <Whale position={[-20, -1.5, 35]} />

            {/* Seagulls with flapping wings */}
            <Seagull position={[0, 18, -15]} speed={0.5} offset={0} />
            <Seagull position={[12, 20, -20]} speed={0.65} offset={2.1} />
            <Seagull position={[-14, 16, -10]} speed={0.45} offset={4.3} />
            <Seagull position={[5, 22, -30]} speed={0.55} offset={1.5} />

            {/* Distant islands */}
            <Island position={[-70, -2, -60]} scale={[1.5, 1.5, 1.5]} />
            <Island position={[55, -2, -70]} scale={[1.2, 1.2, 1.2]} />
            <Island position={[10, -2, -90]} scale={[2, 1.2, 2]} />

            {/* Clouds */}
            <Cloud position={[-50, 35, -60]} opacity={0.7} speed={0.15} segments={12} bounds={[25, 6, 25]} />
            <Cloud position={[45, 30, -50]} opacity={0.6} speed={0.12} segments={10} bounds={[20, 5, 20]} />
            <Cloud position={[0, 40, -80]} opacity={0.5} speed={0.1} segments={8} bounds={[30, 6, 30]} />
        </group>
    );
};
