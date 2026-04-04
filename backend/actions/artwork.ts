"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { createArtworkSchema } from "@/backend/lib/schemas";
import { logger } from "@/backend/lib/logger";

export async function createArtwork(rawData: any) {
    try {
        const data = createArtworkSchema.parse(rawData);
        logger.info('ARTWORK_CREATE_START', { artistId: data.artistId, title: data.title, source: 'backend' });

        const docRef = await addDoc(collection(db, "artworks"), {
            ...data,
            createdAt: new Date().toISOString(),
            status: data.isForSale ? "available" : "collection",
            visibility: "public"
        });

        logger.info('ARTWORK_CREATE_SUCCESS', { artworkId: docRef.id, artistId: data.artistId, source: 'backend' });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error('ARTWORK_CREATE_FAILURE', { error, source: 'backend' });
        return { 
            success: false, 
            error: error.name === "ZodError" ? "Invalid masterpiece details" : "Failed to record masterwork" 
        };
    }
}
