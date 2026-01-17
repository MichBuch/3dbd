import { auth } from "@/auth";
import { db } from "@/db";
import { games } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { gameId, board, currentPlayer, scores, winner } = body;

        if (!gameId) return NextResponse.json({ error: "Missing Game ID" }, { status: 400 });

        // Update Game State
        await db.update(games)
            .set({
                state: {
                    board,
                    currentPlayer,
                    lastMove: new Date().toISOString()
                },
                whiteScore: scores.white,
                blackScore: scores.black,
                winnerId: winner === 'white' ? session.user.id : (winner === 'black' ? 'opponent' : null),
                // Note: Winner logic is simplified here; in PvP it would be real ID. 
                // For AI games, we can just mark 'isFinished' if there is a winner.
                isFinished: !!winner,
                updatedAt: new Date()
            })
            .where(eq(games.id, gameId));

        return NextResponse.json({ success: true, syncedAt: Date.now() });

    } catch (error) {
        console.error("Game Sync Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
