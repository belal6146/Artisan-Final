import { adminDb } from "@/backend/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "@/backend/lib/logger";
import { sendEmail } from "@/backend/lib/email";
import { createNotificationSchema } from "@/backend/lib/schemas";

export async function createNotification(
    userId: string,
    type: string,
    message: string,
    metadata: any = {},
    emailTo?: string
) {
    if (!userId) {
        logger.error('SYSTEM_ERROR', { action: 'create_notification', error: "User ID missing", source: 'backend' });
        return { success: false, error: "User ID is required" };
    }

    try {
        const data = createNotificationSchema.parse({ userId, type, message, metadata });
        
        await adminDb.collection("notifications").add({
            ...data,
            read: false,
            createdAt: new Date().toISOString(),
            timestamp: FieldValue.serverTimestamp()
        });

        logger.info('NOTIFICATION_CREATE_SUCCESS', { userId, type, source: 'backend' });

        // OPTIONAL: Send Email Relay
        if (emailTo) {
            await sendEmail({
                to: emailTo,
                subject: message.split('\n')[0].slice(0, 47) + "...", // Artisan subject line
                body: message
            });
        }

        return { success: true };
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { action: 'create_notification', error: error.message, userId, source: 'backend' });
        return { success: false, error: error.message };
    }
}

/**
 * 🤝 Automated Multi-Party Alerts
 */

// Workshop Registration (RSVP)
export async function onWorkshopRSVP(attendeeId: string, eventId: string) {
    try {
        const [attendeeSnap, eventSnap] = await Promise.all([
            adminDb.collection("users").doc(attendeeId).get(),
            adminDb.collection("events").doc(eventId).get()
        ]);

        if (!attendeeSnap.exists || !eventSnap.exists) return;

        const attendee = attendeeSnap.data()!;
        const event = eventSnap.data()!;

        // Fetch Organizer for their email
        const organizerSnap = await adminDb.collection("users").doc(event.organizerId).get();
        const organizer = organizerSnap.exists ? organizerSnap.data() : null;

        // 1. Alert Attendee (Confirmation)
        await createNotification(
            attendeeId,
            'event_rsvp',
            `Confirmed: Spot secured for ${event.title}`,
            { eventId, title: event.title },
            attendee.email
        );

        // 2. Alert Organizer (New Registration)
        if (organizer) {
            await createNotification(
                event.organizerId,
                'event_rsvp',
                `New Artisan Alert: ${attendee.displayName || 'A participant'} just joined ${event.title}`,
                { eventId, attendeeName: attendee.displayName },
                organizer.email
            );
        }
    } catch (e: any) {
        logger.error('SYSTEM_ERROR', { aspect: 'alerts.onWorkshopRSVP', error: e.message, source: 'backend' });
    }
}

// Artwork Acquisition
export async function onArtworkPurchase(buyerId: string, artworkId: string) {
    try {
        const [buyerSnap, artworkSnap] = await Promise.all([
            adminDb.collection("users").doc(buyerId).get(),
            adminDb.collection("artworks").doc(artworkId).get()
        ]);

        if (!buyerSnap.exists || !artworkSnap.exists) return;

        const buyer = buyerSnap.data()!;
        const artwork = artworkSnap.data()!;

        if (artwork.status !== "available") {
            logger.warn('ARTWORK_UPDATE_START', { artworkId, message: "Double-sale prevented. Artwork already not available.", status: artwork.status, source: 'backend' });
            return;
        }

        // 🛠️ ATOMIC FLIP: Lock the artwork from the market
        logger.info('ARTWORK_UPDATE_START', { artworkId, newStatus: 'sold', source: 'backend' });
        await adminDb.collection("artworks").doc(artworkId).update({ 
            status: "sold",
            soldAt: new Date().toISOString(),
            buyerId
        });
        logger.info('ARTWORK_UPDATE_SUCCESS', { artworkId, newStatus: 'sold', source: 'backend' });

        // Fetch Artist for their email
        const artistSnap = await adminDb.collection("users").doc(artwork.artistId).get();
        const artist = artistSnap.exists ? artistSnap.data() : null;

        // 1. Alert Buyer (Acquisition Proof)
        await createNotification(
            buyerId,
            'artwork_purchase',
            `Acquisition Confirmed: "${artwork.title}" is now yours.`,
            { artworkId, title: artwork.title },
            buyer.email
        );

        // 2. Alert Artist (Sale Success)
        if (artist) {
            await createNotification(
                artwork.artistId,
                'artwork_purchase',
                `Masterpiece Acquired: "${artwork.title}" has been claimed by ${buyer.displayName || 'a collector'}.`,
                { artworkId, buyerName: buyer.displayName },
                artist.email
            );
        }
    } catch (e: any) {
        logger.error('SYSTEM_ERROR', { aspect: 'alerts.onArtworkPurchase', error: e.message, source: 'backend' });
    }
}
