import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Pillar } from './Pillar';
import { Bead } from './Bead';

export const Board = () => {
    const { board, dropBead, theme, winningCells, preferences } = useGameStore();

    // Use board scale from preferences
    const baseSpacing = 2.5;
    const stickSpacing = baseSpacing * preferences.boardScale;

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

    const beadSize = 0.4 * preferences.boardScale;
    const beadSpacing = 0.8 * preferences.boardScale;

    return (
        <group>
            {/* Board Base - Scaled appropriately */}
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
                        position={[p.posX, 0, p.posZ]}
                        height={3.35}
                        onDrop={dropBead}
                        beads={board[p.x][p.y]}
                    />

                    {/* Render stack of beads for this pillar */}
                    {board[p.x][p.y].map((player, zIndex) => (
                        player ? (
                            <Bead
                                key={zIndex}
                                position={[p.posX, zIndex * beadSpacing + 0.5, p.posZ]}
                                color={player === 'white' ? theme.white : theme.black}
                                player={player}
                                isWinning={winningCells.includes(`${p.x}-${p.y}-${zIndex}`)}
                                scale={preferences.boardScale}
                                skin={preferences.beadSkin}
                            />
                        ) : null
                    ))}
                </group>
            ))}
        </group>
    );
};
