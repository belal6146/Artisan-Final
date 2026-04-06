import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import app from "@/backend/config/firebase";

/**
 * 📊 Dynamic Analytics (Browser-Only)
 * Prevents "window is not defined" during Server-Side Rendering (SSR) 
 * and ensures Server Actions never attempt to initialize telemetry.
 */
let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { analytics };
