'use client';

import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Generic 3D Model Loader Component
 */
interface ModelLoaderProps {
    path: string;
    position?: [number, number, number];
    scale?: number | [number, number, number];
    rotation?: [number, number, number];
    animate?: 'bounce' | 'swim' | 'rotate' | 'fly' | 'none';
    speed?: number;
}

export const ModelLoader = ({
    path,
    position = [0, 0, 0],
    scale = 1,
    rotation = [0, 0, 0],
    animate = 'none',
    speed = 1
}: ModelLoaderProps) => {
    const { scene } = useGLTF(path);
    const modelRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!modelRef.current) return;
        const t = state.clock.elapsedTime * speed;

        switch (animate) {
            case 'bounce':
                modelRef.current.position.y = position[1] + Math.sin(t * 2) * 0.3;
                break;
            case 'swim':
                modelRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.5;
                modelRef.current.rotation.z = Math.sin(t * 2) * 0.1;
                break;
            case 'rotate':
                modelRef.current.rotation.y += 0.01 * speed;
                break;
            case 'fly':
                modelRef.current.position.y = position[1] + Math.sin(t) * 2;
                modelRef.current.position.x = position[0] + Math.cos(t * 0.3) * 5;
                break;
        }
    });

    return (
        <primitive
            ref={modelRef}
            object={scene.clone()}
            position={position}
            scale={scale}
            rotation={rotation}
        />
    );
};

// Beach-specific model components using actual GLB files

export const RealisticCrab = ({ position, phase }: any) => {
    return (
        <ModelLoader
            path="/models/beach/Crab.glb"
            position={position}
            scale={0.075}
            animate="bounce"
            speed={0.5 + phase}
        />
    );
};

export const RealisticSeagull = ({ position, index = 0 }: any) => {
    return (
        <ModelLoader
            path="/models/beach/Seagull.glb"
            position={position}
            scale={0.02}
            animate="fly"
            speed={0.8 + index * 0.2}
            rotation={[0, Math.PI / 2, 0]}
        />
    );
};

export const StylizedSeagull = ({ position, index = 0 }: any) => {
    return (
        <ModelLoader
            path="/models/beach/stylized_seagull_3d_model_free_download.glb"
            position={position}
            scale={0.5}
            animate="fly"
            speed={0.8 + index * 0.2}
            rotation={[0, Math.PI / 2, 0]}
        />
    );
};

export const RealisticPalmTree = ({ position, rotation = 0 }: any) => {
    return (
        <ModelLoader
            path="/models/beach/Palm tree.glb"
            position={position}
            scale={1.5}
            rotation={[0, rotation, 0]}
        />
    );
};

export const SandCastle = ({ position, rotation = 0, scale = 0.8 }: any) => {
    return (
        <ModelLoader
            path="/models/beach/Sand castle.glb"
            position={position}
            scale={scale}
            rotation={[0, rotation, 0]}
        />
    );
};

export const FlipFlops = ({ position, rotation = 0 }: any) => {
    return (
        <ModelLoader
            path="/models/beach/Flip flops.glb"
            position={position}
            scale={0.5}
            rotation={[0, rotation, Math.PI / 2]}
        />
    );
};

export const BeachUmbrellaChairs = ({ position, rotation = 0 }: any) => {
    return (
        <ModelLoader
            path="/models/beach/Umbrella and chairs.glb"
            position={position}
            scale={1.0}
            rotation={[0, rotation, 0]}
        />
    );
};

export const SeaLion = ({ position }: any) => {
    return (
        <ModelLoader
            path="/models/beach/Sea lion.glb"
            position={position}
            scale={0.5}
            rotation={[0, Math.PI / 2, 0]}
        />
    );
};

export const KillerWhale = ({ position, delay = 0 }: any) => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;
        const t = (state.clock.elapsedTime + delay) * 0.4;
        const jump = Math.max(0, Math.sin(t));

        ref.current.position.y = position[1] + jump * 10;
        ref.current.rotation.z = jump * Math.PI * 0.3;
    });

    return (
        <group ref={ref} position={position}>
            <ModelLoader
                path="/models/beach/Killer Whale.glb"
                position={[0, 0, 0]}
                scale={2}
                rotation={[0, Math.PI / 2, 0]}
            />
        </group>
    );
};

export const SpermWhale = ({ position, delay = 0 }: any) => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;
        const t = (state.clock.elapsedTime + delay) * 0.3;
        const jump = Math.max(0, Math.sin(t));

        ref.current.position.y = position[1] + jump * 12;
        ref.current.rotation.z = jump * Math.PI * 0.25;
    });

    return (
        <group ref={ref} position={position}>
            <ModelLoader
                path="/models/beach/Sperm Whale.glb"
                position={[0, 0, 0]}
                scale={3}
                rotation={[0, Math.PI / 2, 0]}
            />
        </group>
    );
};

// Preload all beach models 
useGLTF.preload('/models/beach/Crab.glb');
useGLTF.preload('/models/beach/Seagull.glb');
useGLTF.preload('/models/beach/stylized_seagull_3d_model_free_download.glb');
useGLTF.preload('/models/beach/Palm tree.glb');
useGLTF.preload('/models/beach/Sand castle.glb');
useGLTF.preload('/models/beach/Flip flops.glb');
useGLTF.preload('/models/beach/Umbrella and chairs.glb');
useGLTF.preload('/models/beach/Sea lion.glb');
useGLTF.preload('/models/beach/Killer Whale.glb');
useGLTF.preload('/models/beach/Sperm Whale.glb');
