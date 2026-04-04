import Link from "next/link";
import Image from "next/image";
import { Event } from "@/types/schema";
import { cn } from "@/frontend/lib/utils";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { Calendar, MapPin, Users } from "lucide-react";

interface EventCardProps {
    event: Event;
    className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
    const { convertPrice } = useLocale();
    const startDate = new Date(event.startTime);
    const isSoldOut = event.currentAttendees >= event.capacity;

    const month = startDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = startDate.getDate();

    return (
        <Link
            href={`/events/${event.id}`}
            className={cn("group block bg-transparent overflow-hidden", className)}
        >
            <div className="relative h-64 w-full bg-secondary/20 rounded-sm">
                {event.imageUrl ? (
                    <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover grayscale group-hover:scale-105 transition-all duration-1000 ease-out"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-secondary/30">
                        <Calendar className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                )}

                {/* Date Sheet Overlay - Minimalist */}
                <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-md rounded-sm shadow-none p-3 text-center min-w-[3.5rem]">
                    <div className="text-[0.65rem] font-bold text-muted-foreground tracking-widest uppercase">{month}</div>
                    <div className="text-xl font-serif font-medium leading-none mt-1">{day}</div>
                </div>

                {isSoldOut && (
                    <div className="absolute top-4 right-4 bg-destructive/90 backdrop-blur-sm text-destructive-foreground text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        Sold Out
                    </div>
                )}
            </div>

            <div className="pt-5 space-y-3">
                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{event.type}</p>
                    <h3 className="font-serif text-xl font-medium leading-tight group-hover:underline underline-offset-4 decoration-1 transition-all">
                        {event.title}
                    </h3>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground/80 font-light">
                    <div className="flex items-center gap-2">
                        <span className="truncate">{event.locationType === 'online' ? 'Online Event' : event.location}</span>
                    </div>
                    <div>
                        {/* Minimal Capacity Indicator */}
                        {isSoldOut ? 'Capacity reached' : `${event.capacity - event.currentAttendees} spots left`}
                    </div>
                </div>

                <div className="pt-2 flex items-center justify-between mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-muted-foreground">Hosted by <span className="text-foreground font-medium">{event.organizerName}</span></span>
                    <span className="font-medium text-sm">
                        {event.price === 0 ? 'Free' : convertPrice(event.price, event.currency).formatted}
                    </span>
                </div>
            </div>
        </Link>
    );
}
