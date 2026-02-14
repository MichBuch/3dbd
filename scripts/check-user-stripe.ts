
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    console.log("Checking Users Stripe Data...\n");

    const allUsers = await db.select().from(users);

    for (const user of allUsers) {
        if (user.plan === 'premium') {
            console.log(`User: ${user.name} (${user.email})`);
            console.log(`Plan: ${user.plan}`);
            console.log(`Stripe Customer ID: ${user.stripeCustomerId || 'MISSING'}`);
            console.log('---');
        }
    }

    process.exit(0);
}

main().catch(console.error);
