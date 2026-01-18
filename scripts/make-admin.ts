
import { config } from 'dotenv';
config({ path: '.env.local' });

import { users } from "../db/schema";
import { eq, ne } from "drizzle-orm";

const targetEmail = "michbuch1966@gmail.com";

async function main() {
    // Dynamic import to ensure env/dotenv is loaded first
    const { db } = await import("../db");

    console.log(`Securing Admin Access for ${targetEmail}...`);

    // 1. Promote target email
    const result = await db.update(users)
        .set({ admin: true })
        .where(eq(users.email, targetEmail))
        .returning({ updatedId: users.id });

    if (result.length === 0) {
        console.error(`User ${targetEmail} not found!`);
        process.exit(1);
    }
    console.log(`✅ Promoted ${targetEmail}`);

    // 2. Demote everyone else (Optional security measure requested)
    await db.update(users)
        .set({ admin: false })
        .where(ne(users.email, targetEmail));

    console.log("🔒 Demoted all other users.");
    process.exit(0);
}

main().catch(console.error);
