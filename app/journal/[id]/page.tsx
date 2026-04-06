import { getJournalEntryById } from "@/backend/actions/journal";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function JournalEntryPage({ params }: PageProps) {
    const { id } = await params;
    const entry = await getJournalEntryById(id);
    
    if (!entry) notFound();

    return (
        <article className="container max-w-2xl py-12 md:py-24 pb-32 animate-in fade-in duration-1000">
            <Link href="/journal" className="text-[10px] font-bold tracking-[0.4em] uppercase text-muted-foreground hover:text-foreground mb-16 flex items-center group">
                <ChevronLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" /> Journal
            </Link>

            <header className="space-y-6 mb-16 border-l-2 border-primary/10 pl-8">
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary/40">
                    {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    })}
                    {entry.category ? ` · ${entry.category}` : ""}
                </p>
                <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight leading-none text-balance">
                    {entry.title}
                </h1>
                <p className="text-sm font-medium opacity-40 uppercase tracking-[0.3em]">{entry.author || "Anonymous Chronicle"}</p>
            </header>

            {entry.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden bg-muted/20 mb-20 ring-1 ring-border/5">
                    <Image 
                        src={entry.imageUrl} 
                        alt="" 
                        fill 
                        className="object-cover grayscale-0" 
                        priority 
                        sizes="(max-width: 768px) 100vw, 42rem" 
                    />
                </div>
            )}

            <div className="text-xl md:text-2xl leading-relaxed text-foreground/90 font-light italic whitespace-pre-wrap selection:bg-primary/10 mb-24">
                {entry.content}
            </div>

            <footer className="mt-24 pt-12 border-t border-border/10">
                <Link href="/journal" className="text-[10px] font-bold tracking-[0.5em] uppercase text-muted-foreground hover:text-foreground underline underline-offset-8 decoration-1 decoration-primary/20 transition-all">
                    ← Return to Chronicles
                </Link>
            </footer>
        </article>
    );
}
