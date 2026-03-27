import { NextResponse } from 'next/server';
import { db } from '@/backend/config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        // 1. Get Single Event
        if (id) {
            const docRef = doc(db, 'events', id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return NextResponse.json(null, { status: 404 });
            return NextResponse.json(docSnap.data());
        }

        // 2. Get All Events
        const querySnapshot = await getDocs(collection(db, 'events'));
        const events = querySnapshot.docs.map(doc => doc.data());

        // Sort by Date
        events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        return NextResponse.json(events);

    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}
