import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
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
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        const subscriptionId = session.subscription;
        const customerId = session.customer;
        const userId = session.metadata.userId;

        if (!userId) return new NextResponse("User ID metadata missing", { status: 400 });

        // Retrieve full subscription to get end date
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string) as any;

        await db.update(users).set({
            plan: 'premium',
            stripeCustomerId: customerId as string,
            stripeSubscriptionId: subscriptionId as string,
            subscriptionStatus: 'active',
            subscriptionEndDate: new Date(subscription.current_period_end * 1000)
        }).where(eq(users.id, userId));
    }
    else if (event.type === "invoice.payment_succeeded") {
        // Renewal success
        const subscriptionId = session.subscription;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string) as any;

        // Find user by subscription ID? Or just rely on customer ID?
        // Better to query by stripeSubscriptionId
        await db.update(users)
            .set({
                subscriptionStatus: 'active',
                subscriptionEndDate: new Date(subscription.current_period_end * 1000)
            })
            .where(eq(users.stripeSubscriptionId, subscriptionId as string));
    }
    else if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
        const subscription = event.data.object as any;
        await db.update(users)
            .set({
                subscriptionStatus: subscription.status,
                plan: subscription.status === 'active' ? 'premium' : 'free'
            })
            .where(eq(users.stripeSubscriptionId, subscription.id));
    }

    return new NextResponse(null, { status: 200 });
}
