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
        logger.error("RSVP creation failed: missing required fields", { data });
        return { success: false, error: "Event ID and User ID are required" };
    }

    try {
        logger.info("Processing RSVP", { eventId, userId, userName, paymentIntentId });

        // Get event details
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
            logger.error("Event not found", { eventId });
            return { success: false, error: "Event not found" };
        }

        const eventData = eventSnap.data();

        // 🟢 SECURITY: Enforce Payment for Workshops
        if (eventData.price > 0 && !paymentIntentId) {
            logger.warn("Attempted RSVP for paid event without payment intent", { eventId, userId });
            return { success: false, error: "Payment required for this workshop" };
        }

        // Check if user already registered
        const existingRSVP = await checkUserRSVP(eventId, userId);
        if (existingRSVP) {
            if (existingRSVP.status === "going") {
                logger.warn("User already registered for event", { eventId, userId });
                return { success: false, error: "You are already registered for this event" };
            }
        }

        // Check capacity
        if (eventData.currentAttendees >= eventData.capacity) {
            logger.warn("Event at capacity", { eventId, capacity: eventData.capacity });
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

        logger.info("RSVP complete: payment, notifications, and emails actioned.", { eventId, userId });

        return { success: true };
    } catch (error: any) {
        logger.error("Failed to create RSVP", {
            error: error.message,
            stack: error.stack,
            eventId,
            userId
        });
        return { success: false, error: error.message };
    }
}
