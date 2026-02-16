import { db } from "@/db";
import { games, challenges } from "@/db/schema";
import { eq } from "drizzle-orm";

async function emergencyCleanup() {
    console.log("🚨 EMERGENCY CLEANUP STARTING 🚨");
    console.log("This will clear ALL active games and challenges\n");

    try {
        // 1. Mark all unfinished games as abandoned
        const activeGames = await db.select().from(games).where(eq(games.isFinished, false));
        console.log(`Found ${activeGames.length} active games`);

        if (activeGames.length > 0) {
            await db.update(games)
                .set({
                    isFinished: true,
                    winnerId: null,
                    updatedAt: new Date()
                })
                .where(eq(games.isFinished, false));

            console.log(`✅ Marked ${activeGames.length} games as finished`);
        }

        // 2. Clear all pending challenges
        const pendingChallenges = await db.select()
            .from(challenges)
            .where(eq(challenges.status, 'pending'));

        console.log(`Found ${pendingChallenges.length} pending challenges`);

        if (pendingChallenges.length > 0) {
            await db.update(challenges)
                .set({
                    status: 'declined'
                })
                .where(eq(challenges.status, 'pending'));

            console.log(`✅ Cleared ${pendingChallenges.length} pending challenges`);
        }

        console.log("\n✅ CLEANUP COMPLETE");
        console.log("All users should now be able to start fresh games");

    } catch (error) {
        console.error("❌ Error during cleanup:", error);
        process.exit(1);
    }

    process.exit(0);
}

emergencyCleanup();
