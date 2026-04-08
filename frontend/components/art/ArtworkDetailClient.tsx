"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { logger } from "@/backend/lib/logger";

import { getArtworkById } from "@/backend/actions/artwork";

interface Props {
    artwork: any;
    breakdown: any;
    community: number;
}

const SAVED_KEY = "artisan_saved_artwork_ids";

export function ArtworkDetailClient({ artwork: initialArtwork, breakdown, community }: Props) {
    const { convertPrice, t } = useLocale();
    const router = useRouter();
    const { user } = useAuth();
    const [purchasing, setPurchasing] = useState(false);
    const [saved, setSaved] = useState(false);
    const [artwork, setArtwork] = useState(initialArtwork);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        async function revalidate() {
            try {
                if (!artwork?.id) return;
                const fresh = await getArtworkById(artwork.id);
                if (fresh) setArtwork(fresh);
            } catch (e) { /* background silent */ }
        }
        revalidate();

        if (typeof window === "undefined") return;
        try {
            const list = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
            setSaved(Array.isArray(list) && list.includes(artwork.id));
        } catch {
            setSaved(false);
        }
    }, [artwork.id]);

    async function handlePurchase() {
        if (!user) {
            router.push(`/auth?redirect=/artwork/${artwork.id}`);
            return;
        }
        setPurchasing(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId: artwork.id, type: "artwork", userId: user.uid }),
            });
            const { checkoutUrl } = await res.json();
            if (checkoutUrl) {
                logger.info("COMMERCE_CHECKOUT_START", {
                    itemId: artwork.id,
                    userId: user.uid,
                    source: "frontend",
                });
                router.push(checkoutUrl);
            }
        } catch (e: any) {
            logger.error("COMMERCE_CHECKOUT_FAILURE", {
                itemId: artwork.id,
                userId: user.uid,
                error: e.message,
                source: "frontend",
            });
            setPurchasing(false);
        }
    }

    function toggleSaved() {
        if (typeof window === "undefined") return;
        try {
            let list: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
            if (!Array.isArray(list)) list = [];
            if (list.includes(artwork.id)) {
                localStorage.setItem(SAVED_KEY, JSON.stringify(list.filter((x) => x !== artwork.id)));
                setSaved(false);
            } else {
                localStorage.setItem(SAVED_KEY, JSON.stringify([...list, artwork.id]));
                setSaved(true);
            }
        } catch { /* ignore */ }
    }

    return (
        <section className="space-y-12">
            {artwork.status === "available" && artwork.price != null && (
                <div className="border-t border-border/20 pt-12 mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-baseline gap-4">
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-muted-foreground/40 leading-none">
                            {t("price_architecture")}
                        </span>
                        <span className="font-serif text-4xl">
                            {mounted && convertPrice(artwork.price, artwork.currency).formatted}
                        </span>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="h-1 flex bg-muted/40 rounded-sm overflow-hidden" aria-hidden>
                            <div className="h-full bg-primary/60" style={{ width: `${breakdown.artisan}%` }} />
                            <div className="h-full bg-primary/45" style={{ width: `${breakdown.materials}%` }} />
                            <div className="h-full bg-primary/25" style={{ width: `${community}%` }} />
                            <div className="h-full bg-primary/10" style={{ width: `${breakdown.platform}%` }} />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{breakdown.artisan}%</p>
                                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{t("artist_direct")}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50">{breakdown.materials}%</p>
                                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{t("material_sourcing")}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/30">{community}%</p>
                                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{t("community_fund")}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/15">{breakdown.platform}%</p>
                                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{t("platform_ops")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <Button size="lg" variant="outline" onClick={toggleSaved} className="h-16 text-[11px] font-bold tracking-[0.3em] uppercase rounded-none border-border/20">
                    {saved ? "UNSAVE FROM COLLECTION" : "SAVE TO COLLECTION"}
                </Button>
                {artwork.status === "available" && artwork.price != null && (
                    <Button size="lg" onClick={handlePurchase} disabled={purchasing} className="h-16 text-[11px] font-bold tracking-[0.3em] uppercase rounded-none shadow-2xl">
                        {purchasing ? "SYNCHRONISING..." : `PROCEED WITH ${mounted ? convertPrice(artwork.price, artwork.currency).formatted : ""}`}
                    </Button>
                )}
            </div>
        </section>
    );
}
