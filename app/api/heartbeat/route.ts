import { neonAuth } from "@neondatabase/neon-js/auth/next";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const { session, user } = await neonAuth();
        if (!session || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await db.update(users)
            .set({ lastSeen: new Date() })
            .where(eq(users.id, user.id));

        return new NextResponse("OK", { status: 200 });
    } catch (error) {
        return new NextResponse("Error", { status: 500 });
    }
}
