import * as admin from "firebase-admin";

/**
 * 🔐 Firebase Admin SDK (Server-Only Configuration)
 * 
 * Provides administrative authority for secure write operations,
 * verification of client-side identity tokens, and bypasses 
 * the 'unauthenticated quest' problem in Server Actions.
 */
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
    try {
        if (serviceAccount) {
            // Highly secure production initialization
            const parsedAccount = JSON.parse(serviceAccount);
            admin.initializeApp({
                credential: admin.credential.cert(parsedAccount),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        } else {
            // Fallback for development if GOOGLE_APPLICATION_CREDENTIALS is not set
            admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        }
    } catch (e: any) {
        console.error("Firebase Admin Initialization Error:", e.message);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export default admin;
