import { getCollaborations } from "@/backend/actions/collaboration";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, RefreshCcw, Briefcase, ArrowRight, Leaf } from "lucide-react";
import { fonts } from "@/frontend/lib/utils";

export default async function CollaboratePage() {
    // 1. Fetch data on the server
    const collaborationsRaw = await getCollaborations();
    const toPlain = (obj: any) => JSON.parse(JSON.stringify(obj));
    const collaborations = toPlain(collaborationsRaw);

    return (
        <div className="container py-12 lg:py-24 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 lg:gap-12 mb-12 lg:mb-20 border-l-2 border-primary/20 pl-8 lg:pl-12 pb-4">
                <div className="space-y-6 max-w-2xl">
                    <h1 className={`${fonts.display} text-5xl sm:text-7xl lg:text-[8rem] font-medium tracking-tighter leading-[0.8]`}>Collective</h1>
                    <p className="text-xl lg:text-2xl text-muted-foreground font-light italic leading-relaxed opacity-60 text-pretty">A sanctuary for shared work, ancestral mentorship, and the exchange of human labor.</p>
                </div>
                <Button size="lg" variant="outline" className="h-14 lg:h-16 px-10 lg:px-12 w-full sm:w-auto rounded-none text-[11px] font-bold tracking-[0.4em] uppercase border-border/20 group button-artisan" asChild>
                    <Link href="/collaborate/create">
                        ANNOUNCE MISSION <ArrowRight className="ml-3 h-3 w-3 group-hover:translate-x-1 duration-500" />
                    </Link>
                </Button>
            </div>

            {collaborations.length === 0 ? (
                <div className="text-center py-40 border-t border-border/10 flex flex-col items-center justify-center space-y-12">
                    <Briefcase className="h-10 w-10 mx-auto text-muted-foreground/20 opacity-20" />
                    <p className="font-serif text-3xl md:text-4xl tracking-tight text-muted-foreground/30 font-light italic">No missions have been announced yet.</p>
                    <Link href="/collaborate/create" className="text-[11px] font-bold tracking-[0.5em] uppercase text-muted-foreground hover:text-foreground transition-all border-b border-border/20 pb-1">
                        DECLARE MISSION
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-20">
                    {collaborations.map((collab: any) => (
                        <div key={collab.id} className="group border border-border/5 rounded-none overflow-hidden transition-all duration-700 hover:bg-secondary/20 h-full flex flex-col">
                            <div className="p-10 space-y-10 flex-1 flex flex-col justify-between">
                                <div className="space-y-8">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="text-[11px] font-bold tracking-[0.4em] uppercase text-primary/40 border border-primary/10 px-4 py-1.5 italic">
                                            {collab.type}
                                        </div>
                                        <span className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-20">
                                            {new Date(collab.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className={`${fonts.display} text-3xl md:text-4xl font-medium tracking-tight leading-none group-hover:text-primary transition-colors`}>
                                        <Link href={`/collaborate/${collab.id}`}>{collab.title}</Link>
                                    </h3>

                                    <p className="text-lg text-muted-foreground font-light leading-relaxed line-clamp-4 italic text-prose">
                                        {collab.description}
                                    </p>
                                </div>

                                <div className="space-y-10">
                                    <div className="w-full space-y-5 pt-10 border-t border-border/5">
                                        <div className="flex items-center gap-5 text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
                                            <MapPin className="h-4 w-4 opacity-40 shrink-0" />
                                            <span>{collab.location} ({collab.locationType})</span>
                                        </div>
                                        <div className="flex items-center gap-5 text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
                                            {collab.compensation.type === 'Money' ? (
                                                <Leaf className="h-4 w-4 opacity-40 shrink-0" />
                                            ) : (
                                                <RefreshCcw className="h-4 w-4 opacity-40 shrink-0" />
                                            )}
                                            <span>
                                                {collab.compensation.type === 'Money'
                                                    ? `${collab.compensation.currency} ${collab.compensation.amount}`
                                                    : collab.compensation.type === 'Exchange'
                                                        ? 'Skill exchange offered'
                                                        : 'Hand to hand / pro bono'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-border/5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-full border border-primary/5 overflow-hidden shrink-0 grayscale transition-all duration-1000 group-hover:grayscale-0 ring-1 ring-primary/5 p-1">
                                                <div className="w-full h-full rounded-full overflow-hidden bg-muted/20">
                                                    {collab.authorAvatarUrl ? (
                                                        <img src={collab.authorAvatarUrl} alt={collab.authorName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full bg-primary/5 flex items-center justify-center text-[13px] font-serif uppercase tracking-widest text-primary/40">
                                                            {collab.authorName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-foreground leading-none mb-2">{collab.authorName}</p>
                                                <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-primary/40 leading-none italic">Guardian of the Task</p>
                                            </div>
                                        </div>
                                        
                                        <Link href={`/collaborate/${collab.id}`} className="group/link flex items-center gap-2 text-[11px] font-bold tracking-[0.4em] uppercase text-primary/30 hover:text-primary transition-colors">
                                            VIEW CALL <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 duration-300" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
