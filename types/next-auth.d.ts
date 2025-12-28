import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            plan: 'free' | 'premium'
        } & DefaultSession["user"]
    }

    interface User {
        plan?: 'free' | 'premium'
        points?: number
        wins?: number
        losses?: number
        rating?: number
    }
}
