import { adminAuth } from "./firebase-admin";
import { logger } from "./logger";

/**
 * 🛂 Auth Authority
 * 
 * Secure identity derivation for Server Actions.
 * Verifies the client-provided IdToken and returns the verified UID.
 * This prevents identity impersonation (trusting the client-supplied ID).
 */
export async function verifySession(idToken: string | undefined): Promise<string | null> {
    if (!idToken) {
        logger.warn('PERMISSION_DENIED', { message: "Missing idToken in secure action", source: 'backend' });
        return null;
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error: any) {
        logger.error('SECURITY_VIOLATION', { message: "INVALID_TOKEN_ATTEMPT", error: error.message, source: 'backend' });
        return null;
    }
}

/**
 * 🛠️ Get Verified Identity
 * Throws if unauthenticated to halt the server action execution.
 */
export async function getAuthorizedUser(idToken: string | undefined): Promise<string> {
    const uid = await verifySession(idToken);
    if (!uid) {
        throw new Error("UNAUTHORIZED_ACCESS_BLOCKED");
    }
    return uid;
}
