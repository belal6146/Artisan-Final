"use server";

import { adminDb } from "@/backend/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "@/backend/lib/logger";
import { createNotification, onWorkshopRSVP } from "@/backend/actions/notification";
import { createRSVPSchema } from "@/backend/lib/schemas";
import { EventRSVP } from "@/types/schema";

// --- Queries ---

export async function checkUserRSVP(eventId: string, userId: string): Promise<EventRSVP | null> {
    try {
        const snap = await adminDb.collection("event_rsvps")
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .get();

        if (snap.empty) return null;
        const data = snap.docs[0].data();
        return { 
            id: snap.docs[0].id, 
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as unknown as EventRSVP;
    } catch (error: any) {
        logger.error('RSVP_FETCH_FAILED', { error: error.message, eventId, userId, source: 'backend' });
        return null;
    }
}

export async function getRSVPsByEvent(eventId: string): Promise<EventRSVP[]> {
    try {
        const snap = await adminDb.collection("event_rsvps")
            .where("eventId", "==", eventId)
            .get();

        logger.info('RSVP_FETCH_SUCCESS', { eventId, count: snap.size, source: 'backend' });
        return snap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as unknown as EventRSVP;
        });
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { action: 'FETCH_RSVPS_BY_EVENT', error: error.message, eventId, source: 'backend' });
        return [];
    }
}

export async function getRSVPsByUser(userId: string): Promise<EventRSVP[]> {
    try {
        const snap = await adminDb.collection("event_rsvps")
            .where("userId", "==", userId)
            .where("status", "==", "going")
            .get();

        logger.info('RSVP_FETCH_SUCCESS', { userId, count: snap.size, source: 'backend' });
        return snap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as unknown as EventRSVP;
        });
    } catch (error: any) {
        logger.error('RSVP_FETCH_FAILED', { error: error.message, userId, source: 'backend' });
        return [];
    }
}

// --- Mutations ---

import { getAuthorizedUser } from "@/backend/lib/auth-authority";

export async function createRSVP(rawData: any, idToken: string) {
    try {
        const verifiedUid = await getAuthorizedUser(idToken);
        const data = createRSVPSchema.parse(rawData);
        
        logger.info('RSVP_CREATE_START', { eventId: data.eventId, userId: verifiedUid, source: 'backend' });

        const eventRef = adminDb.collection("events").doc(data.eventId);
        const eventSnap = await eventRef.get();
        if (!eventSnap.exists) throw new Error("Gathering not found");

        const eventData = eventSnap.data()!;

        if (eventData.currentAttendees >= eventData.capacity) {
            logger.warn('RSVP_CREATE_FAILURE', { userId: verifiedUid, eventId: data.eventId, error: "Capacity reached", source: 'backend' });
            return { success: false, error: "Capacity reached" };
        }
        
        const existing = await checkUserRSVP(data.eventId, verifiedUid);
        if (existing) {
             logger.warn('RSVP_CREATE_FAILURE', { userId: verifiedUid, eventId: data.eventId, error: "Already registered", source: 'backend' });
             return { success: false, error: "Already registered" };
        }

        await adminDb.collection("event_rsvps").add({
            eventId: data.eventId,
            userId: verifiedUid,
            status: "going",
            createdAt: FieldValue.serverTimestamp()
        });

        await eventRef.update({ currentAttendees: FieldValue.increment(1) });

        // Trigger Multi-Party Alerts (In-App + Email)
        void onWorkshopRSVP(verifiedUid, data.eventId);

        logger.info('RSVP_CREATE_SUCCESS', { eventId: data.eventId, userId: verifiedUid, source: 'backend' });
        return { success: true };
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED_ACCESS_BLOCKED") {
            logger.error('SECURITY_VIOLATION', { message: "RSVP_CREATE_BLOCKED", source: 'backend' });
            return { success: false, error: "Access Denied: Unverified session" };
        }
        logger.error('RSVP_CREATE_FAILURE', { error: error.message, source: 'backend' });
        return { success: false, error: error.name === "ZodError" ? "Invalid registration data" : "Failed to join gathering" };
    }
}
