import { auth } from "@/auth";
import { db } from "@/db";
import { games, trustedConnections, chats, users } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET: Fetch Messages OR Check Permission
export async function GET(req: Request, { params }: { params: Promise<{ gameId: string }> }) {
    const { searchParams } = new URL(req.url);
    const checkOnly = searchParams.get('check') === 'true';

    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { gameId } = await params;

        // 1. Validate Game & Membership
        const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
        if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

        const isWhite = game.whitePlayerId === session.user.id;
        const isBlack = game.blackPlayerId === session.user.id;
        if (!isWhite && !isBlack) return NextResponse.json({ error: "Not a player" }, { status: 403 });

        const opponentId = isWhite ? game.blackPlayerId : game.whitePlayerId;
        if (!opponentId) return NextResponse.json({ allowed: false }); // No opponent yet

        // 2. Check Trust
        const trust = await db.select().from(trustedConnections).where(
            and(
                eq(trustedConnections.userId, session.user.id),
                eq(trustedConnections.friendId, opponentId)
            )
        ).limit(1);

        if (trust.length === 0) {
            return NextResponse.json({ allowed: false });
        }

        if (checkOnly) {
            return NextResponse.json({ allowed: true });
        }

        // Return Messages from DB
        const result = await db.select({
            id: chats.id,
            senderId: chats.senderId,
            senderName: users.name,
            text: chats.message,
            createdAt: chats.createdAt
        })
            .from(chats)
            .leftJoin(users, eq(chats.senderId, users.id))
            .where(eq(chats.gameId, gameId))
            .orderBy(asc(chats.createdAt));

        // Map to ensure createdAt is number/date as expected by frontend
        const messages = result.map(msg => ({
            ...msg,
            senderName: msg.senderName || "Unknown",
            createdAt: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now()
        }));

        return NextResponse.json({ allowed: true, messages });

    } catch (error) {
        console.error("GET Chat Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// POST: Send Message
export async function POST(req: Request, { params }: { params: Promise<{ gameId: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { text } = await req.json();
        if (!text || text.length > 500) return NextResponse.json({ error: "Invalid text" }, { status: 400 });

        const { gameId } = await params;

        // Insert into DB
        await db.insert(chats).values({
            gameId,
            senderId: session.user.id,
            message: text,
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("POST Chat Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
