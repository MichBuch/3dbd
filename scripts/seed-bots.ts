// Script to seed bot users for testing and initial user experience
// Run with: npx tsx scripts/seed-bots.ts

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BOT_USERS = [
    // Bronze tier bots (800-1000 rating)
    { name: 'Nova', rating: 850, wins: 42, losses: 58, rankTier: 'bronze' },
    { name: 'Cipher', rating: 920, wins: 48, losses: 52, rankTier: 'bronze' },
    { name: 'Echo', rating: 980, wins: 54, losses: 46, rankTier: 'bronze' },

    // Silver tier bots (1000-1200 rating)
    { name: 'Nexus', rating: 1050, wins: 61, losses: 39, rankTier: 'silver' },
    { name: 'Quantum', rating: 1120, wins: 68, losses: 32, rankTier: 'silver' },
    { name: 'Vertex', rating: 1180, wins: 73, losses: 27, rankTier: 'silver' },
    { name: 'Matrix', rating: 1190, wins: 75, losses: 25, rankTier: 'silver' },

    // Gold tier bots (1200-1400 rating)
    { name: 'Axion', rating: 1250, wins: 81, losses: 19, rankTier: 'gold' },
    { name: 'Zenith', rating: 1310, wins: 87, losses: 13, rankTier: 'gold' },
    { name: 'Apex', rating: 1380, wins: 92, losses: 8, rankTier: 'gold' },

    // High-tier bots (1400-1500 rating)
    { name: 'Titan', rating: 1420, wins: 94, losses: 6, rankTier: 'gold' },
    { name: 'Oracle', rating: 1480, wins: 97, losses: 3, rankTier: 'gold' },
];

async function seedBots() {
    // Dynamic imports to ensure env vars are loaded first
    const { db } = await import('../db');
    const { users } = await import('../db/schema');
    const bcrypt = await import('bcryptjs');
    const { eq } = await import('drizzle-orm');

    console.log('🤖 Starting bot user seeding...\n');

    // Hash a dummy password (bots won't use it, but schema requires non-null email)
    const hashedPassword = await bcrypt.default.hash('bot-password-unused', 10);

    let successCount = 0;
    let skipCount = 0;

    for (const bot of BOT_USERS) {
        try {
            // Check if bot already exists
            const existingBot = await db.select().from(users).where(
                eq(users.email, `${bot.name.toLowerCase()}@3dbd.bot`)
            ).limit(1);

            if (existingBot.length > 0) {
                console.log(`⏭️  Bot "${bot.name}" already exists, skipping...`);
                skipCount++;
                continue;
            }

            // Calculate points based on wins/losses
            const points = (bot.wins * 10) - (bot.losses * 5);

            await db.insert(users).values({
                name: bot.name,
                email: `${bot.name.toLowerCase()}@3dbd.bot`,
                password: hashedPassword,
                plan: 'premium', // Bots are always "premium" to avoid restrictions
                rating: bot.rating,
                wins: bot.wins,
                losses: bot.losses,
                points: points,
                rankTier: bot.rankTier,
                status: 'online', // Bots are always online
                isBot: true,
                emailVerified: new Date(), // Mark as verified
                lastSeen: new Date(), // Always recent
            });

            console.log(`✅ Created bot: ${bot.name} (Rating: ${bot.rating}, Tier: ${bot.rankTier})`);
            successCount++;
        } catch (error) {
            console.error(`❌ Failed to create bot "${bot.name}":`, error);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${successCount} bots`);
    console.log(`   ⏭️  Skipped: ${skipCount} bots (already exist)`);
    console.log(`   📈 Total: ${BOT_USERS.length} bots defined\n`);

    console.log('🎉 Bot seeding complete!');
    process.exit(0);
}

// Run the seeding
seedBots().catch((error) => {
    console.error('💥 Fatal error during bot seeding:', error);
    process.exit(1);
});
