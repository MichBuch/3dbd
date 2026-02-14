"use server";

import { db } from "@/db";
import { feedback } from "@/db/schema";
import { auth } from "@/auth";

export async function submitFeedback(formData: FormData) {
    const session = await auth();
    const userId = session?.user?.id;

    const message = formData.get("message") as string;
    const type = formData.get("type") as "bug" | "feedback" | "other";
    const url = formData.get("url") as string;
    const screenshot = formData.get("screenshot") as string; // Optional base64

    if (!message) {
        return { error: "Message is required" };
    }

    try {
        await db.insert(feedback).values({
            userId: userId || null,
            message,
            type: type || "bug",
            url: url || null,
            screenshot: screenshot || null,
        });

        // Send email notification
        if (process.env.EMAIL_SERVER_HOST) {
            try {
                const { createTransport } = await import("nodemailer");
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

                await transport.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: "Michael.R.Buchanan@outlook.com",
                    subject: `[3DBD Support] ${type.toUpperCase()}: ${message.substring(0, 50)}...`,
                    text: `
User ID: ${userId || 'Anonymous'}
Type: ${type}
URL: ${url}
Message:
${message}
                    `,
                });
                console.log("Details sent to Michael.R.Buchanan@outlook.com");
            } catch (emailError) {
                console.error("Failed to send feedback email:", emailError);
                // Don't fail the request if email fails, data is in DB
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to submit feedback:", error);
        return { error: "Failed to submit feedback" };
    }
}
