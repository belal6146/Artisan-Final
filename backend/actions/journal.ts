
import { db } from "@/backend/config/firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";

export interface JournalEntry {
    id?: string;
    userId: string;
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
}

export async function createJournalEntry(userId: string, data: { title: string; content: string; imageUrl?: string }) {
    try {
        const entry = {
            userId,
            ...data,
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, "users", userId, "journal_entries"), entry);
        logger.info("Journal entry created", { userId, entryId: docRef.id });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error("Failed to create journal entry", { error: error.message, userId });
        return { success: false, error: error.message };
    }
}

export async function getJournalEntries(userId: string) {
    try {
        const q = query(
            collection(db, "users", userId, "journal_entries"),
            orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
    } catch (error: any) {
        logger.error("Failed to fetch journal entries", { error: error.message, userId });
        return [];
    }
}
