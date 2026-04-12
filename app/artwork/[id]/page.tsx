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

            <div className="space-y-20 lg:space-y-32 px-4 lg:px-0">
                {/* 1. Header & Title Block */}
                <header className="space-y-6 pt-8 lg:pt-12">
                    <p className={`${fonts.caps} text-primary/30 flex items-center gap-4`}>
                        <span className="h-px w-8 bg-primary/20"></span>
                        {artwork.medium ?? "Other Piece"} {artwork.location ? `· ${artwork.location}` : ""}
                    </p>
                    <h1 className={`${fonts.display} text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.9] text-balance`}>
                        {artwork.title}
                    </h1>
                </header>

                {/* 2. Technical Blueprint - Precision Grid */}
                <section className="fade-up-view">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                        <div className="w-full lg:w-1/3 space-y-6">
                            <h3 className={fonts.caps}>The Blueprint</h3>
                            <p className="text-[11px] uppercase tracking-[0.3em] opacity-30 leading-relaxed italic">The physical reality of the craft. Precise, measured, and masterfully executed.</p>
                        </div>
                        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-12 border-l-0 lg:border-l border-primary/5 pl-0 lg:pl-12">
                            {detailRows.slice(0, 4).map(([label, value]) => (
                                <div key={label} className="space-y-3">
                                    <dt className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40 leading-none">{label}</dt>
                                    <dd className="text-base lg:text-lg font-medium leading-tight">{value}</dd>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="divider-artisan" />

                {/* 3. The Soul - Philosophical Centerpiece */}
                <section className="fade-up-view space-y-12 lg:space-y-20">
                    <div className="max-w-4xl space-y-8">
                        <h3 className={fonts.caps}>The Soul</h3>
                        <p className={`${fonts.display} text-2xl sm:text-3xl md:text-5xl leading-tight text-balance text-primary`}>
                            {detailRows.find(r => r[0] === "Meaning")?.[1]}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 lg:gap-20">
                        {detailRows.slice(4, 7).filter(r => r[0] !== "Meaning").map(([label, value]) => (
                            <div key={label} className="space-y-4 max-w-md">
                                <dt className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/30 italic">{label}</dt>
                                <dd className={`${fonts.body} text-lg lg:text-xl text-muted-foreground italic leading-relaxed text-pretty`}>{value}</dd>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. The Artisan - Human Connection */}
                <section className="fade-up-view bg-secondary/30 p-8 sm:p-12 lg:p-24 border border-primary/5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24 items-start lg:items-center">
                        <div className="lg:col-span-2 space-y-8">
                            <h3 className={fonts.caps}>The Artisan</h3>
                            <Link href={`/profile/${artwork.artistId}`} className={`${fonts.display} text-3xl sm:text-5xl md:text-6xl hover:underline underline-offset-8 decoration-1 decoration-primary/10 block`}>
                                {textOrMissing(artwork.artistName)}
                            </Link>
                            <p className={`${fonts.body} text-lg lg:text-xl md:text-2xl text-muted-foreground/80 font-light italic leading-relaxed text-prose text-pretty`}>
                                {background}
                            </p>
                            <div className="pt-4 lg:pt-8 flex items-center gap-6">
                                <div className="h-px w-12 bg-primary/20"></div>
                                <p className="text-[11px] font-bold tracking-[0.4em] uppercase opacity-40">{yearsLine} of dedicated practice</p>
                            </div>
                        </div>
                        <div className="space-y-10 lg:space-y-12 border-t lg:border-t-0 border-primary/5 pt-10 lg:pt-0">
                            {detailRows.slice(8).map(([label, value]) => (
                                <div key={label} className="space-y-3">
                                    <dt className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/30">{label}</dt>
                                    <dd className="text-sm font-medium leading-relaxed italic opacity-70">{value}</dd>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Hand off interactive bits to Client Component */}
                <div className="pt-12">
                   <ArtworkDetailClient 
                        artwork={JSON.parse(JSON.stringify(artwork))} 
                        breakdown={breakdown}
                        community={community}
                    />
                </div>
            </div>
        </div>
    );
}
