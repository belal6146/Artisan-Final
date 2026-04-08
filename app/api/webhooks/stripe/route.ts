import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { recordTransaction } from '@/backend/actions/transaction';
import { onArtworkPurchase, onWorkshopRSVP } from '@/backend/lib/notifications';
import { logger } from '@/backend/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-03-25.dahlia' as any, // Cast to any to bypass the rigid type if necessary, but matching the project default
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!webhookSecret || !sig) {
        logger.error('SYSTEM_ERROR', { message: "Stripe Webhook Secret or Signature missing", source: 'backend' });
        return NextResponse.json({ error: 'Config Error' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        logger.error('SECURITY_VIOLATION', { message: "Webhook Signature Verification Failed", error: err.message, source: 'backend' });
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const { userId, itemId, itemTitle, type } = paymentIntent.metadata;

            if (userId && itemId) {
                logger.info('COMMERCE_CHECKOUT_SUCCESS', { 
                    userId, 
                    itemId, 
                    txId: paymentIntent.id, 
                    method: 'webhook', 
                    source: 'backend' 
                });

                // 2. Record transaction securely
                await recordTransaction(userId, {
                    type: 'buy',
                    itemId,
                    itemTitle: itemTitle || (type === 'event' ? 'Event Ticket' : 'Artwork'),
                    imageUrl: "", 
                    amount: paymentIntent.amount / 100,
                    currency: paymentIntent.currency.toUpperCase(),
                    paymentIntentId: paymentIntent.id
                });

                // 3. Trigger Real-time Alerts & Emails
                if (type === 'artwork') {
                    void onArtworkPurchase(userId, itemId);
                } else if (type === 'event') {
                    void onWorkshopRSVP(userId, itemId);
                }
            }
            break;
        
        default:
            // Unexpected event type
            logger.debug('SYSTEM_ERROR', { message: `Unhandled webhook event type ${event.type}`, source: 'backend' });
    }

    return NextResponse.json({ received: true });
}
