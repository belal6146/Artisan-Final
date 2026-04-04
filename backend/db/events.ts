import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/backend/config/firebase";
import { Event } from "@/types/schema";
import { logger } from "@/backend/lib/logger";

export async function getEvents(maxResults: number = 20): Promise<Event[]> {
    try {
        // Optimized: Database level filter and sort
        const q = query(
            collection(db, "events"),
            where("status", "==", "published"),
            orderBy("startTime", "asc"),
            limit(maxResults)
        );
        
        const querySnapshot = await getDocs(q);
        const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));

        logger.info("Fetched published events", { count: events.length });
        return events;
    } catch (error: any) {
        logger.error(`Error fetching events: ${error.message || error}`, { stack: error.stack });
        return [];
    }
}

export async function getEventById(id: string): Promise<Event | undefined> {
    try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Event;
        }
        return undefined;
    } catch (error: any) {
        logger.error("Error fetching event by ID", { error: error.message, eventId: id });
        return undefined;
    }
}

export async function getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    try {
        const q = query(collection(db, "events"), where("organizerId", "==", organizerId));
        const querySnapshot = await getDocs(q);

        // Sort in code to avoid composite index requirement
        const events = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Event))
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

        logger.info("Fetched events for organizer", { organizerId, count: events.length });
        return events;
    } catch (error: any) {
        logger.error("Error fetching organizer events", { error: error.message, organizerId });
        return [];
    }
}
