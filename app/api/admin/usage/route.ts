import { auth } from "@/auth";
import { db } from "@/db";
import { apiUsageLogs, users } from "@/db/schema";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { admin: true },
    });
    if (!user?.admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "24h";

    // Calculate time boundary
    const now = new Date();
    let since: Date;
    switch (range) {
        case "1h":  since = new Date(now.getTime() - 60 * 60 * 1000); break;
        case "24h": since = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
        case "7d":  since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case "30d": since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
        default:    since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    try {
        // Total requests
        const [totalResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(apiUsageLogs)
            .where(gte(apiUsageLogs.createdAt, since));

        // Requests by endpoint
        const byEndpoint = await db
            .select({
                path: apiUsageLogs.path,
                count: sql<number>`count(*)::int`,
                avgDuration: sql<number>`round(avg(${apiUsageLogs.durationMs}))::int`,
            })
            .from(apiUsageLogs)
            .where(gte(apiUsageLogs.createdAt, since))
            .groupBy(apiUsageLogs.path)
            .orderBy(sql`count(*) desc`)
            .limit(20);

        // Requests by user (top consumers)
        const byUser = await db
            .select({
                userId: apiUsageLogs.userId,
                count: sql<number>`count(*)::int`,
            })
            .from(apiUsageLogs)
            .where(and(gte(apiUsageLogs.createdAt, since), sql`${apiUsageLogs.userId} is not null`))
            .groupBy(apiUsageLogs.userId)
            .orderBy(sql`count(*) desc`)
            .limit(15);

        // Enrich with user names
        const userIds = byUser.map((u) => u.userId).filter(Boolean) as string[];
        let userMap: Record<string, string> = {};
        if (userIds.length > 0) {
            const userRows = await db.query.users.findMany({
                where: sql`${users.id} in (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`,
                columns: { id: true, name: true, email: true },
            });
            userMap = Object.fromEntries(userRows.map((u) => [u.id, u.name || u.email]));
        }

        const topUsers = byUser.map((u) => ({
            userId: u.userId,
            name: userMap[u.userId!] || "Unknown",
            count: u.count,
        }));

        // Hourly breakdown (for chart)
        const hourly = await db
            .select({
                hour: sql<string>`to_char(${apiUsageLogs.createdAt}, 'YYYY-MM-DD HH24:00')`,
                count: sql<number>`count(*)::int`,
            })
            .from(apiUsageLogs)
            .where(gte(apiUsageLogs.createdAt, since))
            .groupBy(sql`to_char(${apiUsageLogs.createdAt}, 'YYYY-MM-DD HH24:00')`)
            .orderBy(sql`to_char(${apiUsageLogs.createdAt}, 'YYYY-MM-DD HH24:00')`);

        // Error rate
        const [errorResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(apiUsageLogs)
            .where(and(
                gte(apiUsageLogs.createdAt, since),
                gte(apiUsageLogs.statusCode, 400)
            ));

        return NextResponse.json({
            totalRequests: totalResult.count,
            errorCount: errorResult.count,
            byEndpoint,
            topUsers,
            hourly,
            range,
        });
    } catch (error) {
        console.error("Usage API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
