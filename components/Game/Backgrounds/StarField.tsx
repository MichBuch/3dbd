'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const StarField = () => {
    const { preferences } = useGameStore();

    // Dynamic Count based on density
    const count = useMemo(() => {
        switch (preferences.themeDensity) {
            case 'low': return 4000;
            case 'high': return 25000;
            default: return 10000;
        }
    }, [preferences.themeDensity]);

    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate random positions
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 25000; i++) { // Increase generation cap
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.2 + Math.random() / 10; // Much faster base speed
            const x = (Math.random() - 0.5) * 140; // Tighter tunnel (-70 to 70)
            const y = (Math.random() - 0.5) * 100; // Tighter height (-50 to 50)
            const z = Math.random() * 200 - 100;

            temp.push({ t, factor, speed, x, y, z, mx: 0, my: 0 });
        }
        return temp;
    }, []); // One-time gen

    useFrame((state, delta) => {
        if (!mesh.current) return;

        // Apply Speed Multiplier
        const speedMult = preferences.themeSpeed || 1;
        // Warp Effect: Stretch stars into lines based on speed
        // If speed is 0.1 (Halt), stretch is 0.
        // If speed is 10 (Max), stretch is huge (e.g. 50 units).
        const warpStretch = (speedMult - 0.5) * 5;
        const validStretch = Math.max(0, warpStretch); // Don't shrink below 0

        particles.slice(0, count).forEach((particle, i) => {
            let { t, factor, speed, x, y, z } = particle;

            // Move particles (Warp speed)
            // If speedMult is very low (0.1), movement is almost static.
            z += speed * 100 * speedMult * delta;

            // Loop the tunnel
            if (z > 50) z = -150 - validStretch; // Spawn further back if stretched to avoid popping

            particle.z = z;

            dummy.position.set(x, y, z);

            // SCALE: X/Y is thickness, Z is Length (Warp Streak)
            // Base size 0.3-0.7
            const size = 0.2 + Math.random() * 0.3;
            dummy.scale.set(size, size, size + validStretch);

            dummy.lookAt(0, 0, 100); // Look at camera? Or look forward?
            // Actually, for streaks, we want them parallel to camera Z.
            // lookAt(0,0,100) points them towards camera if they are in front?
            // Simple rotation [0,0,0] aligns with world.
            // If we use sphere, scaling Z makes it an ellipsoid.
            dummy.rotation.set(0, 0, 0);

            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
        mesh.current.count = count; // Limit visible count
        mesh.current.rotation.z += 0.02 * delta;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, 10000]} frustumCulled={false}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </instancedMesh>
    );
};
