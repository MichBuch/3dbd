import { auth } from "@/auth";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/preferences - Fetch user preferences
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [prefs] = await db
            .select()
            .from(userPreferences)
            .where(eq(userPreferences.userId, session.user.id))
            .limit(1);

        // Return preferences or defaults
        return NextResponse.json({
            showScoreboard: prefs?.showScoreboard ?? true,
            showLeaderboard: prefs?.showLeaderboard ?? true,
            showTurnIndicator: prefs?.showTurnIndicator ?? true,
            boardScale: (prefs?.boardScale ?? 100) / 100, // Convert back to decimal
            theme: prefs?.theme ?? 'dark',
            difficulty: prefs?.difficulty ?? 'medium',
        });
    } catch (error) {
        console.error("[PREFERENCES_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST /api/preferences - Create or update user preferences
export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const {
            showScoreboard,
            showLeaderboard,
            showTurnIndicator,
            boardScale,
            theme,
            difficulty
        } = body;

        // Check if preferences exist
        const [existing] = await db
            .select()
            .from(userPreferences)
            .where(eq(userPreferences.userId, session.user.id))
            .limit(1);

        const prefsData = {
            showScoreboard: showScoreboard ?? true,
            showLeaderboard: showLeaderboard ?? true,
            showTurnIndicator: showTurnIndicator ?? true,
            boardScale: Math.round((boardScale ?? 1.0) * 100), // Store as percentage
            theme: theme ?? 'dark',
            difficulty: difficulty ?? 'medium',
            updatedAt: new Date(),
        };

        if (existing) {
            // Update existing preferences
            await db
                .update(userPreferences)
                .set(prefsData)
                .where(eq(userPreferences.id, existing.id));
        } else {
            // Create new preferences
            await db.insert(userPreferences).values({
                userId: session.user.id,
                ...prefsData,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PREFERENCES_POST_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
