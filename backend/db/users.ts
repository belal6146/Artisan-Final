import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { db } from "@/backend/config/firebase";
import { logger } from "@/backend/lib/logger";
import { User as AppUser } from "@/types";

import { userSchema } from "@/backend/lib/schemas";

/**
 * Syncs the authenticated Firebase User to Firestore.
 */
export async function syncUserToFirestore(user: FirebaseUser): Promise<void> {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    try {
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Create new user record
            const userData = userSchema.parse({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: "observer",
            });

            await setDoc(userRef, {
                ...userData,
                createdAt: serverTimestamp(),
            });

            logger.info('USER_CREATE_SUCCESS', { userId: user.uid, source: 'backend' });
        }
    } catch (error: any) {
        logger.error('USER_CREATE_FAILURE', { 
            message: "Failed to sync user", 
            uid: user.uid,
            error: error.message,
            source: 'backend'
        });
    }
}

/**
 * Fetches all users who have the 'artist' role.
 * Used for the Community page.
 */
export async function getAllArtists(): Promise<AppUser[]> {
    try {
        // In a real app, we might want to paginate this or filter by verification status
        // For now, getting all 'artist' roles is sufficient for the MVP scale
        const q = query(collection(db, "users"), where("role", "==", "artist"));
        const querySnapshot = await getDocs(q);

        const artists = querySnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as AppUser));

        return artists;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { 
            message: "Error fetching artists", 
            error,
            source: 'backend'
        });
        return [];
    }
}

export async function getUserById(uid: string): Promise<AppUser | null> {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { uid: userSnap.id, ...userSnap.data() } as AppUser;
        }
        return null;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { 
            message: "Error fetching user by ID", 
            uid, 
            error,
            source: 'backend'
        });
        return null;
    }
}
