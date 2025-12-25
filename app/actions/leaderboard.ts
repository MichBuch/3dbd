'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function getLeaderboard() {
    try {
        const topPlayers = await db
            .select({
                name: users.name,
                image: users.image,
                points: users.points,
                wins: users.wins,
            })
            .from(users)
            .orderBy(desc(users.points))
            .limit(10);

        return topPlayers;
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        return [];
    }
}
