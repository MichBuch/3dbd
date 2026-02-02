
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const { like } = await import("drizzle-orm");

    console.log("👥 Listing Guest Users (with tracking info)...\n");

    const guests = await db.select().from(users).where(like(users.email, '%@temp.com%'));

    console.log(`Total Guest Users: ${guests.length}\n`);
    console.log("═══════════════════════════════════════════════════════════════════");

    for (const user of guests) {
        const archived = user.isArchived ? '📦' : '  ';
        const lastSeen = user.lastSeen ? user.lastSeen.toLocaleDateString() : 'Never';
        const location = user.country && user.city ? `${user.city}, ${user.country}` :
            user.country || 'Unknown';
        const ip = user.ipAddress || 'N/A';

        console.log(`${archived} ${user.name?.padEnd(20)} | IP: ${ip.padEnd(15)} | ${location.padEnd(20)} | Last: ${lastSeen}`);
    }

    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("\n📦 = Archived");

    process.exit(0);
}

main().catch(console.error);
