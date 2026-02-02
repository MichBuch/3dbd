
import { loadEnvConfig } from '@next/env';
import { eq } from "drizzle-orm";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const { db } = await import("../db");
    const { games, challenges, chats } = await import("../db/schema");

    const gameId = '968505bb-fb16-4b16-80c2-e2be4ba675cc';

    console.log(`🗑️  Deleting corrupted game: ${gameId}\n`);

    // Delete related records first
    console.log("Deleting challenges...");
    await db.delete(challenges).where(eq(challenges.gameId, gameId));

    console.log("Deleting chats...");
    await db.delete(chats).where(eq(chats.gameId, gameId));

    console.log("Deleting game...");
    await db.delete(games).where(eq(games.id, gameId));

    console.log("\n✅ Game and related data deleted successfully!");
    console.log("\n👉 Both players should now create a NEW game to test the fixes.");
    console.log("   The 'mode=pvp' fix is now live, so new PVP games will be tagged correctly.");

    process.exit(0);
}

main().catch(console.error);
