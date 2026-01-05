import { auth } from "@/auth"
import { db } from "@/db";
import { users, games } from "@/db/schema";
import { desc, gt, and, ne, eq, or, isNull, like } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const filter = searchParams.get('filter'); // 'friends'

    try {
        // 1. Get Online Users (active in last 60 seconds)
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

        // Build Where Clause
        let whereClause = and(
            gt(users.lastSeen, oneMinuteAgo),
            ne(users.id, session.user.id)
        );

        if (query) {
            // @ts-ignore
            whereClause = and(whereClause, like(users.name, `%${query}%`));
        }

        // Note: 'friends' filter would go here, joining with friends table. 
        // For Phase 1 Safe Rollout, we are just mocking the structure or ignoring if not implemented fully yet.

        // @ts-ignore
        const onlineUsers = await db.query.users.findMany({
            where: whereClause,
            columns: {
                id: true,
                name: true,
                image: true,
                rating: true,
                status: true,
                wins: true,
                losses: true
            },
            orderBy: [desc(users.lastSeen)],
            limit: 50 // Added Limit for Safety
        });

        // 2. Get Open Games (Waiting for opponent)
        // @ts-ignore
        const openGames = await db.query.games.findMany({
            where: and(
                eq(games.isFinished, false),
                isNull(games.blackPlayerId), // Seat 2 is empty
                ne(games.whitePlayerId, session.user.id) // Not my own game
            ),
            with: {
                whitePlayer: {
                    columns: { name: true, image: true, rating: true }
                }
            },
            orderBy: [desc(games.createdAt)],
            limit: 10
        });

        return NextResponse.json({
            users: onlineUsers,
            openGames: openGames
        });
    } catch (error) {
        console.error("Lobby API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", users: [], openGames: [] }, { status: 500 });
    }
}
