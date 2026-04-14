import { auth } from "@/auth"
import { db } from "@/db";
import { users, games } from "@/db/schema";
import { desc, gt, and, ne, eq, or, isNull, like } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logApiUsage, extractRequestInfo } from "@/lib/usageLogger";

export const GET = async (request: Request) => {
    const reqInfo = extractRequestInfo(request);
    const session = await auth();
    if (!session?.user?.id) {
        logApiUsage({ ...reqInfo, statusCode: 401, durationMs: Date.now() - reqInfo.startTime });
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    try {
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

        // Build where clause for real online users
        let whereClause = and(
            gt(users.lastSeen, oneMinuteAgo),
            ne(users.id, session.user.id),
            eq(users.isBot, false)
        );

        if (query) {
            // @ts-ignore
            whereClause = and(whereClause, like(users.name, `%${query}%`));
        }

        // @ts-ignore
        const onlineUsers = await db.query.users.findMany({
            where: whereClause,
            columns: { id: true, name: true, image: true, rating: true, status: true, wins: true, losses: true },
            orderBy: [desc(users.lastSeen)],
            limit: 50
        });

        // ── Real bot users from DB ────────────────────────────────────────────
        // Bots are always shown; keep their lastSeen fresh so they appear online
        let botWhere: any = eq(users.isBot, true);
        if (query) {
            botWhere = and(botWhere, like(users.name, `%${query}%`));
        }

        // @ts-ignore
        const botUsers = await db.query.users.findMany({
            where: botWhere,
            columns: { id: true, name: true, image: true, rating: true, status: true, wins: true, losses: true },
            orderBy: [desc(users.rating)],
            limit: 12
        });

        // Refresh bot lastSeen in background (fire-and-forget) so they stay "online"
        if (botUsers.length > 0) {
            db.update(users)
                .set({ lastSeen: new Date(), status: 'online' })
                .where(eq(users.isBot, true))
                .catch(() => {});
        }

        // Merge: real users first, then bots
        const allUsers = [...onlineUsers, ...botUsers];

        // ── Open Games ────────────────────────────────────────────────────────
        // @ts-ignore
        const openGames = await db.query.games.findMany({
            where: and(
                eq(games.isFinished, false),
                isNull(games.blackPlayerId),
                ne(games.whitePlayerId, session.user.id)
            ),
            with: {
                whitePlayer: {
                    columns: { name: true, image: true, rating: true }
                }
            },
            orderBy: [desc(games.createdAt)],
            limit: 10
        });

        logApiUsage({ ...reqInfo, statusCode: 200, userId: session.user.id, durationMs: Date.now() - reqInfo.startTime });
        return NextResponse.json({ users: allUsers, openGames });
    } catch (error) {
        console.error("Lobby API Error:", error);
        logApiUsage({ ...reqInfo, statusCode: 500, userId: session.user.id, durationMs: Date.now() - reqInfo.startTime });
        return NextResponse.json({ error: "Internal Server Error", users: [], openGames: [] }, { status: 500 });
    }
}
