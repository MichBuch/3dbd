
import { loadEnvConfig } from '@next/env';
import { eq } from "drizzle-orm";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const { db } = await import("../db");
    const { games } = await import("../db/schema");

    const gameId = '968505bb-fb16-4b16-80c2-e2be4ba675cc';

    console.log(`🔍 Inspecting Game: ${gameId}\n`);

    const game = await db.select().from(games).where(eq(games.id, gameId));

    if (game.length === 0) {
        console.log("❌ Game not found!");
        process.exit(1);
    }

    const g = game[0];

    console.log("═══════════════════════════════════════");
    console.log("📋 GAME METADATA");
    console.log("═══════════════════════════════════════");
    console.log(`ID: ${g.id}`);
    console.log(`White Player ID: ${g.whitePlayerId}`);
    console.log(`Black Player ID: ${g.blackPlayerId}`);
    console.log(`Winner ID: ${g.winnerId || 'None'}`);
    console.log(`Is Finished: ${g.isFinished}`);
    console.log(`Mode: ${g.mode}`);
    console.log(`Theme: ${g.theme}`);
    console.log(`White Score: ${g.whiteScore}`);
    console.log(`Black Score: ${g.blackScore}`);
    console.log(`Created: ${g.createdAt}`);
    console.log(`Updated: ${g.updatedAt}`);

    console.log("\n═══════════════════════════════════════");
    console.log("🎮 FULL STATE JSON");
    console.log("═══════════════════════════════════════");
    console.log(JSON.stringify(g.state, null, 2));

    console.log("\n═══════════════════════════════════════");
    console.log("📊 STATE ANALYSIS");
    console.log("═══════════════════════════════════════");

    const state = g.state as any;
    if (state) {
        console.log(`Current Player: ${state.currentPlayer || 'N/A'}`);
        console.log(`Move History Length: ${state.moveHistory?.length || 0}`);
        console.log(`Winning Cells: ${state.winningCells?.length || 0}`);

        // Count beads on board
        if (state.board) {
            let totalBeads = 0;
            let whiteBeads = 0;
            let blackBeads = 0;

            for (let x = 0; x < 4; x++) {
                for (let y = 0; y < 4; y++) {
                    for (let z = 0; z < 4; z++) {
                        const cell = state.board[x]?.[y]?.[z];
                        if (cell === 'white') {
                            whiteBeads++;
                            totalBeads++;
                        } else if (cell === 'black') {
                            blackBeads++;
                            totalBeads++;
                        }
                    }
                }
            }

            console.log(`\n🔵 WHITE Beads on Board: ${whiteBeads}`);
            console.log(`⚫ BLACK Beads on Board: ${blackBeads}`);
            console.log(`📦 TOTAL Beads: ${totalBeads}`);
        }
    }

    process.exit(0);
}

main().catch(console.error);
