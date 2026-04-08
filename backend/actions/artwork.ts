"use server";

import { adminDb } from "@/backend/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createArtworkSchema } from "@/backend/lib/schemas";
import { logger } from "@/backend/lib/logger";
import { Artwork } from "@/types/schema";

// --- Queries ---

export async function getArtworks(maxResults: number = 20): Promise<Artwork[]> {
    try {
        const snap = await adminDb.collection("artworks")
            .where("status", "==", "available")
            .orderBy("createdAt", "desc")
            .limit(maxResults)
            .get();

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
    if (!id || typeof id !== 'string') {
        logger.warn('SYSTEM_ERROR', { message: "Invalid Artwork ID requested", id, source: 'backend' });
        return undefined;
    }

    try {
        const docSnap = await adminDb.collection("artworks").doc(id).get();
        if (docSnap.exists) {
            const data = docSnap.data()!;
            return { 
                id: docSnap.id, 
                ...data, 
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString() 
            } as Artwork;
        }
        return undefined;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { 
            message: `CRITICAL: Failed to retrieve masterpiece [${id}]`, 
            id, 
            error: {
                message: error.message,
                code: error.code,
                stack: error.stack
            },
            source: 'backend' 
        });
        return undefined;
    }
}

export async function getArtworksByArtist(artistId: string): Promise<Artwork[]> {
    try {
        const snap = await adminDb.collection("artworks")
            .where("artistId", "==", artistId)
            .orderBy("createdAt", "desc")
            .limit(100)
            .get();

        const artworks = snap.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data, 
                createdAt: data.createdAt?.toDate?.()?.toISOString() || (data.createdAt?.toISOString?.() ?? new Date().toISOString())
            } as Artwork;
        });

        logger.info('ARTWORK_FETCH_SUCCESS', { artistId, count: artworks.length, source: 'backend' });
        return artworks;
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
import { getUserById } from "@/backend/actions/profile";

export async function createArtwork(rawData: Record<string, any>, idToken: string) {
    try {
        // 1. Verify Authority & Identity
        const verifiedUid = await getAuthorizedUser(idToken);
        const profile = await getUserById(verifiedUid);
        if (!profile) throw new Error("ARTISAN_PROFILE_NOT_FOUND");

        logger.info('ARTWORK_CREATE_START', { artistId: verifiedUid, title: rawData.title, source: 'backend' });

        // 2. Validate Input Schema (Client Data only)
        const data = createArtworkSchema.parse(rawData);

        // 3. Save to System of Record with DERIVED Identity
        const { isForSale, ...rest } = data;
        const docRef = await adminDb.collection("artworks").add({
            ...rest,
            artistId: verifiedUid,
            artistName: profile.displayName || "Anonymous Artisan",
            createdAt: FieldValue.serverTimestamp(),
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
