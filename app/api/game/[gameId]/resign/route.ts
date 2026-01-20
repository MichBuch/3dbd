
import { auth } from "@/auth";
import { db } from "@/db";
import { games } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { saveGameResult } from "@/app/actions/game";

export async function POST(req: Request, { params }: { params: Promise<{ gameId: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { gameId } = await params;
        const { reason } = await req.json(); // Reason not used in DB but valid payload

        // 1. Fetch Game
        const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
        if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

        if (game.isFinished) return NextResponse.json({ error: "Game already finished" }, { status: 400 });

        // 2. Determine Resigner and Winner
        const isWhite = game.whitePlayerId === session.user.id;
        const isBlack = game.blackPlayerId === session.user.id;

        if (!isWhite && !isBlack) return NextResponse.json({ error: "Not a player" }, { status: 403 });

        const winnerId = isWhite ? game.blackPlayerId : game.whitePlayerId;
        const winnerColor = isWhite ? 'black' : 'white';

        // 3. Update DB
        await db.update(games).set({
            isFinished: true,
            winnerId: winnerId,
            endedAt: new Date()
        }).where(eq(games.id, gameId));

        // 4. Save Stats (XP/Rating)
        if (winnerId) {
            // For AI games, blackPlayerId might be null or bot ID?
            // If AI mode and user resigns (White), Winner is Black (Bot/Null).
            // saveGameResult expects a string literal 'white' | 'black' | 'draw'
            await saveGameResult(
                game.whiteScore || 0,
                game.blackScore || 0,
                winnerColor,
                (game.difficulty as any) || 'medium',
                (game.mode as any) || 'ai'
            );
        }

        return NextResponse.json({ success: true, winnerColor });

    } catch (error) {
        console.error("Resign Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
