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
import Credentials from "next-auth/providers/credentials"

import Nodemailer from "next-auth/providers/nodemailer"

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    adapter: DrizzleAdapter(db) as any,
    session: { strategy: "jwt" },
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
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.log("[Auth] Attempting login for:", credentials?.email);
                console.log("[Auth] Password provided:", !!credentials?.password);
                console.log("[Auth] Password length:", (credentials?.password as string)?.length);

                if (!credentials?.email || !credentials?.password) {
                    console.log("[Auth] ❌ Missing credentials");
                    return null;
                }

                // Fetch user
                // @ts-ignore
                const user = await db.query.users.findFirst({
                    // @ts-ignore
                    where: (users, { eq }) => eq(users.email, credentials.email)
                });

                console.log("[Auth] User found:", !!user);
                console.log("[Auth] User email:", user?.email);
                console.log("[Auth] User has password:", !!user?.password);
                console.log("[Auth] Password hash preview:", user?.password?.substring(0, 20));

                if (!user || !user.password) {
                    console.log("[Auth] ❌ User not found or no password set");
                    return null;
                }

                // Check password
                // @ts-ignore
                const bcrypt = await import("bcryptjs");
                // @ts-ignore
                const isValid = await bcrypt.compare(credentials.password, user.password);

                console.log("[Auth] Password match:", isValid);
                console.log("[Auth] Input password:", credentials.password);

                if (!isValid) {
                    console.log("[Auth] ❌ Invalid password");
                    return null;
                }

                console.log("[Auth] ✅ Login successful for:", user.email);
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

                return {
                    ...user,
                    plan: user.plan ?? undefined,
                    rating: user.rating ?? undefined,
                    stripeCustomerId: user.stripeCustomerId ?? undefined,
                };
            }
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
                        subject: `Sign in to 3DBD`,
                        text: `Sign in to 3DBD\n\nClick here to log in: ${url}\n\n`,
                        html: `<div><h2>Sign in to 3DBD</h2><p><a href="${url}">Click here to log in</a></p></div>`,
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
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.id = user.id;
                token.plan = user.plan;
                token.rating = user.rating;
                token.picture = user.image;
                token.name = user.name;
                token.admin = user.admin;
            }
            return token;
        },
        // @ts-ignore
        async session({ session, token }: { session: any, token: any }) {
            if (session.user && token) {
                session.user.id = token.id;
                session.user.plan = token.plan;
                session.user.rating = token.rating;
                session.user.name = token.name;
                session.user.image = token.picture;
                session.user.admin = token.admin;
            }
            return session;
        },
    },
})
