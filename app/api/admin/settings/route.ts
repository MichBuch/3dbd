import { auth } from "@/auth";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    // Public read access for settings (store hydration)
    // Or we could restrict to authenticated, but theme music should be public?
    // Let's make it public for now so `SoundManager` can fetch it easily without complex auth flows if session is missing.
    try {
        const settings = await db.select().from(systemSettings);
        // Convert to object: { key: value }
        const config = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { key, value } = body;

        if (!key || !value) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        // Upsert
        await db.insert(systemSettings).values({
            key,
            value,
            updatedBy: session.user.id
        }).onConflictDoUpdate({
            target: systemSettings.key,
            set: { value, updatedBy: session.user.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin Settings Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
