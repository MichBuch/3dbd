
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";

async function checkGreenUser() {
    console.log("🔍 Checking 'green' user subscription status...");

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing!");
        return;
    }

    const { db } = await import("../db/index");
    const { users } = await import("../db/schema");

    // Assuming 'green' is part of the email or name, searching broadly first
    const allUsers = await db.select().from(users);
    const greenUser = allUsers.find(u => u.email.includes('green') || u.name?.toLowerCase().includes('green'));

    if (!greenUser) {
        console.error("❌ User 'green' not found.");
        return;
    }

    console.log(`✅ Found User: ${greenUser.email} (${greenUser.id})`);
    console.log(`- Plan: ${greenUser.plan}`);
    console.log(`- Stripe Customer ID: ${greenUser.stripeCustomerId}`);
    console.log(`- Stripe Subscription ID: ${greenUser.stripeSubscriptionId}`);

    process.exit(0);
}

checkGreenUser();
