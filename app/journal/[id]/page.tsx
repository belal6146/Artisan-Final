"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Loader2, BookOpen } from "lucide-react";
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
                    <h1 className="font-serif text-4xl tracking-tight">Entry not found.</h1>
                    <p className="text-muted-foreground font-light">This journal entry does not exist or was removed.</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()}>
                    Back
                </Button>
            </div>
        );
    }

    return (
        <article className="container max-w-2xl py-12 md:py-16 pb-24">
            <div className="flex flex-wrap items-center gap-4 mb-10 text-sm text-muted-foreground">
                <Button variant="ghost" size="sm" className="h-8 px-0 -ml-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <span>·</span>
                <Link href="/journal" className="hover:text-foreground underline-offset-4 hover:underline">
                    All journal
                </Link>
            </div>

            <header className="space-y-4 mb-10">
                <p className="text-sm text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    })}
                    {entry.category ? ` · ${entry.category}` : ""}
                </p>
                <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight leading-tight">
                    {entry.title}
                </h1>
                <p className="text-sm text-muted-foreground">{entry.author || "Author not listed"}</p>
            </header>

            {entry.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden bg-muted/20 mb-10">
                    <Image src={entry.imageUrl} alt="" fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 42rem" />
                </div>
            )}

            <div className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">{entry.content}</div>

            <footer className="mt-16 pt-10 border-t border-border/15">
                <Link href="/journal" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                    ← Journal
                </Link>
            </footer>
        </article>
    );
}
