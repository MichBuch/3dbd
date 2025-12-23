import { useRef, useState } from 'react';
import { Player } from '@/store/gameStore';

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
                <cylinderGeometry args={[0.1, 0.1, height, 16]} />
                <meshStandardMaterial color={hovered ? "#66aaff" : "#888888"} />
            </mesh>

            {/* Base of Pillar (optional visual) */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
                <meshStandardMaterial color="#444" />
            </mesh>
        </group>
    );
};
