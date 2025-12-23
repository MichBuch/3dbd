import type { Metadata } from 'next';
import './globals.css';

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
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
