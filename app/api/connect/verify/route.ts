import { auth } from "@/auth";
import { db } from "@/db";
import { connectionRequests, trustedConnections, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    try {
        // 1. Verify Token
        const [request] = await db.select().from(connectionRequests).where(eq(connectionRequests.token, token)).limit(1);

        if (!request) {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }

        if (request.status !== 'pending') {
            return NextResponse.json({ error: "Request already processed" }, { status: 400 });
        }

        if (new Date() > request.expiresAt) {
            return NextResponse.json({ error: "Token expired" }, { status: 400 });
        }

        // 2. Identify Approving User (User B)
        // We know the email from the request. We need to find the user with that email.
        const [targetUser] = await db.select().from(users).where(eq(users.email, request.toEmail)).limit(1);

        if (!targetUser) {
            // User B doesn't exist yet! 
            // We could redirect them to sign up, but for now let's error.
            // Ideally: Redirect to signup with ?invite=... logic, but let's stick to existing users for now per requirement.
            return NextResponse.json({ error: "Account not found for this email. Please sign up first." }, { status: 404 });
        }

        // 3. Create Trusted Connection (Bidirectional)
        // Check if already exists just in case
        const existing = await db.select().from(trustedConnections).where(
            and(eq(trustedConnections.userId, request.fromId), eq(trustedConnections.friendId, targetUser.id))
        ).limit(1);

        if (existing.length === 0) {
            // A -> B
            await db.insert(trustedConnections).values({
                userId: request.fromId,
                friendId: targetUser.id
            });
            // B -> A
            await db.insert(trustedConnections).values({
                userId: targetUser.id,
                friendId: request.fromId
            });
        }

        // 4. Mark Request Accepted
        await db.update(connectionRequests)
            .set({ status: 'accepted' })
            .where(eq(connectionRequests.token, token));

        // 5. Redirect to Lobby
        return Response.redirect(`${process.env.NEXTAUTH_URL}/?connected=true&friend=${request.fromId}`);

    } catch (error) {
        console.error("GET /api/connect/verify error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
