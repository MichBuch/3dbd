
import { db } from "../db/index";
import { users } from "../db/schema";
import { count } from "drizzle-orm";
import * as dotenv from "dotenv";

// Load .env.local manually for the script
dotenv.config({ path: ".env.local" });

async function main() {
    console.log("🔒 Connecting to Neon Database...");
    try {
        const result = await db.select({ count: count() }).from(users);
        console.log("✅ Connection Successful!");
        console.log(`📊 Current User Count: ${result[0].count}`);

        // Also check if our test users exist
        const allUsers = await db.query.users.findMany({
            columns: { email: true, plan: true }
        });
        console.log("📋 Users found:", allUsers.map(u => `${u.email} (${u.plan})`).join(", "));

    } catch (error) {
        console.error("❌ Stats check failed:", error);
    }
    process.exit(0);
}

main();
