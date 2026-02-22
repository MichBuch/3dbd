/**
 * cleanup-stale-games.ts
 * One-shot script: marks all unfinished PvP games not updated in the last 24 hours as 'abandoned'.
 * Run: npx tsx scripts/cleanup-stale-games.ts
 */
import 'dotenv/config';
import { db } from '../db';
import { games } from '../db/schema';
import { and, eq, lt, isNotNull } from 'drizzle-orm';

const STALE_THRESHOLD_HOURS = 24;

async function main() {
    const cutoff = new Date(Date.now() - STALE_THRESHOLD_HOURS * 60 * 60 * 1000);

    console.log(`🧹 Cleaning stale PvP games not updated since ${cutoff.toISOString()}...`);

    const result = await db
        .update(games)
        .set({
            isFinished: true,
            status: 'abandoned',
            endedAt: new Date(),
        })
        .where(
            and(
                eq(games.isFinished, false),
                eq(games.mode, 'pvp'),
                lt(games.updatedAt, cutoff),
                isNotNull(games.blackPlayerId),   // Ensure it's actually a PvP game
            )
        )
        .returning({ id: games.id });

    console.log(`✅ Marked ${result.length} stale game(s) as abandoned:`);
    result.forEach(g => console.log(`  - ${g.id}`));
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
});
