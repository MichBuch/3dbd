import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build';

export const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-12-15.clover' as any, // Cast to any to avoid type conflicts if types are outdated/newer
    typescript: true,
});

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing. Stripe functionality will not work.");
}
