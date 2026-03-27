export type ArtworkMedium = 'Painting' | 'Sculpture' | 'Photography' | 'Digital' | 'Textile' | 'Mixed Media' | 'Other';

export interface Artwork {
    id: string;
    title: string;
    artistId: string;
    artistName: string; // Denormalized for calm loading
    imageUrl?: string; // Legacy support
    imageUrls?: string[]; // New support for multiple images
    primaryImageIndex?: number;
    medium: ArtworkMedium;
    location: string;
    price?: number;
    currency: string;
    visibility: 'public' | 'private';
    tags: string[];
    createdAt: string;
    description?: string;
    status: 'available' | 'collection';
    // Ethical Commerce & Transparency
    priceBreakdown?: {
        artisan: number;  // Amount going to the artisan
        platform: number; // Amount going to the platform
        materials: number; // Cost of materials
    };
    ecoTags?: string[]; // e.g., "Biodegradable", "Upcycled", "Organic"
    materials?: string[]; // Detailed list of materials used
}

export interface DetailedArtistProfile {
    uid: string;
    displayName: string;
    bio: string;
    location: string;
    mediums: ArtworkMedium[];
    verificationStatus: 'verified' | 'unverified' | 'pending';
    avatarUrl?: string; // Optional override handling
    website?: string;
    instagram?: string;
}

export type EventType = 'Workshop' | 'Class' | 'Gathering' | 'Exhibition';

export interface Event {
    id: string;
    organizerId: string;
    organizerName: string;
    title: string;
    description: string;
    type: EventType;
    startTime: string; // ISO String
    endTime: string; // ISO String
    timezone: string;
    locationType: 'online' | 'inPerson';
    location: string; // Address or URL
    capacity: number;
    currentAttendees: number;
    price: number;
    currency: string;
    status: 'published' | 'draft' | 'cancelled';
    imageUrl?: string;
    // Ethical Commerce
    priceBreakdown?: {
        artisan: number;
        platform: number;
        materials: number;
    };
    ecoTags?: string[];
}

export interface EventRSVP {
    eventId: string;
    userId: string;
    status: 'going' | 'cancelled';
    createdAt: string;
}

export interface Collaboration {
    id: string;
    title: string;
    description: string;
    type: 'Project' | 'Mentorship' | 'Event' | 'Other';
    compensation: {
        type: 'Money' | 'Exchange' | 'ProBono';
        amount?: number;
        currency?: string;
        details?: string;
    };
    authorId: string;
    authorName: string;
    authorAvatarUrl?: string;
    location: string;
    locationType: 'Remote' | 'On-site' | 'Hybrid';
    status: 'Open' | 'Closed';
    createdAt: string;
    updatedAt: string;
    skills?: string[];
    // Ethical Commerce
    ecoGoals?: string[]; // Sustainability goals for the project
}
