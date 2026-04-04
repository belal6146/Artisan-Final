
import { db } from "@/backend/config/firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp, collectionGroup } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";

export interface JournalEntry {
    id?: string;
    userId: string;
    title: string;
    content: string;
    excerpt?: string;
    author?: string;
    category?: string;
    readTime?: string;
    imageUrl?: string;
    createdAt: string;
}

export async function createJournalEntry(userId: string, data: { title: string; content: string; imageUrl?: string; category?: string; author?: string }) {
    try {
        const entry = {
            userId,
            ...data,
            excerpt: data.content.substring(0, 160) + "...",
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, "users", userId, "journal_entries"), entry);
        logger.info('JOURNAL_ENTRY_CREATED', { userId, entryId: docRef.id, source: 'backend' });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { error: error.message, userId, action: 'createJournalEntry', source: 'backend' });
        return { success: false, error: error.message };
    }
}

export async function getGlobalJournalEntries() {
    try {
        const q = query(
            collectionGroup(db, "journal_entries"),
            orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { error: error.message, action: 'getGlobalJournalEntries', source: 'backend' });
        return [];
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
        logger.error('SYSTEM_ERROR', { error: error.message, userId, action: 'getJournalEntries', source: 'backend' });
        return [];
    }
}

