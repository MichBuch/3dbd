
import { auth } from "@/auth";
import { db } from "@/db";
import { games, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET: Poll for game state
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const game = await db.query.games.findFirst({
            where: eq(games.id, id),
            with: {
                // Fetch player names/images for UI
                // Note: Drizzle relation syntax might vary, using manual fetch if needed or if relations defined
            }
        });

        if (!game) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        // Quick fetch of player details if not joined (simple approach)
        let whitePlayer = null;
        let blackPlayer = null;

        if (game.whitePlayerId) {
            whitePlayer = await db.query.users.findFirst({
                where: eq(users.id, game.whitePlayerId),
                columns: { id: true, name: true, image: true }
            });
        }
        if (game.blackPlayerId) {
            blackPlayer = await db.query.users.findFirst({
                where: eq(users.id, game.blackPlayerId),
                columns: { id: true, name: true, image: true }
            });
        }

        return NextResponse.json({
            ...game,
            players: {
                white: whitePlayer,
                black: blackPlayer
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
            }
        });
    } catch (error) {
        console.error("Get Game Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Join Game or Submit Move
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action, gameState } = body; // action: 'join' | 'move'

        const game = await db.query.games.findFirst({
            where: eq(games.id, id)
        });

        if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

        // JOIN GAME
        if (action === 'join') {
            if (game.blackPlayerId) {
                if (game.blackPlayerId === session.user.id) {
                    return NextResponse.json({ message: "Already joined" });
                }
                if (game.whitePlayerId === session.user.id) {
                    return NextResponse.json({ message: "You are player 1" });
                }
                return NextResponse.json({ error: "Game full" }, { status: 400 });
            }

            // Join as Black
            await db.update(games)
                .set({
                    blackPlayerId: session.user.id,
                    mode: 'pvp'  // Set to PVP when second player joins
                })
                .where(eq(games.id, id));

            return NextResponse.json({ success: true, role: 'black' });
        }

        // SUBMIT MOVE
        if (action === 'move') {
            console.log(`[API] Move Received for Game ${id}`);
            // Validate turn

            // Fix Winner ID Mapping
            // gameState.winnerId might be 'white'/'black' string or null?
            // The frontend is sending: winner ? (currentPlayer==='white'?'black':'white') : null
            // Actually let's assume frontend sends 'white' | 'black' | 'draw' | null string in a field called 'winner' inside gameState?
            // No, look at previous code: winnerId: winner ? 'winner' : null. 

            // Let's trust the FE to send "moveHistory" and "board".
            // We need to determine if finished.

            const winningPlayer = gameState.state.winningCells?.length > 0
                ? (gameState.state.currentPlayer === 'white' ? 'black' : 'white') // The person who JUST moved wins. CurrentPlayer is already next.
                : null;

            const winnerId = winningPlayer === 'white'
                ? game.whitePlayerId
                : (winningPlayer === 'black' ? game.blackPlayerId : null);

            await db.update(games)
                .set({
                    state: gameState.state, // Board + currentTurn
                    whiteScore: gameState.whiteScore,
                    blackScore: gameState.blackScore,
                    winnerId: winnerId,
                    isFinished: !!winnerId,
                    updatedAt: new Date()
                })
                .where(eq(games.id, id));

            return NextResponse.json({ success: true });
        }

        // REMATCH VOTE
        // Store votes in the 'state' JSONB to avoid schema changes for now, 
        // or just Reset immediately if this is simpler for V1?
        // Let's implement a "Reset" logic immediately if this is local dev or low stakes?
        // No, need consensus.
        if (action === 'rematch') {
            // Who is voting?
            const role = game.whitePlayerId === session.user.id ? 'white' : 'black';

            // Get current votes from state (initialize if missing)
            const currentState = game.state as any;
            const votes = currentState.rematchVotes || { white: false, black: false };
            votes[role] = true;

            // Check Consensus
            // ROBUST AUTO-VOTE: Check if opponent is a Bot using DB lookup (if mode check failed)
            let isBotOpponent = game.mode === 'ai' || !game.blackPlayerId;

            if (!isBotOpponent && game.blackPlayerId) {
                // Double check if the user is actually a bot (legacy games or mode mismatch)
                const blackUser = await db.query.users.findFirst({
                    where: eq(users.id, game.blackPlayerId),
                    columns: { isBot: true }
                });
                if (blackUser?.isBot) {
                    isBotOpponent = true;
                }
            }

            if (isBotOpponent) {
                votes.white = true;
                votes.black = true; // Bot/System always wants to play
            }

            if (votes.white && votes.black) {
                // RESET GAME
                const newBoard = Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null)));
                // Swap starting player? Let's alternate.
                const newStarter = currentState.currentPlayer === 'white' ? 'black' : 'white';

                await db.update(games).set({
                    state: {
                        board: newBoard,
                        currentPlayer: newStarter,
                        lastMove: null,
                        rematchVotes: { white: false, black: false }, // Clear votes
                        moveHistory: [], // Explicitly clear move history
                        winningCells: [] // Explicitly clear winning cells
                    },
                    winnerId: null, // Clear winner
                    isFinished: false,
                    updatedAt: new Date()
                    // Keep scores!
                }).where(eq(games.id, id));

                return NextResponse.json({ success: true, status: 'reset' });
            } else {
                // Just record vote
                await db.update(games).set({
                    state: { ...currentState, rematchVotes: votes }
                }).where(eq(games.id, id));
                return NextResponse.json({ success: true, status: 'pending' });
            }
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Game Action Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
