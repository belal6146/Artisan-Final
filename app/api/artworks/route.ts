import { NextResponse } from 'next/server';
import { db } from '@/backend/config/firebase';
import { collection, getDocs, doc, getDoc, query, orderBy, limit } from 'firebase/firestore';
import { logger } from '@/backend/lib/logger';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        // 1. Get Single Artwork
        if (id) {
            const docRef = doc(db, 'artworks', id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return NextResponse.json(null, { status: 404 });
            return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
        }

        // 2. Get All Artworks
        const q = query(collection(db, 'artworks'), orderBy('createdAt', 'desc'), limit(20));
        const querySnapshot = await getDocs(q);
        const artworks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        logger.info('ARTWORK_FETCH_SUCCESS', { count: artworks.length, source: 'backend' });
        return NextResponse.json(artworks);

    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { error, action: 'GET_ARTWORKS_API', source: 'backend' });
        return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 });
    }
}
