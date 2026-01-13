'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Billboard, Float } from '@react-three/drei';
import * as THREE from 'three';

export const BeachBackground = () => {
    // Load Textures
    const palmTex = useTexture('/assets/sprites/palm_tree.png');
    const chairTex = useTexture('/assets/sprites/beach_chair.png');

    // Generate Objects around the board
    const objects = useMemo(() => {
        const items = [];
        // Palm Trees
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 25 + Math.random() * 30; // 25-55 units away
            items.push({
                id: `palm-${i}`,
                type: 'palm',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                scale: 3 + Math.random() * 2
            });
        }
        // Chairs
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 10; // Closer
            items.push({
                id: `chair-${i}`,
                type: 'chair',
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                rot: Math.random() * Math.PI * 2,
                scale: 1.5
            });
        }
        return items;
    }, []);

    return (
        <group>
            {/* Sunny Sky & Fog */}
            <fog attach="fog" args={['#87CEEB', 20, 120]} />
            <ambientLight intensity={0.8} color="#FFD700" />
            <directionalLight position={[50, 100, 50]} intensity={1.5} castShadow />

            {/* Sun */}
            <mesh position={[0, 60, -100]}>
                <circleGeometry args={[15, 32]} />
                <meshBasicMaterial color="#FDB813" />
            </mesh>

            {/* Ocean (Far) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, -100]}>
                <planeGeometry args={[500, 200]} />
                <meshStandardMaterial color="#006994" roughness={0.1} metalness={0.5} />
            </mesh>

            {/* Sand Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#F4A460" roughness={1} />
            </mesh>

            {/* Objects */}
            {objects.map((obj) => (
                <BeachObject key={obj.id} data={obj} palmTex={palmTex} chairTex={chairTex} />
            ))}

            {/* Beach Ball (Bouncing) */}
            <Float speed={5} rotationIntensity={2} floatIntensity={5}>
                <mesh position={[10, 2, 10]}>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshStandardMaterial color="white" map={null} />
                    {/* Add stripes via multiple meshes or shader? Just simple colored sphere for now */}
                    <meshStandardMaterial color="red" />
                </mesh>
                {/* Multi-colored ball trick: nested meshes slightly larger/smaller? 
                     Or just a red ball. Red ball is fine. */}
            </Float>
        </group>
    );
};

const BeachObject = ({ data, palmTex, chairTex }: { data: any, palmTex: THREE.Texture, chairTex: THREE.Texture }) => {
    const ref = useRef<THREE.Group>(null);

    // Wind Sway for Palms
    useFrame((state) => {
        if (data.type === 'palm' && ref.current) {
            ref.current.rotation.z = Math.sin(state.clock.elapsedTime + data.x) * 0.05;
        }
    });

    return (
        <group ref={ref} position={[data.x, 0, data.z]}>
            {data.type === 'palm' && (
                <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                    <mesh position={[0, data.scale, 0]} scale={[data.scale * 3, data.scale * 3, 1]}>
                        <planeGeometry />
                        <meshBasicMaterial map={palmTex} transparent side={THREE.DoubleSide} alphaTest={0.5} />
                    </mesh>
                </Billboard>
            )}

            {data.type === 'chair' && (
                <Billboard follow={false} lockX={false} lockY={false} lockZ={false}>
                    <mesh position={[0, 1, 0]} scale={[data.scale, data.scale, 1]} rotation={[0, data.rot, 0]}>
                        {/* Chair needs to be upright? Billboard follows camera. 
                             If we want it sitting on ground, Billboard might look weird if looking down.
                             But for now, "Cardboard Cutout" style. */}
                        <planeGeometry />
                        <meshBasicMaterial map={chairTex} transparent side={THREE.DoubleSide} alphaTest={0.5} />
                    </mesh>
                </Billboard>
            )}
        </group>
    );
};
