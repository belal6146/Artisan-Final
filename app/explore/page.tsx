"use client";

import { useEffect, useState } from "react";
import { getArtworks } from "@/backend/db/artworks"; // Real DB
import { Artwork } from "@/types/schema";
import { ArtworkCard } from "@/components/art/ArtworkCard";
import { FilterBar } from "@/components/art/FilterBar";
import { Globe } from "lucide-react";

const FILTERS = [
    { label: 'Painting', value: 'Painting' },
    { label: 'Sculpture', value: 'Sculpture' },
    { label: 'Digital', value: 'Digital' },
    { label: 'Textile', value: 'Textile' },
];

export default function ExplorePage() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await getArtworks();
                setArtworks(data);
            } catch (err) {
                console.error(err);
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
        <div className="container py-24 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 border-l-2 border-primary/10 pl-8 pb-4">
                <div className="space-y-6 max-w-2xl">
                    <h1 className="font-serif text-5xl md:text-8xl font-medium tracking-tighter">
                        Gallery
                    </h1>
                    <p className="text-xl text-muted-foreground font-light italic leading-relaxed">
                        Emerging artists. Universal talent. 
                        A silent observation of cultural depth and technical excellence.
                    </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] uppercase text-primary/60">
                    <Globe className="h-4 w-4" /> GLOBAL DISCOVERY
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-[4/5] bg-secondary/30 rounded-sm animate-pulse" />
                            <div className="h-4 w-3/4 bg-secondary/30 rounded-sm animate-pulse" />
                            <div className="h-3 w-1/2 bg-secondary/30 rounded-sm animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
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
