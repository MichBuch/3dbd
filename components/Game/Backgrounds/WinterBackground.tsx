'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export const WinterBackground = () => {
    // Snowfall Logic
    const count = 1000;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            // Falling down logic
            particle.my -= speed * 10;
            if (particle.my < -50) particle.my = 50; // Reset height check

            // Update dummy position
            // Simple falling: Y goes down. X/Z drift.
            dummy.position.set(
                xFactor + Math.cos(t) * 5,
                yFactor + particle.my, // Falling
                zFactor + Math.sin(t) * 5
            );
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    // Trees (Snowy Pines)
    const trees = useMemo(() => {
        const items = [];
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 30 + Math.random() * 50;
            items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, s: 1 + Math.random() });
        }
        return items;
    }, []);

    return (
        <group>
            <fog attach="fog" args={['#E0FFFF', 20, 100]} />
            <ambientLight intensity={0.8} color="#E0FFFF" />
            <directionalLight position={[10, 20, 10]} intensity={1} color="white" />

            {/* Snow Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="white" roughness={0.1} />
            </mesh>

            {/* Snowfall */}
            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <dodecahedronGeometry args={[0.2, 0]} />
                <meshBasicMaterial color="white" transparent opacity={0.8} />
            </instancedMesh>

            {/* Trees */}
            {trees.map((t, i) => (
                <group key={i} position={[t.x, -2, t.z]} scale={[t.s, t.s, t.s]}>
                    <mesh position={[0, 1, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 2]} />
                        <meshStandardMaterial color="#3E2723" />
                    </mesh>
                    <mesh position={[0, 3, 0]}>
                        <coneGeometry args={[2, 4, 8]} />
                        <meshStandardMaterial color="white" /> {/* Snow covered */}
                    </mesh>
                    <mesh position={[0, 5, 0]}>
                        <coneGeometry args={[1.5, 3, 8]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                </group>
            ))}
        </group>
    );
};
