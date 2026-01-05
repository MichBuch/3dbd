import { auth } from "@/auth";
import { db } from "@/db";
import { challenges, games } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET: List Challenges (Polling)
export const GET = async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const toId = searchParams.get('toId');
    const fromId = searchParams.get('fromId');

    try {
        if (toId) {
            // User polling for incoming challenges
            // Secure this: Only allow if session.user.id matches toId
            const session = await auth();
            if (session?.user?.id !== toId) {
                return new NextResponse("Unauthorized", { status: 401 });
            }

            const incoming = await db.query.challenges.findMany({
                where: and(
                    eq(challenges.toId, toId),
                    eq(challenges.status, 'pending')
                ),
                orderBy: [desc(challenges.createdAt)],
                limit: 10
            });
            return NextResponse.json(incoming);

        } else if (fromId) {
            // Guest polling for status updates
            const myChallenges = await db.query.challenges.findMany({
                where: eq(challenges.fromId, fromId),
                orderBy: [desc(challenges.createdAt)],
                limit: 5
            });
            return NextResponse.json(myChallenges);
        }

        return new NextResponse("Missing params", { status: 400 });

    } catch (error) {
        console.error("GET /api/challenges error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
};

// POST: Create or Accept Challenge
export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { action } = body;

        // 1. Create Challenge (Guest or User)
        if (action === 'create') {
            const { fromId, fromName, toId, message } = body;
            if (!toId || !fromId) return new NextResponse("Missing fields", { status: 400 });

            await db.insert(challenges).values({
                fromId,
                fromName: fromName || 'Guest',
                toId,
                message,
                status: 'pending'
            });
            return NextResponse.json({ success: true });
        }

        // 2. Accept Challenge (User only)
        if (action === 'accept') {
            const session = await auth();
            if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

            const { challengeId } = body;

            // Create the Game
            // Initial 4x4x4 Empty Board
            const initialBoard = Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null)));

            const newGame = await db.insert(games).values({
                whitePlayerId: session.user.id, // User is White
                // blackPlayerId: null (Guest/Anonymous) - or could store a 'Guest' record
                state: {
                    board: initialBoard,
                    currentPlayer: 'white',
                    lastMove: null
                },
                difficulty: 'medium',
                mode: 'pvp',
                isFinished: false,
                whiteScore: 0,
                blackScore: 0
            }).returning();

            // Update Challenge
            await db.update(challenges)
                .set({ status: 'accepted', gameId: newGame[0].id })
                .where(eq(challenges.id, challengeId));

            return NextResponse.json({ success: true, gameId: newGame[0].id });
        }

        // 3. Decline
        if (action === 'decline') {
            const { challengeId } = body;
            await db.update(challenges)
                .set({ status: 'declined' })
                .where(eq(challenges.id, challengeId));
            return NextResponse.json({ success: true });
        }

        return new NextResponse("Invalid action", { status: 400 });

    } catch (error) {
        console.error("POST /api/challenges error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
