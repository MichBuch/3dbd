import { auth } from "@/auth"
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = async () => {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.update(users).set({
        lastSeen: new Date(),
        status: 'online'
    }).where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
}
