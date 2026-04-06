import { z } from "zod";

// --- Shared Elements ---
const idSchema = z.string().min(1);
const timestampSchema = z.number();
const currencySchema = z.enum(["GBP", "USD", "EUR"]);

// --- User Profile ---
export const updateProfileSchema = z.object({
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    avatarUrl: z.string().url().optional().or(z.literal("")),
    yearsOfPractice: z.number().int().min(0).max(80).optional(),
    craftStatement: z.string().max(2000).optional(),
});

const artworkMediumSchema = z.enum([
    "Painting",
    "Sculpture",
    "Photography",
    "Digital",
    "Textile",
    "Mixed Media",
    "Other",
]);

// --- Artwork ---
export const createArtworkSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(2000).optional(),
    price: z.number().min(0),
    imageUrl: z.string().url(),
    imageUrls: z.array(z.string().url()).optional(),
    primaryImageIndex: z.number().int().min(0).optional(),
    medium: artworkMediumSchema.default("Other"),
    artistId: idSchema,
    artistName: z.string().min(1),
    location: z.string().max(200).optional(),
    isForSale: z.boolean().default(true),
    currency: currencySchema.default("GBP"),
    tags: z.array(z.string()).optional(),
    // Provenance & process; empty fields show as "Not provided" on the piece page
    origin: z.string().max(300).optional(),
    process: z.string().max(1000).optional(),
    materials: z.array(z.string()).optional(),
    timeSpent: z.string().max(100).optional(),
    artisanStory: z.string().max(2000).optional(),
    impactMetrics: z.string().max(500).optional(),
    aspirations: z.string().max(500).optional(),
    peopleInvolved: z.string().max(500).optional(),
    pieceMeaning: z.string().max(2000).optional(),
    workValues: z.string().max(2000).optional(),
});

export const updateArtworkSchema = createArtworkSchema.partial().omit({ artistId: true });

// --- Events ---
export const createEventSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(5000),
    type: z.enum(["Workshop", "Exhibition", "Talk", "Critique"]),
    startTime: z.string(), // ISO String
    endTime: z.string(),   // ISO String
    location: z.string().min(1),
    locationType: z.enum(["physical", "online"]),
    capacity: z.number().min(1),
    price: z.number().min(0),
    currency: currencySchema.default("GBP"),
    imageUrl: z.string().url().optional(),
    organizerId: idSchema,
    organizerName: z.string(),
});

export const updateEventSchema = createEventSchema.partial().omit({ organizerId: true });

// --- Collaborations ---
export const createCollabSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(3000),
    type: z.enum(["Creative", "Technical", "Mentorship", "Other"]),
    location: z.string(),
    locationType: z.enum(["Online", "Physical"]),
    compensation: z.object({
        type: z.enum(["Money", "Exchange", "Unpaid"]),
        amount: z.number().optional(),
        currency: currencySchema.optional(),
    }),
    authorId: idSchema,
    authorName: z.string(),
});

export const applyCollabSchema = z.object({
    collaborationId: idSchema,
    userId: idSchema,
    userName: z.string().min(1),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

// --- Journal ---
export const createJournalSchema = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1),
    imageUrl: z.string().url().optional(),
    category: z.string().optional(),
});

// --- RSVPs ---
export const createRSVPSchema = z.object({
    eventId: idSchema,
    userId: idSchema,
    userName: z.string(),
});

// --- Checkout ---
export const checkoutSchema = z.object({
    itemId: idSchema,
    type: z.enum(["artwork", "event", "support"]),
    userId: idSchema.optional(),
});

// --- Transactions ---
export const recordTransactionSchema = z.object({
    type: z.enum(['buy', 'sell', 'rent']),
    itemId: idSchema,
    itemTitle: z.string().min(1),
    imageUrl: z.string().url().optional().or(z.literal("")),
    amount: z.number().min(0),
    currency: currencySchema,
    paymentIntentId: z.string().optional(),
});

// --- Notifications ---
export const createNotificationSchema = z.object({
    userId: idSchema,
    type: z.enum(['event_rsvp', 'artwork_purchase', 'event_reminder', 'system', 'collaboration_interest']),
    message: z.string().min(1),
    metadata: z.record(z.string(), z.any()).optional(),
});

// --- User Profile ---
export const userSchema = z.object({
    uid: idSchema,
    displayName: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    photoURL: z.string().url().nullable().optional(),
    role: z.enum(["observer", "artist", "admin"]).default("observer"),
});
