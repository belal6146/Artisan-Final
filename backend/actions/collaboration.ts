"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, where, doc, getDoc } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";
import { Collaboration, CollaborationApplication } from "@/types/schema";

import { createCollabSchema, applyCollabSchema } from "@/backend/lib/schemas";

export async function createCollaboration(rawData: any) {
    try {
        const data = createCollabSchema.parse(rawData);
        logger.info('COLLAB_CREATE_START', { authorId: data.authorId, title: data.title, source: 'backend' });

        const docRef = await addDoc(collection(db, "collaborations"), {
            ...data,
            status: 'Open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        logger.info('COLLAB_CREATE_SUCCESS', { collaborationId: docRef.id, authorId: data.authorId, source: 'backend' });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error('COLLAB_CREATE_FAILURE', { error, source: 'backend' });
        return { 
            success: false, 
            error: error.name === "ZodError" ? "Invalid collaboration details" : "Failed to broadcast call" 
        };
    }
}

export async function getCollaborations() {
    try {
        const q = query(collection(db, "collaborations"), where("status", "==", "Open"));
        const snapshot = await getDocs(q);
        const collaborations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Collaboration[];
        
        collaborations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return collaborations;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching collaborations", error: error.message, source: 'backend' });
        return [];
    }
}

export async function getCollaborationsByAuthorId(authorId: string) {
    try {
        const q = query(collection(db, "collaborations"), where("authorId", "==", authorId));
        const snapshot = await getDocs(q);
        const collaborations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Collaboration[];
        collaborations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return collaborations;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching author collaborations", authorId, error: error.message, source: 'backend' });
        return [];
    }
}

export async function applyToCollaboration(rawData: any) {
    try {
        const data = applyCollabSchema.parse(rawData);
        logger.info('COLLAB_INTEREST_START', { collaborationId: data.collaborationId, userId: data.userId, source: 'backend' });

        const collabRef = doc(db, "collaborations", data.collaborationId);
        const collabSnap = await getDoc(collabRef);
        if (!collabSnap.exists()) throw new Error("Collaboration call not found");

        await addDoc(collection(db, "collaborations", data.collaborationId, "applications"), {
            userId: data.userId,
            userName: data.userName,
            message: data.message,
            createdAt: new Date().toISOString(),
            status: 'Pending'
        });

        const { createNotification } = await import("@/backend/lib/notifications");
        await createNotification(
            collabSnap.data().authorId,
            'system',
            `${data.userName} joined your call "${collabSnap.data().title}"`,
            { collaborationId: data.collaborationId, userName: data.userName, type: 'collaboration_interest' }
        );

        logger.info('COLLAB_INTEREST_SUCCESS', { collaborationId: data.collaborationId, userId: data.userId, source: 'backend' });
        return { success: true };
    } catch (error: any) {
        logger.error('COLLAB_INTEREST_FAILURE', { error, source: 'backend' });
        return { 
            success: false, 
            error: error.name === "ZodError" ? "Invalid application message" : "Failed to join call" 
        };
    }
}

export async function getCollaborationById(id: string) {
    try {
        const docRef = doc(db, "collaborations", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() } as Collaboration;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching collaboration", id, error: error.message, source: 'backend' });
        return null;
    }
}

export async function getApplicationsByCollabId(collabId: string) {
    try {
        const q = query(
            collection(db, "collaborations", collabId, "applications"),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CollaborationApplication[];
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching applications", collabId, error: error.message, source: 'backend' });
        return [];
    }
}
