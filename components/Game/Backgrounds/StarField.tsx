'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const StarField = () => {
    const { preferences } = useGameStore();
    const count = 3000;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate random positions
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.05 + Math.random() / 50; // Faster base speed
            const x = Math.random() * 200 - 100; // Wider
            const y = Math.random() * 200 - 100;
            const z = Math.random() * 200 - 100;

            temp.push({ t, factor, speed, x, y, z, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame((state, delta) => {
        if (preferences.reduceMotion || !mesh.current) return;

        particles.forEach((particle, i) => {
            let { t, factor, speed, x, y, z } = particle;

            // Move particles (Warp speed)
            z += speed * 100 * delta; // Much faster
            if (z > 50) z = -150; // Loop further back

            particle.z = z;

            dummy.position.set(x, y, z);
            dummy.scale.setScalar(0.1 + Math.random() * 0.2); // Twinkle size
            dummy.lookAt(0, 0, 100);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
        // Slow rotation of entire field
        mesh.current.rotation.z += 0.02 * delta;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </instancedMesh>
    );
};
