"use client";

import { useEffect, useState } from "react";
import { BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getGlobalJournalEntries, JournalEntry } from "@/backend/actions/journal";
import { useLocale } from "@/frontend/contexts/LocaleContext";

export default function JournalPage() {
    const { t } = useLocale();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getGlobalJournalEntries();
            setEntries(data);
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="container py-48 space-y-32 animate-in fade-in slide-in-from-bottom-12 duration-1200">
            <div className="flex flex-col md:flex-row items-baseline justify-between gap-12 border-l-2 border-primary/20 pl-16 pb-12">
                <div className="space-y-8 max-w-3xl">
                    <h1 className="font-serif text-8xl md:text-[10rem] font-medium tracking-tighter leading-none text-foreground">
                        The Journal
                    </h1>
                    <p className="text-2xl md:text-3xl text-muted-foreground font-light italic leading-relaxed opacity-60">
                        Documenting the stories, techniques, and philosophy behind the global artisan network. 
                    </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40 leading-none">
                    <BookOpen className="h-4 w-4" /> PROCESS & THEORY
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-64 text-muted-foreground animate-pulse space-y-12">
                    <div className="w-16 h-16 bg-secondary/20 flex items-center justify-center">
                         <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">Retrieving Chronicles</p>
                </div>
            ) : entries.length === 0 ? (
                <div className="py-64 text-center border-t border-border/10 space-y-12">
                    <div className="w-24 h-24 bg-secondary/10 flex items-center justify-center mx-auto">
                        <BookOpen className="h-10 w-10 text-primary/20" />
                    </div>
                    <p className="text-xl text-muted-foreground italic max-w-xl mx-auto opacity-40 font-light">
                        “The chronicle is currently a clean slate. Artisans are crafting their first stories. Legacy takes time to prepare.”
                    </p>
                </div>
            ) : (
                <div className="grid gap-32">
                    {entries.map((entry) => (
                        <div key={entry.id} className="group grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24 border-b border-border/10 pb-32 last:border-0 hover:bg-secondary/5 transition-all p-12 -m-12">
                            <div className="md:col-span-7 space-y-12">
                                <div className="flex gap-8 items-center text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40">
                                    <span>{entry.category || 'Technique'}</span>
                                    <span className="w-1 h-1 bg-primary/20" />
                                    <span>{new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                
                                <div className="space-y-8">
                                    <h2 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter group-hover:text-primary transition-colors leading-[0.9]">
                                        <Link href={`/journal/${entry.id}`}>{entry.title}</Link>
                                    </h2>
                                    
                                    <p className="text-xl text-muted-foreground/80 font-light leading-relaxed max-w-2xl italic">
                                        “{entry.excerpt}”
                                    </p>
                                </div>

                                <div className="flex items-center gap-8 pt-6 border-t border-border/5">
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-bold tracking-[0.4em] uppercase opacity-30">Author</div>
                                        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-foreground">{entry.author || 'Anonymous'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-bold tracking-[0.4em] uppercase opacity-30">Reading Duration</div>
                                        <span className="text-muted-foreground text-xs italic">{entry.readTime || '5 min read'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="md:col-span-5 flex flex-col gap-10">
                                <div className="relative aspect-[4/3] w-full bg-secondary/10 border border-border/10 overflow-hidden group/image">
                                    {entry.imageUrl ? (
                                        <Image
                                            src={entry.imageUrl}
                                            alt={entry.title}
                                            fill
                                            className="object-cover grayscale group-hover/image:scale-105 transition-all duration-1000"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center italic text-muted-foreground/30 text-[10px] font-bold tracking-[0.3em] uppercase">
                                            No Process Media
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <Link href={`/journal/${entry.id}`} className="group/btn flex items-center gap-6 text-[10px] font-bold tracking-[0.4em] uppercase text-primary/60 hover:text-primary transition-all">
                                        READ RECORD <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-3 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="py-48 text-center bg-secondary/5 space-y-12">
                <div className="space-y-6">
                    <h3 className="font-serif text-5xl md:text-6xl tracking-tighter leading-none">{t('share_craft')}</h3>
                    <p className="text-muted-foreground text-xl font-light italic max-w-xl mx-auto opacity-60">
                        “Artisans and curators are encouraged to submit their process documentation. Help us build the legacy of human craft.”
                    </p>
                </div>
                <div className="flex justify-center">
                    <Link href="/collaborate">
                        <Button size="lg" className="px-16">
                            APPLY TO DOCUMENT YOUR PROCESS
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

