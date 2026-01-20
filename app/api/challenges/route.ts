import { auth } from "@/auth";
import { db } from "@/db";
import { challenges, games, users } from "@/db/schema";
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
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        return NextResponse.json({ error: "Missing params" }, { status: 400 });

    } catch (error) {
        console.error("GET /api/challenges error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
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
            if (!toId || !fromId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

            console.log(`[CHALLENGE] Checking if target ${toId} is a bot...`);
            // Check if the challenged user is a bot
            const targetUsers = await db.select().from(users).where(eq(users.id, toId)).limit(1);
            const targetUser = targetUsers[0];

            console.log(`[CHALLENGE] Target user found: ${targetUser?.name}, isBot: ${targetUser?.isBot}`);

            // If challenging a bot, auto-accept and create game immediately
            if (targetUser?.isBot) {
                console.log(`🤖 Bot challenge detected for ${targetUser.name}, auto-accepting...`);

                // Initial 4x4x4 Empty Board
                const initialBoard = Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null)));

                // Map bot rating to difficulty
                const botRating = targetUser.rating || 1200;
                let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
                if (botRating < 1000) difficulty = 'easy';
                else if (botRating > 1300) difficulty = 'hard';

                // Create game - challenger is white, bot is black
                const newGame = await db.insert(games).values({
                    whitePlayerId: fromId, // Challenger plays white
                    blackPlayerId: toId, // Bot plays black
                    state: {
                        board: initialBoard,
                        currentPlayer: 'white',
                        lastMove: null
                    },
                    difficulty,
                    mode: 'ai', // Bot games are 'ai' mode
                    isFinished: false,
                    whiteScore: 0,
                    blackScore: 0
                }).returning();

                // Create the challenge record as accepted
                await db.insert(challenges).values({
                    fromId,
                    fromName: fromName || 'Guest',
                    toId,
                    message,
                    status: 'accepted',
                    gameId: newGame[0].id
                });

                return NextResponse.json({ success: true, gameId: newGame[0].id, botAccepted: true });
            }

            // Regular user challenge - create pending challenge
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
            if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("POST /api/challenges error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
