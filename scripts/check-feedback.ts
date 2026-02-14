
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { desc } from "drizzle-orm";

async function checkFeedback() {
    console.log("🔍 Checking Feedback Table...");

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing!");
        return;
    }

    const { db } = await import("../db/index");
    const { feedback } = await import("../db/schema");

    try {
        const reports = await db.query.feedback.findMany({
            orderBy: [desc(feedback.createdAt)],
            limit: 5
        });

        console.log(`Found ${reports.length} reports:`);
        reports.forEach(r => {
            console.log(`- [${r.type}] ${r.message} (Status: ${r.status})`);
        });
    } catch (e) {
        console.error("❌ Failed to query feedback:", e);
    }

    process.exit(0);
}

checkFeedback();
