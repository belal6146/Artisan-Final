
import { logger } from "@/backend/lib/logger";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2026-03-25.dahlia',
});

export const PaymentService = {
    async processPayment(amount: number, currency: string, sourceId: string) {
        try {
            logger.info(`Processing payment`, { amount, currency, sourceId });
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // convert to cents
                currency: currency.toLowerCase(),
                payment_method: sourceId,
                confirm: true,
                automatic_payment_methods: { enabled: true, allow_redirects: 'never' }
            });

            return {
                success: paymentIntent.status === 'succeeded',
                transactionId: paymentIntent.id,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            logger.error("Stripe Charge Error:", { error: error.message });
            return { success: false, error: error.message };
        }
    },

    async createSession(items: { id: string, title: string, price: number, currency: string }) {
        try {
            logger.info(`Creating Stripe PaymentIntent`, { items });
            
            // For real Stripe integration, we create a PaymentIntent and return its client_secret
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(items.price * 100),
                currency: items.currency.toLowerCase(),
                metadata: {
                    itemId: items.id,
                    itemTitle: items.title
                },
                automatic_payment_methods: { enabled: true }
            });

            return {
                id: paymentIntent.id,
                clientSecret: paymentIntent.client_secret
            };
        } catch (error: any) {
            logger.error("Stripe Session Error:", { error: error.message });
            throw error;
        }
    }
};
