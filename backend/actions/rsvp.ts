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
}) {
    const { eventId, userId, userName } = data;

    // Validation
    if (!eventId || !userId) {
        logger.error("RSVP creation failed: missing required fields", { data });
        return { success: false, error: "Event ID and User ID are required" };
    }

    try {
        logger.info("Processing RSVP", { eventId, userId, userName });

        // Check if user already registered
        const existingRSVP = await checkUserRSVP(eventId, userId);
        if (existingRSVP) {
            if (existingRSVP.status === "going") {
                logger.warn("User already registered for event", { eventId, userId });
                return { success: false, error: "You are already registered for this event" };
            }
        }

        // Get event details
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
            logger.error("Event not found", { eventId });
            return { success: false, error: "Event not found" };
        }

        const eventData = eventSnap.data();

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

        // Notify event organizer
        if (eventData.organizerId !== userId) {
            await createNotification(
                eventData.organizerId,
                'event_rsvp',
                `${userName} registered for your event "${eventData.title}"`,
                {
                    eventId,
                    eventTitle: eventData.title,
                    userName
                }
            );
        }

        logger.info("RSVP created successfully", {
            eventId,
            userId,
            newAttendeeCount: eventData.currentAttendees + 1
        });

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
