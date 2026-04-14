import { db } from '@/db';
import { apiUsageLogs } from '@/db/schema';

interface LogEntry {
    method: string;
    path: string;
    statusCode?: number;
    userId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    durationMs?: number;
    country?: string | null;
}

/**
 * Fire-and-forget API usage logger.
 * Call at the end of any API route to track the request.
 */
export function logApiUsage(entry: LogEntry) {
    // Don't await — fire and forget so it doesn't slow down responses
    db.insert(apiUsageLogs).values({
        method: entry.method,
        path: entry.path,
        statusCode: entry.statusCode ?? null,
        userId: entry.userId ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
        durationMs: entry.durationMs ?? null,
        country: entry.country ?? null,
    }).catch((err) => {
        console.warn('Usage log failed:', err);
    });
}

/**
 * Helper to extract common request info for logging.
 */
export function extractRequestInfo(req: Request) {
    const url = new URL(req.url);
    return {
        method: req.method,
        path: url.pathname,
        ip: req.headers.get('x-client-ip')
            || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown',
        userAgent: req.headers.get('user-agent') || null,
        startTime: parseInt(req.headers.get('x-request-start') || '') || Date.now(),
    };
}
