
import { loadEnvConfig } from '@next/env';
import { eq } from "drizzle-orm";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const bcrypt = await import('bcryptjs');

    console.log("🔍 Checking Green user...\n");

    const green = await db.select().from(users).where(eq(users.email, 'green@3dbd.com'));

    if (green.length === 0) {
        console.log("❌ Green user not found!");
        process.exit(1);
    }

    const user = green[0];
    console.log(`✅ Found: ${user.name} (${user.email})`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`🔑 Password Hash: ${user.password?.substring(0, 20)}...`);

    // Test passwords
    console.log("\n🧪 Testing passwords:");

    const passwords = ['green', 'Gr0Dt', 'gr0dt', 'password123'];

    for (const pwd of passwords) {
        const match = user.password ? await bcrypt.default.compare(pwd, user.password) : false;
        console.log(`  '${pwd}': ${match ? '✅ MATCH' : '❌ no match'}`);;
    }

    process.exit(0);
}

main().catch(console.error);
