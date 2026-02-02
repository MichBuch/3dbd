
import { loadEnvConfig } from '@next/env';
import { and, like, or, lt, isNull, eq } from "drizzle-orm";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const { db } = await import("../db");
    const { users } = await import("../db/schema");

    console.log("🗄️  Archiving Old Guest Accounts...\n");

    // Archive guests that:
    // - Haven't been seen in 30+ days
    // - OR have never been seen (null lastSeen)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    // Find guests to archive
    const guestsToArchive = await db.select().from(users).where(
        and(
            like(users.email, '%@temp.com%'),
            eq(users.isArchived, false),
            or(
                lt(users.lastSeen, cutoffDate),
                isNull(users.lastSeen)
            )
        )
    );

    console.log(`Found ${guestsToArchive.length} guest accounts to archive:\n`);

    if (guestsToArchive.length === 0) {
        console.log("✅ No guests to archive.");
        process.exit(0);
    }

    for (const user of guestsToArchive) {
        const lastSeenStr = user.lastSeen ? user.lastSeen.toLocaleDateString() : 'Never';
        console.log(`  - ${user.name} (${user.email}) - Last Seen: ${lastSeenStr}`);
    }

    console.log(`\n📦 Archiving ${guestsToArchive.length} accounts...`);

    // Archive them
    await db.update(users)
        .set({
            isArchived: true,
            archivedAt: new Date(),
            status: 'offline'
        })
        .where(
            and(
                like(users.email, '%@temp.com%'),
                eq(users.isArchived, false),
                or(
                    lt(users.lastSeen, cutoffDate),
                    isNull(users.lastSeen)
                )
            )
        );

    console.log("\n✅ Guest accounts archived successfully!");
    console.log(`\n📝 ${guestsToArchive.length} guests marked as archived (inactive 30+ days)`);

    process.exit(0);
}

main().catch(console.error);
