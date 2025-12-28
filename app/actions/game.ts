'use server';

import { db } from '@/db';
import { games, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { neonAuth } from "@neondatabase/neon-js/auth/next";

import { calculateScore } from '@/lib/ranking';

export async function saveGameResult(
    whiteScore: number,
    blackScore: number,
    winner: 'white' | 'black' | 'draw',
    difficulty: 'easy' | 'medium' | 'hard',
    mode: 'ai' | 'pvp'
) {
    try {
        const { session, user } = await neonAuth();
        if (!user) return;

        const [currentUser] = await db.select().from(users).where(eq(users.id, user.id));
        if (!currentUser) return;

        // Calculate new rating points
        // If user is WHITE (always true against AI currently), they get score based on their performance
        // If AI won, the user score is just participation or low. 
        // Logic: Calculate score for White (User)
        const newPoints = calculateScore(difficulty, whiteScore, blackScore, mode);

        // Update total points (lifetime score) and rating (ELO-like)
        // For simplicity, we add the calculated score to both for now, 
        // but typically rating fluctuates. Let's stick to the "Accumulated Score" requested 
        // by the user ("store all that data... calculate who is top").

        // Actually, User asked for ELO. ELO implies you can lose rating.
        // But against AI, usually you just gain.
        // Let's implement a hybrid: Points = XP (always up), Rating = Skill (can go down)

        let ratingChange = 0;
        if (winner === 'white') {
            ratingChange = newPoints; // Gain big points
        } else if (winner === 'black') {
            ratingChange = -Math.floor(newPoints / 2); // Lose half points
        }

        // Prevent negative rating for now, min 0
        const newRating = Math.max(0, (currentUser.rating || 0) + ratingChange);

        await db.update(users)
            .set({
                wins: winner === 'white' ? currentUser.wins + 1 : currentUser.wins,
                losses: winner === 'black' ? currentUser.losses + 1 : currentUser.losses,
                points: currentUser.points + newPoints, // Total Score "XP"
                rating: newRating, // Skill Rating
                lastSeen: new Date(),
                // Cache subscription if relevant? No, done via webhook.
            })
            .where(eq(users.id, user.id));

        // Also Save Game History
        await db.insert(games).values({
            whitePlayerId: user.id,
            blackPlayerId: mode === 'ai' ? null : 'opponent_id', // TODO: PvP Support
            winnerId: winner === 'white' ? user.id : null,
            state: {}, // Not saving full board state yet for AI games to save space/time
            whiteScore,
            blackScore,
            difficulty,
            mode,
            isFinished: true,
            endedAt: new Date()
        });

    } catch (error) {
        console.error("Failed to save game result:", error);
    }
}
