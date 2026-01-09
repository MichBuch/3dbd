import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { users, webhookLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const body = await req.text();
    const headerPayload = await headers();
    const signature = headerPayload.get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error("❌ Webhook signature verification failed:", error.message);

        // Log failed webhook verification
        await db.insert(webhookLogs).values({
            eventType: "verification_failed",
            eventId: "unknown",
            payload: { error: error.message, body },
            status: "failed",
            errorMessage: error.message,
        });

        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;
    let userId: string | null = null;

    try {
        if (event.type === "checkout.session.completed") {
            const subscriptionId = session.subscription;
            const customerId = session.customer;
            userId = session.metadata.userId;

            if (!userId) {
                throw new Error("User ID metadata missing");
            }

            // Retrieve full subscription to get end date
            const subscription = await stripe.subscriptions.retrieve(subscriptionId as string) as any;

            await db.update(users).set({
                plan: 'premium',
                stripeCustomerId: customerId as string,
                stripeSubscriptionId: subscriptionId as string,
                subscriptionStatus: 'active',
                subscriptionEndDate: new Date(subscription.current_period_end * 1000)
            }).where(eq(users.id, userId));

            console.log("✅ Subscription activated for user:", userId);
        }
        else if (event.type === "invoice.payment_succeeded") {
            // Renewal success
            const subscriptionId = session.subscription;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId as string) as any;

            await db.update(users)
                .set({
                    subscriptionStatus: 'active',
                    subscriptionEndDate: new Date(subscription.current_period_end * 1000)
                })
                .where(eq(users.stripeSubscriptionId, subscriptionId as string));

            console.log("✅ Subscription renewed:", subscriptionId);
        }
        else if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
            const subscription = event.data.object as any;
            await db.update(users)
                .set({
                    subscriptionStatus: subscription.status,
                    plan: subscription.status === 'active' ? 'premium' : 'free'
                })
                .where(eq(users.stripeSubscriptionId, subscription.id));

            console.log("✅ Subscription updated:", subscription.id, "status:", subscription.status);
        }

        // Log successful webhook processing
        await db.insert(webhookLogs).values({
            eventType: event.type,
            eventId: event.id,
            payload: event as any,
            status: "success",
            userId: userId,
        });

        return new NextResponse(null, { status: 200 });
    } catch (error: any) {
        console.error("❌ Webhook processing error:", error);

        // Log failed webhook processing
        await db.insert(webhookLogs).values({
            eventType: event.type,
            eventId: event.id,
            payload: event as any,
            status: "failed",
            errorMessage: error.message,
            userId: userId,
        });

        return new NextResponse(`Processing Error: ${error.message}`, { status: 500 });
    }
}

