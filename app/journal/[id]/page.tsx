"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JournalEntryPage() {
    const { id } = useParams();

    return (
        <article className="container py-24 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Link href="/journal" className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground hover:text-primary transition-colors mb-12">
                <ArrowLeft className="h-3 w-3" /> Back to Journal
            </Link>

            <header className="space-y-8 mb-16">
                <div className="flex gap-6 items-center text-[10px] font-bold tracking-[0.2em] uppercase text-primary/40">
                    <span>Theory & Technique</span>
                    <span className="w-1 h-1 bg-primary/20 rounded-full" />
                    <span>March 20, 2026</span>
                </div>
                
                <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter leading-none">
                    The Documentation of the Human.
                </h1>

                <div className="flex items-center justify-between pt-8 border-t border-border/10">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-secondary bg-zinc-200" />
                        <div>
                            <p className="text-[11px] font-bold tracking-widest uppercase text-foreground">Amina Shah</p>
                            <p className="text-xs text-muted-foreground italic">Lead Curator</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Bookmark className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="prose prose-zinc prose-lg max-w-none prose-headings:font-serif prose-headings:tracking-tighter">
                <p className="lead text-xl text-muted-foreground font-light leading-relaxed italic mb-12">
                    "Every piece in our gallery is documented. This is a placeholder for the full narrative behind entry {id}. We are currently finalizing the digital dossier for this specific artisan process."
                </p>

                <div className="space-y-8 text-foreground/80 leading-relaxed font-light">
                    <p>
                        The artisan experience is one of profound silence and deep material interaction. In this entry, we explore how traditional techniques are being preserved in a digital-first economy.
                    </p>
                    
                    <h2 className="text-3xl mt-12 mb-6">The Materiality of Time</h2>
                    
                    <p>
                        When we look at a finished piece, we often ignore the hundreds of hours of preparation that preceded the first mark. From the sourcing of pigments to the seasoning of wood, time is the invisible ingredient in all human-made artifacts.
                    </p>

                    <div className="aspect-video bg-secondary/20 my-12 flex items-center justify-center border border-border/10">
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-30 italic">Process Media Placeholder</span>
                    </div>

                    <p>
                        Continuing our exploration, we find that the most resilient techniques are those that refuse to be automated. The nuance of a hand-thrown ceramic or the variation in natural indigo cannot be replicated by machines—at least, not with the same soul.
                    </p>
                </div>
            </div>

            <footer className="mt-24 pt-12 border-t border-border/10 text-center space-y-8">
                <h4 className="font-serif text-2xl italic text-muted-foreground">Keep Reading</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link href="/journal" className="p-8 border border-border/5 hover:border-border/20 transition-all text-left space-y-4">
                        <p className="text-[9px] font-bold tracking-widest uppercase opacity-40">Previous Entry</p>
                        <h5 className="font-serif text-xl">Symmetry in Chaos</h5>
                    </Link>
                    <Link href="/journal" className="p-8 border border-border/5 hover:border-border/20 transition-all text-left space-y-4">
                        <p className="text-[9px] font-bold tracking-widest uppercase opacity-40">Next Entry</p>
                        <h5 className="font-serif text-xl">The Indigo Morning</h5>
                    </Link>
                </div>
            </footer>
        </article>
    );
}
