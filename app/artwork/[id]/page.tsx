"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, BookOpen } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { logger } from "@/backend/lib/logger";

export default function ArtworkDetailPage() {
    const { convertPrice, t } = useLocale();
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [artwork, setArtwork] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/artworks?id=${id}`);
                if (!res.ok) throw new Error("Artwork not found");
                const data = await res.json();
                setArtwork(data);
            } catch (e: any) {
                logger.error('ARTWORK_FETCH_FAILED', { id, error: e, source: 'frontend' });
            } finally {
                setLoading(false);
            }
        }
        if (id) load();
    }, [id]);

    const handlePurchase = async () => {
        if (!user) {
            router.push(`/auth?redirect=/artwork/${id}`);
            return;
        }

        setPurchasing(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                body: JSON.stringify({ itemId: id, type: 'artwork' }),
            });

            const { checkoutUrl } = await res.json();
            if (checkoutUrl) {
                logger.info('COMMERCE_CHECKOUT_STARTED', { itemId: id, userId: user?.uid, source: 'frontend' });
                router.push(checkoutUrl);
            }
        } catch (e: any) {
            logger.error('COMMERCE_PAYMENT_FAILED', { itemId: id, userId: user?.uid, error: e.message, source: 'frontend' });
            setPurchasing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (!artwork) return (
        <div className="container py-20 text-center">
            <h1 className="text-xl">Artwork not found.</h1>
            <Link href="/explore" className="text-primary underline mt-2 inline-block">Back to Gallery</Link>
        </div>
    );

    return (
        <div className="container py-24 space-y-20 animate-in fade-in duration-1000">
            <Link href="/explore" className="text-[10px] font-bold tracking-[0.4em] uppercase text-muted-foreground/40 hover:text-primary transition-all inline-block mb-12">
                ← Back to Gallery
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
                {/* Left: Image (Focus) */}
                <div className="relative aspect-[4/5] w-full bg-secondary/10 border border-border/10 overflow-hidden group/image">
                    <Image
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        fill
                        className="object-cover transition-all duration-1000 group-hover/image:scale-105"
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                </div>

                {/* Right: Context & Story */}
                <div className="flex flex-col justify-center space-y-12">
                    <div className="space-y-4">
                        <h1 className="font-serif text-6xl lg:text-8xl font-medium tracking-tighter text-foreground leading-[0.9]">
                            {artwork.title}
                        </h1>
                        <p className="text-2xl text-muted-foreground font-light italic opacity-60">
                            by <Link href={`/profile/${artwork.artistId}`} className="hover:text-primary transition-colors">{artwork.artistName}</Link>
                        </p>
                    </div>

                    <div className="space-y-6 text-[10px] font-bold tracking-[0.2em] uppercase border-y border-border/10 py-10">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground/30">Status</span>
                            <span className={cn(
                                "px-3 py-1 border",
                                artwork.status === 'available' ? "border-primary text-primary" : "border-muted-foreground/20 text-muted-foreground"
                            )}>
                                {artwork.status === 'available' ? "AVAILABLE FOR ACQUISITION" : "PRIVATE COLLECTION"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground/30">Medium</span>
                            <span className="text-foreground">{artwork.medium}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground/30">Location</span>
                            <span className="text-foreground">{artwork.location || "Global"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground/30">Created</span>
                            <span className="text-foreground">{new Date(artwork.createdAt || Date.now()).getFullYear()}</span>
                        </div>
                        {artwork.status === 'available' && artwork.price && (
                            <div className="flex justify-between text-2xl font-serif tracking-tighter pt-4 border-t border-border/5">
                                <span className="text-muted-foreground/30 uppercase text-[10px] font-bold font-sans tracking-[0.2em] pt-2">Price</span>
                                <span className="text-foreground">{convertPrice(artwork.price, artwork.currency).formatted}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40">Narrative & Philosophy</h3>
                        <p className="text-xl text-muted-foreground italic font-light leading-relaxed max-w-xl">
                            “{artwork.description || "Every piece in the collective represents a specific high-end human skill."}”
                        </p>
                    </div>

                    {/* NEW: Transparency Price Breakdown */}
                    {artwork.status === 'available' && artwork.price && (
                        <div className="space-y-8 pt-12 border-t border-border/10 bg-secondary/5 p-10">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40">
                                    {t('price_architecture')}
                                </h3>
                                <div className="h-1 w-full bg-muted/20 overflow-hidden flex">
                                    <div className="h-full bg-primary/40" style={{ width: '60%' }} title={`${t('artist_direct')} (60%)`}></div>
                                    <div className="h-full bg-primary/25" style={{ width: '25%' }} title={`${t('material_sourcing')} (25%)`}></div>
                                    <div className="h-full bg-primary/10" style={{ width: '10%' }} title={`${t('community_fund')} (10%)`}></div>
                                    <div className="h-full bg-primary/5" style={{ width: '5%' }} title={`${t('platform_ops')} (5%)`}></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground/40 gap-y-6 gap-x-12">
                                <div className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-primary/40"></span> 60% {t('artist_direct')}</div>
                                <div className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-primary/25"></span> 25% {t('material_sourcing')}</div>
                                <div className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-primary/10"></span> 10% {t('community_fund')}</div>
                                <div className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-primary/5"></span> 05% {t('platform_ops')}</div>
                            </div>
                        </div>
                    )}

                    <div className="pt-8 flex flex-col sm:flex-row gap-6">
                        {artwork.status === 'available' ? (
                            <>
                                <Button
                                    size="lg"
                                    className="px-16"
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                >
                                    {purchasing ? "CONSTRUCTING..." : `ACQUIRE — ${convertPrice(artwork.price, artwork.currency).formatted}`}
                                </Button>
                                <Button variant="outline" size="lg" className="px-12">
                                    SAVE TO ARCHIVE
                                </Button>
                            </>
                        ) : (
                            <Button variant="secondary" size="lg" className="px-12" disabled>
                                PRIVATE COLLECTION
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
