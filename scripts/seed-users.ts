
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const TEST_USERS = [
    { name: "Red", email: "red@3dbd.com", password: "3dbd26", plan: "premium", image: "https://api.dicebear.com/7.x/pixel-art/svg?seed=red" },
    { name: "Blue", email: "blue@3dbd.com", password: "3dbd26", plan: "premium", image: "https://api.dicebear.com/7.x/pixel-art/svg?seed=blue" },
    { name: "Green", email: "green@3dbd.com", password: "3dbd26", plan: "premium", image: "https://api.dicebear.com/7.x/pixel-art/svg?seed=green" },
    { name: "White", email: "white@3dbd.com", password: "3dbd26", plan: "premium", image: "https://api.dicebear.com/7.x/pixel-art/svg?seed=white" },
    { name: "Black", email: "black@3dbd.com", password: "3dbd26", plan: "premium", image: "https://api.dicebear.com/7.x/pixel-art/svg?seed=black" }
];

async function seedUsers() {
    console.log("🌱 Seeding/Updating Test Users...");

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing from env!");
        return;
    }

    const { db } = await import("../db/index");
    const { users } = await import("../db/schema");

    for (const u of TEST_USERS) {
        const hashedPassword = await bcrypt.hash(u.password, 10);

        try {
            const existing = await db.query.users.findFirst({
                where: eq(users.email, u.email)
            });

            if (existing) {
                console.log(`🔄 Updating ${u.email}...`);
                await db.update(users).set({
                    password: hashedPassword,
                    // optional: update other fields if needed, but password is the main request
                }).where(eq(users.email, u.email));
            } else {
                console.log(`✨ Creating ${u.email}...`);
                await db.insert(users).values({
                    email: u.email,
                    name: u.name,
                    password: hashedPassword,
                    plan: u.plan as "free" | "premium",
                    image: u.image
                });
            }
        } catch (err) {
            console.error(`❌ Failed to process ${u.email}:`, err);
        }
    }

    console.log("✅ All users processed!");
    process.exit(0);
}

seedUsers();
