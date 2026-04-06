"use server";

import { db } from "@/backend/config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";
import { recordTransactionSchema } from "@/backend/lib/schemas";

export async function recordTransaction(uid: string, rawData: any) {
    if (!uid) throw new Error("User ID is required");

    try {
        const data = recordTransactionSchema.parse(rawData);
        const txId = (data.paymentIntentId || `tx_${Date.now()}`).toString();
        
        // Use PaymentIntent ID as the document key for absolute idempotency
        const txRef = doc(db, "users", uid, "transactions", txId);
        const existing = await getDoc(txRef);
        
        if (existing.exists()) {
            return { success: true, duplicated: true };
        }

        logger.info('COMMERCE_CHECKOUT_SUCCESS', { userId: uid, itemId: data.itemId, txId, source: 'backend' });

        await setDoc(txRef, {
            ...data,
            id: txId,
            date: new Date().toISOString()
        });

        return { success: true };
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed to record transaction", uid, error: error.message, source: 'backend' });
        return { success: false, error: error.name === "ZodError" ? "Invalid transaction history" : "Failed to record history" };
    }
}
