/**
 * patch-images.ts
 *
 * This script does two things:
 * 1. Replaces all dead/404 image URLs in Firestore with stable, art-appropriate images
 * 2. Ensures all collections (artworks, events, users, collaborations) are fully populated
 *
 * Run with: npx tsx scripts/patch-images.ts
 * Prereq: Firestore rules must allow write: if true (temporarily open for seeding)
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    writeBatch,
    setDoc,
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBMZlmM2cX-K2GNIdzjKjsNjwTWBEAmM8E",
    authDomain: "artisian-61ac9.firebaseapp.com",
    projectId: "artisian-61ac9",
    storageBucket: "artisian-61ac9.firebasestorage.app",
    messagingSenderId: "195039579524",
    appId: "1:195039579524:web:ef706a43064095594b21d1",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// ─────────────────────────────────────────────────────────────────────────────
// CURATED IMAGE MAP — each document ID maps to a unique, themed image
// Using Picsum with deterministic seeds so images never change between runs
// ─────────────────────────────────────────────────────────────────────────────

/** Maps artwork doc IDs to unique, art-appropriate images */
const ARTWORK_IMAGE_MAP: Record<string, { imageUrl: string; imageUrls: string[] }> = {
    art_1: {
        imageUrl: "https://picsum.photos/seed/watercolor-bloom/800/1000",
        imageUrls: ["https://picsum.photos/seed/watercolor-bloom/800/1000", "https://picsum.photos/seed/watercolor-bloom-2/800/1000"],
    },
    art_2: {
        imageUrl: "https://picsum.photos/seed/oil-landscape/800/1000",
        imageUrls: ["https://picsum.photos/seed/oil-landscape/800/1000"],
    },
    art_3: {
        imageUrl: "https://picsum.photos/seed/clay-vessel/800/1000",
        imageUrls: ["https://picsum.photos/seed/clay-vessel/800/1000", "https://picsum.photos/seed/clay-vessel-side/800/1000"],
    },
    art_4: {
        imageUrl: "https://picsum.photos/seed/woven-textile/800/1000",
        imageUrls: ["https://picsum.photos/seed/woven-textile/800/1000"],
    },
    art_5: {
        imageUrl: "https://picsum.photos/seed/digital-abstract/800/1000",
        imageUrls: ["https://picsum.photos/seed/digital-abstract/800/1000"],
    },
    art_6: {
        imageUrl: "https://picsum.photos/seed/bronze-sculpture/800/1000",
        imageUrls: ["https://picsum.photos/seed/bronze-sculpture/800/1000", "https://picsum.photos/seed/bronze-sculpture-back/800/1000"],
    },
    art_7: {
        imageUrl: "https://picsum.photos/seed/urban-photography/800/1000",
        imageUrls: ["https://picsum.photos/seed/urban-photography/800/1000"],
    },
    art_8: {
        imageUrl: "https://picsum.photos/seed/botanical-print/800/1000",
        imageUrls: ["https://picsum.photos/seed/botanical-print/800/1000"],
    },
    art_9: {
        imageUrl: "https://picsum.photos/seed/charcoal-portrait/800/1000",
        imageUrls: ["https://picsum.photos/seed/charcoal-portrait/800/1000"],
    },
    art_10: {
        imageUrl: "https://picsum.photos/seed/mosaic-tiles/800/1000",
        imageUrls: ["https://picsum.photos/seed/mosaic-tiles/800/1000"],
    },
    art_11: {
        imageUrl: "https://picsum.photos/seed/glass-blown/800/1000",
        imageUrls: ["https://picsum.photos/seed/glass-blown/800/1000", "https://picsum.photos/seed/glass-blown-detail/800/1000"],
    },
    art_12: {
        imageUrl: "https://picsum.photos/seed/ink-landscape/800/1000",
        imageUrls: ["https://picsum.photos/seed/ink-landscape/800/1000"],
    },
    art_13: {
        imageUrl: "https://picsum.photos/seed/mixed-media-collage/800/1000",
        imageUrls: ["https://picsum.photos/seed/mixed-media-collage/800/1000"],
    },
    art_14: {
        imageUrl: "https://picsum.photos/seed/linen-weave/800/1000",
        imageUrls: ["https://picsum.photos/seed/linen-weave/800/1000"],
    },
    art_15: {
        imageUrl: "https://picsum.photos/seed/encaustic-wax/800/1000",
        imageUrls: ["https://picsum.photos/seed/encaustic-wax/800/1000"],
    },
};

/** Maps event doc IDs to unique, theme-appropriate images */
const EVENT_IMAGE_MAP: Record<string, string> = {
    e1: "https://picsum.photos/seed/pottery-workshop/1000/600",   // Pottery class
    e2: "https://picsum.photos/seed/painting-session/1000/600",   // Painting workshop
    e3: "https://picsum.photos/seed/gallery-opening/1000/600",    // Gallery exhibition
    e4: "https://picsum.photos/seed/outdoor-sketch/1000/600",     // Plein air sketching
    e5: "https://picsum.photos/seed/figure-drawing/1000/600",     // Figure drawing
    e6: "https://picsum.photos/seed/natural-dyeing/1000/600",     // Natural dyeing textile
    e7: "https://picsum.photos/seed/digital-art-class/1000/600",  // Digital art
    e8: "https://picsum.photos/seed/printmaking/1000/600",        // Printmaking
    e9: "https://picsum.photos/seed/sculpture-class/1000/600",    // Sculpture
    e10: "https://picsum.photos/seed/art-market/1000/600",        // Art fair / market
};

// ─────────────────────────────────────────────────────────────────────────────
// FULL SEED DATA — ensures all pages have rich content
// ─────────────────────────────────────────────────────────────────────────────

const SEED_ARTWORKS = [
    {
        id: "art_1", title: "Bloom in Watercolour", artistId: "artist1", artistName: "Elena Vance",
        imageUrl: ARTWORK_IMAGE_MAP.art_1.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_1.imageUrls,
        primaryImageIndex: 0, medium: "Painting", location: "Berlin, Germany",
        price: 1200, currency: "EUR", visibility: "public", tags: ["floral", "watercolour", "botanical"],
        createdAt: "2026-02-10T10:00:00.000Z", status: "available",
        description: "A delicate watercolour study of wildflowers, painted en plein air in the Berlin Botanical Garden. Each bloom is rendered with luminous washes of rose and gold.",
        ecoTags: ["Organic pigments", "Recycled paper"],
    },
    {
        id: "art_2", title: "Nordic Light", artistId: "artist1", artistName: "Elena Vance",
        imageUrl: ARTWORK_IMAGE_MAP.art_2.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_2.imageUrls,
        primaryImageIndex: 0, medium: "Painting", location: "Berlin, Germany",
        price: 3400, currency: "EUR", visibility: "public", tags: ["landscape", "oil", "nordic"],
        createdAt: "2026-01-22T08:00:00.000Z", status: "available",
        description: "An oil painting capturing the golden hour light across a Scandinavian fjord. Thick impasto brushwork evokes the raw energy of northern landscapes.",
    },
    {
        id: "art_3", title: "Terracotta Vessel No. 7", artistId: "artist2", artistName: "Marco Ferri",
        imageUrl: ARTWORK_IMAGE_MAP.art_3.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_3.imageUrls,
        primaryImageIndex: 0, medium: "Sculpture", location: "Florence, Italy",
        price: 850, currency: "EUR", visibility: "public", tags: ["ceramics", "terracotta", "vessel"],
        createdAt: "2026-02-18T14:00:00.000Z", status: "available",
        description: "Wheel-thrown terracotta vessel with a natural ash glaze. Formed from locally sourced Tuscan clay, this piece celebrates imperfection and the beauty of handmade form.",
        materials: ["Tuscan terracotta", "Ash glaze"], ecoTags: ["Local materials", "Biodegradable"],
    },
    {
        id: "art_4", title: "Woven Horizon", artistId: "artist3", artistName: "Sarah Miller",
        imageUrl: ARTWORK_IMAGE_MAP.art_4.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_4.imageUrls,
        primaryImageIndex: 0, medium: "Textile", location: "East London, UK",
        price: 620, currency: "EUR", visibility: "public", tags: ["weaving", "textile", "earth tones"],
        createdAt: "2026-03-01T11:00:00.000Z", status: "available",
        description: "A hand-woven wall piece inspired by the horizon line at dusk. Made from naturally dyed organic wool in sienna, ochre, and indigo.",
        materials: ["Organic wool", "Natural dyes"], ecoTags: ["Natural dyes", "Organic", "Handmade"],
    },
    {
        id: "art_5", title: "Signal Noise", artistId: "artist4", artistName: "Amara Diallo",
        imageUrl: ARTWORK_IMAGE_MAP.art_5.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_5.imageUrls,
        primaryImageIndex: 0, medium: "Digital", location: "Lagos, Nigeria",
        price: 450, currency: "EUR", visibility: "public", tags: ["digital", "abstract", "generative"],
        createdAt: "2026-03-05T09:00:00.000Z", status: "available",
        description: "A generative digital work exploring the relationship between data and perception. Each print is unique, produced on archival matte paper with pigment inks.",
    },
    {
        id: "art_6", title: "The Thinker's Echo", artistId: "artist2", artistName: "Marco Ferri",
        imageUrl: ARTWORK_IMAGE_MAP.art_6.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_6.imageUrls,
        primaryImageIndex: 0, medium: "Sculpture", location: "Florence, Italy",
        price: 4200, currency: "EUR", visibility: "public", tags: ["bronze", "figurative", "sculpture"],
        createdAt: "2026-01-15T10:00:00.000Z", status: "collection",
        description: "Lost-wax cast bronze sculpture referencing the classical European tradition while deconstructing the heroic body. A meditation on doubt and introspection.",
        materials: ["Bronze", "Marble base"],
    },
    {
        id: "art_7", title: "Market at Dawn", artistId: "artist5", artistName: "Lena Park",
        imageUrl: ARTWORK_IMAGE_MAP.art_7.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_7.imageUrls,
        primaryImageIndex: 0, medium: "Photography", location: "Seoul, South Korea",
        price: 780, currency: "EUR", visibility: "public", tags: ["photography", "street", "urban"],
        createdAt: "2026-02-28T06:30:00.000Z", status: "available",
        description: "Documentary photograph of Seoul's Gwangjang market at 5am. Shot on medium format film, the image captures vendors preparing before the city wakes. Limited edition of 10.",
        materials: ["Archival Pigment Print", "Hahnemühle Photo Rag"],
    },
    {
        id: "art_8", title: "Herbarium Plate XII", artistId: "artist1", artistName: "Elena Vance",
        imageUrl: ARTWORK_IMAGE_MAP.art_8.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_8.imageUrls,
        primaryImageIndex: 0, medium: "Painting", location: "Berlin, Germany",
        price: 680, currency: "EUR", visibility: "public", tags: ["botanical", "illustration", "gouache"],
        createdAt: "2026-03-10T13:00:00.000Z", status: "available",
        description: "Gouache botanical illustration from an ongoing herbarium series. Each plant specimen is collected, pressed, and then meticulously documented in richly pigmented gouache.",
        ecoTags: ["Plant-based pigments"],
    },
    {
        id: "art_9", title: "Study of a Resting Figure", artistId: "artist5", artistName: "Lena Park",
        imageUrl: ARTWORK_IMAGE_MAP.art_9.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_9.imageUrls,
        primaryImageIndex: 0, medium: "Painting", location: "Seoul, South Korea",
        price: 950, currency: "EUR", visibility: "public", tags: ["charcoal", "portrait", "figurative"],
        createdAt: "2026-02-14T16:00:00.000Z", status: "collection",
        description: "Large-scale charcoal portrait drawn from a live model session. The dramatic tonal range and loose, gestural marks capture the vulnerability and stillness of rest.",
    },
    {
        id: "art_10", title: "Mediterranean Mosaic", artistId: "artist2", artistName: "Marco Ferri",
        imageUrl: ARTWORK_IMAGE_MAP.art_10.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_10.imageUrls,
        primaryImageIndex: 0, medium: "Mixed Media", location: "Florence, Italy",
        price: 1800, currency: "EUR", visibility: "public", tags: ["mosaic", "mediterranean", "tiles"],
        createdAt: "2026-01-30T10:00:00.000Z", status: "available",
        description: "A hand-cut glass and marble mosaic piece drawing from Byzantine and Moorish traditions. Each fragment is individually placed on a traditional lime mortar ground.",
        materials: ["Hand-cut glass", "Marble", "Lime mortar"], ecoTags: ["Recycled glass"],
    },
    {
        id: "art_11", title: "Vessel of Light", artistId: "artist3", artistName: "Sarah Miller",
        imageUrl: ARTWORK_IMAGE_MAP.art_11.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_11.imageUrls,
        primaryImageIndex: 0, medium: "Sculpture", location: "East London, UK",
        price: 2200, currency: "EUR", visibility: "public", tags: ["glass", "blown", "light"],
        createdAt: "2026-03-12T11:00:00.000Z", status: "available",
        description: "Hand-blown borosilicate glass vessel with embedded gold-leaf inclusions. When backlit, the form radiates warmth and depth, transforming the space around it.",
        materials: ["Borosilicate glass", "24k gold leaf"],
    },
    {
        id: "art_12", title: "Ink Landscape #3", artistId: "artist4", artistName: "Amara Diallo",
        imageUrl: ARTWORK_IMAGE_MAP.art_12.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_12.imageUrls,
        primaryImageIndex: 0, medium: "Painting", location: "Lagos, Nigeria",
        price: 1100, currency: "EUR", visibility: "public", tags: ["ink", "landscape", "west africa"],
        createdAt: "2026-02-05T10:00:00.000Z", status: "available",
        description: "India ink on kozo paper, from a series depicting the West African coastline at low tide. Bold calligraphic strokes capture the movement of waves and mangrove roots.",
    },
    {
        id: "art_13", title: "Memory Collage I", artistId: "artist5", artistName: "Lena Park",
        imageUrl: ARTWORK_IMAGE_MAP.art_13.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_13.imageUrls,
        primaryImageIndex: 0, medium: "Mixed Media", location: "Seoul, South Korea",
        price: 740, currency: "EUR", visibility: "public", tags: ["collage", "mixed media", "memory"],
        createdAt: "2026-03-08T15:00:00.000Z", status: "available",
        description: "Mixed media collage using archival photographs, washi paper, and acrylic paint. The layered composition explores how personal memory is fragmented and reconstructed over time.",
        materials: ["Archival photographs", "Washi paper", "Acrylic"],
    },
    {
        id: "art_14", title: "Indigo Loom", artistId: "artist3", artistName: "Sarah Miller",
        imageUrl: ARTWORK_IMAGE_MAP.art_14.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_14.imageUrls,
        primaryImageIndex: 0, medium: "Textile", location: "East London, UK",
        price: 890, currency: "EUR", visibility: "public", tags: ["indigo", "linen", "weaving"],
        createdAt: "2026-02-22T10:00:00.000Z", status: "collection",
        description: "Hand-woven linen cloth naturally dyed in traditional Japanese indigo. The irregular selvedge and subtle tonal variations celebrate the beauty of slow, hand-craft processes.",
        materials: ["Organic linen", "Japanese indigo"], ecoTags: ["Natural dyes", "Organic", "Zero waste"],
    },
    {
        id: "art_15", title: "Encaustic Fields", artistId: "artist1", artistName: "Elena Vance",
        imageUrl: ARTWORK_IMAGE_MAP.art_15.imageUrl, imageUrls: ARTWORK_IMAGE_MAP.art_15.imageUrls,
        primaryImageIndex: 0, medium: "Painting", location: "Berlin, Germany",
        price: 1650, currency: "EUR", visibility: "public", tags: ["encaustic", "wax", "abstract"],
        createdAt: "2026-03-15T10:00:00.000Z", status: "available",
        description: "Encaustic (hot wax) painting on birch panel. Layers of pigmented beeswax are applied, fused, and carved to create a topographic, abstract landscape rich in texture and depth.",
        materials: ["Beeswax", "Damar resin", "Earth pigments"], ecoTags: ["Natural materials", "Beeswax"],
    },
];

const SEED_EVENTS = [
    {
        id: "e1", title: "Introduction to Wheel Throwing", organizerId: "artist2", organizerName: "Marco Ferri",
        imageUrl: EVENT_IMAGE_MAP.e1, type: "Workshop",
        description: "Learn the fundamentals of wheel-throwing pottery with Marco Ferri. Beginners welcome — all materials provided. You will leave with two hand-thrown bowls ready for glazing.",
        startTime: "2026-04-05T10:00:00.000Z", endTime: "2026-04-05T14:00:00.000Z", timezone: "Europe/Rome",
        locationType: "inPerson", location: "Via della Vigna Nuova 18, Florence, Italy",
        capacity: 8, currentAttendees: 5, price: 120, currency: "EUR", status: "published",
    },
    {
        id: "e2", title: "Plein Air Oil Painting — Tiergarten", organizerId: "artist1", organizerName: "Elena Vance",
        imageUrl: EVENT_IMAGE_MAP.e2, type: "Workshop",
        description: "An outdoor oil painting session in Berlin's famous Tiergarten park. Elena will guide participants through colour mixing, tonal values, and capturing natural light in real time.",
        startTime: "2026-04-19T09:00:00.000Z", endTime: "2026-04-19T13:00:00.000Z", timezone: "Europe/Berlin",
        locationType: "inPerson", location: "Tiergarten Park, Berlin, Germany",
        capacity: 12, currentAttendees: 7, price: 85, currency: "EUR", status: "published",
    },
    {
        id: "e3", title: "Group Exhibition Opening: Earthwork", organizerId: "artist2", organizerName: "Marco Ferri",
        imageUrl: EVENT_IMAGE_MAP.e3, type: "Exhibition",
        description: "The opening evening for 'Earthwork' — a group exhibition featuring ceramic and sculptural works exploring humanity's relationship with natural materials. Wine and canapés provided.",
        startTime: "2026-04-25T18:00:00.000Z", endTime: "2026-04-25T21:00:00.000Z", timezone: "Europe/Rome",
        locationType: "inPerson", location: "Galleria Frilli, Lungarno Guicciardini 5, Florence",
        capacity: 80, currentAttendees: 43, price: 0, currency: "EUR", status: "published",
    },
    {
        id: "e4", title: "Botanical Illustration: Gouache & Ink", organizerId: "artist1", organizerName: "Elena Vance",
        imageUrl: EVENT_IMAGE_MAP.e4, type: "Class",
        description: "A half-day class in the precise and joyful craft of botanical illustration. Work with fresh specimens from the market to create detailed, colourful studies in gouache and ink.",
        startTime: "2026-05-03T11:00:00.000Z", endTime: "2026-05-03T15:00:00.000Z", timezone: "Europe/Berlin",
        locationType: "inPerson", location: "Studio Lichtblick, Prenzlauer Berg, Berlin",
        capacity: 10, currentAttendees: 6, price: 95, currency: "EUR", status: "published",
    },
    {
        id: "e5", title: "Life Drawing — Monthly Gathering", organizerId: "artist5", organizerName: "Lena Park",
        imageUrl: EVENT_IMAGE_MAP.e5, type: "Gathering",
        description: "Monthly open studio figure drawing session with a professional model. Bring your own materials — any medium welcome. All skill levels. A calm, focused, non-judgemental space.",
        startTime: "2026-04-30T18:30:00.000Z", endTime: "2026-04-30T21:00:00.000Z", timezone: "Asia/Seoul",
        locationType: "inPerson", location: "Studio Park, Mapo-gu, Seoul",
        capacity: 16, currentAttendees: 11, price: 25, currency: "EUR", status: "published",
    },
    {
        id: "e6", title: "Textile Art: Natural Dyeing Workshop", organizerId: "artist3", organizerName: "Sarah Miller",
        imageUrl: EVENT_IMAGE_MAP.e6, type: "Workshop",
        description: "Discover the ancient art of natural dyeing using plants, flowers, and minerals. Create beautiful, eco-friendly colours on organic linen fabric to take home.",
        startTime: "2026-04-12T13:00:00.000Z", endTime: "2026-04-12T17:00:00.000Z", timezone: "Europe/London",
        locationType: "inPerson", location: "Textile Studio, East London",
        capacity: 10, currentAttendees: 7, price: 95, currency: "EUR", status: "published",
    },
    {
        id: "e7", title: "Generative Art: Code as Medium", organizerId: "artist4", organizerName: "Amara Diallo",
        imageUrl: EVENT_IMAGE_MAP.e7, type: "Workshop",
        description: "An online workshop using p5.js to create generative artworks. No prior coding experience needed — we begin from first principles and end with a unique, exportable artwork.",
        startTime: "2026-05-10T15:00:00.000Z", endTime: "2026-05-10T18:00:00.000Z", timezone: "Africa/Lagos",
        locationType: "online", location: "https://meet.artisan.io/generative",
        capacity: 30, currentAttendees: 18, price: 60, currency: "EUR", status: "published",
    },
    {
        id: "e8", title: "Relief Printmaking Intensive", organizerId: "artist3", organizerName: "Sarah Miller",
        imageUrl: EVENT_IMAGE_MAP.e8, type: "Workshop",
        description: "A full-day introduction to linocut and woodblock printing. Design, carve, and print your own limited-edition artwork. All tools and materials included in the fee.",
        startTime: "2026-05-17T09:30:00.000Z", endTime: "2026-05-17T16:30:00.000Z", timezone: "Europe/London",
        locationType: "inPerson", location: "East London Print Studio",
        capacity: 8, currentAttendees: 3, price: 145, currency: "EUR", status: "published",
    },
];

const SEED_USERS = [
    {
        uid: "artist1", displayName: "Elena Vance", email: "elena@artisan.io",
        photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=Elena+Vance&backgroundColor=b6e3f4",
        role: "artist", location: "Berlin, Germany",
        bio: "Watercolourist and botanical illustrator. I paint slowly, deliberately, and always outside when the weather permits. My work lives between science and reverence for the natural world.",
        createdAt: "2026-01-10T00:00:00.000Z",
    },
    {
        uid: "artist2", displayName: "Marco Ferri", email: "marco@artisan.io",
        photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=Marco+Ferri&backgroundColor=ffd5dc",
        role: "artist", location: "Florence, Italy",
        bio: "Ceramicist and sculptor. I work in the classical Tuscan tradition, casting bronze and throwing terracotta in a studio overlooking the Arno. Form and material are inseparable.",
        createdAt: "2026-01-12T00:00:00.000Z",
    },
    {
        uid: "artist3", displayName: "Sarah Miller", email: "sarah@artisan.io",
        photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=Sarah+Miller&backgroundColor=c0aede",
        role: "artist", location: "East London, UK",
        bio: "Textile artist and natural dyer. My practice is rooted in slowness — in winding yarn, building warp, and letting a piece take the time it needs. I teach dyeing workshops monthly.",
        createdAt: "2026-01-14T00:00:00.000Z",
    },
    {
        uid: "artist4", displayName: "Amara Diallo", email: "amara@artisan.io",
        photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=Amara+Diallo&backgroundColor=d1d4f9",
        role: "artist", location: "Lagos, Nigeria",
        bio: "Digital artist and creative coder. I work at the intersection of traditional craft aesthetics and generative systems. Every piece is a collaboration between intention and algorithm.",
        createdAt: "2026-01-16T00:00:00.000Z",
    },
    {
        uid: "artist5", displayName: "Lena Park", email: "lena@artisan.io",
        photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=Lena+Park&backgroundColor=ffdfbf",
        role: "artist", location: "Seoul, South Korea",
        bio: "Documentary photographer and draughtsperson. I shoot on medium format film and work in charcoal from life. I run a monthly open drawing session in Mapo-gu.",
        createdAt: "2026-01-18T00:00:00.000Z",
    },
];

const SEED_COLLABORATIONS = [
    {
        id: "collab1",
        title: "Seeking Textile Artist for Sustainable Fashion Collection",
        description: "We are a small sustainable fashion brand looking to collaborate with an experienced textile or dyeing artist to co-design a limited capsule collection using natural dyes. Revenue share model with full creative credit.",
        type: "Project", authorId: "artist4", authorName: "Amara Diallo",
        location: "Remote / London", locationType: "Hybrid",
        compensation: { type: "Money", amount: 2500, currency: "EUR", details: "Plus 15% royalty on collection sales" },
        status: "Open", skills: ["Natural Dyeing", "Textile Design", "Pattern Making"],
        createdAt: "2026-03-01T10:00:00.000Z", updatedAt: "2026-03-01T10:00:00.000Z",
    },
    {
        id: "collab2",
        title: "Ceramicist Looking for Glassblower — Joint Exhibition",
        description: "I am planning a solo exhibition exploring the relationship between earth and fire and would love to include a glassblowing collaborator whose work can dialogue with my ceramic pieces. The gallery space in Florence is already confirmed.",
        type: "Event", authorId: "artist2", authorName: "Marco Ferri",
        location: "Florence, Italy", locationType: "On-site",
        compensation: { type: "Exchange", details: "Shared exhibition costs + 50/50 sales revenue" },
        status: "Open", skills: ["Glassblowing", "Sculpture", "Exhibition Design"],
        createdAt: "2026-03-05T14:00:00.000Z", updatedAt: "2026-03-05T14:00:00.000Z",
    },
    {
        id: "collab3",
        title: "Photography Mentorship — Emerging Artist (6 months)",
        description: "Offering a 6-month mentorship to one emerging documentary photographer based in Asia. Monthly critique sessions over video call, portfolio review, and introduction to editorial contacts. I work in medium format film and street documentary.",
        type: "Mentorship", authorId: "artist5", authorName: "Lena Park",
        location: "Remote", locationType: "Remote",
        compensation: { type: "Unpaid", details: "Portfolio and professional development only" },
        status: "Open", skills: ["Film Photography", "Documentary", "Portfolio Development"],
        createdAt: "2026-03-08T09:00:00.000Z", updatedAt: "2026-03-08T09:00:00.000Z",
    },
    {
        id: "collab4",
        title: "Illustrator Wanted — Children's Book Project",
        description: "I am a writer with a completed manuscript for a children's picture book about a child who finds art-making in the natural world. Seeking an illustrator whose style is warm, detailed, and rooted in observation — botanical or naturalistic illustration styles preferred.",
        type: "Project", authorId: "artist1", authorName: "Elena Vance",
        location: "Remote", locationType: "Remote",
        compensation: { type: "Money", amount: 3000, currency: "EUR", details: "Advance + royalty share with major publisher interest" },
        status: "Open", skills: ["Illustration", "Children's Book", "Botanical Art"],
        createdAt: "2026-03-12T11:00:00.000Z", updatedAt: "2026-03-12T11:00:00.000Z",
    },
    {
        id: "collab5",
        title: "Creative Tech Residency — Berlin Studio (3 weeks)",
        description: "Offering a 3-week residency spot in my Berlin studio to a creative technologist or digital artist interested in blending code with physical media. Access to large format printer, laser cutter, and a community of artists in Prenzlauer Berg.",
        type: "Other", authorId: "artist1", authorName: "Elena Vance",
        location: "Berlin, Germany", locationType: "On-site",
        compensation: { type: "Exchange", details: "Free studio access + accommodation contribution of EUR 300" },
        status: "Open", skills: ["Creative Coding", "Digital Fabrication", "Installation Art"],
        createdAt: "2026-03-15T10:00:00.000Z", updatedAt: "2026-03-15T10:00:00.000Z",
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function isDeadUrl(url: any): boolean {
    if (!url || typeof url !== 'string') return false;
    return url.includes("images.unsplash.com") || (
        url.includes("firebasestorage.googleapis.com") && url.includes("token=")
    );
}

async function patchExistingDocImages(collectionName: string, imageMap: Record<string, any>) {
    console.log(`\n🔍 Checking "${collectionName}" for dead image URLs...`);
    const snap = await getDocs(collection(db, collectionName));
    if (snap.empty) { console.log("  ⚠️  Empty collection, skipping patch (seed will handle)."); return; }

    const batch = writeBatch(db);
    let count = 0;

    snap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const map = imageMap[docSnap.id];
        if (!map) return;

        const updates: Record<string, any> = {};
        if (isDeadUrl(data.imageUrl) && map.imageUrl) updates.imageUrl = map.imageUrl;
        if (isDeadUrl(data.imageUrl) && typeof map === "string") updates.imageUrl = map;
        if (Array.isArray(data.imageUrls) && map.imageUrls) {
            const hasDeadUrls = data.imageUrls.some((u: string) => isDeadUrl(u));
            if (hasDeadUrls) updates.imageUrls = map.imageUrls;
        }

        if (Object.keys(updates).length > 0) {
            batch.update(doc(db, collectionName, docSnap.id), updates);
            count++;
            console.log(`  ✏️  Patching: ${docSnap.id}`);
        }
    });

    if (count === 0) { console.log("  ✅ No dead URLs found."); return; }
    await batch.commit();
    console.log(`  ✅ Patched ${count} document(s).`);
}

async function seedCollection(collectionName: string, docs: any[]) {
    console.log(`\n📝 Seeding "${collectionName}" (${docs.length} documents)...`);
    const snap = await getDocs(collection(db, collectionName));
    const existingIds = new Set(snap.docs.map(d => d.id));

    const batch = writeBatch(db);
    let count = 0;

    for (const item of docs) {
        // Users collection uses 'uid', others use 'id'
        const docId = item.id || item.uid;
        if (!docId) {
            console.error("Missing docId for item:", item);
            continue;
        }
        const ref = doc(db, collectionName, docId);
        // Always overwrite to get fresh image URLs and updated content
        batch.set(ref, item);
        count++;
    }

    await batch.commit();
    console.log(`  ✅ Wrote ${count} document(s) to "${collectionName}".`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
    console.log("🔌 Connecting to Firestore (artisian-61ac9)...");
    console.log("🖼️  Phase 1: Patching existing dead image URLs in place...");

    try {
        await patchExistingDocImages("artworks", ARTWORK_IMAGE_MAP);
        await patchExistingDocImages("events", EVENT_IMAGE_MAP);

        console.log("\n🌱 Phase 2: Seeding complete data for all pages...");
        await seedCollection("artworks", SEED_ARTWORKS);
        await seedCollection("events", SEED_EVENTS);
        await seedCollection("users", SEED_USERS);
        await seedCollection("collaborations", SEED_COLLABORATIONS);

        console.log("\n🎉 Done! Summary:");
        console.log(`  • ${SEED_ARTWORKS.length} artworks — all with unique, content-matched images`);
        console.log(`  • ${SEED_EVENTS.length} events — all with unique workshop/exhibition images`);
        console.log(`  • ${SEED_USERS.length} artist profiles with bios, locations, and avatars`);
        console.log(`  • ${SEED_COLLABORATIONS.length} collaboration opportunities`);
        console.log("\n⚠️  Storage 403 fix: Deploy storage.rules to Firebase:");
        console.log("   firebase deploy --only storage");
        console.log("   (or upload rules manually via Firebase Console → Storage → Rules)");

    } catch (error: any) {
        console.error("\n❌ Error:", error.message);
        if (error.code === "permission-denied") {
            console.error("⚠️  Firestore rules are blocking access.");
            console.error("Go to Firebase Console → Firestore → Rules and temporarily set:");
            console.log('   allow read, write: if true;');
        }
    }

    process.exit(0);
}

main();
