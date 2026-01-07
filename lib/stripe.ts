import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is missing. Cannot initialize Stripe.');
}

export const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-12-15.clover' as any,
    typescript: true,
});
