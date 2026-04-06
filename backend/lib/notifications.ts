import { db } from "@/backend/config/firebase";
import { collection, addDoc, getDoc, doc, updateDoc } from "firebase/firestore";
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
        
        await addDoc(collection(db, "notifications"), {
            ...data,
            read: false,
            createdAt: new Date().toISOString()
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
export const alerts = {
    // Workshop Registration (RSVP)
    onWorkshopRSVP: async (attendeeId: string, eventId: string) => {
        try {
            const [attendeeSnap, eventSnap] = await Promise.all([
                getDoc(doc(db, "users", attendeeId)),
                getDoc(doc(db, "events", eventId))
            ]);

            if (!attendeeSnap.exists() || !eventSnap.exists()) return;

            const attendee = attendeeSnap.data();
            const event = eventSnap.data();

            // Fetch Organizer for their email
            const organizerSnap = await getDoc(doc(db, "users", event.organizerId));
            const organizer = organizerSnap.exists() ? organizerSnap.data() : null;

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
    },

    // Artwork Acquisition
    onArtworkPurchase: async (buyerId: string, artworkId: string) => {
        try {
            const [buyerSnap, artworkSnap] = await Promise.all([
                getDoc(doc(db, "users", buyerId)),
                getDoc(doc(db, "artworks", artworkId))
            ]);

            if (!buyerSnap.exists() || !artworkSnap.exists()) return;

            const buyer = buyerSnap.data();
            const artwork = artworkSnap.data();

            // 🛠️ ATOMIC FLIP: Lock the artwork from the market
            logger.info('ARTWORK_UPDATE_START', { artworkId, newStatus: 'sold', source: 'backend' });
            await updateDoc(doc(db, "artworks", artworkId), { 
                status: "sold",
                soldAt: new Date().toISOString(),
                buyerId
            });
            logger.info('ARTWORK_UPDATE_SUCCESS', { artworkId, newStatus: 'sold', source: 'backend' });

            // Fetch Artist for their email
            const artistSnap = await getDoc(doc(db, "users", artwork.artistId));
            const artist = artistSnap.exists() ? artistSnap.data() : null;

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
};
