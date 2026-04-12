import { getGlobalJournalEntries, JournalEntry } from "@/backend/actions/journal";
import Link from "next/link";
import Image from "next/image";
import { JournalWriteLink } from "@/frontend/components/journal/JournalWriteLink";

function previewText(entry: JournalEntry): string {
    const raw = entry.excerpt?.replace(/\.\.\.$/, "").trim() || entry.content?.trim() || "";
    if (raw.length <= 200) return raw;
    return raw.slice(0, 200).trimEnd() + "…";
}

export default async function JournalPage() {
    // 1. Fetch entries on the server
    const entries = await getGlobalJournalEntries();
    const toPlain = (obj: any) => JSON.parse(JSON.stringify(obj));

    return (
        <div className="container py-24 space-y-24 animate-in fade-in duration-700 pb-40">
            <div className="flex flex-col md:flex-row items-baseline justify-between gap-12 border-l-2 border-primary/20 pl-16 pb-12">
                <div className="space-y-8 max-w-3xl">
                    <h1 className="font-serif text-8xl md:text-[10rem] font-medium tracking-tighter leading-none">
                        Chronicles
                    </h1>
                    <p className="text-2xl md:text-3xl text-muted-foreground font-light italic leading-relaxed opacity-60">
                        Observations from our collective. Raw, unedited, and decentralized.
                    </p>
                </div>
            </div>

            {entries.length === 0 ? (
                <div className="space-y-6 py-12 border-t border-border/10">
                    <p className="text-muted-foreground leading-relaxed italic">
                        No public entries yet. Chronicles are added from your profile.
                    </p>
                    <JournalWriteLink />
                </div>
            ) : (
                <ul className="space-y-20 border-t border-border/10 pt-16">
                    {entries.map((entry) => (
                        <li key={entry.id} className="group grid gap-12 pb-20 border-b border-border/5 last:border-0 md:grid-cols-5 md:gap-16">
                            <div className={entry.imageUrl ? "md:col-span-3" : "md:col-span-5"}>
                                <div className="space-y-8">
                                    <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-primary/40 flex items-center gap-4">
                                        <span className="h-px w-8 bg-primary/20"></span>
                                        {new Date(entry.createdAt).toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                        {entry.category ? ` · ${entry.category}` : ""}
                                    </p>
                                    <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight leading-tight">
                                        <Link href={`/journal/${entry.id}`} className="hover:text-primary/70 transition-colors">
                                            {entry.title}
                                        </Link>
                                    </h2>
                                    {previewText(entry) && (
                                        <p className="text-muted-foreground leading-relaxed font-light italic text-xl max-w-2xl">{previewText(entry)}</p>
                                    )}
                                    <div className="pt-4 flex items-center gap-4">
                                        <div className="h-px w-4 bg-primary/10"></div>
                                        <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">{entry.author || "Anonymous Chronicle"}</p>
                                    </div>
                                </div>
                            </div>
                            {entry.imageUrl ? (
                                <div className="md:col-span-2">
                                    <div className="relative aspect-[4/3] w-full bg-muted/20 overflow-hidden ring-1 ring-border/5">
                                        <Image
                                            src={entry.imageUrl}
                                            alt=""
                                            fill
                                            className="object-cover grayscale transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                                            sizes="(max-width: 768px) 100vw, 320px"
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}

            {entries.length > 0 && <JournalWriteLink />}
        </div>
    );
}
