import { NextResponse } from 'next/server';
import { PaymentService } from '@/backend/services/payment';
import { db } from '@/backend/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logger } from '@/backend/lib/logger';

import { checkoutSchema } from '@/backend/lib/schemas';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { itemId, type } = checkoutSchema.parse(body);

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
            const docRef = doc(db, collectionName, itemId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                logger.warn('SECURITY_VIOLATION', { itemId, type, message: 'Requested non-existent item', source: 'backend' });
                return NextResponse.json({ error: 'Item not found in database' }, { status: 404 });
            }

            const item = docSnap.data() as any;
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
            currency: itemCurrency
        });

        logger.info('COMMERCE_CHECKOUT_START', { itemId, type, sessionId, source: 'backend' });

        return NextResponse.json({
            checkoutUrl: `/checkout/${sessionId}?type=${type}&itemId=${itemId}&clientSecret=${clientSecret}&title=${encodeURIComponent(itemTitle)}&imageUrl=${encodeURIComponent(imageUrl)}`
        });

    } catch (error: any) {
        logger.error('COMMERCE_CHECKOUT_FAILURE', { error: error.message, action: 'CREATE_SESSION', source: 'backend' });
        return NextResponse.json({ error: error.name === 'ZodError' ? "Invalid request data" : "Commerce engine error" }, { status: 500 });
    }
}
