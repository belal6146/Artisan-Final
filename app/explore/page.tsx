"use client";

import { useEffect, useState } from "react";
import { getArtworks } from "@/backend/db/artworks"; // Real DB
import { Artwork } from "@/types/schema";
import { ArtworkCard } from "@/components/art/ArtworkCard";
import { FilterBar } from "@/components/art/FilterBar";
import { Globe } from "lucide-react";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { logger } from "@/backend/lib/logger";

const FILTERS = [
    { label: 'Painting', value: 'Painting' },
    { label: 'Sculpture', value: 'Sculpture' },
    { label: 'Digital', value: 'Digital' },
    { label: 'Textile', value: 'Textile' },
];

export default function ExplorePage() {
    const { t } = useLocale();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await getArtworks();
                setArtworks(data);
                logger.debug('ARTWORK_FETCH_SUCCESS', { count: data.length, source: 'frontend' });
            } catch (err: any) {
                logger.error('ARTWORK_FETCH_FAILED', { error: err.message, source: 'frontend' });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filteredArtworks = artworks.filter(a => {
        const matchesMedium = activeFilter === 'all' || a.medium === activeFilter;
        const matchesSearch = searchTerm === '' ||
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.artistName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMedium && matchesSearch;
    });

    return (
        <div className="container py-48 space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1200">
            <div className="flex flex-col md:flex-row items-baseline justify-between gap-12 border-l-2 border-primary/20 pl-16 pb-12">
                <div className="space-y-8 max-w-3xl">
                    <h1 className="font-serif text-8xl md:text-[10rem] font-medium tracking-tighter leading-none">
                        {t('gallery_title')}
                    </h1>
                    <p className="text-2xl md:text-3xl text-muted-foreground font-light italic leading-relaxed opacity-60">
                        {t('gallery_subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40 leading-none">
                    <Globe className="h-4 w-4" /> {t('global_discovery')}
                </div>
            </div>

            <FilterBar
                filters={FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            {loading ? (
                // "Calm" Skeleton Grid
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-[4/5] bg-secondary/30 rounded-sm animate-pulse" />
                            <div className="h-4 w-3/4 bg-secondary/30 rounded-sm animate-pulse" />
                            <div className="h-3 w-1/2 bg-secondary/30 rounded-sm animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredArtworks.map((artwork) => (
                        <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}

                    {filteredArtworks.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground">
                            No artworks found. <span className="opacity-50">(Did you seed the database?)</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
