
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setPassword() {
    // Dynamic imports must be inside the async function to avoid top-level await issues
    const { db } = await import('../db');
    const { users } = await import('../db/schema');
    const bcrypt = await import('bcryptjs');
    const { eq } = await import('drizzle-orm');

    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: npx tsx scripts/set-password.ts <email> <password>');
        process.exit(1);
    }

    const email = args[0];
    const password = args[1];

    console.log(`🔒 Setting password for ${email}...`);

    try {
        const hashedPassword = await bcrypt.default.hash(password, 10);

        const result = await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.email, email))
            .returning();

        if (result.length === 0) {
            console.error(`❌ User with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`✅ Password updated successfully for ${email}`);
    } catch (error) {
        console.error('❌ Failed to update password:', error);
        process.exit(1);
    }

    process.exit(0);
}

setPassword();
