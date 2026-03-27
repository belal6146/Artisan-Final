import { db } from "@/backend/config/firebase";
import { collection, addDoc } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";

export type NotificationType = 'event_rsvp' | 'artwork_purchase' | 'event_reminder' | 'system';

export interface NotificationMetadata {
    eventId?: string;
    eventTitle?: string;
    artworkId?: string;
    userName?: string;
    [key: string]: any;
}

export async function createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    metadata: NotificationMetadata = {}
) {
    if (!userId) {
        logger.error("Notification creation failed: missing userId", { type, message });
        throw new Error("User ID is required");
    }

    try {
        logger.info("Creating notification", { userId, type, metadata });

        const notificationData = {
            userId,
            type,
            message,
            metadata,
            read: false,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "notifications"), notificationData);

        logger.info("Notification created successfully", {
            notificationId: docRef.id,
            userId,
            type
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error("Failed to create notification", {
            error: error.message,
            stack: error.stack,
            userId,
            type
        });
        return { success: false, error: error.message };
    }
}
