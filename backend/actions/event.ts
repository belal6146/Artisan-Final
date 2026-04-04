"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { Event, EventType } from "@/types/schema";
import { logger } from "@/backend/lib/logger";

import { createEventSchema, updateEventSchema } from "@/backend/lib/schemas";

export async function createEvent(rawData: any) {
    try {
        const data = createEventSchema.parse(rawData);
        logger.info('EVENT_CREATE_START', { organizerId: data.organizerId, title: data.title, source: 'backend' });

        const docRef = await addDoc(collection(db, "events"), {
            ...data,
            currentAttendees: 0,
            status: "published" as const,
            createdAt: new Date().toISOString()
        });

        logger.info('EVENT_CREATE_SUCCESS', { eventId: docRef.id, organizerId: data.organizerId, source: 'backend' });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error('EVENT_CREATE_FAILURE', { error, source: 'backend' });
        return { 
            success: false, 
            error: error.name === "ZodError" ? "Invalid gathering details" : "Failed to broadcast gathering" 
        };
    }
}

export async function updateEvent(eventId: string, userId: string, rawData: any) {
    try {
        const data = updateEventSchema.parse(rawData);
        logger.info('EVENT_UPDATE_START', { eventId, userId, source: 'backend' });
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);
        if (!eventSnap.exists()) throw new Error("Gathering not found");

        if ((eventSnap.data() as Event).organizerId !== userId) {
            logger.warn("PERMISSION_DENIED", { eventId, userId, source: 'backend' });
            throw new Error("Unauthorized modification");
        }

        await updateDoc(eventRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });

        logger.info('EVENT_UPDATE_SUCCESS', { eventId, userId, source: 'backend' });
        return { success: true };
    } catch (error: any) {
        logger.error('EVENT_UPDATE_FAILURE', { error, source: 'backend' });
        return { 
            success: false, 
            error: error.name === "ZodError" ? "Invalid update data" : "Failed to update gathering" 
        };
    }
}
