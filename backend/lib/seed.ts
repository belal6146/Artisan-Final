"use server";

import { adminDb } from "@/backend/lib/firebase-admin";
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

const MOCK_JOURNALS = [
    {
        id: "journal_01",
        title: "The Alchemy of Oak",
        content: "Every grain tells a century of history. Today I'm working with a piece of heartwood rescued from the Black Forest. Its density requires a unique tempering of the tools.",
        category: "Process",
        createdAt: new Date().toISOString()
    },
    {
        id: "journal_02",
        title: "Silence in the Workshop",
        content: "There's a specific frequency of sound when the chisel hits the wood correctly. It's a dialogue, not a force. Honoring the spirit of the material is my primary work.",
        category: "Philosophy",
        createdAt: new Date().toISOString()
    }
];

export async function seedDatabase() {
    const batch = adminDb.batch();

    // 1. Seed Artists
    MOCK_ARTISTS.forEach(artist => {
        const ref = adminDb.collection("users").doc(artist.uid);
        batch.set(ref, artist);
    });

    // 2. Seed Journals (under artist1 as decentralized subcollections)
    MOCK_JOURNALS.forEach(entry => {
        const ref = adminDb.collection("users").doc("artist1").collection("journal_entries").doc(entry.id);
        batch.set(ref, {
            ...entry,
            userId: "artist1",
            author: "Elena Vance",
            excerpt: entry.content.substring(0, 100) + "..."
        });
    });

    await batch.commit();
    logger.info('SYSTEM_SUCCESS', { message: "Database seeded successfully (Minimal)", source: 'backend' });
}
