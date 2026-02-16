import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        const stripeKey = process.env.STRIPE_SECRET_KEY;

        // If the key is missing (typical in build environments), return a placeholder
        // instance to prevent the build from crashing during static analysis.
        if (!stripeKey) {
            console.warn('⚠️ STRIPE_SECRET_KEY is missing. Using placeholder for build/initialization.');
            return new Stripe('sk_test_placeholder', {
                apiVersion: '2025-12-15.clover' as any,
                typescript: true,
            });
        }

        _stripe = new Stripe(stripeKey, {
            apiVersion: '2025-12-15.clover' as any,
            typescript: true,
        });
    }
    return _stripe;
}

// Keep backward-compatible export (lazy getter)
export const stripe = new Proxy({} as Stripe, {
    get(_, prop) {
        const instance = getStripe();
        return (instance as any)[prop];
    },
});
