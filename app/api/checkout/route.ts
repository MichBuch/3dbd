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

        // Check if user is already premium
        if (user && user.plan === 'premium') {
            return new NextResponse("Already Premium", { status: 400 });
        }

        // Regular Stripe checkout flow
        const checkoutSession = await stripe.checkout.sessions.create({
            // @ts-ignore
            automatic_payment_methods: {
                enabled: true,
            },
            line_items: [
                {
                    price: 'price_1SiCGICcL18osdGS6bsleSC1', // 3DBD one year game access ($19.99)
                    quantity: 1,
                },
            ],
            mode: "subscription",
            allow_promotion_codes: true, // Allow coupons if needed
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
