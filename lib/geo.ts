/**
 * Get approximate location from IP address using ipapi.co (free tier)
 */
export async function getLocationFromIP(ip: string): Promise<{ country: string | null; city: string | null }> {
    // Skip for localhost/private IPs
    if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return { country: null, city: null };
    }

    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`, {
            headers: { 'User-Agent': '3DBD-Game' }
        });

        if (!res.ok) {
            console.warn('IP geolocation failed:', res.status);
            return { country: null, city: null };
        }

        const data = await res.json();

        return {
            country: data.country_name || null,
            city: data.city || null
        };
    } catch (error) {
        console.error('IP geolocation error:', error);
        return { country: null, city: null };
    }
}

/**
 * Extract real IP from request headers (handles proxies/load balancers)
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    return 'unknown';
}
