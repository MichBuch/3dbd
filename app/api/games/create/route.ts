
import { auth } from "@/auth";
import { db } from "@/db";
import { games } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { difficulty, theme } = body;

        // Initial 4x4x4 Empty Board
        const initialBoard = Array(4).fill(null).map(() =>
            Array(4).fill(null).map(() =>
                Array(4).fill(null)
            )
        );
        const newGame = await db.insert(games).values({
            whitePlayerId: session.user.id,
            state: {
                board: initialBoard,
                currentPlayer: 'white', // White starts
                lastMove: null
            },
            difficulty: difficulty || 'medium',
            mode: 'pvp',
            theme: theme || 'dark', // Save the theme
            isFinished: false,
            whiteScore: 0,
            blackScore: 0
        }).returning();

        return NextResponse.json(newGame[0]);
    } catch (error) {
        console.error("Create Game Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
