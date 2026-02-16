
import { db } from "@/db";
import { games } from "@/db/schema";
import { eq, ne } from "drizzle-orm";

async function main() {
    console.log("🔥 STARTING EMERGENCY GAME RESET 🔥");

    try {
        // Find all active games
        const activeGames = await db.select().from(games).where(eq(games.isFinished, false));
        console.log(`Found ${activeGames.length} active games.`);

        if (activeGames.length > 0) {
            // Update all to finished
            await db.update(games)
                .set({
                    isFinished: true,
                    winnerId: null // No winner, just end it
                })
                .where(eq(games.isFinished, false));

            console.log("✅ All active games have been force-finished.");
        } else {
            console.log("No active games found.");
        }

    } catch (error) {
        console.error("❌ Error during reset:", error);
    }

    process.exit(0);
}

main();
