
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function fixPassword() {
    console.log("🛠 Fixing Password for red@3dbd.com");

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing from env!");
        return;
    }

    const { db } = await import("../db/index");
    const { users } = await import("../db/schema");

    const newPassword = "3dbd26";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`🔑 Hashing '${newPassword}'...`);

    try {
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.email, "red@3dbd.com"));

        console.log("✅ Password updated successfully for red@3dbd.com");
    } catch (e) {
        console.error("❌ Failed to update password:", e);
    }

    process.exit(0);
}

fixPassword();
