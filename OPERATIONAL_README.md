# ENGINEERING CHARTER: THE ARTISAN WAY

## The Moral Position
Artisan is not just a marketplace; it is a declaration that the human creative process is sacred. Our code must reflect this respect through precision, reliability, and emotional intelligence.

## Core Values

### 1. Deep Trust
- We never store what we don't need.
- Every transaction is a promise; our audit logs must be impeccable.
- Security is not a feature; it is the substrate.

### 2. Calm Excellence
- Avoid disruptive "shouting" UI (no standard browser alerts).
- Transitions are smooth, but never distracting.
- The interface feels intentional, not impulsive.

### 3. Operational Rigor
- If it isn't logged, it didn't happen.
- All logs must be machine-readable (JSON) and strictly typed.
- We prioritize operational health over feature density.

### 4. Machine-Readable Integrity
- Domain-driven structure: Auth, Artworks, Events, Commerce.
- Clear separation of concerns; no "magic strings" in critical paths.

---

# OPERATIONAL_README: SYSTEM VISIBILITY

## Unified Logging Architecture
Artisan uses a strictly typed event-driven logging system located in `backend/lib/logger.ts`.

### Mandatory Event Taxonomy
Use the `EventName` types for all operational activity:
- `AUTH_*`: Identity lifecycle.
- `ARTWORK_*`: Creation and gallery state.
- `COMMERCE_*`: Financial and checkout events.
- `SYSTEM_ERROR`: Catch-all for unexpected failures (always include a machine-friendly message).

### Implementation Pattern
```tsx
import { logger } from "@/backend/lib/logger";

try {
  // Action logic
  logger.info('ARTWORK_UPLOAD_SUCCESS', { userId, artworkId, source: 'frontend' });
} catch (e: any) {
  logger.error('SYSTEM_ERROR', { message: "Brief description", error: e.message, source: 'frontend' });
}
```

### Prohibited Patterns (World-Class Guardrails)
- NO `console.log` or `console.error` (unless in local debugging, then remove).
- NO `alert()` calls. Use silent operational traces and subtle UI feedback.
- NO "magic strings" for event names.

## Audit & Monitoring
Every production log is emitted as structured JSON, ready for aggregation in tools like Datadog, Sentry, or CloudWatch. We monitor system health by tracking the velocity of `SYSTEM_ERROR` and `COMMERCE_PAYMENT_FAILED` events.
