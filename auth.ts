import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Facebook from "next-auth/providers/facebook"
import TikTok from "next-auth/providers/tiktok"
import Apple from "next-auth/providers/apple"
import Discord from "next-auth/providers/discord"
import Twitter from "next-auth/providers/twitter"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import LinkedIn from "next-auth/providers/linkedin"
// import Amazon from "next-auth/providers/amazon"
import WeChat from "next-auth/providers/wechat"
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
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET
        }),
        TikTok({
            clientId: process.env.TIKTOK_CLIENT_ID,
            clientSecret: process.env.TIKTOK_CLIENT_SECRET
        }),
        Apple({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET
        }),
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET
        }),
        Twitter({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET
        }),
        MicrosoftEntraID({
            clientId: process.env.MICROSOFT_ENTRA_ID_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_ENTRA_ID_CLIENT_SECRET
        }),
        LinkedIn({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET
        }),
        // Amazon, // specific provider import issue
        WeChat({
            clientId: process.env.AUTH_WECHAT_APP_ID,
            clientSecret: process.env.AUTH_WECHAT_APP_SECRET
        }),

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
                    // @ts-ignore
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
