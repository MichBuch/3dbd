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

    // Generate Snowflake Texture
    const snowflakeTexture = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255,255,255,0.8)';
        ctx.shadowBlur = 4;

        ctx.translate(32, 32);
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 28);
            ctx.stroke();

            // Branches
            ctx.beginPath();
            ctx.moveTo(0, 15);
            ctx.lineTo(10, 22);
            ctx.moveTo(0, 15);
            ctx.lineTo(-10, 22);
            ctx.stroke();

            ctx.rotate(Math.PI / 3);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, []);

    // Initialize Particles
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            // Closer distribution: Concentration near 0
            // Mix of close (board) and far (atmosphere)
            // Previous was -100 to 100. Let's do -30 to 30 for 60% of flakes, and wider for others.
            const r = Math.random();
            const range = r > 0.4 ? 25 : 80;

            const speed = 0.05 + Math.random() * 0.15; // Faster variability
            const xFactor = (Math.random() - 0.5) * 2 * range;
            const yFactor = -20 + Math.random() * 50;
            const zFactor = (Math.random() - 0.5) * 2 * range;

            // Random spin speed
            const spin = (Math.random() - 0.5) * 0.05;

            temp.push({ t, speed, xFactor, yFactor, zFactor, my: yFactor, mx: 0, spin });
        }
        return temp;
    }, [count]);

    useFrame((state, delta) => {
        const instance = mesh.current;
        if (!instance) return;

        // Dynamic wind based on Theme Speed
        const windX = (speedMult * 2) * delta;
        const fallSpeed = (speedMult * 0.8 + 1) * delta;

        particles.forEach((particle, i) => {
            let { xFactor, zFactor } = particle;

            particle.t += (speedMult * delta) + particle.spin;

            // Falling
            particle.my -= particle.speed * 20 * fallSpeed;

            // Wind
            particle.mx += windX;

            // Reset loop
            if (particle.my < -20) {
                particle.my = 30;
                particle.mx = 0;
                particle.mx = (Math.random() - 0.5) * 5;
            }

            // Wiggle
            const wiggle = Math.cos(particle.t) * 1.5;

            dummy.position.set(
                xFactor + particle.mx + wiggle,
                particle.my,
                zFactor + Math.sin(particle.t) * 0.5
            );

            // Scale flakes: Larger and varying
            const s = 0.4 + Math.sin(particle.t * 1324) * 0.2; // 0.2 to 0.6 range
            dummy.scale.set(s, s, s);

            // Rotate flakes to tumble
            dummy.rotation.set(
                particle.t * 0.5,
                particle.t * 0.3,
                particle.t * 0.1
            );

            dummy.updateMatrix();
            instance.setMatrixAt(i, dummy.matrix);
        });
        instance.instanceMatrix.needsUpdate = true;
    });

    // Trees (Snowy Pines) - Keep mostly same, maybe pull in tighter?
    const trees = useMemo(() => {
        const items = [];
        const treeCount = density === 'high' ? 40 : 20;
        for (let i = 0; i < treeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 25 + Math.random() * 50; // Closer trees: 25-75 range
            items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, s: 1 + Math.random() });
        }
        return items;
    }, [density]);

    // Fog & Light adjustments
    const fogDensity = 150 - (blizzardIntensity * 100);
    const lightInt = 1.0 - (blizzardIntensity * 0.5);

    return (
        <group>
            <fog attach="fog" args={['#E0FFFF', 5, fogDensity]} />
            <ambientLight intensity={0.6} color="#E0FFFF" />
            <directionalLight position={[10, 20, 10]} intensity={lightInt} color="white" />

            {/* Snow Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="white" roughness={0.1} />
            </mesh>

            {/* Snowfall */}
            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial
                    map={snowflakeTexture}
                    transparent
                    opacity={0.9}
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                    emissive="white"
                    emissiveIntensity={0.2}
                />
            </instancedMesh>

            {/* Trees */}
            {trees.map((t, i) => (
                <group key={i} position={[t.x, -5, t.z]} scale={[t.s, t.s, t.s]}>
                    <mesh position={[0, 1, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 2]} />
                        <meshStandardMaterial color="#3E2723" />
                    </mesh>
                    <mesh position={[0, 3, 0]}>
                        <coneGeometry args={[2, 4, 8]} />
                        <meshStandardMaterial color="white" />
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
