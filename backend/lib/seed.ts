import { db } from "@/backend/config/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";
const MOCK_ARTISTS = [
    {
        uid: "artist1",
        displayName: "Elena Vance",
        bio: "Capturing the unseen light.",
        location: "Berlin, Germany",
        role: "artist",
        email: "elena@example.com",
        createdAt: new Date().toISOString()
    }
];

const MOCK_ARTWORKS: any[] = []; // Simplified for brevity in this fix, users can add more via CLI or app
const MOCK_EVENTS: any[] = [];

export async function seedDatabase() {
    const batch = writeBatch(db);

    // Seed Artists
    MOCK_ARTISTS.forEach(artist => {
        const ref = doc(db, "users", artist.uid);
        batch.set(ref, artist);
    });

    // Seed Artworks - empty for now to avoid huge inline bloat, reliant on user creation
    // MOCK_ARTWORKS...

    // Seed Events
    // MOCK_EVENTS...

    await batch.commit();
    logger.info('USER_RECORD_CREATED', { message: "Database seeded successfully (Minimal)", source: 'backend' });
}
