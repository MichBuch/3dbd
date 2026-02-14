
import { db } from "@/db";
import { feedback, users } from "@/db/schema";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createTransport } from "nodemailer";

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Allow anonymous feedback? Maybe for now restrict to logged in users or just mark as anonymous.

        const { message, type, url, screenshot } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // 1. Save to DB
        await db.insert(feedback).values({
            userId: session?.user?.id,
            message,
            type: type || 'bug',
            url,
            screenshot,
            status: 'open'
        });

        // 2. Send Email (Fire and Forget or await?) 
        // We await to catch errors but don't fail the request if email fails
        try {
            if (process.env.EMAIL_SERVER_HOST) {
                const transport = createTransport({
                    host: process.env.EMAIL_SERVER_HOST,
                    port: Number(process.env.EMAIL_SERVER_PORT),
                    auth: {
                        user: process.env.EMAIL_SERVER_USER,
                        pass: process.env.EMAIL_SERVER_PASSWORD,
                    },
                    tls: { rejectUnauthorized: false }
                });

                const userEmail = session?.user?.email || "Anonymous";

                await transport.sendMail({
                    to: "support@3dbd.com", // As requested
                    from: process.env.EMAIL_FROM,
                    subject: `[${type?.toUpperCase()}] Report from ${userEmail}`,
                    text: `User: ${userEmail}\nURL: ${url}\n\nMessage:\n${message}`,
                    // Attach screenshot if needed, but might be too large for basic text email 
                    // html: ... 
                });
            }
        } catch (emailErr) {
            console.error("Failed to send feedback email:", emailErr);
            // Ignore email error, DB save is what matters
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Feedback Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
