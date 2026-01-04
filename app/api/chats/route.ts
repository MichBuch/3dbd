import { auth } from "@/auth"
import { db } from "@/db";
import { chats, users } from "@/db/schema";
import { eq, asc, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) return NextResponse.json({ error: "Missing gameId" }, { status: 400 });

    // Fetch messages for this game
    // @ts-ignore
    const messages = await db.query.chats.findMany({
        where: eq(chats.gameId, gameId),
        with: {
            sender: {
                columns: { name: true, image: true, id: true }
            }
        },
        orderBy: [asc(chats.createdAt)],
        limit: 50
    });

    return NextResponse.json({ messages });
};

export const POST = async (req: Request) => {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { gameId, message } = body;

    if (!gameId || !message) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    await db.insert(chats).values({
        gameId,
        senderId: session.user.id,
        message: message.trim()
    });

    return NextResponse.json({ success: true });
};
