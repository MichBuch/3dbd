'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Lego-style block with studs
const LegoBlock = ({ position, rotation, color, w = 2, h = 1, d = 1 }: any) => (
    <group position={position} rotation={rotation}>
        <mesh castShadow receiveShadow>
            <boxGeometry args={[w * 8, h * 9.6, d * 8]} />
            <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        {/* Studs on top */}
        {Array.from({ length: w }, (_, xi) =>
            Array.from({ length: d }, (_, zi) => (
                <mesh key={`${xi}-${zi}`} position={[(xi - (w - 1) / 2) * 8, h * 9.6 / 2 + 1.8, (zi - (d - 1) / 2) * 8]} castShadow>
                    <cylinderGeometry args={[2.4, 2.4, 3.6, 16]} />
                    <meshStandardMaterial color={color} roughness={0.4} />
                </mesh>
            ))
        )}
    </group>
);

// Toy train car
const TrainCar = ({ position, color, isEngine = false }: any) => (
    <group position={position}>
        {/* Body */}
        <mesh position={[0, 2.5, 0]} castShadow>
            <boxGeometry args={[5, 4, 8]} />
            <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        {/* Roof */}
        {isEngine && (
            <mesh position={[0, 5.5, -1]} castShadow>
                <boxGeometry args={[4.5, 2.5, 5]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
        )}
        {/* Chimney */}
        {isEngine && (
            <mesh position={[0, 7.5, -2.5]} castShadow>
                <cylinderGeometry args={[0.8, 1, 3, 8]} />
                <meshStandardMaterial color="#222" roughness={0.6} />
            </mesh>
        )}
        {/* Wheels */}
        {[-2.5, 2.5].map((z, i) => (
            <group key={i}>
                <mesh position={[-2.8, 1, z]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[1.5, 1.5, 0.8, 16]} />
                    <meshStandardMaterial color="#222" roughness={0.7} />
                </mesh>
                <mesh position={[2.8, 1, z]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[1.5, 1.5, 0.8, 16]} />
                    <meshStandardMaterial color="#222" roughness={0.7} />
                </mesh>
            </group>
        ))}
        {/* Window */}
        {isEngine && (
            <mesh position={[0, 4, 2.1]}>
                <boxGeometry args={[3, 2, 0.2]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} roughness={0.1} />
            </mesh>
        )}
    </group>
);

// Animated toy train on circular track
const ToyTrain = ({ position }: any) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime * 0.3;
        ref.current.rotation.y = t;
    });

    return (
        <group position={position}>
            {/* Track circle */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[28, 30, 64]} />
                <meshStandardMaterial color="#8B4513" roughness={0.9} />
            </mesh>
            {/* Rails */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
                <ringGeometry args={[26.5, 27.5, 64]} />
                <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
                <ringGeometry args={[30.5, 31.5, 64]} />
                <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
            </mesh>

            {/* Train cars on track */}
            <group ref={ref}>
                <group position={[29, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    <TrainCar position={[0, 0, 0]} color="#CC0000" isEngine />
                    <TrainCar position={[0, 0, 10]} color="#FFD700" />
                    <TrainCar position={[0, 0, 20]} color="#0066CC" />
                </group>
            </group>
        </group>
    );
};

// Spinning top
const SpinningTop = ({ position }: any) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!ref.current) return;
        ref.current.rotation.y = state.clock.elapsedTime * 8;
        ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    });
    return (
        <group ref={ref} position={position}>
            <mesh>
                <coneGeometry args={[3, 6, 16]} />
                <meshStandardMaterial color="#FF0066" roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[0, 3.5, 0]}>
                <sphereGeometry args={[3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#FF0066" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Stripe */}
            <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2.5, 0.4, 8, 24]} />
                <meshStandardMaterial color="#FFD700" roughness={0.3} />
            </mesh>
            {/* Handle */}
            <mesh position={[0, 5.5, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 2, 8]} />
                <meshStandardMaterial color="#333" roughness={0.5} />
            </mesh>
        </group>
    );
};

// Bouncy ball with stripe
const BouncyBall = ({ position, color, stripeColor }: any) => {
    const ref = useRef<THREE.Group>(null);
    const offset = useRef(Math.random() * Math.PI * 2);
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime + offset.current;
        const bounce = Math.abs(Math.sin(t * 1.5)) * 8;
        ref.current.position.y = position[1] + bounce;
        ref.current.rotation.y = t * 0.5;
    });
    return (
        <group ref={ref} position={position}>
            <mesh castShadow>
                <sphereGeometry args={[7, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.1} />
            </mesh>
            <mesh rotation={[Math.PI / 4, 0, 0]}>
                <torusGeometry args={[7, 0.6, 8, 48]} />
                <meshStandardMaterial color={stripeColor} roughness={0.1} />
            </mesh>
            <mesh rotation={[-Math.PI / 4, 0, 0]}>
                <torusGeometry args={[7, 0.6, 8, 48]} />
                <meshStandardMaterial color={stripeColor} roughness={0.1} />
            </mesh>
        </group>
    );
};

// Teddy bear
const TeddyBear = ({ position, rotation }: any) => (
    <group position={position} rotation={rotation}>
        {/* Body */}
        <mesh position={[0, 4, 0]} castShadow>
            <sphereGeometry args={[4, 12, 12]} />
            <meshStandardMaterial color="#C4A265" roughness={0.9} />
        </mesh>
        {/* Tummy */}
        <mesh position={[0, 4, 3.5]}>
            <sphereGeometry args={[2.5, 12, 12]} />
            <meshStandardMaterial color="#D4B483" roughness={0.9} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 9, 0]} castShadow>
            <sphereGeometry args={[3, 12, 12]} />
            <meshStandardMaterial color="#C4A265" roughness={0.9} />
        </mesh>
        {/* Snout */}
        <mesh position={[0, 8.5, 2.8]}>
            <sphereGeometry args={[1.5, 10, 10]} />
            <meshStandardMaterial color="#D4B483" roughness={0.9} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 8.8, 4.1]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="#222" roughness={0.5} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-1.2, 9.8, 2.7]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[1.2, 9.8, 2.7]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial color="#111" />
        </mesh>
        {/* Ears */}
        <mesh position={[-2.5, 11.5, 0]}>
            <sphereGeometry args={[1.5, 10, 10]} />
            <meshStandardMaterial color="#C4A265" roughness={0.9} />
        </mesh>
        <mesh position={[2.5, 11.5, 0]}>
            <sphereGeometry args={[1.5, 10, 10]} />
            <meshStandardMaterial color="#C4A265" roughness={0.9} />
        </mesh>
        {/* Arms */}
        <mesh position={[-5, 5, 0]} rotation={[0, 0, 0.5]}>
            <capsuleGeometry args={[1.2, 3, 4, 8]} />
            <meshStandardMaterial color="#C4A265" roughness={0.9} />
        </mesh>
        <mesh position={[5, 5, 0]} rotation={[0, 0, -0.5]}>
            <capsuleGeometry args={[1.2, 3, 4, 8]} />
            <meshStandardMaterial color="#C4A265" roughness={0.9} />
        </mesh>
        {/* Legs */}
        <mesh position={[-2, 0.5, 1]} rotation={[0.3, 0, 0]}>
            <capsuleGeometry args={[1.5, 2.5, 4, 8]} />
            <meshStandardMaterial color="#C4A265" roughness={0.9} />
        </mesh>
        <mesh position={[2, 0.5, 1]} rotation={[0.3, 0, 0]}>
            <capsuleGeometry args={[1.5, 2.5, 4, 8]} />
            <meshStandardMaterial color="#C4A265" roughness={0.9} />
        </mesh>
    </group>
);

export const PlayroomBackground = () => {
    return (
        <group>
            <ambientLight intensity={0.9} color="#fff8e7" />
            <directionalLight position={[30, 80, 30]} intensity={1.5} castShadow />
            <pointLight position={[0, 40, 0]} color="#FFD700" intensity={0.8} distance={80} />

            {/* Wood floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[400, 400]} />
                <meshStandardMaterial color="#C8A96E" roughness={0.7} />
            </mesh>
            {/* Floor planks */}
            {Array.from({ length: 20 }, (_, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[i * 10 - 100, -1.98, 0]}>
                    <planeGeometry args={[9.5, 400]} />
                    <meshStandardMaterial color={i % 2 === 0 ? '#C8A96E' : '#B8996E'} roughness={0.7} />
                </mesh>
            ))}

            {/* Walls */}
            <mesh position={[0, 30, -120]}>
                <boxGeometry args={[400, 80, 2]} />
                <meshStandardMaterial color="#FFF9F0" roughness={0.8} />
            </mesh>
            <mesh position={[-120, 30, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[400, 80, 2]} />
                <meshStandardMaterial color="#FFF9F0" roughness={0.8} />
            </mesh>

            {/* Colorful wall stripes */}
            {['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'].map((color, i) => (
                <mesh key={i} position={[-90 + i * 60, 15, -119]}>
                    <boxGeometry args={[50, 30, 1]} />
                    <meshStandardMaterial color={color} roughness={0.8} transparent opacity={0.3} />
                </mesh>
            ))}

            {/* Lego block towers */}
            <LegoBlock position={[-55, -2, -55]} rotation={[0, 0.3, 0]} color="#FF0000" w={2} h={1} d={2} />
            <LegoBlock position={[-55, 7.6, -55]} rotation={[0, 0.1, 0]} color="#FFD700" w={2} h={1} d={1} />
            <LegoBlock position={[-55, 17.2, -55]} rotation={[0, -0.2, 0]} color="#0066CC" w={1} h={1} d={1} />

            <LegoBlock position={[60, -2, -50]} rotation={[0, -0.2, 0]} color="#00AA44" w={3} h={1} d={2} />
            <LegoBlock position={[60, 7.6, -50]} rotation={[0, 0.4, 0]} color="#FF6600" w={2} h={1} d={2} />

            <LegoBlock position={[-70, -2, 30]} rotation={[0, 0.8, 0]} color="#9900CC" w={2} h={1} d={3} />
            <LegoBlock position={[-70, 7.6, 30]} rotation={[0, 0.5, 0]} color="#FF0000" w={2} h={1} d={2} />
            <LegoBlock position={[-70, 17.2, 30]} rotation={[0, 0.2, 0]} color="#FFD700" w={1} h={1} d={1} />

            {/* Toy train */}
            <ToyTrain position={[0, -2, 20]} />

            {/* Spinning tops */}
            <SpinningTop position={[30, -2, -30]} />
            <SpinningTop position={[-25, -2, 40]} />

            {/* Bouncy balls */}
            <BouncyBall position={[50, 5, 30]} color="#FF4444" stripeColor="#ffffff" />
            <BouncyBall position={[-45, 5, -20]} color="#4488FF" stripeColor="#FFD700" />

            {/* Teddy bears */}
            <TeddyBear position={[20, -2, -60]} rotation={[0, -0.5, 0]} />
            <TeddyBear position={[-60, -2, -60]} rotation={[0, 0.8, 0]} />

            {/* Floating toy shapes */}
            <Float speed={1.5} floatIntensity={3} rotationIntensity={0.5}>
                <mesh position={[-80, 20, -40]}>
                    <torusGeometry args={[8, 3, 12, 32]} />
                    <meshStandardMaterial color="#FF00FF" roughness={0.3} />
                </mesh>
            </Float>
            <Float speed={2} floatIntensity={4} rotationIntensity={1}>
                <mesh position={[80, 25, -60]}>
                    <icosahedronGeometry args={[7, 0]} />
                    <meshStandardMaterial color="#00FFAA" roughness={0.2} metalness={0.3} />
                </mesh>
            </Float>
        </group>
    );
};
