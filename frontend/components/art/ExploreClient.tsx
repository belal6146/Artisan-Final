"use client";

import { useState } from "react";
import { Artwork } from "@/types/schema";
import { ArtworkCard } from "@/components/art/ArtworkCard";
import { FilterBar } from "@/components/art/FilterBar";
import { useLocale } from "@/frontend/contexts/LocaleContext";

const FILTERS = [
    { label: 'Painting', value: 'Painting' },
    { label: 'Sculpture', value: 'Sculpture' },
    { label: 'Digital', value: 'Digital' },
    { label: 'Textile', value: 'Textile' },
];

interface ExploreClientProps {
    initialArtworks: Artwork[];
}

export function ExploreClient({ initialArtworks }: ExploreClientProps) {
    const { t } = useLocale();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredArtworks = initialArtworks.filter(a => {
        const matchesMedium =
            activeFilter === "all" || (a.medium ?? "Other") === activeFilter;
        const matchesSearch = searchTerm === '' ||
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.artistName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMedium && matchesSearch;
    });

    return (
        <div className="space-y-24">
            <FilterBar
                filters={FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredArtworks.map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}

                {filteredArtworks.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <p className="font-serif text-2xl italic text-muted-foreground/50">No works match this filter.</p>
                        <button
                            onClick={() => { setActiveFilter('all'); setSearchTerm(''); }}
                            className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40 hover:text-primary transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
