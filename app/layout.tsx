import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import { CookieConsent } from '@/components/Layout/CookieConsent';
import { GlobalGameListener } from '@/components/GlobalGameListener';

export const viewport: Viewport = {
    themeColor: '#000000', // Black status bar for seamless look
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: {
        default: '3DBD - 3D Four in a Row Game | Play Online Multiplayer',
        template: '%s | 3DBD'
    },
    description: 'Play 3DBD, the ultimate 3D Four in a Row game online. Challenge friends, compete globally, and master the 4x4x4 board. Free to play with premium features.',
    keywords: ['3D four in a row', 'connect 4 3D', 'online multiplayer game', '3DBD game', '4x4x4 board game', 'strategy game', 'casual gaming'],
    authors: [{ name: '3DBD' }],
    creator: '3DBD',
    publisher: '3DBD',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://3dbd.vercel.app'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        siteName: '3DBD',
        title: '3DBD - 3D Four in a Row Game',
        description: 'Challenge your mind with 3DBD - the ultimate 3D Four in a Row experience. Play online multiplayer with friends or AI opponents.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: '3DBD Game Preview',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '3DBD - 3D Four in a Row Game',
        description: 'Challenge your mind with 3DBD - the ultimate 3D Four in a Row experience.',
        images: ['/og-image.png'],
        creator: '@3DBDGame',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    id="schema-org"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebApplication',
                            name: '3DBD',
                            applicationCategory: 'Game',
                            genre: 'Strategy Game',
                            description: 'Play 3DBD, the ultimate 3D Four in a Row game online.',
                            url: 'https://3dbd.vercel.app',
                            operatingSystem: 'Web Browser',
                            offers: {
                                '@type': 'Offer',
                                price: '0',
                                priceCurrency: 'USD',
                                availability: 'https://schema.org/InStock',
                            }
                        }),
                    }}
                />
            </head>
            <body className="bg-black text-white antialiased overflow-hidden selection:bg-neonPink selection:text-white" suppressHydrationWarning>
                {/* Google AdSense via Strategy to avoid Hydration issues */}
                <Script
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID_HERE"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
                <Providers>
                    {children}
                    <CookieConsent />
                    <GlobalGameListener />
                </Providers>
            </body>
        </html>
    );
}
