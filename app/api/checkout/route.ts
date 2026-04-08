import { NextResponse } from 'next/server';
import { PaymentService } from '@/backend/services/payment';
import { adminDb } from '@/backend/lib/firebase-admin';
import { logger } from '@/backend/lib/logger';

import { checkoutSchema } from '@/backend/lib/schemas';
import { getAuthorizedUser } from '@/backend/lib/auth-authority';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { itemId, type, userId, idToken } = checkoutSchema.parse(body);

        // Derive Identity if token present
        let derivedUserId = userId || 'anonymous';
        if (idToken) {
            try {
                derivedUserId = await getAuthorizedUser(idToken);
            } catch (authError) {
                logger.warn('SECURITY_VIOLATION', { itemId, type, message: 'Unauthorized checkout attempt', source: 'backend' });
                return NextResponse.json({ error: 'Unverified session. Please log in.' }, { status: 401 });
            }
        }

        // 1. Validate Item or Support Action
        let itemTitle = "";
        let itemPrice = 0;
        let itemCurrency = "GBP"; 
        let imageUrl = "";

        if (type === 'support') {
            itemTitle = "Studio Patronage Support";
            itemPrice = 5; 
            imageUrl = "/images/support-badge.png";
        } else {
            const collectionName = type === 'artwork' ? 'artworks' : 'events';
            const docSnap = await adminDb.collection(collectionName).doc(itemId).get();

            if (!docSnap.exists) {
                logger.warn('SECURITY_VIOLATION', { itemId, type, message: 'Requested non-existent item', source: 'backend' });
                return NextResponse.json({ error: 'Item not found in database' }, { status: 404 });
            }

            const item = docSnap.data()!;
            itemTitle = item.title;
            itemPrice = item.price || 0;
            itemCurrency = item.currency || "GBP";
            imageUrl = item.imageUrl || "";
        }

        // 2. Create Payment Session
        const { id: sessionId, clientSecret } = await PaymentService.createSession({
            id: itemId,
            title: itemTitle,
            price: itemPrice,
            currency: itemCurrency,
            userId: derivedUserId,
            type: type
        });


        return NextResponse.json({
            checkoutUrl: `/checkout/${sessionId}?type=${type}&itemId=${itemId}&clientSecret=${clientSecret}&title=${encodeURIComponent(itemTitle)}&imageUrl=${encodeURIComponent(imageUrl)}`
        });

    } catch (error: any) {
        logger.error('COMMERCE_CHECKOUT_FAILURE', { error: error.message, action: 'CREATE_SESSION', source: 'backend' });
        return NextResponse.json({ error: error.name === 'ZodError' ? "Invalid request data" : "Commerce engine error" }, { status: 500 });
    }
}
