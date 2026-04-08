"use server";

import { adminDb } from "@/backend/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "@/backend/lib/logger";
import { createJournalSchema } from "@/backend/lib/schemas";
import { getAuthorizedUser } from "@/backend/lib/auth-authority";
import { getUserById } from "@/backend/actions/profile";

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

export async function createJournalEntry(rawData: Record<string, any>, idToken: string) {
    try {
        const verifiedUid = await getAuthorizedUser(idToken);
        const profile = await getUserById(verifiedUid);
        
        const data = createJournalSchema.parse(rawData);
        logger.info('JOURNAL_CREATE_START', { userId: verifiedUid, title: data.title, source: 'backend' });
        
        const docRef = await adminDb.collection("users").doc(verifiedUid).collection("journal_entries").add({
            userId: verifiedUid,
            author: profile?.displayName || "Anonymous Artisan",
            ...data,
            excerpt: data.content.substring(0, 160) + "...",
            createdAt: FieldValue.serverTimestamp()
        });
        
        logger.info('JOURNAL_CREATE_SUCCESS', { userId: verifiedUid, entryId: docRef.id, source: 'backend' });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED_ACCESS_BLOCKED") {
            logger.error('SECURITY_VIOLATION', { message: "JOURNAL_CREATE_BLOCKED", source: 'backend' });
            return { success: false, error: "Access Denied: Unverified session" };
        }
        logger.error('JOURNAL_CREATE_FAILURE', { error: error.message, source: 'backend' });
        return { 
            success: false, 
            error: error.name === "ZodError" ? "Invalid chronicle format" : "Failed to record chronicle" 
        };
    }
}

export async function getGlobalJournalEntries() {
    try {
        const snap = await adminDb.collectionGroup("journal_entries").limit(100).get();
        const entries = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as JournalEntry;
        });
        
        // Sort in memory to avoid collectionGroup index requirement for ordering
        entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        logger.info('JOURNAL_FETCH_SUCCESS', { count: entries.length, source: 'backend' });
        return entries;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { error: error.message, action: 'getGlobalJournalEntries', source: 'backend' });
        return [];
    }
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    try {
        const snap = await adminDb.collection("users").doc(userId).collection("journal_entries")
            .orderBy("createdAt", "desc")
            .get();
            
        const entries = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as JournalEntry;
        });

        logger.info('JOURNAL_FETCH_SUCCESS', { userId, count: entries.length, source: 'backend' });
        return entries;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { error: error.message, userId, action: 'getJournalEntries', source: 'backend' });
        return [];
    }
}

export async function getJournalEntryById(id: string) {
    try {
        const snap = await adminDb.collectionGroup('journal_entries').limit(200).get(); 
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