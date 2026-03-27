import { collection, getDocs, doc, getDoc, query, where, addDoc } from "firebase/firestore";
import { db } from "@/backend/config/firebase";
import { EventRSVP } from "@/types/schema";
import { logger } from "@/backend/lib/logger";

export async function getRSVPsByEvent(eventId: string): Promise<EventRSVP[]> {
    try {
        const q = query(collection(db, "event_rsvps"), where("eventId", "==", eventId));
        const querySnapshot = await getDocs(q);
        logger.info("Fetched RSVPs for event", { eventId, count: querySnapshot.size });
        return querySnapshot.docs.map(doc => ({ ...doc.data() } as EventRSVP));
    } catch (error: any) {
        logger.error("Error fetching event RSVPs", { error: error.message, eventId });
        return [];
    }
}

export async function getRSVPsByUser(userId: string): Promise<EventRSVP[]> {
    try {
        const q = query(
            collection(db, "event_rsvps"),
            where("userId", "==", userId),
            where("status", "==", "going")
        );
        const querySnapshot = await getDocs(q);
        logger.info("Fetched RSVPs for user", { userId, count: querySnapshot.size });
        return querySnapshot.docs.map(doc => ({ ...doc.data() } as EventRSVP));
    } catch (error: any) {
        logger.error("Error fetching user RSVPs", { error: error.message, userId });
        return [];
    }
}

export async function checkUserRSVP(eventId: string, userId: string): Promise<EventRSVP | null> {
    try {
        const q = query(
            collection(db, "event_rsvps"),
            where("eventId", "==", eventId),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const rsvp = { ...querySnapshot.docs[0].data() } as EventRSVP;
        logger.info("Found existing RSVP", { eventId, userId, status: rsvp.status });
        return rsvp;
    } catch (error: any) {
        logger.error("Error checking user RSVP", { error: error.message, eventId, userId });
        return null;
    }
}

export async function createRSVPRecord(eventId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const rsvpData = {
            eventId,
            userId,
            status: "going" as const,
            createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, "event_rsvps"), rsvpData);
        logger.info("RSVP record created", { eventId, userId });
        return { success: true };
    } catch (error: any) {
        logger.error("Failed to create RSVP record", {
            error: error.message,
            stack: error.stack,
            eventId,
            userId
        });
        return { success: false, error: error.message };
    }
}
