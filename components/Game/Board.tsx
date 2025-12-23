import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Pillar } from './Pillar';
import { Bead } from './Bead';
import { useControls } from 'leva';

export const Board = () => {
    const { board, dropBead } = useGameStore();

    const { stickSpacing, baseColor, whiteColor, blackColor } = useControls('Board Settings', {
        stickSpacing: { value: 2.5, min: 1.5, max: 4, step: 0.1 },
        baseColor: '#222222',
        whiteColor: '#ffffff',
        blackColor: '#333333'
    });

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
            {/* Board Base */}
            <mesh position={[0, -0.5, 0]} receiveShadow>
                <boxGeometry args={[stickSpacing * 4 + 1, 0.5, stickSpacing * 4 + 1]} />
                <meshStandardMaterial color={baseColor} />
            </mesh>

            {/* Pillars and Beads */}
            {pillars.map((p) => (
                <group key={`${p.x}-${p.y}`}>
                    <Pillar
                        x={p.x}
                        y={p.y}
                        position={[p.posX, 2, p.posZ]}
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
                                color={player === 'white' ? whiteColor : blackColor}
                                player={player}
                            />
                        ) : null
                    ))}
                </group>
            ))}
        </group>
    );
};
