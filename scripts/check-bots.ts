import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from "../db";
import { users } from "../db/schema";
import { eq, like } from "drizzle-orm";

async function checkBots() {
    console.log("Checking Bot Status...");
    console.log("DB URL Length:", process.env.DATABASE_URL ? process.env.DATABASE_URL.length : "MISSING");

    // Check for 'Nova' specifically or any bot
    const bots = await db.select().from(users).where(eq(users.isBot, true)).limit(5);

    console.log(`Found ${bots.length} confirmed bots.`);
    bots.forEach(b => {
        console.log(`- ${b.name} (ID: ${b.id}, isBot: ${b.isBot})`);
    });

    if (bots.length === 0) {
        console.log("WARNING: No users found with isBot=true!");

        // Check if they exist but isBot is false
        const potentialBots = await db.select().from(users).where(like(users.email, '%@3dbd.bot')).limit(5);
        console.log(`Found ${potentialBots.length} users with '@3dbd.bot' email:`);
        potentialBots.forEach(b => {
            console.log(`- ${b.name} (isBot: ${b.isBot})`);
        });
    }

    process.exit(0);
}

checkBots();
