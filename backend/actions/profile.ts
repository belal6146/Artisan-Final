"use server";

import { adminDb } from "@/backend/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "@/backend/lib/logger";
import { updateProfileSchema, userSchema } from "@/backend/lib/schemas";
import { User as AppUser } from "@/types";

// --- Queries ---

export async function getUserById(uid: string): Promise<AppUser | null> {
    try {
        const userSnap = await adminDb.collection("users").doc(uid).get();
        if (userSnap.exists) {
            const data = userSnap.data()!;
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
        const snap = await adminDb.collection("users")
            .where("role", "==", "artist")
            .orderBy("createdAt", "desc")
            .limit(30)
            .get();
            
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

export async function syncUserToFirestore(user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null }): Promise<void> {
    if (!user) return;
    const userRef = adminDb.collection("users").doc(user.uid);
    try {
        const userSnap = await userRef.get();
        if (!userSnap.exists) {
            const userData = userSchema.parse({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: "observer",
            });
            await userRef.set({ ...userData, createdAt: FieldValue.serverTimestamp() });
            logger.info('USER_CREATE_SUCCESS', { userId: user.uid, source: 'backend' });
        }
    } catch (error: any) {
        logger.error('USER_CREATE_FAILURE', { uid: user.uid, error: error.message, source: 'backend' });
    }
}

import { getAuthorizedUser } from "@/backend/lib/auth-authority";

export async function updateUserProfile(rawData: Record<string, any>, idToken: string) {
    try {
        const verifiedUid = await getAuthorizedUser(idToken);
        logger.info('USER_UPDATE_START', { userId: verifiedUid, source: 'backend' });

        const data = updateProfileSchema.parse(rawData);
        await adminDb.collection("users").doc(verifiedUid).update({
            ...data,
            updatedAt: FieldValue.serverTimestamp()
        });

        logger.info('USER_UPDATE_SUCCESS', { userId: verifiedUid, source: 'backend' });
        return { success: true };
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED_ACCESS_BLOCKED") {
            logger.error('SECURITY_VIOLATION', { message: "USER_UPDATE_BLOCKED", source: 'backend' });
            return { success: false, error: "Access Denied: Unverified session" };
        }
        
        logger.error('USER_UPDATE_FAILURE', { error: error.message, source: 'backend', isZod: error.name === "ZodError" });
        return { success: false, error: error.name === "ZodError" ? "Invalid profile information" : "Failed to update profile" };
    }
}
