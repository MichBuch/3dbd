import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Facebook from "next-auth/providers/facebook"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"

import Nodemailer from "next-auth/providers/nodemailer"

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: '/auth/signin',
    },
    adapter: DrizzleAdapter(db),
    providers: [
        Google,
        GitHub,
        Facebook,
        // AWS SES Configuration
        Nodemailer({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM
        })
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
