'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const MoonBallBackground = () => {
    const { preferences } = useGameStore();
    const speedMult = (preferences.themeSpeed || 1) * 0.5; // Slow down a bit by default

    const count = 30; // Number of balls

    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Initialize Balls
    const balls = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                x: (Math.random() - 0.5) * 60,
                y: (Math.random() - 0.5) * 40,
                z: (Math.random() - 0.5) * 40 - 10, // Keep slightly behind
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                vz: (Math.random() - 0.5) * 0.2,
                scale: 1 + Math.random() * 2, // Varied sizes
                color: Math.random() > 0.5 ? new THREE.Color('#FFD700') : new THREE.Color('#FF0000') // Yellow or Red
            });
        }
        return temp;
    }, []);

    // Create Color Array for InstancedMesh
    const colorArray = useMemo(() => {
        const colors = new Float32Array(count * 3);
        balls.forEach((ball, i) => {
            ball.color.toArray(colors, i * 3);
        });
        return colors;
    }, [balls]);

    useFrame((state, delta) => {
        const instance = mesh.current;
        if (!instance) return;

        // Apply colors once? No, do it here or use an attribute.
        // For simplicity with InstancedMesh colors in R3F, we often use instanceColor attribute.
        // But doing it manual via geometry attribute is efficient.

        balls.forEach((ball, i) => {
            // Update Position
            ball.x += ball.vx * speedMult * (delta * 60);
            ball.y += ball.vy * speedMult * (delta * 60);
            ball.z += ball.vz * speedMult * (delta * 60);

            // Bounce Bounds
            if (ball.x > 30 || ball.x < -30) ball.vx *= -1;
            if (ball.y > 20 || ball.y < -20) ball.vy *= -1;
            if (ball.z > 10 || ball.z < -30) ball.vz *= -1;

            dummy.position.set(ball.x, ball.y, ball.z);
            dummy.scale.set(ball.scale, ball.scale, ball.scale);
            dummy.updateMatrix();
            instance.setMatrixAt(i, dummy.matrix);
        });
        instance.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <sphereGeometry args={[1, 32, 32]}>
                    <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
                </sphereGeometry>
                <meshStandardMaterial
                    vertexColors
                    roughness={0.2}
                    metalness={0.8}
                    emissiveIntensity={0.2}
                />
            </instancedMesh>
        </group>
    );
};
