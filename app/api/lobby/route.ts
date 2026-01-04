import { auth } from "@/auth"
import { db } from "@/db";
import { users, games } from "@/db/schema";
import { desc, gt, and, ne, eq, or, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async () => {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Get Online Users (active in last 60 seconds)
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

        // @ts-ignore
        const onlineUsers = await db.query.users.findMany({
            where: and(
                gt(users.lastSeen, oneMinuteAgo),
                ne(users.id, session.user.id) // Exclude self
            ),
            columns: {
                id: true,
                name: true,
                image: true,
                rating: true,
                status: true,
                wins: true,
                losses: true
            },
            orderBy: [desc(users.lastSeen)]
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
