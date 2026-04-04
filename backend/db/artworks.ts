import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/backend/config/firebase";
import { Artwork } from "@/types/schema";
import { logger } from "@/backend/lib/logger";

export async function getArtworks(maxResults: number = 20): Promise<Artwork[]> {
    try {
        // Optimized: Filter and sort at the database level
        const q = query(
            collection(db, "artworks"),
            where("status", "==", "available"),
            orderBy("createdAt", "desc"),
            limit(maxResults)
        );
        
        const querySnapshot = await getDocs(q);
        const artworks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artwork));

        logger.info("Fetched published artworks", { count: artworks.length });
        return artworks;
    } catch (error: any) {
        logger.error(`Error fetching artworks: ${error.message || error}`, { stack: error.stack });
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
        logger.error(`Error fetching artwork by ID (${id}): ${error.message || error}`);
        return undefined;
    }
}
export async function getArtworksByArtist(artistId: string): Promise<Artwork[]> {
    try {
        const q = query(collection(db, "artworks"), where("artistId", "==", artistId));
        const querySnapshot = await getDocs(q);
        const artworks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artwork));
        console.log("🔍 [DB] Fetched URLs:", artworks.map(a => `${a.title}: ${a.imageUrl?.substring(0, 50)}...`));
        return artworks;
    } catch (error: any) {
        logger.error("Error fetching user artworks", { error: error.message, artistId });
        return [];
    }
}
