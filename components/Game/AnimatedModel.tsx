import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

interface AnimatedModelProps {
    path: string;
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    animationName?: string; // e.g. "Walk", "Run", "Idle"
    speed?: number;
}

export const AnimatedModel = ({
    path,
    scale = 1,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    animationName,
    speed = 1
}: AnimatedModelProps) => {
    const group = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF(path);
    // Clone scene to allow multiple instances with independent skeletons
    const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { actions, names } = useAnimations(animations, group);

    useEffect(() => {
        // Default to the first animation if specific one not found/provided
        const actionToPlay = animationName && actions[animationName]
            ? actions[animationName]
            : actions[names[0]];

        if (actionToPlay) {
            actionToPlay.reset().fadeIn(0.5).play();
            actionToPlay.timeScale = speed;
        }

        return () => {
            actionToPlay?.fadeOut(0.5);
        };
    }, [animationName, actions, names, speed]);

    return (
        <group ref={group} position={position} rotation={rotation} dispose={null}>
            <primitive object={clone} scale={scale} />
        </group>
    );
};

// Preload to avoid pop-in
useGLTF.preload('/assets/models/grey_alien_idle.glb');
