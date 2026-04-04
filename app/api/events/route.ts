import { NextResponse } from 'next/server';
import { db } from '@/backend/config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { logger } from '@/backend/lib/logger';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        // 1. Get Single Event
        if (id) {
            const docRef = doc(db, 'events', id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return NextResponse.json(null, { status: 404 });
            return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
        }

        // 2. Get All Events
        const querySnapshot = await getDocs(collection(db, 'events'));
        const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by Date
        events.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        logger.info('EVENT_FETCH_SUCCESS', { count: events.length, source: 'backend' });
        return NextResponse.json(events);

    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { error, action: 'GET_EVENTS_API', source: 'backend' });
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}
