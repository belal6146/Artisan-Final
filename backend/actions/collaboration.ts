"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, where, doc, getDoc } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";
import { Collaboration, CollaborationApplication } from "@/types/schema";

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

        logger.info('COLLAB_POST_CREATED', {
            collaborationId: docRef.id,
            authorId: data.authorId,
            type: data.type,
            source: 'backend'
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { 
            message: "Failed to create collaboration", 
            error: error.message, 
            authorId: data.authorId, 
            source: 'backend' 
        });
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

        logger.info('COLLAB_POST_UPDATED', { count: collaborations.length, message: "Fetched open collabs", source: 'backend' });
        return collaborations;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { 
            message: "Failed fetching collaborations", 
            error: error.message, 
            source: 'backend' 
        });
        return [];
    }
}

export async function getCollaborationsByAuthorId(authorId: string) {
    try {
        const q = query(
            collection(db, "collaborations"),
            where("authorId", "==", authorId)
        );

        const snapshot = await getDocs(q);
        const collaborations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Collaboration[];

        // Sort by createdAt descending in memory
        collaborations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        logger.info('COLLAB_POST_UPDATED', { authorId, count: collaborations.length, message: "Fetched author collabs", source: 'backend' });
        return collaborations;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { 
            message: "Failed fetching author collaborations", 
            authorId, 
            error: error.message, 
            source: 'backend' 
        });
        return [];
    }
}

export async function applyToCollaboration(data: {
    collaborationId: string;
    userId: string;
    userName: string;
    message: string;
}) {
    const { collaborationId, userId, userName, message } = data;

    try {
        // 1. Get Collaboration Details
        const collabRef = doc(db, "collaborations", collaborationId);
        const collabSnap = await getDoc(collabRef);

        if (!collabSnap.exists()) {
            throw new Error("Collaboration call not found");
        }

        const collabData = collabSnap.data();

        // 2. Add to Applications (Subcollection)
        await addDoc(collection(db, "collaborations", collaborationId, "applications"), {
            userId,
            userName,
            message,
            createdAt: new Date().toISOString(),
            status: 'Pending'
        });

        // 3. 🔔 In-App Notification (for Author)
        const { createNotification } = await import("@/backend/lib/notifications");
        await createNotification(
            collabData.authorId,
            'system',
            `${userName} is interested in your collaboration "${collabData.title}"`,
            { collaborationId, userName, type: 'collaboration_interest' }
        );

        // 4. 📧 Simulated Emails
        const { sendEmail, emailTemplates } = await import("@/backend/lib/email");
        
        // Notify Author
        const authorEmail = emailTemplates.organizerAlert(collabData.authorName, userName, collabData.title);
        await sendEmail({ 
            to: "artisan-author@artisan.com", 
            subject: `Collaboration Interest: ${collabData.title}`,
            body: `Hi ${collabData.authorName}, ${userName} has applied to collaborate with you! \n\nMessage: ${message}`
        });

        // Notify Applicant
        await sendEmail({ 
            to: "applicant@artisan.com",
            subject: `Application Sent: ${collabData.title}`,
            body: `Hi ${userName}, you have successfully applied to ${collabData.authorName}'s collaboration call: "${collabData.title}". They will be in touch!`
        });

        logger.info('COLLAB_INTEREST_SUBMITTED', { collaborationId, applicantId: userId, source: 'backend' });
        return { success: true };

    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { 
            message: "Failed to apply for collaboration", 
            error: error.message, 
            collaborationId, 
            source: 'backend' 
        });
        return { success: false, error: error.message };
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
