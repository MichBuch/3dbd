import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://3dbd.vercel.app';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/game/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
