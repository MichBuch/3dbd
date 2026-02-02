
import { loadEnvConfig } from '@next/env';
import { eq } from "drizzle-orm";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const bcrypt = await import('bcryptjs');

    // Simple, easy to type password
    const newPassword = "green";
    console.log(`🔒 Setting Green password to simple: '${newPassword}'\n`);

    const hashedPassword = await bcrypt.default.hash(newPassword, 10);

    await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, 'green@3dbd.com'));

    console.log("✅ Password updated!");
    console.log("\n📝 Login as Green:");
    console.log("   Email: green@3dbd.com");
    console.log(`   Password: ${newPassword}`);

    process.exit(0);
}

main().catch(console.error);
