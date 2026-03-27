"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Loader2, Check, Edit2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getEventById } from "@/backend/db/events";
import { createRSVP } from "@/backend/actions/rsvp";
import { PriceBreakdown } from "@/components/ui/price-breakdown";
import { EcoTag } from "@/components/ui/eco-tag";
import { checkUserRSVP } from "@/backend/db/rsvps";
import { Event } from "@/types/schema";

export default function EventDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

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
            } catch (e) {
                console.error(e);
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
            const result = await createRSVP({
                eventId: event.id,
                userId: user.uid,
                userName: user.displayName || "Anonymous"
            });

            if (result.success) {
                setHasRSVP(true);
                setSuccess(true);
                // Update local event state
                setEvent({
                    ...event,
                    currentAttendees: event.currentAttendees + 1
                });
            } else {
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
        <div className="container py-8 lg:py-12 max-w-5xl">
            <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">
                ← Back to Events
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative aspect-video w-full rounded-sm overflow-hidden bg-secondary/20">
                        {event.imageUrl && (
                            <Image src={event.imageUrl} alt={event.title} fill className="object-cover" priority />
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
                                    {event.type}
                                </span>
                            </div>
                            {user && user.uid === event.organizerId && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/events/${id}/edit`}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit Event
                                    </Link>
                                </Button>
                            )}
                        </div>
                        <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-4">
                            {event.title}
                        </h1>
                        <p className="text-sm text-muted-foreground mb-4">
                            Hosted by {event.organizerName}
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        </p>

                        {/* Ethical Commerce Section */}
                        {(event.priceBreakdown || (event.ecoTags && event.ecoTags.length > 0)) && (
                            <div className="pt-8 border-t border-border/40 space-y-8">
                                {event.ecoTags && event.ecoTags.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-serif text-lg font-medium flex items-center gap-2">
                                            <span className="w-1 h-4 bg-green-500 rounded-full inline-block" />
                                            Sustainability Impact
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {event.ecoTags.map((tag) => (
                                                <EcoTag key={tag} tag={tag} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {event.priceBreakdown && (
                                    <div className="space-y-3">
                                        <PriceBreakdown breakdown={event.priceBreakdown} currency={event.currency} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / RSVP Card */}
                <div className="space-y-6">
                    <div className="sticky top-24 border-none bg-secondary/10 rounded-lg p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="font-medium">
                                        {startDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({event.timezone})
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="font-medium">{event.locationType === 'online' ? 'Online Event' : 'In Person'}</div>
                                    <div className="text-sm text-muted-foreground">{event.location}</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="font-medium">
                                        {event.currentAttendees} / {event.capacity} attending
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {isSoldOut ? 'Event is full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-medium">Price</span>
                                <span className="text-xl font-serif">
                                    {event.price === 0 ? 'Free' : `${event.currency} ${event.price}`}
                                </span>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    Successfully registered!
                                </div>
                            )}

                            {hasRSVP ? (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    disabled
                                    variant="outline"
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    You're Registered
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    disabled={isSoldOut || reserving}
                                    onClick={handleRSVP}
                                >
                                    {isSoldOut ? 'Event Full' : (reserving ? 'Registering...' : 'Register for Event')}
                                </Button>
                            )}

                            <p className="text-xs text-center text-muted-foreground mt-3">
                                {hasRSVP ? 'Check your email for event details' : 'Free registration via Artisan'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
