import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Pillar } from './Pillar';
import { Bead } from './Bead';

export const Board = () => {
    const { board, dropBead, theme } = useGameStore();

    // Fixed spacing settings for now, can be added to store if needed
    const stickSpacing = 2.5;

    // Calculate positions efficiently
    const pillars = useMemo(() => {
        const items = [];
        const offset = (3 * stickSpacing) / 2;

        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                items.push({
                    x,
                    y,
                    posX: x * stickSpacing - offset,
                    posZ: y * stickSpacing - offset,
                });
            }
        }
        return items;
    }, [stickSpacing]);

    return (
        <group>
            {/* Board Base - Moved up to touch pillars properly */}
            <mesh position={[0, -0.25, 0]} receiveShadow>
                <boxGeometry args={[stickSpacing * 4 + 1, 0.5, stickSpacing * 4 + 1]} />
                <meshStandardMaterial color={theme.base} />
            </mesh>

            {/* Pillars and Beads */}
            {pillars.map((p) => (
                <group key={`${p.x}-${p.y}`}>
                    <Pillar
                        x={p.x}
                        y={p.y}
                        // Pillars start at y=0. Height=4 means center is at y=2.
                        position={[p.posX, 0, p.posZ]}
                        height={4}
                        onDrop={dropBead}
                        beads={board[p.x][p.y]}
                    />

                    {/* Render stack of beads for this pillar */}
                    {board[p.x][p.y].map((player, zIndex) => (
                        player ? (
                            <Bead
                                key={zIndex}
                                position={[p.posX, zIndex * 0.8 + 0.5, p.posZ]} // 0.8 spacing, 0.5 initial offset
                                color={player === 'white' ? theme.white : theme.black}
                                player={player}
                            />
                        ) : null
                    ))}
                </group>
            ))}
        </group>
    );
};
