'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Tube } from '@react-three/drei';
import * as THREE from 'three';

// Curve for the winding road
const RoadPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-100, 0, -100),
    new THREE.Vector3(-40, 0, -40),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(40, 0, -40),
    new THREE.Vector3(80, 0, -80),
    new THREE.Vector3(120, 0, -40),
    new THREE.Vector3(160, 0, 0)
]);

// Ramshackle Diner/Gas Station
const Shack = ({ position, rotation }: any) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Main Building */}
            <mesh castShadow receiveShadow position={[0, 4, 0]}>
                <boxGeometry args={[12, 8, 8]} />
                <meshStandardMaterial color="#8B4513" roughness={0.9} />
            </mesh>
            {/* Roof (Slanted) */}
            <mesh position={[0, 9, 0]} rotation={[0.1, 0, 0]}>
                <boxGeometry args={[14, 1, 10]} />
                <meshStandardMaterial color="#555" />
            </mesh>
            {/* Neon Sign */}
            <group position={[0, 12, 0]} rotation={[0, -0.2, 0]}>
                <Text color="#FF00FF" fontSize={3} position={[0, 0, 0]} anchorX="center" anchorY="middle" font="/fonts/Inter-Bold.woff">
                    DINER
                </Text>
                <pointLight color="#FF00FF" intensity={2} distance={10} />
            </group>
        </group>
    )
}

// Alien Hitchhiker
const Alien = ({ position }: any) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            // Thumb wave
            ref.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
        }
    })
    return (
        <group ref={ref} position={position}>
            {/* Head */}
            <mesh position={[0, 3.5, 0]}>
                <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
                {/* Elongated Head? */}
                <meshStandardMaterial color="#39FF14" roughness={0.4} />
            </mesh>
            {/* Eyes */}
            <mesh position={[-0.4, 3.6, 0.7]} rotation={[0.2, -0.2, 0]}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial color="black" roughness={0} />
            </mesh>
            <mesh position={[0.4, 3.6, 0.7]} rotation={[0.2, 0.2, 0]}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial color="black" roughness={0} />
            </mesh>
            {/* Body */}
            <mesh position={[0, 1.5, 0]}>
                <capsuleGeometry args={[0.5, 2.5, 8]} />
                <meshStandardMaterial color="#39FF14" />
            </mesh>
            {/* Thumb Arm */}
            <mesh position={[0.8, 2, 0.5]} rotation={[0, 0, -0.5]}>
                <cylinderGeometry args={[0.15, 0.15, 1.5]} />
                <meshStandardMaterial color="#39FF14" />
            </mesh>
        </group>
    )
}

// Crashed UFO
const UFO = ({ position }: any) => {
    return (
        <group position={position} rotation={[0.5, 0, 0.3]}>
            {/* Disc */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[6, 8, 1, 32]} />
                <meshStandardMaterial color="silver" metalness={0.8} />
            </mesh>
            {/* Dome */}
            <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#00FFFF" transparent opacity={0.6} />
            </mesh>
            {/* Smoke Particles from crash? Simply a cloud for now */}
            <Float speed={2} rotationIntensity={0} floatIntensity={0}>
                <mesh position={[2, 2, 0]}>
                    <sphereGeometry args={[1]} />
                    <meshBasicMaterial color="#555" transparent opacity={0.4} />
                </mesh>
                <mesh position={[3, 3, 1]}>
                    <sphereGeometry args={[1.5]} />
                    <meshBasicMaterial color="#777" transparent opacity={0.3} />
                </mesh>
            </Float>
        </group>
    )
}

export const Route66Background = () => {

    return (
        <group>
            {/* Sunset Atmosphere */}
            <ambientLight intensity={0.2} color="#8B4513" />
            <directionalLight position={[-80, 10, -80]} intensity={1.5} color="#FF4500" castShadow />
            <fog attach="fog" args={['#2F1810', 10, 120]} />

            {/* Sun */}
            <mesh position={[-80, 5, -80]}>
                <sphereGeometry args={[10]} />
                <meshBasicMaterial color="#FF4500" />
            </mesh>

            {/* Sky */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[200, 32, 32]} />
                <meshBasicMaterial side={THREE.BackSide} color="#191970" />
                {/* Midnight Blue merging with sunset fog */}
            </mesh>

            {/* Desert Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#3E2723" roughness={1} />
            </mesh>

            {/* Winding Road */}
            <Tube args={[RoadPath, 64, 4, 8, false]} position={[0, -1.9, 0]} rotation={[Math.PI / 2, Math.PI, 0]}>
                <meshStandardMaterial color="#333" roughness={0.8} />
            </Tube>
            {/* Road Lines - Tube slightly higher */}
            {/* Simplified central line by using another thin tube or texture. Let's skip for now, road shape is enough */}

            {/* Props */}
            <Shack position={[-30, 0, -40]} rotation={[0, 0.5, 0]} />

            <Alien position={[15, -2, -20]} />

            <UFO position={[40, -1, -50]} />

            {/* Tumbleweeds? */}
            <mesh position={[-10, 0, 10]}>
                <dodecahedronGeometry args={[0.5]} />
                <meshStandardMaterial color="#DAA520" wireframe />
            </mesh>
        </group>
    );
};
