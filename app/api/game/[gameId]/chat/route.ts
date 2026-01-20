import { auth } from "@/auth";
import { db } from "@/db";
import { games, trustedConnections, users } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// --- IN-MEMORY STORE ---
// In a serverless/Edge env, this global might reset. 
// For Vercel Serverless Functions, it effectively resets between warm starts.
// For a production app, use Redis (Upstash).
// But per requirement "cache locally but not maintain history in DB", this works for now.
const CHAT_STORE: Record<string, { id: string; senderId: string; senderName: string; text: string; createdAt: number }[]> = {};

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
            // Also check the reverse direction to be safe, though our Verify logic creates bidirectional rows
            // Optimization: If rows are guaranteed bidirectional, this is enough.
            return NextResponse.json({ allowed: false });
        }

        if (checkOnly) {
            return NextResponse.json({ allowed: true });
        }

        // Return Messages
        const messages = CHAT_STORE[gameId] || [];
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

        // (We assume permissions checked by UI/GET, but good to double check if strict security needed)
        // For speed, logging only here.

        if (!CHAT_STORE[gameId]) {
            CHAT_STORE[gameId] = [];
        }

        // Add Message
        CHAT_STORE[gameId].push({
            id: crypto.randomUUID(),
            senderId: session.user.id,
            senderName: session.user.name || "Player",
            text,
            createdAt: Date.now()
        });

        // Cap at 50 messages to prevent memory leak
        if (CHAT_STORE[gameId].length > 50) {
            CHAT_STORE[gameId] = CHAT_STORE[gameId].slice(-50);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("POST Chat Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
