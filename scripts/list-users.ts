
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const { db } = await import("../db");
    const { users } = await import("../db/schema");

    console.log("👥 Listing All Users...\n");

    const allUsers = await db.select().from(users);

    console.log("═══════════════════════════════════════");
    console.log(`Total Users: ${allUsers.length}\n`);

    for (const user of allUsers) {
        const hasPassword = user.password ? '🔒' : '❌';
        const isBot = user.isBot ? '🤖' : '  ';
        const plan = user.plan === 'premium' ? '💎' : '  ';

        console.log(`${hasPassword} ${isBot} ${plan} ${user.name?.padEnd(20)} | ${user.email?.padEnd(30)} | ID: ${user.id.substring(0, 8)}...`);
    }

    console.log("\n═══════════════════════════════════════");
    console.log("Legend:");
    console.log("🔒 = Has password");
    console.log("🤖 = Bot account");
    console.log("💎 = Premium user");

    process.exit(0);
}

main().catch(console.error);
