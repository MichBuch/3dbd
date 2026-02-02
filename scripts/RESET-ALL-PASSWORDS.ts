import { loadEnvConfig } from '@next/env';
import { or, like, eq } from "drizzle-orm";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const bcrypt = await import('bcryptjs');

    const newPassword = "Gr0Dt";
    console.log(`\n🔐 Setting ALL test/bot passwords to: '${newPassword}'\n`);

    const hashedPassword = await bcrypt.default.hash(newPassword, 10);

    // Update all test/bot accounts
    const result = await db.update(users)
        .set({ password: hashedPassword })
        .where(
            or(
                like(users.email, '%@3dbd.bot%'),
                like(users.email, '%@temp.com%'),
                eq(users.email, 'green@3dbd.com'),
                eq(users.email, 'red@3dbd.com')
            )
        );

    console.log("✅ Passwords updated!\n");

    // Verify Green
    const green = await db.select().from(users).where(eq(users.email, 'green@3dbd.com'));
    if (green.length > 0) {
        const match = await bcrypt.default.compare(newPassword, green[0].password!);
        console.log(`✅ Green verification: ${match ? 'SUCCESS ✓' : 'FAILED ✗'}`);
        console.log(`   Email: green@3dbd.com`);
        console.log(`   Password: ${newPassword}`);
    }

    process.exit(0);
}

main().catch(console.error);
