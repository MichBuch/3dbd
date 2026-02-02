
import { loadEnvConfig } from '@next/env';
import { or, like, eq } from "drizzle-orm";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const bcrypt = await import('bcryptjs');

    console.log("🔒 Updating passwords for test/bot/guest accounts to 'Gr0Dt'...\n");

    const newPassword = "Gr0Dt";
    const hashedPassword = await bcrypt.default.hash(newPassword, 10);

    // Find all test, bot, and guest accounts
    // Criteria: email contains '@3dbd.bot', '@temp.com', OR name is 'Green', 'Red', or starts with 'Guest'
    const testAccounts = await db.select().from(users).where(
        or(
            like(users.email, '%@3dbd.bot%'),
            like(users.email, '%@temp.com%'),
            eq(users.name, 'Green'),
            eq(users.name, 'Red'),
            like(users.name, 'Guest%')
        )
    );

    console.log(`Found ${testAccounts.length} test/bot/guest accounts:\n`);

    for (const user of testAccounts) {
        console.log(`  - ${user.name} (${user.email})`);
    }

    console.log(`\n🔐 Setting password to 'Gr0Dt' for all ${testAccounts.length} accounts...`);

    // Update all at once
    await db.update(users)
        .set({ password: hashedPassword })
        .where(
            or(
                like(users.email, '%@3dbd.bot%'),
                like(users.email, '%@temp.com%'),
                eq(users.name, 'Green'),
                eq(users.name, 'Red'),
                like(users.name, 'Guest%')
            )
        );

    console.log("\n✅ All test/bot/guest passwords updated!");
    console.log("\n📝 Login credentials for all test accounts:");
    console.log("   Password: Gr0Dt");

    process.exit(0);
}

main().catch(console.error);
