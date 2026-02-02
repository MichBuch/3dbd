
import { loadEnvConfig } from '@next/env';
import { ilike } from "drizzle-orm";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    // Dynamic import
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const bcrypt = await import('bcryptjs');
    const { eq } = await import('drizzle-orm');

    console.log("🔍 Searching for 'Green'...");

    // Find User
    const greenUsers = await db.select().from(users).where(ilike(users.name, "%Green%"));

    if (greenUsers.length === 0) {
        console.log("❌ No user found with name containing 'Green'. Listing all names:");
        const all = await db.select({ name: users.name, id: users.id, email: users.email }).from(users);
        console.table(all);
        process.exit(0);
    }

    const targetUser = greenUsers[0];
    console.log(`✅ Found User: ${targetUser.name} (${targetUser.email})`);
    console.log(`🆔 ID: ${targetUser.id}`);

    // Set Password
    const newPassword = "password123";
    const hashedPassword = await bcrypt.default.hash(newPassword, 10);

    console.log(`🔒 Resetting password to: '${newPassword}'`);

    await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, targetUser.id));

    console.log("✅ Password Updated!");
    process.exit(0);
}

main().catch(console.error);
