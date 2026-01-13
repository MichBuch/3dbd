'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const WinterBackground = () => {
    const { preferences } = useGameStore();

    // Theme Configs
    const speedMult = preferences.themeSpeed || 1;
    const density = preferences.themeDensity || 'medium';

    // Particle Count Logic
    const count = useMemo(() => {
        if (density === 'low') return 500;
        if (density === 'high') return 4000; // Blizzard!
        return 1500;
    }, [density]);

    // Blizzard Intensity Logic (0 to 1 based on speed)
    const blizzardIntensity = Math.min((speedMult - 1) / 9, 1); // 0 at 1x, 1 at 10x
    const isBlizzard = speedMult > 5;

    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Initialize Particles
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.05 + Math.random() * 0.1; // Base fall speed
            const xFactor = -100 + Math.random() * 200;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -100 + Math.random() * 200;
            // Randomize starting wiggle
            temp.push({ t, speed, xFactor, yFactor, zFactor, my: yFactor, mx: 0 });
        }
        return temp;
    }, [count]);

    useFrame((state, delta) => {
        const instance = mesh.current;
        if (!instance) return;

        // Dynamic wind based on Theme Speed
        // Horizontal wind increases massively with speed
        const windX = (speedMult * 2) * delta;
        const fallSpeed = (speedMult * 0.5 + 1) * delta;

        particles.forEach((particle, i) => {
            let { xFactor, zFactor } = particle;

            // Update Time for wiggles
            particle.t += speedMult * delta;

            // Falling
            particle.my -= particle.speed * 20 * fallSpeed;

            // Wind (Horizontal Drift)
            particle.mx += windX;

            // Reset loop
            if (particle.my < -50) {
                particle.my = 50;
                particle.mx = 0; // Reset wind drift
                // Respawn slightly random X to prevent "sheets" of snow
                particle.mx = (Math.random() - 0.5) * 10;
            }

            // Wiggle
            const wiggle = Math.cos(particle.t) * 0.5;

            dummy.position.set(
                xFactor + particle.mx + wiggle,
                particle.my,
                zFactor + Math.sin(particle.t) * 0.5
            );

            // Scale flakes based on intensity (Blizzard = smaller, sharper flakes?)
            // Or just keep them visible.
            const s = 1.0;
            dummy.scale.set(s, s, s);

            // Rotate flakes
            dummy.rotation.set(
                particle.t * 0.2,
                particle.t * 0.1,
                particle.t * 0.3
            );

            dummy.updateMatrix();
            instance.setMatrixAt(i, dummy.matrix);
        });
        instance.instanceMatrix.needsUpdate = true;
    });

    // Trees (Snowy Pines)
    const trees = useMemo(() => {
        const items = [];
        // More trees in high density? 
        const treeCount = density === 'high' ? 40 : 20;
        for (let i = 0; i < treeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 30 + Math.random() * 80;
            items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, s: 1 + Math.random() });
        }
        return items;
    }, [density]);

    // Dynamic Fog & Light
    // Blizzard = Whiteout (Dense Fog)
    // Clear = Soft Mist
    const fogDensity = 200 - (blizzardIntensity * 150); // 200 (clear) -> 50 (dense)
    const lightInt = 1.0 - (blizzardIntensity * 0.5); // Dimmer in storm

    return (
        <group>
            <fog attach="fog" args={['#E0FFFF', 10, fogDensity]} />
            <ambientLight intensity={0.6} color="#E0FFFF" />
            <directionalLight position={[10, 20, 10]} intensity={lightInt} color="white" />

            {/* Snow Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="white" roughness={0.1} />
            </mesh>

            {/* Snowfall */}
            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <dodecahedronGeometry args={[0.15, 0]} />
                <meshBasicMaterial color="white" transparent opacity={0.9} />
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
                    {/* Wind Shake Effect? */}
                    <mesh position={[0, 5, 0]}>
                        <coneGeometry args={[1.5, 3, 8]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                </group>
            ))}
        </group>
    );
};
