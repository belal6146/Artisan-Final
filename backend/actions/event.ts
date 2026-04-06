"use server";

import { db } from "@/backend/config/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { Event } from "@/types/schema";
import { logger } from "@/backend/lib/logger";

import { createEventSchema, updateEventSchema } from "@/backend/lib/schemas";

// --- Queries ---

export async function getEvents(maxResults: number = 20): Promise<Event[]> {
    try {
        const q = query(
            collection(db, "events"), 
            where("status", "==", "published"),
            orderBy("startTime", "asc"), 
            limit(50)
        );
        const querySnapshot = await getDocs(q);
        const events = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as unknown as Event;
        });
        logger.info('EVENT_FETCH_SUCCESS', { count: events.length, source: 'backend' });
        return events.slice(0, maxResults);
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching published events", error: error.message, source: 'backend' });
        return [];
    }
}

export async function getEventById(id: string): Promise<Event | undefined> {
    try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as unknown as Event;
        }
        return undefined;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: `Failed to fetch individual event ${id}`, error: error.message, source: 'backend' });
        return undefined;
    }
}

export async function getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    try {
        const q = query(
            collection(db, "events"), 
            where("organizerId", "==", organizerId),
            orderBy("startTime", "desc"),
            limit(100)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as unknown as Event;
        });
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching organizer events", organizerId, error: error.message, source: 'backend' });
        return [];
    }
}

// --- Mutations ---

export async function createEvent(rawData: any) {
    try {
        const data = createEventSchema.parse(rawData);
        logger.info('EVENT_CREATE_START', { organizerId: data.organizerId, title: data.title, source: 'backend' });

        const docRef = await addDoc(collection(db, "events"), {
            ...data,
            currentAttendees: 0,
            status: "published" as const,
            createdAt: serverTimestamp()
        });

        logger.info('EVENT_CREATE_SUCCESS', { eventId: docRef.id, organizerId: data.organizerId, source: 'backend' });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        logger.error('EVENT_CREATE_FAILURE', { error: error.message, source: 'backend' });
        return { success: false, error: error.name === "ZodError" ? "Invalid gathering details" : "Failed to broadcast gathering" };
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
            updatedAt: serverTimestamp()
        });

        logger.info('EVENT_UPDATE_SUCCESS', { eventId, userId, source: 'backend' });
        return { success: true };
    } catch (error: any) {
        logger.error('EVENT_UPDATE_FAILURE', { error: error.message, source: 'backend' });
        return { success: false, error: error.name === "ZodError" ? "Invalid update data" : "Failed to update gathering" };
    }
}
