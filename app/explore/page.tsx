import { getArtworks } from "@/backend/actions/artwork";
import { Globe } from "lucide-react";
import { ExploreClient } from "@/frontend/components/art/ExploreClient";
import { serialize, fonts } from "@/frontend/lib/serialization";

export default async function ExplorePage() {
    // 1. Fetch initial data on server to reduce client-side delay
    const initialArtworks = await getArtworks(100); // Fetch a reasonable chunk for client-side filtering

    return (
        <div className="container py-24 space-y-24 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row items-baseline justify-between gap-12 border-l-2 border-primary/20 pl-16 pb-12">
                <div className="space-y-8 max-w-3xl">
                    <h1 className={`${fonts.display} text-8xl md:text-[10rem] font-medium leading-none`}>
                        Exhibit
                    </h1>
                    <p className="text-2xl md:text-3xl text-muted-foreground font-light italic leading-relaxed opacity-60">
                        Defining the next era of decentralized craftsmanship. 
                    </p>
                </div>
                <div className={`flex items-center gap-4 ${fonts.caps} text-primary/40 leading-none`}>
                    <Globe className="h-4 w-4" /> GLOBAL DISCOVERY
                </div>
            </div>

            <ExploreClient initialArtworks={serialize(initialArtworks)} />
        </div>
    );
}
