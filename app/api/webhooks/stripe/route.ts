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

        if (!userId) {
            return new NextResponse("User ID metadata missing", { status: 400 });
        }

        await db.update(users).set({
            plan: 'premium',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId
        }).where(eq(users.id, userId));
    }

    return new NextResponse(null, { status: 200 });
}
