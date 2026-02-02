
import { auth } from "@/auth";
import { db } from "@/db";
import { games } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log(`[API] FORCE RESET Request for Game ${id} by ${session.user.name}`);

        const newBoard = Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null)));

        await db.update(games).set({
            state: {
                board: newBoard,
                currentPlayer: 'white',
                lastMove: null,
                rematchVotes: { white: false, black: false },
                moveHistory: [],
                winningCells: []
            },
            winnerId: null,
            isFinished: false,
            whiteScore: 0,
            blackScore: 0,
            updatedAt: new Date()
        }).where(eq(games.id, id));

        return NextResponse.json({ success: true, message: "Game Force Reset Complete" });

    } catch (error) {
        console.error("Game Reset Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
