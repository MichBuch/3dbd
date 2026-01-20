import { auth } from "@/auth";
import { db } from "@/db";
import { connectionRequests, users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
// import { Resend } from 'resend'; // If using Resend
// Or use your existing Nodemailer provider from auth.ts logic

// Re-using the Nodemailer logic from auth.ts is tricky as it's inside NextAuth.
// We will use standard nodemailer here since we already have the env vars.
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

        // normalize email
        const targetEmail = email.toLowerCase().trim();

        // 1. Check if user is trying to connect to themselves
        if (session.user.email?.toLowerCase() === targetEmail) {
            return NextResponse.json({ error: "Cannot connect to yourself" }, { status: 400 });
        }

        // 2. Rate Limit / Spam Check (Basic)
        // Check if there is already a pending request to this email from this user in the last 5 minutes
        const recentRequest = await db.select().from(connectionRequests).where(
            and(
                eq(connectionRequests.fromId, session.user.id),
                eq(connectionRequests.toEmail, targetEmail),
                eq(connectionRequests.status, 'pending'),
                gt(connectionRequests.createdAt, new Date(Date.now() - 5 * 60 * 1000))
            )
        ).limit(1);

        if (recentRequest.length > 0) {
            return NextResponse.json({ error: "Request already sent to this email recently." }, { status: 429 });
        }

        // 3. Generate Token
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // 4. Save Request
        await db.insert(connectionRequests).values({
            token,
            fromId: session.user.id,
            toEmail: targetEmail,
            status: 'pending',
            expiresAt
        });

        // 5. Send Email
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT),
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
            tls: { rejectUnauthorized: false }
        });

        const verifyUrl = `${process.env.NEXTAUTH_URL}/api/connect/verify?token=${token}`;
        const senderName = session.user.name || "A user";

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: targetEmail,
            subject: `${senderName} wants to connect on 3DBD`,
            text: `Hello,\n\n${senderName} has requested a Safe Chat connection with you on 3DBD.\n\nTo approve this connection, click the link below:\n${verifyUrl}\n\nIf you did not request this, please ignore this email.`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #333;">Safe Chat Connection Request</h2>
                    <p style="font-size: 16px; color: #555;">
                        <strong>${senderName}</strong> wants to connect with you.
                    </p>
                    <p style="color: #666;">
                        Approving this request will enable <strong>Private Safe Chat</strong> between the two of you in 3DBD games.
                    </p>
                    <a href="${verifyUrl}" style="display: inline-block; background-color: #00f3ff; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
                        Approve Connection
                    </a>
                    <p style="margin-top: 30px; font-size: 12px; color: #999;">
                        If you did not expect this, you can safely ignore this email.
                    </p>
                </div>
            `
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("POST /api/connect/request error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
