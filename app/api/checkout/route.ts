import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure db is exported from db/index or similar
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get user from DB to check current plan
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

        if (user && user.plan === 'premium') {
            return new NextResponse("Already Premium", { status: 400 });
        }

        // ✅ PAYMENT BYPASS TOGGLE
        // Set ENABLE_PAYMENTS=false in .env.local to offer free premium access
        const paymentsEnabled = process.env.ENABLE_PAYMENTS !== 'false';

        if (!paymentsEnabled) {
            // Auto-grant premium access without payment
            if (user) {
                await db
                    .update(users)
                    .set({
                        plan: 'premium',
                        subscriptionStatus: 'active_free',  // Mark as free access
                        subscriptionEndDate: null  // No expiration for free access
                    })
                    .where(eq(users.id, user.id));
            }

            return NextResponse.json({
                url: '/?upgraded=true',
                message: 'Premium access granted (free trial period)'
            });
        }

        // Regular Stripe checkout flow (when payments are enabled)
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "3D4BD Premium",
                            description: "Unlock multiplayer and leaderboards",
                        },
                        unit_amount: 999, // $9.99
                        recurring: {
                            interval: "year"
                        }
                    },
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXTAUTH_URL}/?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/?canceled=true`,
            customer_email: session.user.email,
            metadata: {
                userId: user?.id || session.user.id || "",
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error("[STRIPE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
