'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Giant Toy Block
const GiantBlock = ({ position, color, rotation }: any) => {
    return (
        <group position={position} rotation={rotation}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[15, 15, 15]} />
                <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
            </mesh>
            {/* Studs on top if it's lego-like? Let's just keep it simple wood blocks for now */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[15.2, 15.2, 15.2]} />
                <meshBasicMaterial color="black" wireframe transparent opacity={0.1} />
            </mesh>
        </group>
    );
};

// Giant Bouncy Ball
const GiantBall = ({ position, color }: any) => {
    return (
        <group position={position}>
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[12, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.1} metalness={0.0} />
            </mesh>
            {/* Stripe */}
            <mesh rotation={[Math.PI / 4, 0, 0]}>
                <torusGeometry args={[12, 1, 16, 64]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    );
};

// Giant Ring/Donut
const GiantRing = ({ position, color }: any) => {
    return (
        <group position={position} rotation={[Math.PI / 2, 0, Math.random()]}>
            <mesh castShadow receiveShadow>
                <torusGeometry args={[10, 4, 16, 64]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
        </group>
    )
}

export const PlayroomBackground = () => {

    // Scattered Toys
    const toys = useMemo(() => {
        return [
            { type: 'block', pos: [-50, 7.5, -50], rot: [0, 0.4, 0], color: '#FF0000' }, // Red Block
            { type: 'block', pos: [60, 7.5, -40], rot: [0, -0.2, 0], color: '#0000FF' }, // Blue Block
            { type: 'block', pos: [-40, 22.5, -50], rot: [0, 0.5, 0], color: '#FFFF00' }, // Yellow Block (Stacked)
            { type: 'ball', pos: [40, 12, 40], color: '#00FF00' }, // Green Ball
            { type: 'ring', pos: [-60, 4, 50], color: '#FF00FF' }, // Pink Ring
            // Huge block in distance
            { type: 'block', pos: [0, 7.5, -120], rot: [0, 0, 0], color: '#FFA500' },
        ];
    }, []);

    return (
        <group>
            <ambientLight intensity={0.8} />
            <directionalLight position={[50, 100, 50]} intensity={1.2} castShadow >
                <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100]} />
            </directionalLight>

            {/* Floor (Wood Planks) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#DEB887" roughness={0.6} />
            </mesh>

            {/* Baseboards (Walls) - Far away */}
            <group position={[0, 0, -150]}>
                <mesh position={[0, 25, 0]}>
                    <boxGeometry args={[500, 50, 5]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                {/* Wallpaper */}
                <mesh position={[0, 150, -2]}>
                    <planeGeometry args={[500, 200]} />
                    <meshStandardMaterial color="#87CEEB" />
                </mesh>
            </group>

            <group position={[-200, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <mesh position={[0, 25, 0]}>
                    <boxGeometry args={[500, 50, 5]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                <mesh position={[0, 150, -2]}>
                    <planeGeometry args={[500, 200]} />
                    <meshStandardMaterial color="#87CEEB" />
                </mesh>
            </group>

            {/* Giant Dust Motes floating */}
            <Float speed={1} rotationIntensity={0} floatIntensity={10} floatingRange={[10, 40]}>
                <mesh position={[-20, 30, -20]}>
                    <sphereGeometry args={[0.5]} />
                    <meshBasicMaterial color="white" opacity={0.3} transparent />
                </mesh>
            </Float>

            {/* Render Toys */}
            {toys.map((toy, i) => (
                <group key={i}>
                    {toy.type === 'block' && <GiantBlock position={toy.pos} rotation={toy.rot} color={toy.color} />}
                    {toy.type === 'ball' && <GiantBall position={toy.pos} color={toy.color} />}
                    {toy.type === 'ring' && <GiantRing position={toy.pos} color={toy.color} />}
                </group>
            ))}
        </group>
    );
};
