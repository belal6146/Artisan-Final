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
        <div className="container py-48 px-6 md:px-12 space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1200">
            <div className="flex flex-col md:flex-row items-baseline justify-between gap-12 border-l-2 border-primary/20 pl-16 pb-12">
                <div className="space-y-8 max-w-3xl">
                    <h1 className="font-serif text-8xl md:text-[10rem] font-medium tracking-tighter leading-none text-foreground">
                        Gatherings
                    </h1>
                    <p className="text-2xl md:text-3xl text-muted-foreground font-light italic leading-relaxed opacity-60">
                        Intimate workshops, critique sessions, and community walks. 
                        Safe spaces for the curation of craft.
                    </p>
                </div>
                <Button size="lg" className="px-16" asChild>
                    <Link href="/events/create">
                        <Plus className="mr-2 h-4 w-4" /> HOST GATHERING
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-96 bg-secondary/10 border border-border/10 animate-pulse" />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="py-64 text-center border-t border-border/10 flex flex-col items-center justify-center space-y-12">
                    <div className="w-24 h-24 bg-secondary/20 flex items-center justify-center">
                        <Plus className="h-10 w-10 text-primary/40" />
                    </div>
                    <div className="space-y-6">
                        <h3 className="font-serif text-5xl md:text-6xl tracking-tighter italic text-muted-foreground opacity-60 leading-none">The gatherings are a clean slate.</h3>
                        <p className="text-xl text-muted-foreground max-w-xl mx-auto italic font-light opacity-40">
                            “Be the first to host a workshop or gathering for the community. Shape the legacy of craft in your region.”
                        </p>
                    </div>
                    <Button size="lg" className="px-20" asChild>
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
