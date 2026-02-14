
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { createTransport } from "nodemailer";
import { eq } from "drizzle-orm";

async function debugAuth() {
    console.log("🔍 Debugging Auth for red@3dbd.com");

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing from env!");
        return;
    }

    // Dynamic imports to ensure env is loaded
    const { db } = await import("../db/index");
    const { users, passwordResetTokens } = await import("../db/schema");

    // 1. Check User
    const user = await db.query.users.findFirst({
        where: eq(users.email, "red@3dbd.com")
    });

    if (!user) {
        console.error("❌ User red@3dbd.com NOT FOUND");
        return;
    }

    console.log("✅ User found:", user.email);
    console.log("   ID:", user.id);
    console.log("   Password Hash:", user.password);

    // 2. Check Password
    const isMatch = await bcrypt.compare("3dbd26", user.password || "");
    console.log(`🔑 Password '3dbd26' match: ${isMatch ? "✅ YES" : "❌ NO"}`);

    if (!isMatch) {
        console.log("   Attempting to compare with a newly hashed version for debug...");
        const newHash = await bcrypt.hash("3dbd26", 10);
        console.log("   New hash of '3dbd26':", newHash);
    }

    // 3. Simulate Forgot Password (DB Part)
    console.log("\n🔄 Simulating Forgot Password Token Generation...");
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    try {
        await db.insert(passwordResetTokens).values({
            identifier: "red@3dbd.com",
            token: token,
            expires: expires
        });
        console.log("✅ Token inserted into DB successfully");
    } catch (e) {
        console.error("❌ DB Insert Failed:", e);
    }

    // 4. Test Email Sending
    console.log("\n📧 Testing Email Sending...");
    if (!process.env.EMAIL_SERVER_HOST) {
        console.error("❌ EMAIL_SERVER_HOST is not set in env");
    } else {
        console.log("   Host:", process.env.EMAIL_SERVER_HOST);
        console.log("   Port:", process.env.EMAIL_SERVER_PORT);
        console.log("   User:", process.env.EMAIL_SERVER_USER);

        const transport = createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT),
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        try {
            await transport.verify();
            console.log("✅ SMTP Connection Verified");
        } catch (err) {
            console.error("❌ SMTP Verification Failed:", err);
            // Don't leak full error in logs if sensitive, but here we are debugging.
        }
    }

    process.exit(0);
}

debugAuth();
