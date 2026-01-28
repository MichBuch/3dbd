import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, identifier, password } = await req.json();

        if (!token || !identifier || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        // 1. Find Token
        const msg = await db.query.passwordResetTokens.findFirst({
            where: and(
                eq(passwordResetTokens.token, token),
                eq(passwordResetTokens.identifier, identifier)
            )
        });

        if (!msg) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // 2. Check Expiry
        if (new Date() > msg.expires) {
            // Cleanup expired token
            await db.delete(passwordResetTokens).where(
                and(
                    eq(passwordResetTokens.identifier, identifier),
                    eq(passwordResetTokens.token, token)
                )
            );
            return NextResponse.json({ error: "Token expired" }, { status: 400 });
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Update User
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.email, identifier));

        // 5. Delete Token
        await db.delete(passwordResetTokens).where(
            and(
                eq(passwordResetTokens.identifier, identifier),
                eq(passwordResetTokens.token, token)
            )
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
