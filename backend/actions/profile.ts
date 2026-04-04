"use server";

import { db } from "@/backend/config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";

import { updateProfileSchema } from "@/backend/lib/schemas";

export async function updateUserProfile(uid: string, rawData: any) {
    try {
        const data = updateProfileSchema.parse(rawData);
        logger.info('PROFILE_UPDATE_START', { userId: uid, source: 'backend' });

        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });

        logger.info('PROFILE_UPDATE_SUCCESS', { userId: uid, source: 'backend' });
        return { success: true };
    } catch (error: any) {
        logger.error('PROFILE_UPDATE_FAILURE', { error, userId: uid, source: 'backend' });
        return { 
            success: false, 
            error: error.name === "ZodError" ? "Invalid profile data" : "Failed to update profile" 
        };
    }
}
