"use server";

import { db } from "@/backend/config/firebase";
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";
import { createNotification, alerts } from "@/backend/lib/notifications";
import { createRSVPSchema } from "@/backend/lib/schemas";
import { EventRSVP } from "@/types/schema";

// --- Queries ---

export async function checkUserRSVP(eventId: string, userId: string): Promise<EventRSVP | null> {
    try {
        const q = query(collection(db, "event_rsvps"), where("eventId", "==", eventId), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        const data = querySnapshot.docs[0].data();
        return { 
            id: querySnapshot.docs[0].id, 
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
        const q = query(collection(db, "event_rsvps"), where("eventId", "==", eventId));
        const querySnapshot = await getDocs(q);
        logger.info('RSVP_FETCH_SUCCESS', { eventId, count: querySnapshot.size, source: 'backend' });
        return querySnapshot.docs.map(d => {
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
        const q = query(collection(db, "event_rsvps"), where("userId", "==", userId), where("status", "==", "going"));
        const querySnapshot = await getDocs(q);
        logger.info('RSVP_FETCH_SUCCESS', { userId, count: querySnapshot.size, source: 'backend' });
        return querySnapshot.docs.map(d => {
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

export async function createRSVP(rawData: any) {
    try {
        const data = createRSVPSchema.parse(rawData);
        logger.info('RSVP_CREATE_START', { eventId: data.eventId, userId: data.userId, source: 'backend' });

        const eventRef = doc(db, "events", data.eventId);
        const eventSnap = await getDoc(eventRef);
        if (!eventSnap.exists()) throw new Error("Gathering not found");

        const eventData = eventSnap.data();

        if (eventData.currentAttendees >= eventData.capacity) {
            logger.warn('RSVP_CREATE_FAILURE', { userId: data.userId, eventId: data.eventId, error: "Capacity reached", source: 'backend' });
            return { success: false, error: "Capacity reached" };
        }
        
        const existing = await checkUserRSVP(data.eventId, data.userId);
        if (existing) {
             logger.warn('RSVP_CREATE_FAILURE', { userId: data.userId, eventId: data.eventId, error: "Already registered", source: 'backend' });
             return { success: false, error: "Already registered" };
        }

        await addDoc(collection(db, "event_rsvps"), {
            eventId: data.eventId,
            userId: data.userId,
            status: "going",
            createdAt: serverTimestamp()
        });

        await updateDoc(eventRef, { currentAttendees: increment(1) });

        // Trigger Multi-Party Alerts (In-App + Email)
        void alerts.onWorkshopRSVP(data.userId, data.eventId);

        logger.info('RSVP_CREATE_SUCCESS', { eventId: data.eventId, userId: data.userId, source: 'backend' });
        return { success: true };
    } catch (error: any) {
        logger.error('RSVP_CREATE_FAILURE', { error: error.message, source: 'backend' });
        return { success: false, error: error.name === "ZodError" ? "Invalid registration data" : "Failed to join gathering" };
    }
}
