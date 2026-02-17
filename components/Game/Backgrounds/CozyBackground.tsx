'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Fire Particles
const FireParticles = () => {
    const count = 50;
    const mesh = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 1.5;
            const y = Math.random() * 2;
            const z = (Math.random() - 0.5) * 1;
            const speed = 0.5 + Math.random();
            temp.push({ x, y, z, speed, offset: Math.random() * 100 });
        }
        return temp;
    }, []);

    const positions = useMemo(() => new Float32Array(count * 3), []);

    useFrame((state) => {
        if (!mesh.current) return;
        const t = state.clock.elapsedTime;

        for (let i = 0; i < count; i++) {
            const p = particles[i];

            // Rise up
            p.y = (Math.sin((t * p.speed) + p.offset) + 1) * 1.5;
            // Wiggle
            p.x = Math.sin(t * 3 + p.offset) * 0.2;

            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
        }
        mesh.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.3} color="#FF4500" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </points>
    );
};

// Fireplace Component
const Fireplace = ({ position, rotation }: any) => {
    const light = useRef<THREE.PointLight>(null);
    useFrame((state) => {
        if (light.current) {
            // Flicker effect
            light.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 10) * 0.5 + Math.random() * 0.5;
        }
    });

    return (
        <group position={position} rotation={rotation}>
            {/* Mantle/Structure */}
            <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[6, 5, 2]} />
                <meshStandardMaterial color="#8B4513" roughness={0.9} /> {/* Brick/Stone color */}
            </mesh>
            {/* Hearth (Black inside) */}
            <mesh position={[0, 1.5, 0.1]}>
                <boxGeometry args={[3, 2.5, 1.8]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Fire */}
            <group position={[0, 0.5, 0.5]}>
                <FireParticles />
                <pointLight ref={light} color="#FF6600" distance={20} decay={2} />
            </group>

            {/* Chimney extending up */}
            <mesh position={[0, 7, -0.5]}>
                <boxGeometry args={[4, 10, 2]} />
                <meshStandardMaterial color="#8B4513" roughness={0.9} />
            </mesh>
        </group>
    );
};

// Fish Tank Component
const FishTank = ({ position, rotation }: any) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Glass Box */}
            <mesh position={[0, 3, 0]}>
                <boxGeometry args={[8, 4, 3]} />
                <meshPhysicalMaterial
                    color="#E0FFFF"
                    transmission={0.9}
                    roughness={0.05}
                    thickness={0.5}
                    transparent
                    opacity={0.3}
                />
            </mesh>
            {/* Water Inside */}
            <mesh position={[0, 2.8, 0]}>
                <boxGeometry args={[7.8, 3.5, 2.8]} />
                <meshBasicMaterial color="#00FFFF" transparent opacity={0.2} />
            </mesh>
            {/* Stand */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[8.2, 1, 3.2]} />
                <meshStandardMaterial color="#333" />
            </mesh>

            {/* Bubbles */}
            <group position={[0, 2, 0]}>
                <Sparkles count={20} scale={[7, 3, 2]} size={2} speed={1} opacity={0.5} color="white" noise={0.5} />
            </group>

            {/* Fish */}
            <Fish position={[0, 3, 0]} color="#FFD700" speed={1} />
            <Fish position={[2, 2.5, 0.5]} color="#FF4500" speed={1.5} />
            <Fish position={[-2, 3.5, -0.5]} color="#00FF00" speed={0.8} />

            {/* Tank Light */}
            <pointLight position={[0, 4.5, 0]} color="#E0FFFF" intensity={0.5} distance={10} />
        </group>
    )
}

const Fish = ({ position, color, speed }: any) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime * speed;
            // Swim in figure 8 or circle
            ref.current.position.x = Math.sin(t) * 3;
            ref.current.position.z = Math.cos(t * 0.5) * 1;
            // Face direction
            ref.current.rotation.y = Math.cos(t) + Math.PI / 2;

            // Wiggle tail (simplified as whole body wobble)
            ref.current.rotation.z = Math.sin(t * 10) * 0.1;
        }
    });

    return (
        <group ref={ref} position={position}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Tail */}
            <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <coneGeometry args={[0.2, 0.4, 4]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    )
}

export const CozyBackground = () => {
    return (
        <group>
            {/* Warm Indoor Lighting */}
            <ambientLight intensity={0.3} color="#FFD700" />

            {/* Floor (Wood) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#5D4037" roughness={0.8} />
            </mesh>

            {/* Rug */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
                <circleGeometry args={[15, 64]} />
                <meshStandardMaterial color="#8B0000" roughness={1} />
            </mesh>

            {/* Walls (Log Cabin) */}
            {/* Back Wall */}
            <group position={[0, 10, -40]}>
                {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map((y) => (
                    <mesh key={y} position={[0, y - 10, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[1, 1, 80]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                ))}
            </group>
            {/* Side Walls */}
            <group position={[-40, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
                {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map((y) => (
                    <mesh key={y} position={[0, y - 10, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[1, 1, 80]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                ))}
            </group>
            <group position={[40, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
                {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map((y) => (
                    <mesh key={y} position={[0, y - 10, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[1, 1, 80]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                ))}
            </group>


            {/* Fireplace */}
            <Fireplace position={[0, -2, -35]} />

            {/* Fish Tank */}
            <FishTank position={[25, -2, -25]} rotation={[0, -0.5, 0]} />

            {/* Window (Cold Outside) */}
            <group position={[-20, 10, -38]}>
                <mesh>
                    <boxGeometry args={[10, 8, 1]} />
                    <meshStandardMaterial color="#87CEEB" emissive="#1E90FF" emissiveIntensity={0.5} />
                </mesh>
                {/* Window Frame */}
                <mesh>
                    <boxGeometry args={[10.5, 0.5, 1.2]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[8.5, 0.5, 1.2]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>

        </group>
    );
};
