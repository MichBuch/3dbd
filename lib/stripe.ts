import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeKey
    ? new Stripe(stripeKey, {
        apiVersion: '2025-12-15.clover' as any,
        typescript: true,
    })
    : new Proxy({} as any, {
        get: (target, prop) => {
            console.warn(`⚠️ Stripe is not initialized. Accessing '${String(prop)}' will return a mock.`);
            // Return a nested proxy to handle deep access like stripe.checkout.sessions.create
            return new Proxy(() => Promise.resolve({ url: '/?mock_payment=true', id: 'mock_session_id' }), {
                get: (t, p) => {
                    return new Proxy(() => Promise.resolve({ url: '/?mock_payment=true', id: 'mock_session_id' }), {
                        get: () => () => Promise.resolve({ url: '/?mock_payment=true', id: 'mock_session_id' })
                    });
                }
            });
        }
    });

if (!stripeKey) {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing. Using Mock Stripe Implementation for Build/Dev.");
}
