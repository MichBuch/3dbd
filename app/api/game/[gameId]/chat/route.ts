import { auth } from "@/auth";
import { db } from "@/db";
import { games, chats, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET: Fetch messages (any player in the game can chat)
export async function GET(req: Request, { params }: { params: Promise<{ gameId: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { gameId } = await params;

        const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
        if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

        const isPlayer = game.whitePlayerId === session.user.id || game.blackPlayerId === session.user.id;
        if (!isPlayer) return NextResponse.json({ error: "Not a player" }, { status: 403 });

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
            .orderBy(asc(chats.createdAt))
            .limit(100);

        const messages = result.map(msg => ({
            ...msg,
            senderName: msg.senderName || "Unknown",
            createdAt: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now()
        }));

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("GET Chat Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// POST: Send message — persists to DB and broadcasts via socket
export async function POST(req: Request, { params }: { params: Promise<{ gameId: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { text } = await req.json();
        if (!text || text.trim().length === 0 || text.length > 500) {
            return NextResponse.json({ error: "Invalid text" }, { status: 400 });
        }

        const { gameId } = await params;

        const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
        if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

        const isPlayer = game.whitePlayerId === session.user.id || game.blackPlayerId === session.user.id;
        if (!isPlayer) return NextResponse.json({ error: "Not a player" }, { status: 403 });

        const [inserted] = await db.insert(chats).values({
            gameId,
            senderId: session.user.id,
            message: text.trim(),
        }).returning();

        const message = {
            id: inserted.id,
            senderId: session.user.id,
            senderName: session.user.name || "Unknown",
            text: text.trim(),
            createdAt: Date.now()
        };

        // Broadcast via socket so the other player gets it instantly
        const io = (global as any).io;
        if (io) {
            io.to(`game:${gameId}`).emit('chat-message', message);
        }

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error("POST Chat Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
