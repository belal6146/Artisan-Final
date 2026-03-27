import { NextResponse } from 'next/server';
import { PaymentService } from '@/backend/services/payment';
import { db } from '@/backend/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { itemId, type } = body; // type: 'artwork' | 'event'

        // 1. Validate Item or Support Action
        let itemTitle = "";
        let itemPrice = 0;
        let itemCurrency = "EUR";

        if (type === 'support') {
            itemTitle = "Studio Patronage Support";
            itemPrice = 5; // Flat €5 for the patron button
        } else {
            const collectionName = type === 'artwork' ? 'artworks' : 'events';
            const docRef = doc(db, collectionName, itemId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return NextResponse.json({ error: 'Item not found in database' }, { status: 404 });
            }

            const item = docSnap.data() as any;
            itemTitle = item.title;
            itemPrice = item.price || 0;
            itemCurrency = item.currency || "EUR";
        }

        // 2. Create Payment Session (Stripe PaymentIntent)
        const { id: sessionId, clientSecret } = await PaymentService.createSession({
            id: itemId,
            title: itemTitle,
            price: itemPrice,
            currency: itemCurrency
        });

        // 3. Return Checkout URL with clientSecret for the frontend
        return NextResponse.json({
            checkoutUrl: `/checkout/${sessionId}?type=${type}&itemId=${itemId}&clientSecret=${clientSecret}`
        });

    } catch (error) {
        console.error("Checkout Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
