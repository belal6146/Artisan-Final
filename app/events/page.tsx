"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents } from "@/backend/db/events";
import { Event } from "@/types/schema";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getEvents();
                setEvents(data);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="container py-24 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 border-l-2 border-primary/10 pl-8 pb-4">
                <div className="space-y-6 max-w-2xl">
                    <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter">
                        Gatherings
                    </h1>
                    <p className="text-xl text-muted-foreground font-light italic leading-relaxed">
                        Intimate workshops, critique sessions, and community walks. 
                        Safe spaces for the curation of craft.
                    </p>
                </div>
                <Button size="lg" className="h-16 px-12 rounded-none bg-primary text-[11px] font-bold tracking-[0.2em] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all" asChild>
                    <Link href="/events/create">
                        <Plus className="mr-2 h-4 w-4" /> HOST GATHERING
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-96 bg-secondary/20 rounded-xl animate-pulse border border-border/50" />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="py-24 text-center bg-secondary/10 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No events scheduled</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Be the first to host a workshop or gathering for the community.
                    </p>
                    <Button size="lg" className="rounded-full" asChild>
                        <Link href="/events/create">
                            Host the First Event
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}
