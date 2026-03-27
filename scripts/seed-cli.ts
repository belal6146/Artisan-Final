
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { MOCK_ARTWORKS, MOCK_EVENTS, MOCK_ARTISTS } from "../backend/lib/mock-data";

// Duplicate config here to avoid importing the App-specific firebase.ts which might have client-side dependencies
const firebaseConfig = {
    apiKey: "AIzaSyBMZlmM2cX-K2GNIdzjKjsNjwTWBEAmM8E",
    authDomain: "artisian-61ac9.firebaseapp.com",
    projectId: "artisian-61ac9",
    storageBucket: "artisian-61ac9.firebasestorage.app",
    messagingSenderId: "195039579524",
    appId: "1:195039579524:web:ef706a43064095594b21d1",
    measurementId: "G-783YGVH6BB"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function main() {
    console.log("🔌 Connecting to Firestore...");

    try {
        const artworksRef = collection(db, "artworks");
        const snapshot = await getDocs(artworksRef);

        if (!snapshot.empty) {
            console.log(`ℹ️ Database has ${snapshot.size} existing artworks. Proceeding to update/add new mock data...`);
            // We do NOT return here anymore; we proceed to seed.
        } else {
            console.log("⚠️ Database is empty. Seeding...");
        }
        const batch = writeBatch(db);

        // Seed Artists
        console.log("... Seeding Artists");
        for (const [id, artist] of Object.entries(MOCK_ARTISTS)) {
            const ref = doc(db, "artist_profiles", id);
            batch.set(ref, artist);
        }

        // Seed Artworks
        console.log("... Seeding Artworks");
        for (const artwork of MOCK_ARTWORKS) {
            const ref = doc(db, "artworks", artwork.id);
            batch.set(ref, artwork);
        }

        // Seed Events
        console.log("... Seeding Events");
        for (const event of MOCK_EVENTS) {
            const ref = doc(db, "events", event.id);
            batch.set(ref, event);
        }

        await batch.commit();
        console.log("✅ Seeding Complete! Added mock data to Firestore.");

    } catch (error: any) {
        console.error("❌ Error:", error.message);
        if (error.code === 'permission-denied') {
            console.error("\nCRITICAL: Permission Denied.");
            console.error("You are running this script as an unauthenticated client.");
            console.error("To fix this, go to Firebase Console -> Firestore Database -> Rules and change to:");
            console.log(`
      match /{document=**} {
        allow read, write: if true;
      }
        `);
        }
    }
}

main();
