'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

const CUBE_COLORS = [
    '#ffffff', // White
    '#ffff00', // Yellow
    '#0000ff', // Blue
    '#00ff00', // Green
    '#ff0000', // Red
    '#ffa500', // Orange
];

export const RubiksCubeBackground = () => {
    const { preferences } = useGameStore();
    const count = 400;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const cubes = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 80;
            const y = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 40 - 25;

            const rotationSpeed = {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01,
            };

            const colorIndex = Math.floor(Math.random() * CUBE_COLORS.length);
            temp.push({ x, y, z, rotationSpeed, color: CUBE_COLORS[colorIndex] });
        }
        return temp;
    }, [count]);

    useEffect(() => {
        if (!mesh.current) return;
        cubes.forEach((cube, i) => {
            const color = new THREE.Color(cube.color);
            mesh.current!.setColorAt(i, color);

            dummy.position.set(cube.x, cube.y, cube.z);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
        mesh.current.instanceColor!.needsUpdate = true;
    }, [cubes, dummy]);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        if (preferences.reduceMotion) return;

        cubes.forEach((cube, i) => {
            dummy.position.set(cube.x, cube.y, cube.z);
            const time = state.clock.elapsedTime;
            dummy.rotation.x = time * cube.rotationSpeed.x * 10;
            dummy.rotation.y = time * cube.rotationSpeed.y * 10;
            dummy.position.y += Math.sin(time + i) * 0.02;
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial
                metalness={0.2}
                roughness={0.1}
            />
        </instancedMesh>
    );
};
