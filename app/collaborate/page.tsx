import { getCollaborations } from "@/backend/actions/collaboration";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, RefreshCcw, Briefcase, ArrowRight } from "lucide-react";

export default async function CollaboratePage() {
    // 1. Fetch data on the server
    const collaborationsRaw = await getCollaborations();
    const toPlain = (obj: any) => JSON.parse(JSON.stringify(obj));
    const collaborations = toPlain(collaborationsRaw);

    return (
        <div className="container py-12 md:py-24 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 mb-20 border-l-2 border-primary/20 pl-12 pb-4">
                <div className="space-y-6 max-w-2xl">
                    <h1 className="font-serif text-6xl md:text-[8rem] font-medium tracking-tighter leading-[0.8]">Collaborate</h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-light italic leading-relaxed opacity-60">Artists and makers seeking mentorship, shared work, or exchange.</p>
                </div>
                <Button size="lg" variant="outline" className="h-16 px-12 rounded-none text-[10px] font-bold tracking-[0.3em] uppercase border-border/20 group" asChild>
                    <Link href="/collaborate/create">
                        Broadcast Call <ArrowRight className="ml-3 h-3 w-3 group-hover:translate-x-1 duration-500" />
                    </Link>
                </Button>
            </div>

            {collaborations.length === 0 ? (
                <div className="text-center py-40 border-t border-border/10 flex flex-col items-center justify-center space-y-12">
                    <Briefcase className="h-10 w-10 mx-auto text-muted-foreground/20 opacity-20" />
                    <p className="font-serif text-3xl md:text-4xl tracking-tight text-muted-foreground/30 font-light italic">No calls have been initiated yet.</p>
                    <Link href="/collaborate/create" className="text-[10px] font-bold tracking-[0.5em] uppercase text-muted-foreground hover:text-foreground transition-all border-b border-border/20 pb-1">
                        DECLARE MISSION
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-20">
                    {collaborations.map((collab: any) => (
                        <div key={collab.id} className="group border border-border/10 rounded-none overflow-hidden transition-all duration-700 hover:bg-secondary/5 h-full flex flex-col">
                            <div className="p-10 space-y-10 flex-1 flex flex-col justify-between">
                                <div className="space-y-8">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40 border border-primary/10 px-4 py-1.5">
                                            {collab.type}
                                        </div>
                                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-20">
                                            {new Date(collab.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-3xl md:text-4xl font-medium tracking-tight leading-none group-hover:text-primary transition-colors">
                                        <Link href={`/collaborate/${collab.id}`}>{collab.title}</Link>
                                    </h3>

                                    <p className="text-lg text-muted-foreground font-light leading-relaxed line-clamp-4 italic">
                                        {collab.description}
                                    </p>
                                </div>

                                <div className="space-y-10">
                                    <div className="w-full space-y-5 pt-10 border-t border-border/10">
                                        <div className="flex items-center gap-5 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
                                            <MapPin className="h-4 w-4 opacity-40 shrink-0" />
                                            <span>{collab.location} ({collab.locationType})</span>
                                        </div>
                                        <div className="flex items-center gap-5 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
                                            {collab.compensation.type === 'Money' ? (
                                                <DollarSign className="h-4 w-4 opacity-40 shrink-0" />
                                            ) : (
                                                <RefreshCcw className="h-4 w-4 opacity-40 shrink-0" />
                                            )}
                                            <span>
                                                {collab.compensation.type === 'Money'
                                                    ? `${collab.compensation.currency} ${collab.compensation.amount}`
                                                    : collab.compensation.type === 'Exchange'
                                                        ? 'Skill exchange offered'
                                                        : 'Unpaid / pro bono'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-border/5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-muted/20 border border-border/10 overflow-hidden shrink-0 grayscale transition-all duration-1000 group-hover:grayscale-0">
                                                {collab.authorAvatarUrl ? (
                                                    <img src={collab.authorAvatarUrl} alt={collab.authorName} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full bg-primary/5 flex items-center justify-center text-[11px] font-serif uppercase tracking-widest">
                                                        {collab.authorName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-muted-foreground leading-none mb-1.5">{collab.authorName}</p>
                                                <p className="text-[8px] font-bold tracking-[0.3em] uppercase text-primary/30 leading-none">Initiator</p>
                                            </div>
                                        </div>
                                        
                                        <Link href={`/collaborate/${collab.id}`} className="text-[9px] font-bold tracking-[0.4em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-border/20 pb-0.5">
                                            Details
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
