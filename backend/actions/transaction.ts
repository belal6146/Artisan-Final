"use server";

import { adminDb } from "@/backend/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "@/backend/lib/logger";
import { recordTransactionSchema } from "@/backend/lib/schemas";

export async function recordTransaction(uid: string, rawData: any) {
    if (!uid) throw new Error("User ID is required");

    try {
        const data = recordTransactionSchema.parse(rawData);
        const txId = (data.paymentIntentId || `tx_${Date.now()}`).toString();
        
        // Use PaymentIntent ID as the document key for absolute idempotency
        const txRef = adminDb.collection("users").doc(uid).collection("transactions").doc(txId);
        const existing = await txRef.get();
        
        if (existing.exists) {
            return { success: true, duplicated: true };
        }

        logger.info('COMMERCE_CHECKOUT_SUCCESS', { userId: uid, itemId: data.itemId, txId, source: 'backend' });

        await txRef.set({
            ...data,
            id: txId,
            date: FieldValue.serverTimestamp()
        });

        return { success: true };
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed to record transaction", uid, error: error.message, source: 'backend' });
        return { success: false, error: error.name === "ZodError" ? "Invalid transaction history" : "Failed to record history" };
    }
}
