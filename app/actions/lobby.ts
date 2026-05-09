'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { desc, gt, and, ne, eq, or } from 'drizzle-orm';
import { auth } from "@/auth";


export async function getOnlineUsers() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userId = session.user.id;

    // NOTE: lastSeen is updated by the heartbeat (/api/heartbeat) — not here.
    // Updating it here caused a DB write on every lobby poll (every 30s per user).

    // Get users seen in the last 5 minutes OR bots (always online), excluding self
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const onlineUsers = await db.select({
        id: users.id,
        name: users.name,
        image: users.image,
        rankTier: users.rankTier,
        points: users.points,
        isBot: users.isBot,
    })
        .from(users)
        .where(and(
            or(
                gt(users.lastSeen, fiveMinutesAgo), // Real users active in last 5 min
                eq(users.isBot, true) // OR bot users (always shown as online)
            ),
            ne(users.id, userId) // Exclude current user
        ))
        .orderBy(desc(users.points));

    return onlineUsers;
}
