import { NextResponse } from 'next/server';
import { adminDb } from '@/backend/lib/firebase-admin';
import { logger } from '@/backend/lib/logger';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        // 1. Get Single Event
        if (id) {
            const docSnap = await adminDb.collection('events').doc(id).get();
            if (!docSnap.exists) return NextResponse.json(null, { status: 404 });
            return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
        }

        // 2. Get All Events
        const snapshot = await adminDb.collection('events').get();
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by Date
        events.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        logger.info('EVENT_FETCH_SUCCESS', { count: events.length, source: 'backend' });
        return NextResponse.json(events);

    } catch (error: any) {
        logger.error('SYSTEM_ERROR', { error: error.message, action: 'GET_EVENTS_API', source: 'backend' });
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}
