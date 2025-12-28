'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { desc, gt, and, ne } from 'drizzle-orm';
import { neonAuth } from "@neondatabase/neon-js/auth/next";

export async function getOnlineUsers() {
    const { user } = await neonAuth();
    if (!user) return [];

    // Get users seen in the last 5 minutes, excluding self
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const onlineUsers = await db.select({
        id: users.id,
        name: users.name,
        image: users.image,
        rankTier: users.rankTier,
        points: users.points,
    })
        .from(users)
        .where(and(
            gt(users.lastSeen, fiveMinutesAgo),
            ne(users.id, user.id)
        ))
        .orderBy(desc(users.points));

    return onlineUsers;
}
