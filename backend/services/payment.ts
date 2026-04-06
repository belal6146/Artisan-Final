
import { logger } from "@/backend/lib/logger";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2026-03-25.dahlia' as any,
});

export const PaymentService = {
    async processPayment(amount: number, currency: string, sourceId: string) {
        try {
            logger.info('PAYMENT_START', { amount, currency, sourceId, source: 'backend' });
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), 
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
            logger.error('PAYMENT_FAILURE', { error: error.message, sourceId, source: 'backend' });
            return { success: false, error: error.message };
        }
    },

    async createSession(items: { id: string, title: string, price: number, currency: string, userId: string, type: string }) {
        try {
            logger.info('COMMERCE_CHECKOUT_START', { itemId: items.id, userId: items.userId, source: 'backend' });
            
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(items.price * 100),
                currency: items.currency.toLowerCase(),
                metadata: {
                    itemId: items.id,
                    itemTitle: items.title,
                    userId: items.userId,
                    type: items.type
                },
                automatic_payment_methods: { enabled: true }
            });

            return {
                id: paymentIntent.id,
                clientSecret: paymentIntent.client_secret
            };
        } catch (error: any) {
            logger.error('COMMERCE_CHECKOUT_FAILURE', { error: error.message, itemId: items.id, source: 'backend' });
            throw error;
        }
    }
};
