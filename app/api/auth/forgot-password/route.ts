import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createTransport } from "nodemailer";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 1. Check if user exists
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        // Always return success to prevent email enumeration, unless dev mode?
        // But for UX we might want to say "sent".
        if (!user) {
            // Fake delay to prevent timing attacks
            await new Promise(resolve => setTimeout(resolve, 500));
            return NextResponse.json({ success: true });
        }

        if (!user.password) {
            // User signed up with OAuth, they don't have a password to reset.
            // Ideally send an email saying "You use Google/GitHub to login."
            // For now, just return success.
            return NextResponse.json({ success: true });
        }

        // 2. Generate Token
        // Use crypto for simpler token
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

        // 3. Save Token
        await db.insert(passwordResetTokens).values({
            identifier: email,
            token: token,
            expires: expires
        });

        // 4. Send Email
        const transport = createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT),
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        await transport.sendMail({
            to: email,
            from: process.env.EMAIL_FROM,
            subject: "Reset your password",
            text: `Reset your password by verifying this link: ${resetUrl}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Reset Password</h2>
                    <p>Click the button below to reset your password. This link expires in 24 hours.</p>
                    <a href="${resetUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
