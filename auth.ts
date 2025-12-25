import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: '/auth/signin',
    },
    adapter: DrizzleAdapter(db),
    providers: [
        Google,
        GitHub,
        // Facebook, // Requires import from "next-auth/providers/facebook"
        // Twitter, // Requires import from "next-auth/providers/twitter"
        // Resend({ apiKey: process.env.AUTH_RESEND_KEY }) // Requires import
    ],
    callbacks: {
        session({ session, user }) {
            if (session.user) {
                // @ts-ignore
                session.user.plan = user.plan;
                session.user.id = user.id;
            }
            return session
        },
    },
})
