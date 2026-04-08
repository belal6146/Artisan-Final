"use server";

import { adminDb } from "@/backend/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { Event } from "@/types/schema";
import { logger } from "@/backend/lib/logger";

import { createEventSchema, updateEventSchema } from "@/backend/lib/schemas";

// --- Queries ---

export async function getEvents(maxResults: number = 20): Promise<Event[]> {
    try {
        const snap = await adminDb.collection("events")
            .where("status", "==", "published")
            .orderBy("startTime", "asc")
            .limit(maxResults)
            .get();

        const events = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as unknown as Event;
        });
        logger.info('EVENT_FETCH_SUCCESS', { count: events.length, source: 'backend' });
        return events;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Failed fetching published events", error: error.message, source: 'backend' });
        return [];
    }
}

export async function getEventById(id: string): Promise<Event | undefined> {
    try {
        const docSnap = await adminDb.collection("events").doc(id).get();
        if (docSnap.exists) {
            const data = docSnap.data()!;
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
        const snap = await adminDb.collection("events")
            .where("organizerId", "==", organizerId)
            .orderBy("startTime", "desc")
            .limit(100)
            .get();

        return snap.docs.map(doc => {
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

import { getAuthorizedUser } from "@/backend/lib/auth-authority";
import { getUserById } from "@/backend/actions/profile";

export async function createEvent(rawData: any, idToken: string) {
    try {
        const verifiedUid = await getAuthorizedUser(idToken);
        const profile = await getUserById(verifiedUid);
        if (!profile) throw new Error("ORGANIZER_PROFILE_NOT_FOUND");

        const data = createEventSchema.parse(rawData);
        logger.info('EVENT_CREATE_START', { organizerId: verifiedUid, title: data.title, source: 'backend' });

        const docRef = await adminDb.collection("events").add({
            ...data,
            organizerId: verifiedUid,
            organizerName: profile.displayName || "Anonymous Organizer",
            currentAttendees: 0,
            status: "published" as const,
            createdAt: FieldValue.serverTimestamp()
        });

        logger.info('EVENT_CREATE_SUCCESS', { eventId: docRef.id, organizerId: verifiedUid, source: 'backend' });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED_ACCESS_BLOCKED") {
            logger.error('SECURITY_VIOLATION', { message: "EVENT_CREATE_BLOCKED", source: 'backend' });
            return { success: false, error: "Access Denied: Unverified session" };
        }
        logger.error('EVENT_CREATE_FAILURE', { error: error.message, source: 'backend' });
        return { success: false, error: error.name === "ZodError" ? "Invalid gathering details" : "Failed to broadcast gathering" };
    }
}

export async function updateEvent(eventId: string, idToken: string, rawData: any) {
    try {
        const verifiedUid = await getAuthorizedUser(idToken);
        const data = updateEventSchema.parse(rawData);
        logger.info('EVENT_UPDATE_START', { eventId, userId: verifiedUid, source: 'backend' });
        const eventRef = adminDb.collection("events").doc(eventId);
        const eventSnap = await eventRef.get();
        if (!eventSnap.exists) throw new Error("Gathering not found");

        if ((eventSnap.data() as Event).organizerId !== verifiedUid) {
            logger.warn("PERMISSION_DENIED", { eventId, userId: verifiedUid, source: 'backend' });
            throw new Error("Unauthorized modification");
        }

        await eventRef.update({
            ...data,
            updatedAt: FieldValue.serverTimestamp()
        });

        logger.info('EVENT_UPDATE_SUCCESS', { eventId, userId: verifiedUid, source: 'backend' });
        return { success: true };
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED_ACCESS_BLOCKED") {
            logger.error('SECURITY_VIOLATION', { message: "EVENT_UPDATE_BLOCKED", source: 'backend' });
            return { success: false, error: "Access Denied: Unverified session" };
        }
        logger.error('EVENT_UPDATE_FAILURE', { error: error.message, source: 'backend' });
        return { success: false, error: error.name === "ZodError" ? "Invalid update data" : "Failed to update gathering" };
    }
}
