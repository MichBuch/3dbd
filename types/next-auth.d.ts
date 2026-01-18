
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            admin?: boolean
            id: string
            plan?: "free" | "premium"
            rating?: number
        } & DefaultSession["user"]
    }

    interface User {
        admin?: boolean
        plan?: "free" | "premium"
        rating?: number
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        admin?: boolean
        plan?: "free" | "premium"
        rating?: number
    }
}
