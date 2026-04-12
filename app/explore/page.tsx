import { getArtworks } from "@/backend/actions/artwork";
import { Globe } from "lucide-react";
import { ExploreClient } from "@/frontend/components/art/ExploreClient";
import { fonts } from "@/frontend/lib/utils";

export default async function ExplorePage() {
    // 1. Fetch initial data on server to reduce client-side delay
    const initialArtworks = await getArtworks(100); // Fetch a reasonable chunk for client-side filtering

    return (
        <div className="container py-12 lg:py-24 space-y-12 lg:space-y-24 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row items-baseline justify-between gap-8 lg:gap-12 border-l-2 border-primary/20 pl-8 lg:pl-16 pb-8 lg:pb-12">
                <div className="space-y-6 lg:space-y-8 max-w-3xl">
                    <h1 className={`${fonts.display} text-5xl sm:text-7xl lg:text-[10rem] font-medium leading-[0.85] tracking-tighter`}>
                        Exhibit
                    </h1>
                    <p className="text-xl lg:text-3xl text-muted-foreground font-light italic leading-relaxed opacity-60 text-pretty">
                        Defining the next era of decentralized craftsmanship. 
                    </p>
                </div>
                <div className={`flex items-center gap-4 ${fonts.caps} text-primary/40 leading-none text-[10px] lg:text-[12px] opacity-40 lg:opacity-100`}>
                    <Globe className="h-4 w-4" /> GLOBAL DISCOVERY
                </div>
            </div>

            <ExploreClient initialArtworks={JSON.parse(JSON.stringify(initialArtworks))} />
        </div>
    );
}
