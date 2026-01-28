
import { auth } from "@/auth";
import { db } from "@/db";
import { games } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const game = await db.query.games.findFirst({
            where: eq(games.id, id)
        });

        if (!game) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        // Determine which player is leaving
        const isWhite = game.whitePlayerId === session.user.id;
        const isBlack = game.blackPlayerId === session.user.id;

        if (!isWhite && !isBlack) {
            return NextResponse.json({ error: "Not a participant" }, { status: 403 });
        }

        // Prepare updates
        const updates: any = {
            mode: 'ai', // Convert to AI mode
            updatedAt: new Date()
        };

        // Clear the leaving player's slot so they can't rejoin easily as the same role? 
        // Or keep it but mode='ai' implies logic change?
        // Let's clear it to signify "Left".
        if (isWhite) {
            updates.whitePlayerId = null;
            // If White leaves, Black becomes "Player 1"? No, keep positions.
            // If White leaves, the "User" is now Black vs "White Bot".
        } else {
            updates.blackPlayerId = null;
        }

        await db.update(games)
            .set(updates)
            .where(eq(games.id, id));

        return NextResponse.json({
            success: true,
            message: "Left game. Bot has taken over."
        });

    } catch (error) {
        console.error("Leave Game Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
