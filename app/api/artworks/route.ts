import { NextResponse } from 'next/server';
import { adminDb } from '@/backend/lib/firebase-admin';
import { logger } from '@/backend/lib/logger';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        // 1. Get Single Artwork
        if (id) {
            const docSnap = await adminDb.collection('artworks').doc(id).get();
            if (!docSnap.exists) return NextResponse.json(null, { status: 404 });
            return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
        }

        // 2. Get All Artworks
        const snap = await adminDb.collection('artworks').orderBy('createdAt', 'desc').limit(20).get();
        const artworks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        logger.info('ARTWORK_FETCH_SUCCESS', { count: artworks.length, source: 'backend' });
        return NextResponse.json(artworks);

    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { error: error.message, action: 'GET_ARTWORKS_API', source: 'backend' });
        return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 });
    }
}
