# 🏛️ Artisan Platform: Production Doctrine
**Architecture & Hardening Report**

The Artisan platform has been transitioned from an MVP to a **Production-Grade Ecosystem**. This involves architectural isolation, verified identity authority, and editorial discipline.

---

### 1. 🛂 Backend Authority (Hardened)
We have moved away from "Security by Convenience." All high-value write operations now require a verified `IdToken` and are derived from the backend session, not the client request.
- **Authority Helper**: `backend/lib/auth-authority.ts` handles cryptographic verification.
- **Admin Singleton**: `backend/lib/firebase-admin.ts` provides the server-side administrative authority.
- **Action Pattern**: All `create` and `update` server actions now derive user identity after token verification.

### 2. 🛡️ Runtime Boundary Security
The "Boundary Blur" that caused hydrate/SSR errors and security bleed has been eliminated.
- **Firebase Core**: `backend/config/firebase.ts` is safe for both Client and Server Actions.
- **Analytics Isolation**: `frontend/lib/analytics.ts` is strictly browser-only and never hydrates on the server.
- **Serialization**: Explicit JSON normalization is used in Server Components to ensure safe prop passing while maintaining code clarity.

### 3. 🎨 Museum-Grade Editorial Tone
The platform now uses a "Breathable Gallery" cadence rather than a transactional store feeling.
- **State Warmth**: "Collected" is now **"Held by Archive"**; "Available" is now **"Available for Acquisition."**
- **Provenance Discipline**: Missing data is no longer "Not provided" but part of a **"Hidden Narrative"** or **"Arriving Soon."**
- **Typography**: The Playfair Display/Inter hierarchy is strictly enforced via typography archetypes in `@/frontend/lib/utils`.

---

### 🚀 Mandatory Production Steps (Post-Hardening)

#### A. Firestore Composite Indices
The new server-side query filters for high performance require three specific composite indices in the Firebase Console:
1. **Artworks**: `artistId: ASC`, `createdAt: DESC`
2. **Events**: `organizerId: ASC`, `startTime: DESC`
3. **Transactions**: `type: ASC`, `createdAt: DESC`

#### B. Identity Environment
Ensure the `FIREBASE_SERVICE_ACCOUNT_KEY` is set in your production environment (Vercel/Cloud Run). Without this, the **Authority Layer** will block all write operations.

#### C. Final Review Criteria
- **Zen-Standard**: No component should exceed 500 lines without a sub-component extraction.
- **Telemetry Silence**: Production must have **ZERO** `console.log` statements. Use `logger.ts` exclusively.
- **Humanity First**: No generic "Submit" buttons. Every CTA must have intention (e.g., "Seal Record", "Acquire Provenance").

---
**CTO's Final Note**: "The architecture is now unassailable, and the design is intentional. Maintain the silence of the telemetry and the warmth of the copy, and the studio will thrive."
