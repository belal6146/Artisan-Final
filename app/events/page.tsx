"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents } from "@/backend/actions/event";
import { Event as EventSchema } from "@/types/schema";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EventsPage() {
    const [events, setEvents] = useState<EventSchema[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getEvents();
            setEvents(data);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="uppercase tracking-[0.4em] text-[10px] font-bold opacity-30 animate-pulse">
                Sychronizing Gatherings...
            </div>
        </div>
    );

    return (
        <div className="container py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-l-2 border-primary/20 pl-8">
                <div className="space-y-4">
                    <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter leading-none">Gatherings</h1>
                    <p className="text-xl text-muted-foreground font-light italic leading-relaxed">Artisan curated events, workshops, and exhibitions.</p>
                </div>
                <Button asChild className="shadow-2xl h-14 px-8 tracking-widest text-[10px] uppercase font-bold">
                    <Link href="/events/create">
                        <Plus className="h-4 w-4 mr-2" />
                        BROADCAST GATHERING
                    </Link>
                </Button>
            </div>

            {events.length === 0 ? (
                <div className="py-32 text-center border border-dashed border-border/10 flex flex-col items-center justify-center space-y-8">
                    <p className="font-serif text-3xl md:text-4xl tracking-tighter italic text-muted-foreground opacity-60">The gathering hall is currently quiet.</p>
                    <Link href="/events/create" className="text-primary underline tracking-widest uppercase text-[10px] font-bold hover:opacity-70 transition-opacity">
                        Initiate first broadcast
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}
