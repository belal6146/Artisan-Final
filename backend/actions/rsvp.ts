"use server";

import { db } from "@/backend/config/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";
import { checkUserRSVP, createRSVPRecord } from "@/backend/db/rsvps";
import { createNotification } from "@/backend/lib/notifications";

import { createRSVPSchema } from "@/backend/lib/schemas";

export async function createRSVP(rawData: any) {
    try {
        const data = createRSVPSchema.parse(rawData);
        logger.info('RSVP_CREATE_START', { eventId: data.eventId, userId: data.userId, source: 'backend' });

        const eventRef = doc(db, "events", data.eventId);
        const eventSnap = await getDoc(eventRef);
        if (!eventSnap.exists()) throw new Error("Gathering not found");

        const eventData = eventSnap.data();

        // 🟢 SECURITY: State Checks
        if (eventData.currentAttendees >= eventData.capacity) {
            logger.warn('RSVP_CREATE_FAILURE', { userId: data.userId, eventId: data.eventId, error: "Capacity reached", source: 'backend' });
            return { success: false, error: "Capacity reached" };
        }
        
        const existingRSVP = await checkUserRSVP(data.eventId, data.userId);
        if (existingRSVP?.status === "going") {
             logger.warn('RSVP_CREATE_FAILURE', { userId: data.userId, eventId: data.eventId, error: "Already registered", source: 'backend' });
             return { success: false, error: "Already registered" };
        }

        const rsvpResult = await createRSVPRecord(data.eventId, data.userId);
        if (!rsvpResult.success) {
            logger.error('RSVP_CREATE_FAILURE', { userId: data.userId, eventId: data.eventId, error: rsvpResult.error, source: 'backend' });
            return rsvpResult;
        }

        await updateDoc(eventRef, { currentAttendees: increment(1) });

        if (eventData.organizerId !== data.userId) {
            await createNotification(
                eventData.organizerId,
                'event_rsvp',
                `${data.userName} joined "${eventData.title}"`,
                { eventId: data.eventId, eventTitle: eventData.title, userName: data.userName }
            );
        }

        logger.info('RSVP_CREATE_SUCCESS', { eventId: data.eventId, userId: data.userId, source: 'backend' });
        return { success: true };
    } catch (error: any) {
        logger.error('RSVP_CREATE_FAILURE', { error, source: 'backend' });
        return { 
            success: false, 
            error: error.name === "ZodError" ? "Invalid registration data" : "Failed to join gathering" 
        };
    }
}
