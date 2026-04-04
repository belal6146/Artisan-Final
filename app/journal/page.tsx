"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getGlobalJournalEntries, JournalEntry } from "@/backend/actions/journal";
import { useAuth } from "@/contexts/AuthContext";

function previewText(entry: JournalEntry): string {
    const raw = entry.excerpt?.replace(/\.\.\.$/, "").trim() || entry.content?.trim() || "";
    if (raw.length <= 200) return raw;
    return raw.slice(0, 200).trimEnd() + "…";
}

export default function JournalPage() {
    const { user } = useAuth();
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

    const writeHref = user ? `/profile/${user.uid}?tab=journal` : "/auth?redirect=/journal";

    return (
        <div className="container max-w-3xl py-16 md:py-20 space-y-14">
            <header className="space-y-3">
                <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight">Journal</h1>
                <p className="text-muted-foreground leading-relaxed">
                    Notes from people who use the site. Nothing here is edited or ranked by the platform.
                </p>
            </header>

            {loading ? (
                <div className="flex items-center gap-3 py-16 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin opacity-40" />
                    Loading…
                </div>
            ) : entries.length === 0 ? (
                <div className="space-y-6 py-12 border-t border-border/15">
                    <p className="text-muted-foreground leading-relaxed">
                        No public entries yet. Journal posts are added from your profile (Journal tab) when you are signed in.
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                        <Link href={writeHref} className="underline underline-offset-4 hover:text-foreground text-muted-foreground">
                            {user ? "Write from your profile" : "Sign in to write"}
                        </Link>
                        <span className="text-muted-foreground/40">·</span>
                        <Link href="/explore" className="underline underline-offset-4 hover:text-foreground text-muted-foreground">
                            Browse work
                        </Link>
                    </div>
                </div>
            ) : (
                <ul className="space-y-12 border-t border-border/15 pt-10">
                    {entries.map((entry) => (
                        <li
                            key={entry.id}
                            className={`grid gap-8 pb-12 border-b border-border/10 last:border-0 ${
                                entry.imageUrl ? "md:grid-cols-5 md:gap-10" : ""
                            }`}
                        >
                            <div className={entry.imageUrl ? "md:col-span-3" : ""}>
                                <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(entry.createdAt).toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                        {entry.category ? ` · ${entry.category}` : ""}
                                    </p>
                                    <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight">
                                        <Link href={`/journal/${entry.id}`} className="hover:underline underline-offset-4">
                                            {entry.title}
                                        </Link>
                                    </h2>
                                    {previewText(entry) && (
                                        <p className="text-muted-foreground leading-relaxed text-[15px]">{previewText(entry)}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">{entry.author || "Author not listed"}</p>
                                </div>
                            </div>
                            {entry.imageUrl ? (
                                <div className="md:col-span-2">
                                    <div className="relative aspect-[4/3] w-full bg-muted/20 overflow-hidden">
                                        <Image
                                            src={entry.imageUrl}
                                            alt=""
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 240px"
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}

            {entries.length > 0 && (
                <p className="text-sm text-muted-foreground pt-4 border-t border-border/15">
                    <Link href={writeHref} className="underline underline-offset-4 hover:text-foreground">
                        Add a post from your profile
                    </Link>
                </p>
            )}
        </div>
    );
}

