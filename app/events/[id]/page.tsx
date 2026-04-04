"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Loader2, Check, Edit2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getEventById } from "@/backend/db/events";
import { createRSVP } from "@/backend/actions/rsvp";
import { logger } from "@/backend/lib/logger";
import { PriceBreakdown } from "@/components/ui/price-breakdown";
import { EcoTag } from "@/components/ui/eco-tag";
import { checkUserRSVP } from "@/backend/db/rsvps";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { Event } from "@/types/schema";

export default function EventDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { convertPrice } = useLocale();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [reserving, setReserving] = useState(false);
    const [hasRSVP, setHasRSVP] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const eventData = await getEventById(id as string);
                setEvent(eventData || null);

                // Check if user already registered
                if (user && eventData) {
                    const rsvp = await checkUserRSVP(eventData.id, user.uid);
                    setHasRSVP(rsvp?.status === 'going');
                }
            } catch (e: any) {
                logger.error('SYSTEM_ERROR', { eventId: id, message: "Load event failed", error: e.message, source: 'frontend' });
                setEvent(null);
            } finally {
                setLoading(false);
            }
        }
        if (id) load();
    }, [id, user]);

    const handleRSVP = async () => {
        if (!user) {
            router.push(`/auth?redirect=/events/${id}`);
            return;
        }

        if (!event) return;

        setReserving(true);
        setError(null);

        try {
            // New Paid Checkout Flow
            if (event.price > 0) {
                const res = await fetch('/api/checkout', {
                    method: 'POST',
                    body: JSON.stringify({ itemId: event.id, type: 'event' }),
                });
                const { checkoutUrl } = await res.json();
                if (checkoutUrl) {
                    router.push(checkoutUrl);
                    return;
                }
                throw new Error("Failed to initialize checkout");
            }

            // Free Event Flow
            logger.info('RSVP_CREATE_START', { eventId: event.id, userId: user.uid, source: 'frontend' });
            const result = await createRSVP({
                eventId: event.id,
                userId: user.uid,
                userName: user.displayName || "Anonymous"
            });

            if (result.success) {
                logger.info('RSVP_CREATE_SUCCESS', { eventId: event.id, userId: user.uid, source: 'frontend' });
                setHasRSVP(true);
                setSuccess(true);
                // Update local event state
                setEvent({
                    ...event,
                    currentAttendees: event.currentAttendees + 1
                });
            } else {
                logger.error('RSVP_CREATE_FAILURE', { eventId: event.id, userId: user.uid, error: result.error, source: 'frontend' });
                setError(result.error || "Failed to register for event");
            }
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred");
        } finally {
            setReserving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (!event) return (
        <div className="container py-20 text-center space-y-4">
            <h1 className="text-xl">Event not found.</h1>
            <p className="text-muted-foreground">It may have been removed or the database hasn't been seeded.</p>
            <Link href="/events" className="text-primary underline">Back to Events</Link>
        </div>
    );

    const startDate = new Date(event.startTime);
    const isSoldOut = event.currentAttendees >= event.capacity;
    const spotsLeft = event.capacity - event.currentAttendees;

    return (
        <div className="container py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="mb-12 border-l-2 border-primary/20 pl-8 space-y-6">
                <Button variant="ghost" className="h-10 px-0 hover:bg-transparent hover:text-primary text-[10px] font-bold tracking-widest uppercase transition-all group" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Gatherings
                </Button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-primary/5 text-primary/60 px-3 py-1">
                                {event.type}
                            </span>
                        </div>
                        <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter leading-none">
                            {event.title}
                        </h1>
                        <p className="text-xl text-muted-foreground font-light italic leading-relaxed">
                            A curated gathering by {event.organizerName}
                        </p>
                    </div>
                    {user && user.uid === event.organizerId && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/events/${id}/edit`}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                EDIT EVENT
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-16">
                    <div className="relative aspect-[21/9] w-full rounded-none overflow-hidden bg-secondary/10 border border-border/5">
                        {event.imageUrl && (
                            <Image 
                                src={event.imageUrl} 
                                alt={event.title} 
                                fill 
                                sizes="(max-width: 768px) 100vw, 800px"
                                className="object-cover" 
                                priority 
                            />
                        )}
                    </div>

                    <div className="space-y-12">
                        <div className="prose prose-slate max-w-none">
                            <p className="text-xl text-muted-foreground/80 font-light leading-relaxed whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </div>

                        {/* Ethical Commerce Section */}
                        {(event.priceBreakdown || (event.ecoTags && event.ecoTags.length > 0)) && (
                            <div className="pt-16 border-t border-border/10 space-y-12">
                                {event.ecoTags && event.ecoTags.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
                                            <span className="w-8 h-px bg-primary/20" />
                                            Ethical Credentials
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {event.ecoTags.map((tag) => (
                                                <EcoTag key={tag} tag={tag} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {event.priceBreakdown && (
                                    <div className="space-y-6 pt-8 border-t border-border/5">
                                         <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
                                            <span className="w-8 h-px bg-primary/20" />
                                            Value Distribution
                                        </div>
                                        <PriceBreakdown breakdown={event.priceBreakdown} currency={event.currency} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / RSVP Card */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-24 bg-secondary/5 border border-border/10 p-10 space-y-10 group/sidebar">
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary/5 flex items-center justify-center rounded-none group-hover/sidebar:bg-primary/10 transition-colors">
                                    <Calendar className="h-4 w-4 text-primary/60" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold tracking-widest uppercase opacity-40">Chronological context</div>
                                    <div className="font-serif text-lg">
                                        {startDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="text-sm text-muted-foreground italic font-light">
                                        {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({event.timezone})
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary/5 flex items-center justify-center rounded-none group-hover/sidebar:bg-primary/10 transition-colors">
                                    <MapPin className="h-4 w-4 text-primary/60" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold tracking-widest uppercase opacity-40">Physical Coordinates</div>
                                    <div className="font-serif text-lg">{event.locationType === 'online' ? 'Global Projection' : 'Intimate Studio'}</div>
                                    <div className="text-sm text-muted-foreground italic font-light">{event.location}</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary/5 flex items-center justify-center rounded-none group-hover/sidebar:bg-primary/10 transition-colors">
                                    <Users className="h-4 w-4 text-primary/60" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold tracking-widest uppercase opacity-40">Collective Density</div>
                                    <div className="font-serif text-lg">
                                        {event.currentAttendees} / {event.capacity} artisans
                                    </div>
                                    <div className="text-sm text-muted-foreground italic font-light">
                                        {isSoldOut ? 'Capacity reached' : `${spotsLeft} allocation${spotsLeft !== 1 ? 's' : ''} available`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-border/10 space-y-8">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold tracking-widest uppercase opacity-40">Access Contribution</div>
                                    <div className="font-serif text-3xl">
                                        {event.price === 0 ? 'Pro-Bono' : convertPrice(event.price, event.currency).formatted}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/5 border border-red-500/10 text-red-600 text-xs font-bold tracking-widest uppercase">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 bg-green-500/5 border border-green-500/10 text-green-600 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    RELAY SUCCESSFUL
                                </div>
                            )}

                            {hasRSVP ? (
                                <Button
                                    className="w-full h-16 pointer-events-none"
                                    variant="outline"
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    ACCESS GRANTED
                                </Button>
                            ) : (
                                <Button
                                    className="w-full shadow-2xl"
                                    size="lg"
                                    disabled={isSoldOut || reserving}
                                    onClick={handleRSVP}
                                >
                                    {isSoldOut ? 'CAPACITY REACHED' : (reserving ? 'RESERVING...' : 'REGISTER FOR GATHERING')}
                                </Button>
                            )}

                            <p className="text-[9px] font-bold tracking-widest text-center text-muted-foreground/40 uppercase">
                                {hasRSVP ? 'Check your chronicle for event details' : 'Secure direct registration via Artisan'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
