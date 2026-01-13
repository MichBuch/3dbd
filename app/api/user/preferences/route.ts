import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email),
        });

        if (!user) return new NextResponse("User not found", { status: 404 });

        return NextResponse.json(user.preferences || {});
    } catch (error) {
        console.error("Failed to fetch preferences:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { preferences } = body;
        // body should be the preferences object directly or { preferences: ... }?
        // Let's assume body IS the preferences object we want to save.

        await db.update(users)
            .set({ preferences: body })
            .where(eq(users.email, session.user.email));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save preferences:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
