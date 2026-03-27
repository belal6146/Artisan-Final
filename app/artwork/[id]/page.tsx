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
            } catch (e) {
                console.error(e);
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
                router.push(checkoutUrl);
            }
        } catch (e) {
            alert("Purchase failed. Please try again.");
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
        <div className="container py-8 lg:py-16">
            <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">
                ← Back to Gallery
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                {/* Left: Image (Focus) */}
                <div className="relative aspect-[4/5] w-full bg-secondary/10 rounded-sm overflow-hidden">
                    <Image
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                </div>

                {/* Right: Context & Story */}
                <div className="flex flex-col justify-center space-y-8">
                    <div className="space-y-2">
                        <h1 className="font-serif text-4xl lg:text-5xl font-medium tracking-tight text-foreground">
                            {artwork.title}
                        </h1>
                        <p className="text-xl text-muted-foreground font-light">
                            by <Link href={`/profile/${artwork.artistId}`} className="hover:underline">{artwork.artistName}</Link>
                        </p>
                    </div>

                    <div className="space-y-4 text-sm border-y border-border py-6">
                        <div className="flex justify-between items-center text-[11px] font-bold tracking-[0.2em] uppercase">
                            <span className="text-muted-foreground/60">Status</span>
                            <span className={cn(
                                "py-0.5 px-2",
                                artwork.status === 'available' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {artwork.status === 'available' ? "AVALAIBLE FOR ACQUISITION" : "PRIVATE COLLECTION"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Medium</span>
                            <span className="font-medium">{artwork.medium}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Location</span>
                            <span className="font-medium">{artwork.location || "Global"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Created</span>
                            <span className="font-medium">{new Date(artwork.createdAt || Date.now()).getFullYear()}</span>
                        </div>
                        {artwork.status === 'available' && artwork.price && (
                            <div className="flex justify-between text-lg pt-2">
                                <span className="text-muted-foreground">Price</span>
                                <span className="font-serif">{convertPrice(artwork.price, artwork.currency).formatted}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium">About the Work</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {artwork.description || "No description provided by the artist."}
                        </p>
                    </div>

                    {/* NEW: Transparency Price Breakdown */}
                    {artwork.status === 'available' && artwork.price && (
                        <div className="space-y-6 pt-12 border-t border-border/10">
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/60">
                                    {t('price_architecture')}
                                </h3>
                                <div className="h-0.5 w-full bg-muted overflow-hidden flex">
                                    <div className="h-full bg-primary/40" style={{ width: '60%' }} title={`${t('artist_direct')} (60%)`}></div>
                                    <div className="h-full bg-primary/25" style={{ width: '25%' }} title={`${t('material_sourcing')} (25%)`}></div>
                                    <div className="h-full bg-primary/10" style={{ width: '10%' }} title={`${t('community_fund')} (10%)`}></div>
                                    <div className="h-full bg-primary/5" style={{ width: '5%' }} title={`${t('platform_ops')} (5%)`}></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground/60 gap-y-4 gap-x-8">
                                <div className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-primary/40"></span> 60% {t('artist_direct')}</div>
                                <div className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-primary/25"></span> 25% {t('material_sourcing')}</div>
                                <div className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-primary/10"></span> 10% {t('community_fund')}</div>
                                <div className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-primary/5"></span> 05% {t('platform_ops')}</div>
                            </div>
                        </div>
                    )}

                    {/* NEW: Link to Process Journal */}
                    <Link href="/journal" className="block group/journal bg-zinc-50 border border-zinc-100 p-6 hover:bg-zinc-100 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">Process Journal</span>
                            <BookOpen className="h-4 w-4 text-zinc-400 group-hover/journal:text-primary transition-colors" />
                        </div>
                        <h4 className="font-serif text-lg mb-2">The Human Effort.</h4>
                        <p className="text-zinc-500 text-xs leading-relaxed italic">
                            “Every piece in our gallery is documented. Read the stories, techniques, and philosophy behind the global artisan network.”
                        </p>
                    </Link>

                    <div className="pt-4 space-x-4">
                        {artwork.status === 'available' ? (
                            <>
                                <Button
                                    size="lg"
                                    className="h-16 px-12 rounded-none bg-primary text-[11px] font-bold tracking-[0.3em] uppercase w-full md:w-auto shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                >
                                    {purchasing ? "CONSTRUCTING SESSION..." : `ACQUIRE — ${artwork.currency || "EUR"} ${artwork.price}`}
                                </Button>
                                <Button variant="outline" size="lg" className="h-16 px-12 rounded-none text-[11px] font-bold tracking-[0.3em] uppercase w-full md:w-auto">
                                    ARCHIVE PIECE
                                </Button>
                            </>
                        ) : (
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto" disabled>
                                In Private Collection
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
