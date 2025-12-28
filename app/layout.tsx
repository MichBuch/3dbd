import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: '3dBd - 3D Board Game',
    description: 'A 3D strategy game',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-black text-white antialiased overflow-hidden selection:bg-neonPink selection:text-white">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
