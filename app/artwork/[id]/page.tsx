import { getArtworkById } from "@/backend/actions/artwork";
import { getUserById } from "@/backend/actions/profile";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ArtworkDetailClient } from "@/frontend/components/art/ArtworkDetailClient";
import { NOT_PROVIDED, materialsLine, textOrMissing } from "@/frontend/lib/artwork-display";
import { fonts } from "@/frontend/lib/utils";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ArtworkDetailPage({ params }: PageProps) {
    const { id } = await params;
    
    // 1. Parallel fetch to eliminate request waterfall
    const artwork = await getArtworkById(id);
    if (!artwork) notFound();
    
    const artist = await getUserById(artwork.artistId).catch(() => null);

    const breakdown = artwork.priceBreakdown ?? { artisan: 60, platform: 5, materials: 25 };
    const community = 100 - breakdown.artisan - breakdown.materials - breakdown.platform;
    
    const imageSrc = artwork.imageUrl?.trim() || artwork.imageUrls?.[0]?.trim() || "";
    const yearsLine = (artist?.yearsOfPractice ?? 0) > 0 ? `${artist?.yearsOfPractice} years` : NOT_PROVIDED;
    const background = textOrMissing(artist?.craftStatement?.trim() || artist?.bio?.trim() || null);

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
        <div className="container max-w-2xl py-10 md:py-14 animate-in fade-in duration-700">
            <Link href="/explore" className={`mb-12 flex items-center group ${fonts.caps} text-muted-foreground hover:text-foreground`}>
                <ChevronLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" /> {artwork.title ? "Back" : "Explore"}
            </Link>

            <div className="relative w-full aspect-[4/3] bg-muted/20 mb-12 overflow-hidden ring-1 ring-border/5">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={artwork.title}
                        fill
                        className="object-contain grayscale-0"
                        priority
                        sizes="(max-width: 768px) 100vw, 42rem"
                    />
                ) : (
                    <div className={`absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/30 font-bold tracking-widest uppercase`}>
                        {NOT_PROVIDED}
                    </div>
                )}
            </div>

            <header className="space-y-4 mb-16">
                <p className={`${fonts.caps} text-primary/40 leading-none`}>
                    {artwork.medium ?? "Other Piece"} {artwork.location ? `· ${artwork.location}` : ""}
                </p>
                <h1 className={`${fonts.display} text-5xl md:text-6xl font-medium leading-none text-balance`}>
                    {artwork.title}
                </h1>
            </header>

            <div className="grid gap-16">
                <section className="space-y-8">
                    <h3 className={`${fonts.caps} text-muted-foreground/50 border-b border-border/10 pb-4`}>Artisan</h3>
                    <div className="space-y-6">
                        <Link href={`/profile/${artwork.artistId}`} className={`${fonts.display} text-2xl hover:underline underline-offset-8 decoration-1 decoration-primary/20`}>
                            {textOrMissing(artwork.artistName)}
                        </Link>
                        <p className="text-sm font-medium opacity-40 uppercase tracking-widest">{yearsLine} experience</p>
                        <p className="leading-relaxed font-light italic text-muted-foreground text-lg">{background}</p>
                    </div>
                </section>

                <section className="space-y-8">
                    <h3 className={`${fonts.caps} text-muted-foreground/50 border-b border-border/10 pb-4`}>Narrative</h3>
                    <dl className="grid gap-10">
                        {detailRows.map(([label, value]) => (
                            <div key={label} className="space-y-2">
                                <dt className={`${fonts.caps} text-primary/30`}>{label}</dt>
                                <dd className="leading-relaxed text-foreground/90 font-light">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {artwork.description?.trim() && (
                    <section className="pt-8 border-t border-border/10">
                        <p className="leading-relaxed text-muted-foreground italic font-light">
                            {artwork.description.trim()}
                        </p>
                    </section>
                )}

                {/* Hand off interactive bits to Client Component */}
                <ArtworkDetailClient 
                    artwork={JSON.parse(JSON.stringify(artwork))} 
                    breakdown={breakdown}
                    community={community}
                />
            </div>
        </div>
    );
}
