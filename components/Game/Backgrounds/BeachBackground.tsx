'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud, Float } from '@react-three/drei';
import * as THREE from 'three';

// Low-Poly Island
const Island = ({ position, scale }: any) => (
    <group position={position} scale={scale}>
        {/* Sand Base */}
        <mesh receiveShadow>
            <coneGeometry args={[5, 3, 16]} />
            <meshStandardMaterial color="#F4A460" roughness={1} />
        </mesh>
        {/* Palm Tree Trunk */}
        <mesh position={[0, 2, 0]} rotation={[0.2, 0, 0.1]}>
            <cylinderGeometry args={[0.2, 0.4, 4, 8]} />
            <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Palm Leaves */}
        <group position={[0, 4, 0]}>
            {[0, 1, 2, 3, 4].map((i) => (
                <mesh key={i} rotation={[0, i * (Math.PI * 2) / 5, Math.PI / 3]} position={[0, 0, 0]}>
                    <coneGeometry args={[0.5, 3, 4]} />
                    <meshStandardMaterial color="#228B22" />
                </mesh>
            ))}
        </group>
    </group>
);

// Animated Whale Spout
const WhaleSpout = ({ position }: any) => {
    const particles = useRef<THREE.Points>(null);

    // Create particles
    const particleGeo = useMemo(() => {
        const count = 50;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 0.5; // x
            pos[i * 3 + 1] = Math.random() * 2; // y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // z
            speeds[i] = 1 + Math.random();
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return { geo, speeds }; // Store speeds separately conceptually
    }, []);

    useFrame((state) => {
        if (!particles.current) return;
        const time = state.clock.elapsedTime;
        // Intermittent spout
        const burst = Math.sin(time * 0.5) > 0.8;

        if (burst) {
            particles.current.visible = true;
            // Jitter/Scale effect simply via scale for now
            particles.current.scale.y = 1 + Math.random();
        } else {
            particles.current.visible = false;
        }
    });

    return (
        <group position={position}>
            {/* Whale Back (barely visible) */}
            <mesh position={[0, -0.2, 0]} rotation={[0.2, 0, 0]}>
                <sphereGeometry args={[2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
                <meshStandardMaterial color="#333" roughness={0.2} />
            </mesh>
            {/* The Spout */}
            <points ref={particles}>
                <bufferGeometry attach="geometry" {...particleGeo.geo} />
                <pointsMaterial size={0.3} color="white" transparent opacity={0.6} />
            </points>
        </group>
    )
}

// Seagull Flock
const Seagull = ({ position, speed, offset }: any) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime + offset;
        // Circle movement
        ref.current.position.x = position[0] + Math.cos(t * speed * 0.1) * 30;
        ref.current.position.z = position[2] + Math.sin(t * speed * 0.1) * 30;
        ref.current.rotation.y = -(t * speed * 0.1);

        // Bob
        ref.current.position.y = position[1] + Math.sin(t * 2) * 2;
    });

    return (
        <group ref={ref}>
            {/* V Shape Body */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.05, 0.05, 1]} />
                <meshBasicMaterial color="white" />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
                <cylinderGeometry args={[0.05, 0.05, 1]} />
                <meshBasicMaterial color="white" />
            </mesh>
        </group>
    )
}

// Custom Wave Mesh
const Ocean = () => {
    const mesh = useRef<THREE.Mesh>(null);

    // Wave animation via vertex manipulation
    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.elapsedTime;
        const position = mesh.current.geometry.attributes.position;

        // Simple sine wave displacement
        for (let i = 0; i < position.count; i++) {
            const x = position.getX(i);
            const z = position.getZ(i);
            // Wave equation
            const y = Math.sin(x * 0.2 + time) * 0.5 + Math.sin(z * 0.1 + time * 0.5) * 0.5;
            position.setY(i, y);
        }
        position.needsUpdate = true;
    });

    return (
        <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[200, 200, 64, 64]} />
            <meshStandardMaterial
                color="#006994"
                roughness={0.1}
                metalness={0.1}
                transparent
                opacity={0.9}
            />
        </mesh>
    );
};

export const BeachBackground = () => {
    return (
        <group>
            {/* Sunny Lighting */}
            <ambientLight intensity={0.6} color="#FFD700" />
            <directionalLight position={[-50, 20, -50]} intensity={1.5} color="#FFA500" castShadow />
            <fog attach="fog" args={['#87CEEB', 10, 150]} />

            {/* Sun */}
            <mesh position={[-50, 10, -50]}>
                <sphereGeometry args={[8]} />
                <meshBasicMaterial color="#FF4500" />
            </mesh>

            {/* Ocean */}
            <Ocean />

            {/* Distant Islands */}
            <Island position={[-60, -2, -40]} scale={[1.5, 1.5, 1.5]} />
            <Island position={[50, -2, -60]} scale={[1, 1, 1]} />
            <Island position={[0, -2, -80]} scale={[2, 1, 2]} />

            {/* Whales */}
            <WhaleSpout position={[-30, -2, -40]} />
            <WhaleSpout position={[20, -2, -50]} />

            {/* Seagulls */}
            <Seagull position={[0, 20, -20]} speed={0.5} offset={0} />
            <Seagull position={[10, 22, -25]} speed={0.6} offset={1} />
            <Seagull position={[-10, 18, -15]} speed={0.4} offset={2} />

            {/* Clouds */}
            {/* Clouds */}
            <Cloud position={[-40, 30, -50]} opacity={0.6} speed={0.2} segments={10} bounds={[20, 5, 20]} />
            <Cloud position={[40, 25, -40]} opacity={0.6} speed={0.2} segments={10} bounds={[20, 5, 20]} />
        </group>
    );
};
