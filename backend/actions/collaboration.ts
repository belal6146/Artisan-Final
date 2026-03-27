"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, where } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";
import { Collaboration } from "@/types/schema";

export async function createCollaboration(data: {
    title: string;
    description: string;
    type: Collaboration['type'];
    compensation: Collaboration['compensation'];
    authorId: string;
    authorName: string;
    authorAvatarUrl?: string;
    location: string;
    locationType: Collaboration['locationType'];
    skills?: string[];
}) {
    if (!data.authorId) {
        throw new Error("Author ID is required");
    }

    try {
        const docRef = await addDoc(collection(db, "collaborations"), {
            ...data,
            status: 'Open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        logger.info("Created new collaboration", {
            collaborationId: docRef.id,
            authorId: data.authorId,
            type: data.type
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error("Failed to create collaboration", { error: error.message, stack: error.stack, authorId: data.authorId });
        return { success: false, error: error.message };
    }
}

export async function getCollaborations() {
    try {
        // Query only by status to avoid composite index requirement
        const q = query(
            collection(db, "collaborations"),
            where("status", "==", "Open")
        );

        const snapshot = await getDocs(q);
        const collaborations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Collaboration[];

        // Sort by createdAt descending in memory
        collaborations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        logger.info("Fetched open collaborations", { count: collaborations.length });
        return collaborations;
    } catch (error: any) {
        logger.error("Failed to fetch collaborations", { error: error.message, stack: error.stack });
        return [];
    }
}
