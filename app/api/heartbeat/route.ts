import { auth } from "@/auth"
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    const session = await auth();

    // 1. Logged In User
    if (session?.user?.id) {
        await db.update(users).set({
            lastSeen: new Date(),
            status: 'online'
        }).where(eq(users.id, session.user.id));
        return NextResponse.json({ success: true });
    }

    // 2. Guest User (passed via body)
    try {
        const body = await req.json().catch(() => ({}));
        const { guestId, guestName } = body;

        if (guestId) {
            // Check if guest exists
            const existing = await db.query.users.findFirst({
                where: eq(users.id, guestId)
            });

            if (existing) {
                await db.update(users).set({
                    lastSeen: new Date(),
                    status: 'online',
                    name: guestName || existing.name // Update name if provided
                }).where(eq(users.id, guestId));
            } else {
                // Register new Guest - Capture IP and location
                const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                    req.headers.get('x-real-ip') || 'unknown';
                const userAgent = req.headers.get('user-agent') || null;

                // Fetch location (optional, may be slow)
                let country = null;
                let city = null;
                try {
                    const { getLocationFromIP } = await import('@/lib/geo');
                    const location = await getLocationFromIP(ip);
                    country = location.country;
                    city = location.city;
                } catch (err) {
                    console.warn('Geolocation failed:', err);
                }

                await db.insert(users).values({
                    id: guestId,
                    name: guestName || 'Guest',
                    email: `guest-${guestId}@temp.com`, // Dummy email
                    status: 'online',
                    lastSeen: new Date(),
                    isBot: false,
                    plan: 'free',
                    points: 0,
                    wins: 0,
                    losses: 0,
                    ipAddress: ip,
                    country: country,
                    city: city,
                    userAgent: userAgent,
                    isArchived: false
                });
            }
            return NextResponse.json({ success: true });
        }
    } catch (e) {
        console.error("Guest Heartbeat Error", e);
    }

    return NextResponse.json({ success: true }); // Silent fail is fine
}
