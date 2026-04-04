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

import { createNotificationSchema } from "@/backend/lib/schemas";

export async function createNotification(
    userId: string,
    type: string,
    message: string,
    metadata: any = {}
) {
    if (!userId) throw new Error("User ID is required");

    try {
        const data = createNotificationSchema.parse({ userId, type, message, metadata });
        
        const docRef = await addDoc(collection(db, "notifications"), {
            ...data,
            read: false,
            createdAt: new Date().toISOString()
        });

        logger.info('SYSTEM_SUCCESS', { action: 'create_notification', notificationId: docRef.id, userId, source: 'backend' });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { action: 'create_notification', error: error.message, userId, source: 'backend' });
        return { success: false, error: error.message };
    }
}
