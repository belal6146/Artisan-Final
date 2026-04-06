"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { sendEmail, emailTemplates } from "@/backend/lib/email";
import { logger } from "@/backend/lib/logger";

export interface CreateNotificationOptions {
    userId: string;
    type: 'event_rsvp' | 'artwork_purchase' | 'support' | 'system';
    title: string;
    message: string;
    emailTo?: string;
}

/**
 * 📣 TRIPLE RELAY: Firestore + Local Logger + Email Simulator
 */
export async function createNotification(options: CreateNotificationOptions) {
    try {
        // 1. In-App Notification (Real-time Firestore)
        const notificationData = {
            userId: options.userId,
            type: options.type,
            title: options.title,
            message: options.message,
            read: false,
            createdAt: new Date().toISOString(), // Use standard string for serializability in actions
            timestamp: serverTimestamp()
        };

        await addDoc(collection(db, "notifications"), notificationData);
        
        logger.info('NOTIFICATION_CREATE_SUCCESS', { userId: options.userId, type: options.type, source: 'backend' });

        // 2. Email Notification (if requested)
        if (options.emailTo) {
            await sendEmail({
                to: options.emailTo,
                subject: options.title,
                body: options.message
            });
        }

        return { success: true };
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { userId: options.userId, message: "Notification relay failed", error: error.message, source: 'backend' });
        return { success: false, error: error.message };
    }
}

/**
 * 🤝 Automated Multi-Party Alerts
 */
export const alerts = {
    // Workshop Registration
    onWorkshopRSVP: async (attendeeId: string, eventId: string) => {
        const [attendeeSnap, eventSnap] = await Promise.all([
            getDoc(doc(db, "users", attendeeId)),
            getDoc(doc(db, "events", eventId))
        ]);

        if (!attendeeSnap.exists() || !eventSnap.exists()) return;

        const attendee = attendeeSnap.data();
        const event = eventSnap.data();
        const organizerId = event.organizerId;

        // A. Notify Attendee (Consumer)
        await createNotification({
            userId: attendeeId,
            type: 'event_rsvp',
            title: `Confirmed: ${event.title}`,
            message: `Your spot is secured! Checked your profile for details.`,
            emailTo: attendee.email
        });

        // B. Notify Organizer (Artist)
        await createNotification({
            userId: organizerId,
            type: 'event_rsvp',
            title: `New Registration!`,
            message: `${attendee.displayName || 'An artisan'} just registered for ${event.title}.`,
            emailTo: event.organizerEmail || "" // We'll try to find this or the user record email
        });
    },

    // Artwork Purchase
    onArtworkPurchase: async (buyerId: string, artworkId: string) => {
        const [buyerSnap, artworkSnap] = await Promise.all([
            getDoc(doc(db, "users", buyerId)),
            getDoc(doc(db, "artworks", artworkId))
        ]);

        if (!buyerSnap.exists() || !artworkSnap.exists()) return;

        const buyer = buyerSnap.data();
        const artwork = artworkSnap.data();
        const artistId = artwork.artistId;

        // A. Notify Buyer
        await createNotification({
            userId: buyerId,
            type: 'artwork_purchase',
            title: `Acquisition Successful`,
            message: `"${artwork.title}" has been successfully added to your collection.`,
            emailTo: buyer.email
        });

        // B. Notify Artist
        await createNotification({
            userId: artistId,
            type: 'artwork_purchase',
            title: `Work Collected!`,
            message: `Congratulations! "${artwork.title}" was just acquired by ${buyer.displayName || 'a collector'}.`,
            // Ideally we get the artist's email from their user doc
        });
    }
};
