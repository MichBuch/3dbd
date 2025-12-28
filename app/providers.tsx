'use client';

import { SessionProvider } from "next-auth/react";
import { Heartbeat } from "@/components/Auth/Heartbeat";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <Heartbeat />
            {children}
        </SessionProvider>
    );
}
