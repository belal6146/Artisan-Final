import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "@/backend/config/firebase";
import { Artwork } from "@/types/schema";
import { logger } from "@/backend/lib/logger";

export async function getArtworks(): Promise<Artwork[]> {
    try {
        const querySnapshot = await getDocs(collection(db, "artworks"));
        const allArtworks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artwork));

        // Filter and sort for consistency
        const publishedArtworks = allArtworks
            .filter(artwork => artwork.status === 'available')
            .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

        logger.info("Fetched published artworks", { count: publishedArtworks.length });
        return publishedArtworks;
    } catch (error: any) {
        logger.error("Error fetching artworks", { error: error.message, stack: error.stack });
        return [];
    }
}

export async function getArtworkById(id: string): Promise<Artwork | undefined> {
    try {
        const docRef = doc(db, "artworks", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Artwork;
        }
        return undefined;
    } catch (error: any) {
        logger.error("Error fetching artwork by ID", { error: error.message, artworkId: id });
        return undefined;
    }
}
export async function getArtworksByArtist(artistId: string): Promise<Artwork[]> {
    try {
        const q = query(collection(db, "artworks"), where("artistId", "==", artistId));
        const querySnapshot = await getDocs(q);
        logger.info("Fetched artworks for artist", { artistId, count: querySnapshot.size });
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artwork));
    } catch (error: any) {
        logger.error("Error fetching user artworks", { error: error.message, artistId });
        return [];
    }
}
