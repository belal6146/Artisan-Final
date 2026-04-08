"use server";

import { adminDb } from "@/backend/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "@/backend/lib/logger";
import { Collaboration, CollaborationApplication } from "@/types/schema";

import { createCollabSchema, applyCollabSchema } from "@/backend/lib/schemas";

import { getAuthorizedUser } from "@/backend/lib/auth-authority";
import { getUserById } from "@/backend/actions/profile";

export async function createCollaboration(rawData: any, idToken: string) {
    try {
        const verifiedUid = await getAuthorizedUser(idToken);
        const profile = await getUserById(verifiedUid);
        if (!profile) throw new Error("AUTHOR_PROFILE_NOT_FOUND");

        const data = createCollabSchema.parse(rawData);
        logger.info('COLLAB_CREATE_START', { authorId: verifiedUid, title: data.title, source: 'backend' });

        const docRef = await adminDb.collection("collaborations").add({
            ...data,
            authorId: verifiedUid,
            authorName: profile.displayName || "Anonymous Artisan",
            status: 'Open',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });

        logger.info('COLLAB_CREATE_SUCCESS', { collaborationId: docRef.id, authorId: verifiedUid, source: 'backend' });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED_ACCESS_BLOCKED") {
            logger.error('SECURITY_VIOLATION', { message: "COLLAB_CREATE_BLOCKED", source: 'backend' });
            return { success: false, error: "Access Denied: Unverified session" };
        }
        logger.error('COLLAB_CREATE_FAILURE', { error: error.message, source: 'backend' });
        return { 
            success: false, 
            error: error.name === "ZodError" ? "Invalid collaboration details" : "Failed to broadcast call" 
        };
    }
}

export async function getCollaborations() {
    try {
        const snapshot = await adminDb.collection("collaborations")
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        const results = snapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as Collaboration;
        }).filter(c => c.status === "Open");
        
        logger.info('COLLAB_FETCH_SUCCESS', { count: results.length, source: 'backend' });
        return results;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching collaborations", error: error.message, source: 'backend' });
        return [];
    }
}

export async function getCollaborationsByAuthorId(authorId: string) {
    try {
        const snapshot = await adminDb.collection("collaborations")
            .where("authorId", "==", authorId)
            .get();

        const collaborations = snapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as Collaboration;
        });
        collaborations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return collaborations;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching author collaborations", authorId, error: error.message, source: 'backend' });
        return [];
    }
}

export async function applyToCollaboration(rawData: any, idToken: string) {
    try {
        const verifiedUid = await getAuthorizedUser(idToken);
        const profile = await getUserById(verifiedUid);
        if (!profile) throw new Error("APPLICANT_PROFILE_NOT_FOUND");

        const data = applyCollabSchema.parse(rawData);
        const userName = profile.displayName || "Anonymous Artisan";

        logger.info('COLLAB_INTEREST_START', { collaborationId: data.collaborationId, userId: verifiedUid, source: 'backend' });

        const collabRef = adminDb.collection("collaborations").doc(data.collaborationId);
        const collabSnap = await collabRef.get();
        if (!collabSnap.exists) throw new Error("Collaboration call not found");

        await collabRef.collection("applications").add({
            userId: verifiedUid,
            userName,
            message: data.message,
            createdAt: FieldValue.serverTimestamp(),
            status: 'Pending'
        });

        // Notification is supplementary
        try {
            const { createNotification } = await import("@/backend/lib/notifications");
            await createNotification(
                collabSnap.data()!.authorId,
                'system',
                `${userName} joined your call "${collabSnap.data()!.title}"`,
                { collaborationId: data.collaborationId, userName, type: 'collaboration_interest' }
            );
        } catch (notifError: any) {
            logger.error('SYSTEM_EMAIL_FAILED', {
                message: "Collaboration notification failed to deliver",
                collaborationId: data.collaborationId,
                userId: verifiedUid,
                error: notifError.message,
                source: 'backend'
            });
        }

        logger.info('COLLAB_INTEREST_SUCCESS', { collaborationId: data.collaborationId, userId: verifiedUid, source: 'backend' });
        return { success: true };
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED_ACCESS_BLOCKED") {
            logger.error('SECURITY_VIOLATION', { message: "COLLAB_APPLY_BLOCKED", source: 'backend' });
            return { success: false, error: "Access Denied: Unverified session" };
        }
        logger.error('COLLAB_INTEREST_FAILURE', { error: error.message, source: 'backend' });
        return { 
            success: false, 
            error: error.name === "ZodError" ? "Invalid application message" : "Failed to join call" 
        };
    }
}

export async function getCollaborationById(id: string) {
    try {
        const docSnap = await adminDb.collection("collaborations").doc(id).get();
        if (!docSnap.exists) return null;
        const data = docSnap.data()!;
        return { 
            id: docSnap.id, 
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as Collaboration;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching collaboration", id, error: error.message, source: 'backend' });
        return null;
    }
}

export async function getApplicationsByCollabId(collabId: string) {
    try {
        const snapshot = await adminDb.collection("collaborations").doc(collabId)
            .collection("applications")
            .orderBy("createdAt", "desc")
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as CollaborationApplication;
        });
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching applications", collabId, error: error.message, source: 'backend' });
        return [];
    }
}
