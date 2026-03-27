import { NextResponse } from 'next/server';
import { db } from '@/backend/config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        // 1. Get Single Artwork
        if (id) {
            const docRef = doc(db, 'artworks', id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return NextResponse.json(null, { status: 404 });
            return NextResponse.json(docSnap.data());
        }

        // 2. Get All Artworks
        const querySnapshot = await getDocs(collection(db, 'artworks'));
        const artworks = querySnapshot.docs.map(doc => doc.data());
        return NextResponse.json(artworks);

    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 });
    }
}
