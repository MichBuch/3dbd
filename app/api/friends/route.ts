import { auth } from "@/auth";
import { db } from "@/db";
import { users, friends } from "@/db/schema";
import { and, eq, ne, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET: List Friends
export const GET = async () => {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Find accepted friends
        // Note: In a full system we'd join twice (user->friend, friend->user). 
        // For simplicity we assume bidirectional 'friends' rows or just query where userId = me

        // Joining to get Friend Details
        const friendLinks = await db.query.friends.findMany({
            where: eq(friends.userId, session.user.id),
            with: {
                friend: {
                    columns: {
                        id: true,
                        name: true,
                        image: true,
                        status: true,
                        rating: true
                    }
                }
            },
            orderBy: [desc(friends.createdAt)]
        });

        // Flatten structure
        const myFriends = friendLinks.map(link => link.friend);

        return NextResponse.json(myFriends);
    } catch (error) {
        console.error("GET /api/friends error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
};

// POST: Add Friend
export const POST = async (req: Request) => {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { friendId } = await req.json();
        if (!friendId || friendId === session.user.id) {
            return NextResponse.json({ error: "Invalid Friend ID" }, { status: 400 });
        }

        // Demo Mode: Auto-Accept (Create 2 rows for bidirectional)
        await db.insert(friends).values([
            { userId: session.user.id, friendId: friendId, status: 'accepted' },
            { userId: friendId, friendId: session.user.id, status: 'accepted' }
        ]).onConflictDoNothing();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST /api/friends error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// DELETE: Remove Friend
export const DELETE = async (req: Request) => {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { friendId } = await req.json();

        await db.delete(friends).where(
            and(
                eq(friends.userId, session.user.id),
                eq(friends.friendId, friendId)
            )
        );
        // Also remove reverse link
        await db.delete(friends).where(
            and(
                eq(friends.userId, friendId),
                eq(friends.friendId, session.user.id)
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/friends error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
