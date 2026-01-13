'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import { useTexture, Billboard } from '@react-three/drei';
import * as THREE from 'three';

export const CozyBackground = () => {
    // Load Textures
    const alienTex = useTexture('/assets/sprites/alien_santa_peek_sprite.png');
    // Using a simple wood texture or color for the room

    // Fire Flickering Logic
    const fireLight = useRef<THREE.PointLight>(null);
    useFrame((state) => {
        if (fireLight.current) {
            // Random flicker
            fireLight.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 10) * 0.5 + Math.random() * 0.5;
            fireLight.current.position.x = Math.sin(state.clock.elapsedTime * 2) * 0.2;
        }
    });

    return (
        <group>
            {/* Warm Indoor Atmosphere */}
            <ambientLight intensity={0.2} color="#4a2c2a" />

            {/* The Fireplace Light */}
            <pointLight ref={fireLight} position={[0, 5, -20]} distance={50} color="#ff6600" decay={2} />

            {/* Room Shell (Walls) */}
            <mesh position={[0, 0, -25]}>
                <planeGeometry args={[100, 50]} />
                <meshStandardMaterial color="#3E2723" />
            </mesh>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#5D4037" />
            </mesh>

            {/* Fireplace Structure */}
            <group position={[0, -5, -24.5]}>
                {/* Mantle/Hearth */}
                <mesh position={[0, 2.5, 0]}>
                    <boxGeometry args={[10, 5, 2]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                {/* Fire particles simplified as glowing spheres */}
                <mesh position={[0, 0.5, 1]}>
                    <coneGeometry args={[1, 2, 8]} />
                    <meshBasicMaterial color="#ff4400" transparent opacity={0.8} />
                </mesh>
                <mesh position={[-0.5, 0.3, 1.2]} rotation={[0, 0, -0.2]}>
                    <coneGeometry args={[0.6, 1.5, 8]} />
                    <meshBasicMaterial color="#ff8800" transparent opacity={0.8} />
                </mesh>
            </group>

            {/* The Window (Looking outside) */}
            <group position={[20, 5, -24.9]}>
                {/* Frame */}
                <mesh>
                    <boxGeometry args={[12, 12, 1]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                {/* Glass/Outside View */}
                {/* Masking logic is hard in simple R3F without stencil. 
                    We'll just place a 'Sky' plane behind the window frame and some snow particles localized there. 
                */}
                <mesh position={[0, 0, -0.6]}>
                    <planeGeometry args={[10, 10]} />
                    <meshBasicMaterial color="#001133" />
                </mesh>

                {/* Falling Snow appearing outside */}
                <SnowWindow />

                {/* Peeking Alien */}
                <AlienPeek tex={alienTex} />
            </group>

            {/* Coffee Table (Foreground) */}
            <group position={[0, -6, 15]}>
                {/* Table Top (Board sits on/near this, but board is at [0,0,0] usually? 
                    Actually Game board is centered. We should place table BELOW the board.
                    Board is usually at y=0 or floating. 
                    Let's put table at y = -3.
                */}
                <mesh position={[0, 3, 0]}>
                    <boxGeometry args={[40, 0.5, 20]} />
                    <meshStandardMaterial color="#3E2723" roughness={0.1} />
                </mesh>
                {/* Legs */}
                <mesh position={[-18, 1.5, -9]}><boxGeometry args={[2, 3, 2]} /><meshStandardMaterial color="#2E1715" /></mesh>
                <mesh position={[18, 1.5, -9]}><boxGeometry args={[2, 3, 2]} /><meshStandardMaterial color="#2E1715" /></mesh>
                <mesh position={[-18, 1.5, 9]}><boxGeometry args={[2, 3, 2]} /><meshStandardMaterial color="#2E1715" /></mesh>
                <mesh position={[18, 1.5, 9]}><boxGeometry args={[2, 3, 2]} /><meshStandardMaterial color="#2E1715" /></mesh>
            </group>
        </group>
    );
};

const SnowWindow = () => {
    // Localized snow particles behind window
    const count = 50;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!mesh.current) return;
        const t = state.clock.elapsedTime;
        for (let i = 0; i < count; i++) {
            const y = (t + i * 0.1) % 10;
            dummy.position.set(
                (Math.random() - 0.5) * 10,
                5 - y, // Fall down
                -1 // Behind frame
            );
            dummy.scale.set(0.1, 0.1, 0.1);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]} position={[0, 0, -1]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="white" />
        </instancedMesh>
    )
}

const AlienPeek = ({ tex }: { tex: THREE.Texture }) => {
    const ref = useRef<THREE.Group>(null);
    // Random peek logic
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime;
        // Peek every ~10 seconds
        const cycle = t % 10;
        if (cycle > 8) {
            // Peeking up
            const peekProgress = Math.sin((cycle - 8) * Math.PI); // 0 -> 1 -> 0
            ref.current.position.y = -5 + peekProgress * 4;
        } else {
            ref.current.position.y = -10; // Hidden
        }
    });

    return (
        <group ref={ref} position={[0, -5, -0.8]}>
            <Billboard>
                <mesh scale={[4, 4, 1]}>
                    <planeGeometry />
                    <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} alphaTest={0.5} />
                </mesh>
            </Billboard>
        </group>
    )
}
