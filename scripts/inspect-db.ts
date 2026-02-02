
import { loadEnvConfig } from '@next/env';
import { desc, eq } from "drizzle-orm";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    // Dynamic import to ensure ENV is loaded first
    const { db } = await import("../db");
    const { games, users } = await import("../db/schema");

    console.log("🔍 Inspecting 3DBD Database for Recent Games...");

    const recentGames = await db.query.games.findMany({
        orderBy: [desc(games.updatedAt)],
        limit: 5,
        with: {
            whitePlayer: true,
            blackPlayer: true
        }
    });

    if (recentGames.length === 0) {
        console.log("❌ No games found.");
        process.exit(0);
    }

    for (const game of recentGames) {
        console.log(`\n------------------------------------------------`);
        console.log(`🆔 Game ID: ${game.id}`);
        console.log(`📅 Updated: ${game.updatedAt?.toLocaleString()}`);
        console.log(`👤 Players: ${game.whitePlayer?.name || 'Unknown'} (White) vs ${game.blackPlayer?.name || 'None'} (Black)`);

        // Inspect State
        const state = game.state as any;
        if (!state) {
            console.log("⚠️ State: NULL/Empty");
            continue;
        }

        const moveCount = state.moveHistory?.length || 0;
        console.log(`moves: ${moveCount}`);

        if (moveCount > 0) {
            console.log(`🕹️ LAST MOVE: Player ${state.currentPlayer} (Index ${moveCount})`);
            // Check for potential corruption (phantom board? mismatch?)
            // We can't easily visualize 3D board here, but we can verify consistency.
            if (moveCount > 0 && Array.isArray(state.board)) {
                // basic check
                console.log("✅ Board data exists.");
            }
        } else {
            console.log("EMPTY BOARD (New/Reset Game)");
        }

        console.log(`🏆 Winner ID: ${game.winnerId || 'None'}`);
        console.log(`🏁 Finished: ${game.isFinished}`);
    }
    console.log(`\n------------------------------------------------`);
    process.exit(0);
}

main().catch(console.error);
