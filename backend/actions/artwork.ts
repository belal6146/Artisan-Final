"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";

export async function createArtwork(data: {
    title: string;
    description: string;
    price: number;
    imageUrl?: string; // Legacy
    imageUrls?: string[]; // New
    primaryImageIndex?: number;
    artistId: string;
    artistName: string;
    location?: string;
    currency?: string;
    isForSale?: boolean;
}) {
    if (!data.artistId) {
        logger.error("Artwork creation failed: missing artistId", { data });
        throw new Error("Artist ID is required");
    }

    try {
        // Handle image backward compatibility
        const finalImageUrls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
        const primaryImage = finalImageUrls[data.primaryImageIndex || 0] || data.imageUrl || "";

        logger.info("Creating new artwork", {
            artistId: data.artistId,
            title: data.title,
            isForSale: data.isForSale ?? true,
            location: data.location || "Global",
            imageCount: finalImageUrls.length
        });

        const artworkData = {
            ...data,
            imageUrl: primaryImage, // Maintain legacy field for easy display
            imageUrls: finalImageUrls,
            primaryImageIndex: data.primaryImageIndex || 0,
            location: data.location || "Global",
            currency: data.currency || "EUR",
            visibility: "public" as const,
            tags: [],
            category: "Painting",
            medium: "Painting" as const,
            createdAt: new Date().toISOString(),
            status: (data.isForSale ?? true) ? "available" as const : "collection" as const
        };

        // Add to main collection
        const docRef = await addDoc(collection(db, "artworks"), artworkData);

        logger.info("Artwork created successfully", {
            artworkId: docRef.id,
            artistId: data.artistId,
            status: artworkData.status,
            imageCount: finalImageUrls.length
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error("Failed to create artwork", {
            error: error.message,
            stack: error.stack,
            artistId: data.artistId,
            title: data.title
        });
        return { success: false, error: error.message };
    }
}
