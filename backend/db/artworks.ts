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

        logger.info('ARTWORK_FETCH_SUCCESS', { count: artworks.length, source: 'backend' });
        return artworks;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { 
            message: "Failed fetching published artworks", 
            error, 
            source: 'backend' 
        });
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
        logger.error('SYSTEM_ERROR', { 
            message: `Failed to fetch individual artwork ${id}`, 
            error, 
            source: 'backend' 
        });
        return undefined;
    }
}
export async function getArtworksByArtist(artistId: string): Promise<Artwork[]> {
    try {
        const q = query(collection(db, "artworks"), where("artistId", "==", artistId));
        const querySnapshot = await getDocs(q);
        const artworks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artwork));
        return artworks;
    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { 
            message: "Failed fetching artist artworks", 
            artistId,
            error, 
            source: 'backend' 
        });
        return [];
    }
}
