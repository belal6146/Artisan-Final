import { config } from "dotenv";
config({ path: ".env.local" });

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { Collaboration } from "../types/schema";

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

const collaborations: Omit<Collaboration, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        title: "Large Scale Kinetic Sculpture Installation",
        description: "Looking for a metalworker to help fabricate a 3-meter tall kinetic sculpture for an upcoming exhibition in Rotterdam. I have the designs and funding, need technical expertise in welding and mechanics.",
        type: "Project",
        compensation: {
            type: "Money",
            amount: 2500,
            currency: "EUR",
            details: "Plus materials and travel"
        },
        authorId: "user_1",
        authorName: "Elena V.",
        location: "Rotterdam, NL",
        locationType: "On-site",
        status: "Open"
    },
    {
        title: "Ceramics Glazing Mentorship",
        description: "Experienced ceramicist offering mentorship in crystal glazes. Happy to teach my techniques in exchange for help with studio management and kiln loading.",
        type: "Mentorship",
        compensation: {
            type: "Exchange",
            details: "Mentorship for Studio Assistance"
        },
        authorId: "user_2",
        authorName: "Marcus T.",
        location: "Berlin, DE",
        locationType: "On-site",
        status: "Open"
    },
    {
        title: "Sustainable Textile Workshop Series",
        description: "Organizing a series of workshops on natural dyeing and weaving. Seeking a co-host with experience in local plant foraging.",
        type: "Event",
        compensation: {
            type: "Money",
            amount: 500,
            currency: "EUR",
            details: "Per workshop session"
        },
        authorId: "user_3",
        authorName: "Sarah J.",
        location: "London, UK",
        locationType: "On-site",
        status: "Open"
    },
    {
        title: "Digital Portfolio Review for Artisans",
        description: "I'm a web designer looking to help artisans build better portfolios. Offering free reviews and tips in exchange for a small handmade piece.",
        type: "Other",
        compensation: {
            type: "Exchange",
            details: "Web advice for Art"
        },
        authorId: "user_4",
        authorName: "David L.",
        location: "Remote",
        locationType: "Remote",
        status: "Open"
    }
];

async function seedCollaborations() {
    console.log("🌱 Seeding collaborations...");

    try {
        // Optional: Clear existing collaborations (be careful in production)
        // const existing = await getDocs(collection(db, "collaborations"));
        // await Promise.all(existing.docs.map(doc => deleteDoc(doc.ref)));

        for (const data of collaborations) {
            await addDoc(collection(db, "collaborations"), {
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`✅ Created: ${data.title}`);
        }

        console.log("✨ Seeding complete!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
}

// Run if called directly
if (require.main === module) {
    seedCollaborations();
}
