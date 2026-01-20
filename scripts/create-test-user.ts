
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
    console.log("Creating Test User 'test@example.com'...");

    const email = "test@example.com";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (existing) {
        console.log("User already exists. Updating password...");
        await db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));
    } else {
        console.log("Creating new user...");
        await db.insert(users).values({
            email,
            name: "Test User",
            password: hashedPassword,
            emailVerified: new Date(),
            plan: 'free',
            rating: 1200,
            wins: 0,
            losses: 0
        });
    }

    console.log(`\n✅ Success! Login details:\nEmail: ${email}\nPassword: ${password}`);
    process.exit(0);
}

main().catch(console.error);
