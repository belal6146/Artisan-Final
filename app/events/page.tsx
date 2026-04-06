import { getEvents } from "@/backend/actions/event";
import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function EventsPage() {
    // 1. Fetch data on the server
    const eventsRaw = await getEvents();
    const toPlain = (obj: any) => JSON.parse(JSON.stringify(obj));
    const events = toPlain(eventsRaw);

    return (
        <div className="container py-12 md:py-24 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 border-l-2 border-primary/20 pl-12 pb-4">
                <div className="space-y-6">
                    <h1 className="font-serif text-6xl md:text-[8rem] font-medium tracking-tighter leading-[0.8]">Gatherings</h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-light italic leading-relaxed opacity-60">Curated workshops, exhibitions, and rituals.</p>
                </div>
                <Button asChild className="h-16 px-10 tracking-[0.3em] text-[10px] font-bold uppercase overflow-hidden group relative">
                    <Link href="/events/create">
                        <Plus className="h-3 w-3 mr-3 transition-transform group-hover:rotate-90 duration-500" />
                        BROADCAST GATHERING
                    </Link>
                </Button>
            </div>

            {events.length === 0 ? (
                <div className="py-40 text-center border-t border-border/10 flex flex-col items-center justify-center space-y-12">
                    <p className="font-serif text-3xl md:text-4xl tracking-tight text-muted-foreground/30 font-light italic">The calendar is silent.</p>
                    <Link href="/events/create" className="text-[10px] font-bold tracking-[0.5em] uppercase text-muted-foreground hover:text-foreground transition-all border-b border-border/20 pb-1">
                        INITIALISE FIRST CALL
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-20">
                    {events.map((event: any) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}
