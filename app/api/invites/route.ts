import { auth } from "@/auth";
import { db } from "@/db";
import { invites } from "@/db/schema";
import { NextResponse } from "next/server";

// POST: Generate Invite Link
export const POST = async () => {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Generate a random 6-char code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Expires in 24 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await db.insert(invites).values({
            code: code,
            referrerId: session.user.id,
            expiresAt: expiresAt,
        });

        return NextResponse.json({ code, expiresAt });
    } catch (error) {
        console.error("POST /api/invites error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
