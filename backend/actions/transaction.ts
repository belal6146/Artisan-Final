"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";

interface TransactionData {
    type: 'buy' | 'sell' | 'rent';
    itemId: string;
    itemTitle: string;
    imageUrl?: string;
    amount: number;
    currency: string;
}

export async function recordTransaction(uid: string, data: TransactionData) {
    if (!uid) throw new Error("User ID is required");

    try {
        logger.info('COMMERCE_CHECKOUT_SUCCESS', { userId: uid, type: data.type, itemId: data.itemId, source: 'backend' });

        await addDoc(collection(db, "users", uid, "transactions"), {
            ...data,
            date: new Date().toISOString()
        });

        return { success: true };
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed to record transaction", uid, error: error.message, source: 'backend' });
        return { success: false, error: error.message };
    }
}
