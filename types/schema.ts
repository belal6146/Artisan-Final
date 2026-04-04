export type ArtworkMedium = 'Painting' | 'Sculpture' | 'Photography' | 'Digital' | 'Textile' | 'Mixed Media' | 'Other';

export interface Artwork {
    id: string;
    title: string;
    artistId: string;
    artistName: string;
    imageUrl?: string;
    imageUrls?: string[];
    primaryImageIndex?: number;
    medium?: ArtworkMedium;
    location?: string;
    price?: number;
    currency: string;
    visibility: 'public' | 'private';
    tags?: string[];
    createdAt: string;
    description?: string;
    status: 'available' | 'collection';
    // Provenance & Process
    origin?: string;          // Cultural / geographic context of the work
    process?: string;         // How it was made — specific, not vague
    materials?: string[];     // What was used and where sourced
    timeSpent?: string;       // Honest time: "22 hours over 4 days"
    artisanStory?: string;    // The maker's specific words about this piece
    impactMetrics?: string;   // Who benefits — real, not marketing
    aspirations?: string;     // What the artist is working toward
    peopleInvolved?: string; // Who worked on it (names, roles, workshop size)
    pieceMeaning?: string;    // What the piece carries for the maker or community
    workValues?: string;      // What the maker respects in this work (craft, ethics, tradition)
    // Ethical Commerce
    priceBreakdown?: {
        artisan: number;
        platform: number;
        materials: number;
    };
    ecoTags?: string[];
}

export interface DetailedArtistProfile {
    uid: string;
    displayName: string;
    bio: string;
    location: string;
    mediums: ArtworkMedium[];
    verificationStatus: 'verified' | 'unverified' | 'pending';
    avatarUrl?: string;
    website?: string;
    instagram?: string;
    // Craft depth
    yearsOfPractice?: number;  // How long they have been working
    craftStatement?: string;   // Their specific words about their practice — not a bio
    influences?: string;       // What has shaped the work
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

export interface CollaborationApplication {
    id: string;
    collaborationId: string;
    userId: string;
    userName: string;
    message: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
    createdAt: string;
}
