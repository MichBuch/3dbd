import { useRef, useState } from 'react';
import { Player, useGameStore } from '@/store/gameStore';

interface PillarProps {
    x: number;
    y: number;
    position: [number, number, number];
    height: number;
    onDrop: (x: number, y: number) => void;
    beads: (Player | null)[];
}

export const Pillar = ({ x, y, position, height, onDrop, beads }: PillarProps) => {
    const [hovered, setHovered] = useState(false);
    const { preferences } = useGameStore();

    const pillarRadius = 0.1 * preferences.boardScale;
    const baseRadius = 0.4 * preferences.boardScale;

    return (
        <group position={position}>
            {/* The Pillar Rod */}
            <mesh
                position={[0, height / 2, 0]}
                onClick={(e) => {
                    e.stopPropagation();
                    onDrop(x, y);
                }}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <cylinderGeometry args={[pillarRadius, pillarRadius, height, 16]} />
                <meshStandardMaterial color={hovered ? "#66aaff" : "#888888"} />
            </mesh>

            {/* Base of Pillar (optional visual) */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[baseRadius, baseRadius, 0.2, 32]} />
                <meshStandardMaterial color="#444" />
            </mesh>
        </group>
    );
};
