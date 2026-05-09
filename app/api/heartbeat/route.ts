import { auth } from "@/auth"
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logApiUsage, extractRequestInfo } from "@/lib/usageLogger";

export const POST = async (req: Request) => {
    const reqInfo = extractRequestInfo(req);
    const session = await auth();

    // 1. Logged In User
    if (session?.user?.id) {
        // Skip DB write if seen recently — avoids unnecessary writes on every heartbeat
        const existing = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { lastSeen: true }
        });
        const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
        const needsUpdate = !existing?.lastSeen || existing.lastSeen < sixtySecondsAgo;

        if (needsUpdate) {
            await db.update(users).set({
                lastSeen: new Date(),
                status: 'online'
            }).where(eq(users.id, session.user.id));
        }

        // Check if user is in an ACTIVE PvP game updated within the last 5 minutes
        // Only PvP games need resuming — AI games don't require network sync
        // 5-minute window: anything older is treated as abandoned
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const activeGame = await db.query.games.findFirst({
            where: (games, { or, and, eq, gt }) => and(
                or(eq(games.whitePlayerId, session.user.id), eq(games.blackPlayerId, session.user.id)),
                eq(games.isFinished, false),
                eq(games.mode, 'pvp'),          // Only PvP games need resuming
                gt(games.updatedAt, fiveMinutesAgo) // Only if updated in last 5 min
            ),
            columns: { id: true }
        });

        return NextResponse.json({ success: true, activeGameId: activeGame?.id });
    }

    // 2. Guest User (passed via body)
    try {
        const body = await req.json().catch(() => ({}));
        const { guestId, guestName } = body;

        if (guestId) {
            const ip = req.headers.get('x-client-ip')
                || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                || req.headers.get('x-real-ip')
                || 'unknown';
            const userAgent = req.headers.get('user-agent') || null;

            // Upsert — insert on first visit, update lastSeen on subsequent visits
            // Avoids the race condition of check-then-insert
            await db.insert(users).values({
                id: guestId,
                name: guestName || 'Guest',
                email: `guest-${guestId}@temp.com`,
                status: 'online',
                lastSeen: new Date(),
                isBot: false,
                plan: 'free',
                points: 0,
                wins: 0,
                losses: 0,
                ipAddress: ip,
                userAgent: userAgent,
                isArchived: false,
            }).onConflictDoUpdate({
                target: users.id,
                set: {
                    lastSeen: new Date(),
                    status: 'online',
                    name: guestName || sql`${users.name}`, // keep existing name if not provided
                }
            });

            return NextResponse.json({ success: true, activeGameId: null });
        }
    } catch (e) {
        console.error("Guest Heartbeat Error", e);
    }

    logApiUsage({
        ...reqInfo,
        statusCode: 200,
        userId: session?.user?.id ?? null,
        durationMs: Date.now() - reqInfo.startTime,
    });

    return NextResponse.json({ success: true }); // Silent fail is fine
}

