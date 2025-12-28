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
    scale?: number;
}

export const Bead = ({ position, color, player, isWinning = false, scale = 1 }: BeadProps) => {
    const meshRef = useRef<Mesh>(null);
    const targetY = position[1];
    const startY = targetY + 10; // Drop from height
    const initialized = useRef(false);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        if (!initialized.current) {
            meshRef.current.position.set(position[0], startY, position[2]);
            initialized.current = true;
        }

        // Lerp to target
        const currentY = meshRef.current.position.y;
        if (Math.abs(currentY - targetY) > 0.01) {
            meshRef.current.position.y = THREE.MathUtils.lerp(currentY, targetY, 10 * delta);
        } else {
            meshRef.current.position.y = targetY; // Snap to finish
        }
    });

    const beadRadius = 0.35 * scale;

    // Darken non-winning beads by 10%, brighten winning beads by 20%
    const adjustedColor = isWinning
        ? new THREE.Color(color).multiplyScalar(1.2) // 20% brighter
        : new THREE.Color(color).multiplyScalar(0.9); // 10% darker

    return (
        <mesh ref={meshRef} position={position} castShadow receiveShadow>
            <sphereGeometry args={[beadRadius, 32, 32]} />
            <meshStandardMaterial
                color={adjustedColor}
                roughness={isWinning ? 0.1 : 0.3}
                metalness={isWinning ? 0.9 : 0.4}
                emissive={isWinning ? color : undefined}
                emissiveIntensity={isWinning ? 0.8 : 0}
            />
        </mesh>
    );
};
