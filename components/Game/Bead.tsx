import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Player } from '@/store/gameStore';

interface BeadProps {
    position: [number, number, number];
    color: string;
    player: Player;
}

export const Bead = ({ position, color, player }: BeadProps) => {
    const meshRef = useRef<Mesh>(null);

    // Optional: Add simple animation or bobbing
    // useFrame((state) => {
    //   if (meshRef.current) {
    //       meshRef.current.rotation.y += 0.01;
    //   }
    // });

    return (
        <mesh ref={meshRef} position={position} castShadow receiveShadow>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshStandardMaterial
                color={color}
                roughness={0.1}
                metalness={0.5}
            />
        </mesh>
    );
};
