import { getEventById } from "@/backend/actions/event";
import { EventDetailClient } from "@/frontend/components/events/EventDetailClient";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: PageProps) {
    const { id } = await params;

    const event = await getEventById(id);
    if (!event) notFound();

    return (
        <EventDetailClient 
            event={JSON.parse(JSON.stringify(event))} 
            hasRSVPInitial={false} 
        />
    );
}
