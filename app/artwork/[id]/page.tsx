"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { logger } from "@/backend/lib/logger";
import { Artwork } from "@/types/schema";

export default function ArtworkDetailPage() {
    const { convertPrice, t } = useLocale();
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/artworks?id=${id}`);
                if (!res.ok) throw new Error("Artwork not found");
                setArtwork(await res.json());
            } catch (e: any) {
                logger.error('ARTWORK_FETCH_FAILED', { id, error: e.message, source: 'frontend' });
            } finally {
                setLoading(false);
            }
        }
        if (id) load();
    }, [id]);

    const handlePurchase = async () => {
        if (!user) { router.push(`/auth?redirect=/artwork/${id}`); return; }
        setPurchasing(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                body: JSON.stringify({ itemId: id, type: 'artwork' }),
            });
            const { checkoutUrl } = await res.json();
            if (checkoutUrl) {
                logger.info('COMMERCE_CHECKOUT_START', { itemId: id, userId: user?.uid, source: 'frontend' });
                router.push(checkoutUrl);
            }
        } catch (e: any) {
            logger.error('COMMERCE_CHECKOUT_FAILURE', { itemId: id, userId: user?.uid, error: e.message, source: 'frontend' });
            setPurchasing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin opacity-20" />
        </div>
    );

    if (!artwork) return (
        <div className="container py-40 text-center space-y-6">
            <p className="font-serif text-3xl italic text-muted-foreground">This work is no longer available.</p>
            <Link href="/explore" className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/50 hover:text-primary transition-colors">
                Return to the gallery
            </Link>
        </div>
    );

    const breakdown = artwork.priceBreakdown ?? { artisan: 60, platform: 5, materials: 25 };
    const community = 100 - breakdown.artisan - breakdown.materials - breakdown.platform;
    const np = <span className="text-muted-foreground/25 italic">Not provided</span>;

    // Only render provenance section if at least one field has data
    const hasProvenance = artwork.origin || artwork.process || artwork.materials?.length || artwork.timeSpent;

    return (
        <div className="animate-in fade-in duration-700">

            <div className="container pt-12 pb-4">
                <Link href="/explore" className="text-[10px] font-bold tracking-[0.4em] uppercase text-muted-foreground/30 hover:text-muted-foreground transition-colors">
                    ← Gallery
                </Link>
            </div>

            {/* Full-width image */}
            <div className="w-full bg-secondary/5 border-y border-border/5 my-8">
                <div className="relative w-full max-h-[85vh]" style={{ aspectRatio: '16/9' }}>
                    <Image
                        src={artwork.imageUrl || artwork.imageUrls?.[0] || ''}
                        alt={artwork.title}
                        fill
                        className="object-contain"
                        priority
                        sizes="100vw"
                    />
                </div>
            </div>

            <div className="container max-w-3xl py-16 space-y-16">

                {/* Title */}
                <section>
                    <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter leading-[0.9] mb-6">
                        {artwork.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground/40">
                        <span>by <Link href={`/profile/${artwork.artistId}`} className="text-muted-foreground/70 hover:text-primary transition-colors">{artwork.artistName}</Link></span>
                        <span className="w-px h-3 bg-border/30" />
                        <span>{artwork.medium}</span>
                        {artwork.location && <><span className="w-px h-3 bg-border/30" /><span>{artwork.location}</span></>}
                        <span className="w-px h-3 bg-border/30" />
                        <span className={artwork.status === 'available' ? "text-primary" : "text-muted-foreground/30"}>
                            {artwork.status === 'available' ? "Available" : "In a private collection"}
                        </span>
                    </div>
                </section>

                {/* Description */}
                {artwork.description && (
                    <p className="text-lg text-muted-foreground font-light leading-relaxed">
                        {artwork.description}
                    </p>
                )}

                {/* Provenance — only shown when at least one field is filled */}
                {hasProvenance && (
                    <section>
                        <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40 mb-6">Making this work</h2>
                        <div className="divide-y divide-border/10">
                            {[
                                { label: "Origin",     value: artwork.origin },
                                { label: "Process",    value: artwork.process },
                                { label: "Materials",  value: artwork.materials?.join(", ") },
                                { label: "Time taken", value: artwork.timeSpent },
                            ].filter(r => r.value).map(({ label, value }) => (
                                <div key={label} className="py-4 grid grid-cols-[140px_1fr] gap-6">
                                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground/40 pt-0.5">{label}</span>
                                    <span className="text-sm font-light text-foreground/80 leading-relaxed">{value}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* From the maker */}
                {artwork.artisanStory && (
                    <section>
                        <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40 mb-6">From the maker</h2>
                        <blockquote className="border-l-2 border-primary/20 pl-8 text-muted-foreground font-light italic leading-relaxed">
                            {artwork.artisanStory}
                        </blockquote>
                    </section>
                )}

                {/* Impact */}
                <section>
                    <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40 mb-4">Who this supports</h2>
                    <p className="text-sm font-light leading-relaxed text-muted-foreground/80">
                        {artwork.impactMetrics || np}
                    </p>
                </section>

                {/* Aspirations */}
                <section>
                    <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40 mb-4">What this artist is working toward</h2>
                    <p className="text-sm font-light leading-relaxed text-muted-foreground/80">
                        {artwork.aspirations || np}
                    </p>
                </section>

                {/* Price breakdown */}
                {artwork.status === 'available' && artwork.price && (
                    <section className="bg-secondary/5 border border-border/10 p-8 space-y-6">
                        <div className="flex justify-between items-baseline">
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground/40">{t('price_architecture')}</span>
                            <span className="font-serif text-3xl tracking-tighter">{convertPrice(artwork.price, artwork.currency).formatted}</span>
                        </div>
                        <div className="h-px w-full bg-muted/20 flex overflow-hidden" style={{ height: 4 }}>
                            <div className="h-full bg-primary/50" style={{ width: `${breakdown.artisan}%` }} />
                            <div className="h-full bg-primary/25" style={{ width: `${breakdown.materials}%` }} />
                            <div className="h-full bg-primary/10" style={{ width: `${community}%` }} />
                            <div className="h-full bg-primary/5"  style={{ width: `${breakdown.platform}%` }} />
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/40">
                            <span>{breakdown.artisan}% {t('artist_direct')}</span>
                            <span>{breakdown.materials}% {t('material_sourcing')}</span>
                            <span>{community}% {t('community_fund')}</span>
                            <span>{breakdown.platform}% {t('platform_ops')}</span>
                        </div>
                    </section>
                )}

                {/* Actions */}
                <section className="border-t border-border/10 pt-10 flex flex-col sm:flex-row gap-4">
                    {artwork.status === 'available' ? (
                        <>
                            <Button
                                size="lg"
                                className="h-14 px-12 rounded-none text-[11px] font-bold tracking-[0.2em] uppercase"
                                onClick={handlePurchase}
                                disabled={purchasing}
                            >
                                {purchasing ? "Processing..." : `Acquire — ${convertPrice(artwork.price ?? 0, artwork.currency).formatted}`}
                            </Button>
                            <Button variant="outline" size="lg" className="h-14 px-12 rounded-none text-[11px] font-bold tracking-[0.2em] uppercase border-border/20">
                                Contact the artist
                            </Button>
                        </>
                    ) : (
                        <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-muted-foreground/30">
                            This work is held in a private collection.
                        </p>
                    )}
                </section>

                {/* Artist */}
                <Link href={`/profile/${artwork.artistId}`} className="group border-t border-border/10 pt-10 flex items-center justify-between hover:text-primary transition-colors block">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-muted-foreground/30 mb-1">Artist</p>
                        <p className="font-serif text-2xl tracking-tight">{artwork.artistName}</p>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground/30 group-hover:text-primary transition-colors">
                        View practice →
                    </span>
                </Link>

            </div>
        </div>
    );
}
