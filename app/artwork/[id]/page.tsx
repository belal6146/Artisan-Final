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
import { getUserById } from "@/backend/actions/profile";
import type { User } from "@/types";
import { NOT_PROVIDED, materialsLine, textOrMissing } from "@/frontend/lib/artwork-display";

const SAVED_KEY = "artisan_saved_artwork_ids";

export default function ArtworkDetailPage() {
    const { convertPrice, t } = useLocale();
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [artist, setArtist] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [saved, setSaved] = useState(false);

    const artworkId = typeof id === "string" ? id : id?.[0] ?? "";

    useEffect(() => {
        if (!artworkId) return;
        (async () => {
            try {
                const res = await fetch(`/api/artworks?id=${artworkId}`);
                if (!res.ok) throw new Error("not found");
                setArtwork((await res.json()) as Artwork);
            } catch (e: unknown) {
                logger.error("ARTWORK_FETCH_FAILED", {
                    id: artworkId,
                    error: e instanceof Error ? e.message : String(e),
                    source: "frontend",
                });
            } finally {
                setLoading(false);
            }
        })();
    }, [artworkId]);

    useEffect(() => {
        if (!artwork?.artistId) return;
        getUserById(artwork.artistId).then(setArtist).catch(() => setArtist(null));
    }, [artwork?.artistId]);

    useEffect(() => {
        if (!artworkId || typeof window === "undefined") return;
        try {
            const list = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
            setSaved(Array.isArray(list) && list.includes(artworkId));
        } catch {
            setSaved(false);
        }
    }, [artworkId]);

    function toggleSaved() {
        if (!artworkId || typeof window === "undefined") return;
        try {
            let list: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
            if (!Array.isArray(list)) list = [];
            if (list.includes(artworkId)) {
                localStorage.setItem(
                    SAVED_KEY,
                    JSON.stringify(list.filter((x) => x !== artworkId))
                );
                setSaved(false);
            } else {
                localStorage.setItem(SAVED_KEY, JSON.stringify([...list, artworkId]));
                setSaved(true);
            }
        } catch {
            /* ignore */
        }
    }

    async function handlePurchase() {
        if (!user) {
            router.push(`/auth?redirect=/artwork/${artworkId}`);
            return;
        }
        setPurchasing(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                body: JSON.stringify({ itemId: artworkId, type: "artwork" }),
            });
            const { checkoutUrl } = await res.json();
            if (checkoutUrl) {
                logger.info("COMMERCE_CHECKOUT_START", {
                    itemId: artworkId,
                    userId: user?.uid,
                    source: "frontend",
                });
                router.push(checkoutUrl);
            }
        } catch (e: unknown) {
            logger.error("COMMERCE_CHECKOUT_FAILURE", {
                itemId: artworkId,
                userId: user?.uid,
                error: e instanceof Error ? e.message : String(e),
                source: "frontend",
            });
            setPurchasing(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin opacity-20" />
            </div>
        );
    }

    if (!artwork) {
        return (
            <div className="container py-24 text-center space-y-4">
                <p className="text-muted-foreground">Not available.</p>
                <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">
                    Back
                </Link>
            </div>
        );
    }

    const breakdown = artwork.priceBreakdown ?? {
        artisan: 60,
        platform: 5,
        materials: 25,
    };
    const community =
        100 - breakdown.artisan - breakdown.materials - breakdown.platform;

    const imageSrc =
        artwork.imageUrl?.trim() ||
        artwork.imageUrls?.[artwork.primaryImageIndex ?? 0]?.trim() ||
        artwork.imageUrls?.[0]?.trim() ||
        "";

    const yearsLine =
        artist?.yearsOfPractice != null && artist.yearsOfPractice > 0
            ? `${artist.yearsOfPractice} years`
            : NOT_PROVIDED;

    const background = textOrMissing(
        artist?.craftStatement?.trim() || artist?.bio?.trim() || null
    );

    const detailRows: [string, string][] = [
        ["Origin", textOrMissing(artwork.origin)],
        ["Process", textOrMissing(artwork.process)],
        ["Materials", materialsLine(artwork.materials)],
        ["Time", textOrMissing(artwork.timeSpent)],
        ["People", textOrMissing(artwork.peopleInvolved)],
        ["Impact", textOrMissing(artwork.impactMetrics)],
        ["Meaning", textOrMissing(artwork.pieceMeaning)],
        ["Values", textOrMissing(artwork.workValues)],
        ["Maker", textOrMissing(artwork.artisanStory)],
        ["Aspirations", textOrMissing(artwork.aspirations)],
    ];

    return (
        <div className="container max-w-2xl py-10 md:py-14">
            <Link
                href="/explore"
                className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block"
            >
                ← Back
            </Link>

            <div className="relative w-full aspect-[4/3] bg-muted/30 mb-10">
                {imageSrc.startsWith("http") ? (
                    <Image
                        src={imageSrc}
                        alt={artwork.title}
                        fill
                        className="object-contain"
                        priority
                        sizes="(max-width: 768px) 100vw, 42rem"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                        {NOT_PROVIDED}
                    </div>
                )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-3">
                {artwork.title}
            </h1>
            <p className="text-sm text-muted-foreground mb-10">
                {artwork.medium ?? "Other"}
                {artwork.location ? ` · ${artwork.location}` : ""}
                {" · "}
                {artwork.status === "available" ? "Available" : "Sold / held"}
            </p>

            <div className="space-y-6 mb-10">
                <p className="text-sm text-muted-foreground">Artist</p>
                <p>
                    <Link
                        href={`/profile/${artwork.artistId}`}
                        className="text-base hover:underline underline-offset-4"
                    >
                        {textOrMissing(artwork.artistName)}
                    </Link>
                </p>
                <p className="text-sm text-muted-foreground">{yearsLine}</p>
                <p className="leading-relaxed">{background}</p>
            </div>

            <dl className="space-y-6 mb-12">
                {detailRows.map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-sm text-muted-foreground">{label}</dt>
                        <dd className="mt-1 leading-relaxed">{value}</dd>
                    </div>
                ))}
            </dl>

            {artwork.description?.trim() && (
                <p className="leading-relaxed text-muted-foreground mb-12">
                    {artwork.description.trim()}
                </p>
            )}

            {artwork.status === "available" && artwork.price != null && (
                <div className="border-t border-border/20 pt-8 mb-10 space-y-4">
                    <div className="flex justify-between gap-4">
                        <span className="text-sm text-muted-foreground">
                            {t("price_architecture")}
                        </span>
                        <span className="font-serif text-2xl">
                            {convertPrice(artwork.price, artwork.currency).formatted}
                        </span>
                    </div>
                    <div className="h-1 flex bg-muted/40 rounded-sm overflow-hidden" aria-hidden>
                        <div className="h-full bg-primary/50" style={{ width: `${breakdown.artisan}%` }} />
                        <div className="h-full bg-primary/35" style={{ width: `${breakdown.materials}%` }} />
                        <div className="h-full bg-primary/20" style={{ width: `${community}%` }} />
                        <div className="h-full bg-primary/10" style={{ width: `${breakdown.platform}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <span>
                            {breakdown.artisan}% {t("artist_direct")}
                        </span>
                        <span>
                            {breakdown.materials}% {t("material_sourcing")}
                        </span>
                        <span>
                            {community}% {t("community_fund")}
                        </span>
                        <span>
                            {breakdown.platform}% {t("platform_ops")}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2 pt-6 border-t border-border/20">
                <Button type="button" variant="outline" size="sm" onClick={toggleSaved}>
                    {saved ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/profile/${artwork.artistId}`}>Contact</Link>
                </Button>
                {artwork.status === "available" && artwork.price != null && (
                    <Button size="sm" className="sm:ml-auto" onClick={handlePurchase} disabled={purchasing}>
                        {purchasing
                            ? "…"
                            : `Buy ${convertPrice(artwork.price, artwork.currency).formatted}`}
                    </Button>
                )}
            </div>
        </div>
    );
}
