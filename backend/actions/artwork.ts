"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { createArtworkSchema } from "@/backend/lib/schemas";
import { logger } from "@/backend/lib/logger";
import { Artwork } from "@/types/schema";

// --- Queries ---

export async function getArtworks(maxResults: number = 20): Promise<Artwork[]> {
    try {
        const q = query(collection(db, "artworks"), where("status", "==", "available"), orderBy("createdAt", "desc"), limit(maxResults));
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
        const q = query(collection(db, "artworks"), where("artistId", "==", artistId));
        const snap = await getDocs(q);
        return snap.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data, 
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString() 
            } as Artwork;
        });
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching artist artworks", artistId, error: error.message, source: 'backend' });
        return [];
    }
}

// --- Mutations ---

export async function createArtwork(rawData: any) {
    try {
        const data = createArtworkSchema.parse(rawData);
        logger.info('ARTWORK_CREATE_START', { artistId: data.artistId, title: data.title, source: 'backend' });

        const { isForSale, ...rest } = data;
        const docRef = await addDoc(collection(db, "artworks"), {
            ...rest,
            createdAt: serverTimestamp(),
            status: isForSale ? "available" : "collection",
            visibility: "public",
        });

        logger.info('ARTWORK_CREATE_SUCCESS', { artworkId: docRef.id, artistId: data.artistId, source: 'backend' });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error('ARTWORK_CREATE_FAILURE', { error: error.message, source: 'backend' });
        return { success: false, error: error.name === "ZodError" ? "Invalid artwork details" : "Could not save artwork" };
    }
}
