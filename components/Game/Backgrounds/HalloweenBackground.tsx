'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Billboard, Float } from '@react-three/drei';
import * as THREE from 'three';

export const HalloweenBackground = () => {
    const pumpkinTex = useTexture('/assets/sprites/pumpkin.png');
    const ghostTex = useTexture('/assets/sprites/ghost.png');
    const batTex = useTexture('/assets/sprites/bat.png');

    const objects = useMemo(() => {
        const items = [];
        // Pumpkins (Ground)
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 25;
            items.push({ id: `pump-${i}`, type: 'pumpkin', x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, scale: 1 + Math.random() });
        }
        // Ghosts (Floating)
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 30;
            items.push({ id: `ghost-${i}`, type: 'ghost', x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, scale: 2 + Math.random() });
        }
        // Bats (Flying)
        for (let i = 0; i < 15; i++) {
            // Bats orbit
            items.push({ id: `bat-${i}`, type: 'bat', offset: Math.random() * Math.PI * 2, radius: 20 + Math.random() * 20, speed: 0.5 + Math.random() });
        }
        return items;
    }, []);

    return (
        <group>
            {/* Spooky Atmosphere */}
            <fog attach="fog" args={['#2a0a2a', 10, 80]} />
            <ambientLight intensity={0.1} color="#4b0082" />
            <pointLight position={[0, 10, 0]} intensity={1} color="#ff6600" distance={50} />

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#1a051a" roughness={1} />
            </mesh>

            {/* Objects */}
            {objects.map((obj) => (
                <HalloweenObject key={obj.id} data={obj} tex={{ pumpkin: pumpkinTex, ghost: ghostTex, bat: batTex }} />
            ))}
        </group>
    );
};

const HalloweenObject = ({ data, tex }: { data: any, tex: any }) => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;
        const time = state.clock.elapsedTime;

        if (data.type === 'ghost') {
            // Float up and down
            ref.current.position.y = Math.sin(time * 2 + data.id) * 1 + 2; // Base height 2
            // Drift slightly
            ref.current.position.x = data.x + Math.sin(time * 0.5) * 2;
        } else if (data.type === 'bat') {
            // Orbit
            const angle = time * data.speed + data.offset;
            ref.current.position.x = Math.cos(angle) * data.radius;
            ref.current.position.z = Math.sin(angle) * data.radius;
            ref.current.position.y = 10 + Math.sin(time * 3) * 2; // Height 10 +/- 2
            ref.current.rotation.y = -angle; // Face direction of travel
        }
    });

    return (
        <group ref={ref} position={[data.x, 0, data.z]}>
            {data.type === 'pumpkin' && (
                <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                    <mesh position={[0, 0.5, 0]} scale={[data.scale, data.scale, 1]}>
                        <planeGeometry />
                        <meshBasicMaterial map={tex.pumpkin} transparent side={THREE.DoubleSide} alphaTest={0.5} />
                    </mesh>
                </Billboard>
            )}

            {data.type === 'ghost' && (
                <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                    <mesh scale={[data.scale, data.scale * 1.5, 1]}>
                        <planeGeometry />
                        <meshBasicMaterial map={tex.ghost} transparent side={THREE.DoubleSide} alphaTest={0.5} opacity={0.8} />
                    </mesh>
                </Billboard>
            )}

            {data.type === 'bat' && (
                <Billboard follow={false} lockX={false} lockY={false} lockZ={false}> {/* Face sideways? Or Billboard to camera? Bats flying should probably not billboard to camera if they orbit. They should face movement. */}
                    {/* If we disable billboard, it's just a plane. */}
                    <mesh rotation={[0, 0, 0]} scale={[3, 1.5, 1]}>
                        <planeGeometry />
                        <meshBasicMaterial map={tex.bat} transparent side={THREE.DoubleSide} alphaTest={0.5} />
                    </mesh>
                </Billboard>
            )}
        </group>
    );
};
