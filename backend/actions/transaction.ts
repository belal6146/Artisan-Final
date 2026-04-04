"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";

import { recordTransactionSchema } from "@/backend/lib/schemas";

export async function recordTransaction(uid: string, rawData: any) {
    if (!uid) throw new Error("User ID is required");

    try {
        const data = recordTransactionSchema.parse(rawData);
        logger.info('COMMERCE_CHECKOUT_SUCCESS', { userId: uid, itemId: data.itemId, source: 'backend' });

        await addDoc(collection(db, "users", uid, "transactions"), {
            ...data,
            date: new Date().toISOString()
        });

        return { success: true };
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed to record transaction", uid, error: error.message, source: 'backend' });
        return { success: false, error: error.name === "ZodError" ? "Invalid transaction history" : "Failed to record history" };
    }
}
