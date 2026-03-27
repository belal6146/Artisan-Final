"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";

interface TransactionData {
    type: 'buy' | 'sell' | 'rent';
    itemId: string;
    itemTitle: string;
    amount: number;
    currency: string;
}

export async function recordTransaction(uid: string, data: TransactionData) {
    if (!uid) throw new Error("User ID is required");

    try {
        logger.info("Recording transaction", { uid, type: data.type, itemId: data.itemId });

        await addDoc(collection(db, "users", uid, "transactions"), {
            ...data,
            date: new Date().toISOString()
        });

        return { success: true };
    } catch (error: any) {
        logger.error("Failed to record transaction", { uid, error: error.message });
        return { success: false, error: error.message };
    }
}
