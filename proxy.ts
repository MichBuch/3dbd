import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const start = Date.now();
    const response = NextResponse.next();

    // Tag the request with timing info so the API routes can log it
    response.headers.set('x-request-start', start.toString());

    // Pass IP through for logging
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
    response.headers.set('x-client-ip', ip);

    return response;
}

// Only run on API routes — no need to track static assets or pages
export const config = {
    matcher: '/api/:path*',
};
