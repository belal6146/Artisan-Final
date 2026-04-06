import { db } from "@/backend/config/firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp, collectionGroup, serverTimestamp, limit } from "firebase/firestore";
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

import { createJournalSchema } from "@/backend/lib/schemas";

export async function createJournalEntry(userId: string, rawData: any) {
    try {
        const data = createJournalSchema.parse(rawData);
        logger.info('JOURNAL_CREATE_START', { userId, title: data.title, source: 'backend' });
        
        const docRef = await addDoc(collection(db, "users", userId, "journal_entries"), {
            userId,
            ...data,
            excerpt: data.content.substring(0, 160) + "...",
            createdAt: serverTimestamp()
        });
        
        logger.info('JOURNAL_CREATE_SUCCESS', { userId, entryId: docRef.id, source: 'backend' });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error('JOURNAL_CREATE_FAILURE', { error: error.message, userId, source: 'backend' });
        return { 
            success: false, 
            error: error.name === "ZodError" ? "Invalid chronicle format" : "Failed to record chronicle" 
        };
    }
}

export async function getGlobalJournalEntries() {
    try {
        const q = query(collectionGroup(db, "journal_entries"), limit(100));
        const snap = await getDocs(q);
        const entries = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as JournalEntry));
        
        // Sort in memory to avoid collectionGroup index requirement for ordering
        entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        logger.info('JOURNAL_FETCH_SUCCESS', { count: entries.length, source: 'backend' });
        return entries;
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
        return snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as JournalEntry;
        });
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { error: error.message, userId, action: 'getJournalEntries', source: 'backend' });
        return [];
    }
}

export async function getJournalEntryById(id: string) {
    try {
        const q = query(collectionGroup(db, 'journal_entries'), limit(200)); // Still semi-broad to find specific leaf ID
        const snap = await getDocs(q);
        const docSnap = snap.docs.find(d => d.id === id);
        if (!docSnap) return null;
        
        const data = docSnap.data();
        return { 
            id: docSnap.id, 
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as JournalEntry;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { error: error.message, id, action: 'getJournalEntryById', source: 'backend' });
        return null;
    }
}