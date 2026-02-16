import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
            throw new Error('STRIPE_SECRET_KEY is missing. Cannot initialize Stripe.');
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
        return (getStripe() as any)[prop];
    },
});
