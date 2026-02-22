'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// ---- Road Path: offset well away from board centre (5 units behind) ----
// The board sits roughly at world origin (0,0,0). We push the road to z=-5 through z=-50
const RoadPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-80, 0, -60),
    new THREE.Vector3(-30, 0, -20),
    new THREE.Vector3(0, 0, -5),   // closest point: 5 units behind origin
    new THREE.Vector3(30, 0, -20),
    new THREE.Vector3(70, 0, -50),
    new THREE.Vector3(110, 0, -30),
    new THREE.Vector3(140, 0, -55),
]);

// ---- Ramshackle Diner ---- (moved off to the side, not directly behind board)
const Shack = ({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
        <mesh castShadow receiveShadow position={[0, 4, 0]}>
            <boxGeometry args={[12, 8, 8]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
        <mesh position={[0, 9, 0]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[14, 1, 10]} />
            <meshStandardMaterial color="#555" />
        </mesh>
        <group position={[0, 14, 0]}>
            <Text color="#FF00FF" fontSize={2.5} anchorX="center" anchorY="middle" font="/fonts/Inter-Bold.woff">
                DINER
            </Text>
            <pointLight color="#FF00FF" intensity={3} distance={15} />
        </group>
    </group>
);

// ---- Alien Hitchhiker ----
const Alien = ({ position }: { position: [number, number, number] }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
        }
    });
    return (
        <group ref={ref} position={position}>
            <mesh position={[0, 3.5, 0]}>
                <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
                <meshStandardMaterial color="#39FF14" roughness={0.4} />
            </mesh>
            <mesh position={[-0.4, 3.6, 0.7]}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial color="black" roughness={0} />
            </mesh>
            <mesh position={[0.4, 3.6, 0.7]}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial color="black" roughness={0} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
                <capsuleGeometry args={[0.5, 2.5, 8]} />
                <meshStandardMaterial color="#39FF14" />
            </mesh>
            <mesh position={[0.8, 2, 0.5]} rotation={[0, 0, -0.5]}>
                <cylinderGeometry args={[0.15, 0.15, 1.5]} />
                <meshStandardMaterial color="#39FF14" />
            </mesh>
        </group>
    );
};

// ---- Crashed UFO ----
const UFO = ({ position }: { position: [number, number, number] }) => (
    <group position={position} rotation={[0.5, 0, 0.3]}>
        <mesh castShadow receiveShadow>
            <cylinderGeometry args={[6, 8, 1, 32]} />
            <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#00FFFF" transparent opacity={0.6} />
        </mesh>
    </group>
);

// ---- Road Plane (flat, not a tube) ----
// Using a flat plane is much simpler and guaranteed not to protrude in 3D space
const Road = () => {
    const roadPoints = RoadPath.getPoints(100);
    return (
        <>
            {/* Main tarmac strip */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, -25]}>
                <planeGeometry args={[6, 120]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
            </mesh>
            {/* Centre dashes — a thin bright strip */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.84, -25]}>
                <planeGeometry args={[0.15, 120]} />
                <meshStandardMaterial color="#FFD700" roughness={0.7} />
            </mesh>
        </>
    );
};

export const Route66Background = () => {
    return (
        <group>
            {/* ---- Lighting ---- */}
            {/* Enough ambient so meshStandardMaterial surfaces are clearly visible */}
            <ambientLight intensity={0.7} color="#FFA07A" />
            {/* Warm sunset directional light from the left */}
            <directionalLight position={[-60, 20, -40]} intensity={2.5} color="#FF6030" castShadow />
            {/* Fill from right to avoid pure shadow on board side */}
            <directionalLight position={[40, 10, 20]} intensity={0.8} color="#FF8C42" />

            {/* ---- Fog: start at 40 units, end at 150 — board is at ~12 units, safely before fog ---- */}
            <fog attach="fog" args={['#3B1E08', 40, 150]} />
            <color attach="background" args={['#3B1E08']} />

            {/* ---- Sky dome ---- */}
            <mesh>
                <sphereGeometry args={[200, 32, 16]} />
                <meshBasicMaterial side={THREE.BackSide} color="#1A0A30" />
            </mesh>

            {/* ---- Setting sun ---- */}
            <mesh position={[-70, 12, -90]}>
                <sphereGeometry args={[8, 16, 16]} />
                <meshBasicMaterial color="#FF4500" />
            </mesh>
            {/* sun glow */}
            <pointLight position={[-70, 12, -90]} color="#FF4500" intensity={4} distance={200} />

            {/* ---- Desert floor ---- */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#5C3317" roughness={1} />
            </mesh>

            {/* ---- Road — flat plane, offset behind the board ---- */}
            <Road />

            {/* ---- Props: pushed off to the sides / back so they don't intrude on board ---- */}
            <Shack position={[-35, 0, -45]} rotation={[0, 0.4, 0]} />
            <Alien position={[18, -2, -22]} />
            <UFO position={[45, -1, -55]} />

            {/* Tumbleweed */}
            <mesh position={[-12, 0, -8]}>
                <dodecahedronGeometry args={[0.6]} />
                <meshStandardMaterial color="#DAA520" wireframe />
            </mesh>
        </group>
    );
};
