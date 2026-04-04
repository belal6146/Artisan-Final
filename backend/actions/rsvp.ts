"use server";

import { db } from "@/backend/config/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";
import { checkUserRSVP, createRSVPRecord } from "@/backend/db/rsvps";
import { createNotification } from "@/backend/lib/notifications";

export async function createRSVP(data: {
    eventId: string;
    userId: string;
    userName: string;
    paymentIntentId?: string; // NEW: proof of payment for paid workshops
}) {
    const { eventId, userId, userName, paymentIntentId } = data;

    // Validation
    if (!eventId || !userId) {
        logger.error('EVENT_RSVP_FAILURE', { 
            message: "Missing required fields", 
            eventId, 
            userId, 
            source: 'backend' 
        });
        return { success: false, error: "Event ID and User ID are required" };
    }

    try {
        // We log the intent as part of system tracing if needed, but the creation event happens at the end.
        // For now, we trace the activity.
        logger.debug('EVENT_RSVP_FAILURE', { message: "Starting RSVP process", eventId, userId, source: 'backend' });

        // Get event details
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
            logger.error('EVENT_FETCH_FAILED', { eventId, source: 'backend' });
            return { success: false, error: "Event not found" };
        }

        const eventData = eventSnap.data();

        // 🟢 SECURITY: Enforce Payment for Workshops
        if (eventData.price > 0 && !paymentIntentId) {
            logger.warn('PERMISSION_DENIED', { 
                message: "Attempted RSVP for paid event without payment intent", 
                eventId, 
                userId, 
                source: 'backend' 
            });
            return { success: false, error: "Payment required for this workshop" };
        }

        // Check if user already registered
        const existingRSVP = await checkUserRSVP(eventId, userId);
        if (existingRSVP) {
            if (existingRSVP.status === "going") {
                logger.warn('EVENT_RSVP_FAILURE', { 
                    message: "User already registered", 
                    eventId, 
                    userId, 
                    source: 'backend' 
                });
                return { success: false, error: "You are already registered for this event" };
            }
        }

        // Check capacity
        if (eventData.currentAttendees >= eventData.capacity) {
            logger.warn('EVENT_RSVP_FAILURE', { 
                message: "Event at capacity", 
                eventId, 
                capacity: eventData.capacity, 
                source: 'backend' 
            });
            return { success: false, error: "This event is at full capacity" };
        }

        // Create RSVP record
        const rsvpResult = await createRSVPRecord(eventId, userId);
        if (!rsvpResult.success) {
            return rsvpResult;
        }

        // Increment attendee count
        await updateDoc(eventRef, {
            currentAttendees: increment(1)
        });

        // 1. Notify event organizer (In-App)
        if (eventData.organizerId !== userId) {
            await createNotification(
                eventData.organizerId,
                'event_rsvp',
                `${userName} registered for your event "${eventData.title}"`,
                { eventId, eventTitle: eventData.title, userName }
            );
        }

        // 2. Notify the person registering (Attendee - In-App)
        await createNotification(
            userId,
            'event_rsvp',
            `You've successfully registered for "${eventData.title}"!`,
            { eventId, eventTitle: eventData.title, organizerName: eventData.organizerName }
        );

        // 3. 📧 SEND DUAL EMAILS (Simulated)
        const { sendEmail, emailTemplates } = await import("@/backend/lib/email");
        
        // Attendee Email Confirmation
        const userEmail = emailTemplates.rsvpConfirmation(userName, eventData.title);
        await sendEmail({ to: "attendee-placeholder@artisan.com", ...userEmail });

        // Organizer Email Alert
        const organizerEmail = emailTemplates.organizerAlert(eventData.organizerName, userName, eventData.title);
        await sendEmail({ to: "organizer-placeholder@artisan.com", ...organizerEmail });

        logger.info('EVENT_RSVP_CREATED', { eventId, userId, source: 'backend' });

        return { success: true };
    } catch (error: any) {
        logger.error('EVENT_RSVP_FAILURE', {
            error: error.message,
            eventId,
            userId,
            source: 'backend'
        });
        return { success: false, error: error.message };
    }
}
