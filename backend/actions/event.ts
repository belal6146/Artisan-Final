"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { Event, EventType } from "@/types/schema";
import { logger } from "@/backend/lib/logger";

export async function createEvent(data: {
    title: string;
    description: string;
    type: EventType;
    startTime: string;
    endTime: string;
    timezone: string;
    locationType: 'online' | 'inPerson';
    location: string;
    capacity: number;
    price: number;
    currency?: string;
    organizerId: string;
    organizerName: string;
    imageUrl?: string;
}) {
    // Validation
    if (!data.organizerId) {
        logger.error("Event creation failed: missing organizerId", { data });
        throw new Error("Organizer ID is required");
    }

    if (!data.title || !data.description) {
        logger.error("Event creation failed: missing required fields", { data });
        return { success: false, error: "Title and description are required" };
    }

    // Validate dates
    const startDate = new Date(data.startTime);
    const endDate = new Date(data.endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        logger.error("Event creation failed: invalid dates", { startTime: data.startTime, endTime: data.endTime });
        return { success: false, error: "Invalid date format" };
    }

    if (endDate <= startDate) {
        logger.error("Event creation failed: end time before start time", { startTime: data.startTime, endTime: data.endTime });
        return { success: false, error: "End time must be after start time" };
    }

    if (startDate < new Date()) {
        logger.error("Event creation failed: start time in the past", { startTime: data.startTime });
        return { success: false, error: "Event cannot start in the past" };
    }

    try {
        logger.info("Creating new event", {
            organizerId: data.organizerId,
            title: data.title,
            type: data.type,
            startTime: data.startTime,
            locationType: data.locationType
        });

        const eventData = {
            ...data,
            currency: data.currency || "EUR",
            currentAttendees: 0,
            status: "published" as const,
            imageUrl: data.imageUrl || null
        };

        const docRef = await addDoc(collection(db, "events"), eventData);

        logger.info("Event created successfully", {
            eventId: docRef.id,
            organizerId: data.organizerId,
            title: data.title,
            startTime: data.startTime
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error("Failed to create event", {
            error: error.message,
            stack: error.stack,
            organizerId: data.organizerId,
            title: data.title
        });
        return { success: false, error: error.message };
    }
}

export async function updateEvent(eventId: string, userId: string, data: Partial<Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'currentAttendees' | 'status'>>) {
    if (!eventId || !userId) {
        throw new Error("Event ID and User ID are required");
    }

    try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
            throw new Error("Event not found");
        }

        const eventData = eventSnap.data() as Event;

        // Authorization check
        if (eventData.organizerId !== userId) {
            logger.warn("Unauthorized event update attempt", { eventId, userId, organizerId: eventData.organizerId });
            throw new Error("You are not authorized to edit this event");
        }

        // Update fields
        await updateDoc(eventRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });

        logger.info("Event updated successfully", { eventId, userId });
        return { success: true };
    } catch (error: any) {
        logger.error("Failed to update event", { error: error.message, stack: error.stack, eventId });
        return { success: false, error: error.message };
    }
}
