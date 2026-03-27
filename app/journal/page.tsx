"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ENTRIES = [
    {
        id: '1',
        title: "The Indigo Weaver's Morning",
        excerpt: "Exploring the traditional vats of central India and the chemistry of organic indigo.",
        date: "March 20, 2026",
        readTime: "6 min read",
        category: "Technique",
        author: "Amina Shah"
    },
    {
        id: '2',
        title: "Symmetry in Chaos",
        excerpt: "A look at the mathematical underpinnings of geometric stone carving.",
        date: "March 15, 2026",
        readTime: "12 min read",
        category: "Theory",
        author: "Marco Rossi"
    },
    {
        id: '3',
        title: "Preserving the Silent Studio",
        excerpt: "Why we focus on low-noise environments for traditional craftsmanship.",
        date: "March 10, 2026",
        readTime: "4 min read",
        category: "Mission",
        author: "Platform Team"
    }
];

export default function JournalPage() {
    return (
        <div className="container py-24 space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 border-l-2 border-primary/10 pl-8 pb-4">
                <div className="space-y-6 max-w-2xl">
                    <h1 className="font-serif text-5xl md:text-8xl font-medium tracking-tighter">
                        The Journal
                    </h1>
                    <p className="text-xl text-muted-foreground font-light italic leading-relaxed">
                        Documenting the stories, techniques, and philosophy behind the global artisan network. 
                    </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] uppercase text-primary/60">
                    <BookOpen className="h-4 w-4" /> PROCESS & THEORY
                </div>
            </div>

            <div className="grid gap-20">
                {ENTRIES.map((entry) => (
                    <div key={entry.id} className="group grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-border/10 pb-20 last:border-0">
                        <div className="md:col-span-8 space-y-8">
                            <div className="flex gap-8 items-center text-[10px] font-bold tracking-[0.2em] uppercase text-primary/40">
                                <span>{entry.category}</span>
                                <span className="w-1 h-1 bg-primary/20 rounded-full" />
                                <span>{entry.date}</span>
                            </div>
                            
                            <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight group-hover:text-primary transition-colors cursor-pointer leading-tight">
                                <Link href={`/journal/${entry.id}`}>{entry.title}</Link>
                            </h2>
                            
                            <p className="text-lg text-muted-foreground/70 font-light leading-relaxed max-w-2xl">
                                {entry.excerpt}
                            </p>

                            <div className="flex items-center gap-6 pt-4">
                                <span className="text-[11px] font-bold tracking-[0.1em] uppercase">{entry.author}</span>
                                <span className="text-muted-foreground/30 text-xs italic">{entry.readTime}</span>
                            </div>
                        </div>
                        
                        <div className="md:col-span-4 flex items-end justify-end">
                            <Link href={`/journal/${entry.id}`} className="group/btn flex items-center gap-4 text-[11px] font-bold tracking-[0.3em] uppercase text-primary/80 hover:text-primary transition-all">
                                READ STORY <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-24 pb-12 text-center border-t border-slate-100 max-w-xl mx-auto space-y-6">
                <h3 className="font-serif text-2xl">Want to contribute?</h3>
                <p className="text-muted-foreground">
                    Artisans and curators can submit their process documentation for publication.
                    Help us build the documentation of the human.
                </p>
                <div className="flex justify-center">
                    <Link href="/collaborate">
                        <Button className="h-16 px-12 rounded-none bg-primary text-[11px] font-bold tracking-[0.3em] uppercase">
                            APPLY TO DOCUMENT YOUR CRAFT
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
