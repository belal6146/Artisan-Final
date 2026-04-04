import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { db } from "@/backend/config/firebase";
import { logger } from "@/backend/lib/logger";
import { User as AppUser } from "@/types";

/**
 * Syncs the authenticated Firebase User to Firestore.
 * - If the user document does not exist, it creates one.
 * - If it exists, it updates the `lastSeen` field (optional, good for activity tracking).
 * 
 * @param user - The Firebase Auth user object
 */
export async function syncUserToFirestore(user: FirebaseUser): Promise<void> {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    try {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            // User exists, just update metadata if needed
            // For now, we just log it. In a real app, optimize this to not write on every page load.
            // logger.info("User logged in", { uid: user.uid, email: user.email });
            // await updateDoc(userRef, { lastSeen: serverTimestamp() });
        } else {
            // Create new user record
            const newUser: AppUser = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: "observer", // Default role
                createdAt: new Date().toISOString(),
            };

            await setDoc(userRef, {
                ...newUser,
                createdAt: serverTimestamp(), // Use server timestamp for consistency
            });

            logger.info('USER_PROFILE_UPDATED', { uid: user.uid, role: newUser.role, isNew: true, source: 'backend' });
        }
    } catch (error) {
        logger.error('SYSTEM_ERROR', { 
            message: "Failed to sync user to Firestore", 
            uid: user.uid,
            error,
            source: 'backend'
        });
        // We don't block the UI here, but this is a critical failure for "Trust" features.
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
