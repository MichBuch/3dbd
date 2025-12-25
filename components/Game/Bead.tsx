import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import * as THREE from 'three';
import { Player } from '@/store/gameStore';

interface BeadProps {
    position: [number, number, number];
    color: string;
    player: Player;
    isWinning?: boolean;
}

export const Bead = ({ position, color, player, isWinning = false }: BeadProps) => {
    const meshRef = useRef<Mesh>(null);
    const targetY = position[1];
    const startY = targetY + 10; // Drop from height
    // We use a ref to track if we've initialized the position
    const initialized = useRef(false);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        if (!initialized.current) {
            meshRef.current.position.set(position[0], startY, position[2]);
            initialized.current = true;
        }

        // Lerp to target
        // Simple easing: move 10% of the distance per frame (adjusted for delta for some frame independence)
        // For physics feel, we can just lerp.
        const currentY = meshRef.current.position.y;
        if (Math.abs(currentY - targetY) > 0.01) {
            meshRef.current.position.y = THREE.MathUtils.lerp(currentY, targetY, 10 * delta);
        } else {
            meshRef.current.position.y = targetY; // Snap to finish
        }
    });

    return (
        <mesh ref={meshRef} position={position} castShadow receiveShadow>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshStandardMaterial
                color={color}
                roughness={isWinning ? 0.2 : 0.1}
                metalness={isWinning ? 0.8 : 0.5}
                emissive={isWinning ? color : undefined}
                emissiveIntensity={isWinning ? 0.5 : 0}
            />
        </mesh>
    );
};
