"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Share2, Bookmark, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getJournalEntryById, JournalEntry } from "@/backend/actions/journal";

export default function JournalEntryPage() {
    const { id } = useParams();
    const router = useRouter();
    const [entry, setEntry] = useState<JournalEntry | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!id) return;
            const data = await getJournalEntryById(id as string);
            setEntry(data);
            setLoading(false);
        }
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
            </div>
        );
    }

    if (!entry) {
        return (
            <div className="container py-40 text-center space-y-8 animate-in fade-in duration-200">
                <div className="w-24 h-24 bg-secondary/10 flex items-center justify-center mx-auto">
                    <BookOpen className="h-10 w-10 text-primary/20" />
                </div>
                <div className="space-y-4">
                    <h1 className="font-serif text-4xl">Record not found.</h1>
                    <p className="text-muted-foreground italic opacity-60">“The archive has no record of this specific narrative pulse.”</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()}>
                    RETURN TO CHRONICLE
                </Button>
            </div>
        );
    }

    return (
        <article className="container py-32 max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-200 pb-64">
            <Button variant="ghost" className="h-10 px-0 hover:bg-transparent hover:text-primary text-[10px] font-bold tracking-widest uppercase mb-16 transition-all group" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Journal
            </Button>

            <header className="space-y-12 mb-24 border-l-2 border-primary/20 pl-12">
                <div className="flex gap-8 items-center text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40">
                    <span>{entry.category || 'Theory & Technique'}</span>
                    <span className="w-1.5 h-1.5 bg-primary/20" />
                    <span>{new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                
                <h1 className="font-serif text-6xl md:text-[7rem] font-medium tracking-tighter leading-[0.9] text-foreground">
                    {entry.title}
                </h1>

                <div className="flex items-center justify-between pt-12 border-t border-border/10">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 bg-secondary flex items-center justify-center italic text-[10px] font-bold text-muted-foreground/40 border border-border/5">
                            {entry.author?.[0] || 'A'}
                        </div>
                        <div>
                            <p className="text-[12px] font-bold tracking-widest uppercase text-foreground">{entry.author || 'Anonymous Curator'}</p>
                            <p className="text-xs text-muted-foreground italic opacity-40">Documentation Lead</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <Button variant="ghost" size="icon" className="hover:bg-primary/5 transition-colors">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/5 transition-colors">
                            <Bookmark className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="space-y-16">
                {entry.imageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden bg-secondary/5 border border-border/5 group">
                        <Image 
                            src={entry.imageUrl} 
                            alt={entry.title} 
                            fill 
                            className="object-cover transition-transform duration-2000 group-hover:scale-105" 
                            priority 
                        />
                    </div>
                )}

                <div className="prose prose-zinc prose-xl max-w-none prose-headings:font-serif prose-headings:tracking-tighter font-light leading-relaxed text-foreground/80">
                    <p className="lead text-2xl md:text-3xl font-light italic mb-16 opacity-60 border-l-4 border-primary/10 pl-10">
                        “{entry.excerpt}”
                    </p>

                    <div className="whitespace-pre-wrap space-y-10">
                        {entry.content}
                    </div>
                </div>
            </div>

            <footer className="mt-48 pt-24 border-t border-border/10 text-center space-y-16">
                <div className="space-y-4">
                    <h4 className="font-serif text-3xl italic text-muted-foreground opacity-40">Chronicle Continuity</h4>
                    <p className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-20">Exploring Related Narrative Pulses</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <Link href="/journal" className="p-12 border border-border/10 bg-secondary/5 hover:bg-secondary/10 transition-all text-left space-y-6 group">
                        <p className="text-[9px] font-bold tracking-[0.4em] uppercase opacity-40">Previous Entry</p>
                        <h5 className="font-serif text-2xl group-hover:text-primary transition-colors">Symmetry in Chaos</h5>
                    </Link>
                    <Link href="/journal" className="p-12 border border-border/10 bg-secondary/5 hover:bg-secondary/10 transition-all text-left space-y-6 group">
                        <p className="text-[9px] font-bold tracking-[0.4em] uppercase opacity-40">Next Entry</p>
                        <h5 className="font-serif text-2xl group-hover:text-primary transition-colors">The Indigo Morning</h5>
                    </Link>
                </div>
            </footer>
        </article>
    );
}
