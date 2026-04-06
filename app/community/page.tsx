import { getAllArtists } from "@/backend/actions/profile";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default async function CommunityPage() {
    const artists = await getAllArtists();

    return (
        <div className="container py-24 space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 border-l-2 border-primary/10 pl-8 pb-4">
                <div className="space-y-6 max-w-2xl">
                    <h1 className="font-serif text-5xl md:text-8xl font-medium tracking-tighter">
                        The Inhabitants
                    </h1>
                    <p className="text-xl text-muted-foreground font-light italic leading-relaxed">
                        A global sanctuary for creators and connoisseurs. 
                        Defining the next era of decentralized craftsmanship.
                    </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] uppercase text-primary/60">
                    <Globe className="h-4 w-4" /> GLOBAL COLLECTIVE
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                {artists.map((artist) => (
                    <div key={artist.uid} className="group relative bg-muted/5 border border-border/5 p-12 flex flex-col items-center text-center transition-all hover:bg-muted/10 duration-700">
                        <div className="relative w-40 h-40 mb-10 overflow-hidden bg-muted/20 border border-border/10 grayscale transition-all duration-700">
                            {artist.photoURL ? (
                                <Image
                                    src={artist.photoURL}
                                    alt={artist.displayName || "Artist"}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary/20 text-5xl font-serif">
                                    {(artist.displayName || "A").charAt(0)}
                                </div>
                            )}
                        </div>

                        <h3 className="font-serif text-3xl font-medium mb-2 tracking-tight">{artist.displayName}</h3>
                        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40 mb-8">{artist.location || "Global Business"}</p>

                        <p className="text-muted-foreground font-light leading-relaxed mb-12 line-clamp-3 italic">
                            {artist.bio}
                        </p>

                        <div className="mt-auto w-full">
                            <Link href={`/profile/${artist.uid}`} className="block">
                                <Button variant="outline" className="w-full h-14 rounded-none text-[11px] font-bold tracking-[0.2em] uppercase border-border/10">
                                    VIEW DOSSIER
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
