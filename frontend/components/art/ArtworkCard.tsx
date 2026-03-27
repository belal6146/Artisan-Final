"use client";

import Link from "next/link";
import Image from "next/image";
import { Artwork } from "@/types/schema";
import { cn } from "@/frontend/lib/utils";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { logger } from "@/backend/lib/logger";

interface ArtworkCardProps {
    artwork: Artwork;
    className?: string; // Allow external layout control
    priority?: boolean;
}

export function ArtworkCard({ artwork, className, priority = false }: ArtworkCardProps) {
    const { convertPrice, t } = useLocale();
    
    // Robust image selection: Primary URL > First URL in array > null
    const displayImage = artwork.imageUrl || (artwork.imageUrls && artwork.imageUrls.length > 0 ? artwork.imageUrls[0] : null);

    return (
        <div className={cn("group block space-y-4 transition-all duration-500", className)}>
            <Link href={`/artwork/${artwork.id}`} className="block relative">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-none bg-muted hover:bg-muted/80 transition-all duration-500">
                    {displayImage && displayImage.startsWith('http') ? (
                        <Image
                            src={displayImage}
                            alt={artwork.title}
                            fill
                            priority={priority}
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={() => {
                                logger.error("Artwork image failed to load", { artworkId: artwork.id, title: artwork.title, url: displayImage });
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground">
                            <span className="font-serif italic opacity-50 uppercase tracking-[0.2em] text-[10px]">No Artifact Image</span>
                        </div>
                    )}
 
                    {/* Price Tag (Always Visible) */}
                    {artwork.price && (
                        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-none uppercase text-foreground/80 border border-border/10">
                            {convertPrice(artwork.price, artwork.currency).formatted}
                        </div>
                    )}

                    {/* Economic Dignity Indicator (Translated) */}
                    <div className="absolute bottom-4 left-4 text-[8px] font-bold tracking-[0.2em] uppercase text-white bg-black/40 backdrop-blur-sm px-2 py-1">
                        {t('direct_to_artist')}
                    </div>
                </div>
            </Link>
 
            {/* Metadata */}
            <div className="space-y-2 px-1">
                <div className="flex justify-between items-start gap-4">
                    <Link href={`/artwork/${artwork.id}`} className="flex-1">
                        <h3 className="font-serif text-xl leading-tight text-foreground hover:text-primary transition-colors tracking-tighter">
                            {artwork.title}
                        </h3>
                    </Link>
                    <span className={cn(
                        "text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-none border self-start mt-1.5",
                        artwork.status === 'available' ? "border-primary/20 text-primary" : "border-muted-foreground/20 text-muted-foreground"
                    )}>
                        {artwork.status === 'available' ? t('available') : t('collected')}
                    </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border/10">
                    <Link href={`/profile/${artwork.artistId}`} className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-bold tracking-[0.1em] uppercase">
                        {artwork.artistName}
                    </Link>
                    <p className="text-[10px] text-muted-foreground/40 font-medium tracking-tight">
                        {artwork.medium} / {artwork.location || "Global"}
                    </p>
                </div>

                {/* Narrative Snippet (Trust Trigger) */}
                {artwork.description && (
                   <p className="text-[11px] text-muted-foreground/60 italic line-clamp-2 leading-relaxed font-light pt-1">
                       “{artwork.description}”
                   </p>
                )}
            </div>
        </div>
    );
}
