"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { createArtworkSchema } from "@/backend/lib/schemas";
import { logger } from "@/backend/lib/logger";
import { Artwork } from "@/types/schema";

// --- Queries ---

export async function getArtworks(maxResults: number = 20): Promise<Artwork[]> {
    try {
        const q = query(
            collection(db, "artworks"), 
            where("status", "==", "available"),
            orderBy("createdAt", "desc"), 
            limit(maxResults)
        );
        const snap = await getDocs(q);
        const artworks = snap.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data, 
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString() 
            } as Artwork;
        });
        logger.info('ARTWORK_FETCH_SUCCESS', { count: artworks.length, source: 'backend' });
        return artworks;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching artworks", error: error.message, source: 'backend' });
        return [];
    }
}

export async function getArtworkById(id: string): Promise<Artwork | undefined> {
    try {
        const docRef = doc(db, "artworks", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return { 
                id: docSnap.id, 
                ...data, 
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString() 
            } as Artwork;
        }
        return undefined;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: `Failed to fetch artwork ${id}`, error: error.message, source: 'backend' });
        return undefined;
    }
}

export async function getArtworksByArtist(artistId: string): Promise<Artwork[]> {
    try {
        const q = query(
            collection(db, "artworks"), 
            where("artistId", "==", artistId),
            // ORDER BY removed temporarily until composite index is deployed: works: artistId ASC, createdAt DESC
            // orderBy("createdAt", "desc"),
            limit(100)
        );
        const snap = await getDocs(q);
        const artworks = snap.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data, 
                createdAt: data.createdAt?.toDate?.()?.toISOString() || (data.createdAt?.toISOString?.() ?? new Date().toISOString())
            } as Artwork;
        });

        // 🛡️ Safe in-memory fallback for high-performance sort
        const sorted = artworks.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

        logger.info('ARTWORK_FETCH_SUCCESS', { artistId, count: sorted.length, source: 'backend' });
        return sorted;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { 
            message: "Failed fetching artist artworks", 
            artistId, 
            error: error.message || error,
            code: error.code || 'unknown',
            source: 'backend' 
        });
        return [];
    }
}

// --- Mutations ---

import { getAuthorizedUser } from "@/backend/lib/auth-authority";

export async function createArtwork(rawData: any, idToken: string) {
    try {
        // 1. Verify Authority & Identity
        const verifiedUid = await getAuthorizedUser(idToken);
        logger.info('ARTWORK_CREATE_START', { artistId: verifiedUid, title: rawData.title, source: 'backend' });

        // 2. Derive Identity (Override client-provided ID)
        const dataPayload = { ...rawData, artistId: verifiedUid };
        const data = createArtworkSchema.parse(dataPayload);

        // 3. Save to System of Record
        const { isForSale, ...rest } = data;
        const docRef = await addDoc(collection(db, "artworks"), {
            ...rest,
            createdAt: serverTimestamp(),
            status: isForSale ? "available" : "collection",
            visibility: "public",
        });

        logger.info('ARTWORK_CREATE_SUCCESS', { artworkId: docRef.id, artistId: verifiedUid, source: 'backend' });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED_ACCESS_BLOCKED") {
            logger.error('SECURITY_VIOLATION', { message: "ARTWORK_CREATE_BLOCKED", source: 'backend' });
            return { success: false, error: "Access Denied: Unverified session" };
        }
        
        logger.error('ARTWORK_CREATE_FAILURE', { error: error.message, source: 'backend', isZod: error.name === "ZodError" });
        return { success: false, error: error.name === "ZodError" ? "Invalid artwork details" : "Could not save artwork" };
    }
}
