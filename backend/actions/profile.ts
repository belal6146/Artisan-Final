"use server";

import { db } from "@/backend/config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { logger } from "@/backend/lib/logger";

export async function updateUserProfile(uid: string, data: { bio?: string; location?: string; avatarUrl?: string }) {
    if (!uid) throw new Error("User ID is required");

    try {
        logger.info("Updating user profile", { uid });
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error: any) {
        logger.error("Failed to update profile", { uid, error: error.message });
        return { success: false, error: error.message };
    }
}
