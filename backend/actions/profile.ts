"use server";

import { db } from "@/backend/config/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, setDoc, limit, orderBy } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";
import { updateProfileSchema, userSchema } from "@/backend/lib/schemas";
import { User as AppUser } from "@/types";

// --- Queries ---

export async function getUserById(uid: string): Promise<AppUser | null> {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            return {
                uid: userSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as AppUser;
        }
        return null;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Error fetching user by ID", uid, error: error.message, source: 'backend' });
        return null;
    }
}

export async function getAllArtists(): Promise<AppUser[]> {
    try {
        const q = query(
            collection(db, "users"), 
            where("role", "==", "artist"),
            orderBy("createdAt", "desc"),
            limit(30)
        );
        const snap = await getDocs(q);
        const artists = snap.docs.map(doc => {
            const data = doc.data();
            return {
                uid: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as AppUser;
        });
        
        logger.info('USER_FETCH_SUCCESS', { count: artists.length, role: 'artist', source: 'backend' });
        return artists;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { message: "Error fetching artists", error: error.message, source: 'backend' });
        return [];
    }
}

// --- Mutations ---

export async function syncUserToFirestore(user: any): Promise<void> {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            const userData = userSchema.parse({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: "observer",
            });
            await setDoc(userRef, { ...userData, createdAt: serverTimestamp() });
            logger.info('USER_CREATE_SUCCESS', { userId: user.uid, source: 'backend' });
        }
    } catch (error: any) {
        logger.error('USER_CREATE_FAILURE', { uid: user.uid, error: error.message, source: 'backend' });
    }
}

export async function updateUserProfile(uid: string, rawData: any) {
    try {
        const data = updateProfileSchema.parse(rawData);
        logger.info('USER_UPDATE_START', { userId: uid, source: 'backend' });

        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            ...data,
            updatedAt: serverTimestamp()
        });

        logger.info('USER_UPDATE_SUCCESS', { userId: uid, source: 'backend' });
        return { success: true };
    } catch (error: any) {
        logger.error('USER_UPDATE_FAILURE', { userId: uid, error: error.message, source: 'backend' });
        return { success: false, error: error.name === "ZodError" ? "Invalid profile information" : "Failed to update profile" };
    }
}
