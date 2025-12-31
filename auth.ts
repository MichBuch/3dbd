import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Facebook from "next-auth/providers/facebook"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"

import Nodemailer from "next-auth/providers/nodemailer"

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    adapter: DrizzleAdapter(db),
    providers: [
        Google,
        GitHub,
        Facebook,

        // AWS SES Email (SSL bypass for corporate proxies)
        Nodemailer({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
                debug: true, // Enable SMTP logging
                logger: true, // Log to console
                tls: {
                    rejectUnauthorized: false
                }
            },
            from: process.env.EMAIL_FROM,
            async sendVerificationRequest({ identifier: email, url, provider }) {
                console.log('📧 Attempting to send verification email to:', email);
                console.log('🔗 Magic link URL:', url);
                console.log('📮 From:', provider.from);
                console.log('🖥️  SMTP:', process.env.EMAIL_SERVER_HOST);

                try {
                    const { createTransport } = await import('nodemailer');
                    const transport = createTransport(provider.server);

                    const result = await transport.sendMail({
                        to: email,
                        from: provider.from,
                        subject: `Sign in to 3D4BD`,
                        text: `Sign in to 3D4BD\n\nClick here to log in: ${url}\n\n`,
                        html: `<div><h2>Sign in to 3D4BD</h2><p><a href="${url}">Click here to log in</a></p></div>`,
                    });

                    console.log('✅ Email sent successfully!', result);
                } catch (error) {
                    console.error('❌ Email send FAILED:', error);
                    throw error;
                }
            }
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
