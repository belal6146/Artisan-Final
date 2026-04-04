"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, DollarSign, RefreshCcw, Briefcase, ArrowRight } from "lucide-react";
import { getCollaborations, applyToCollaboration } from "@/backend/actions/collaboration";
import { Collaboration } from "@/types/schema";
import { useAuth } from "@/frontend/contexts/AuthContext";
import { logger } from "@/backend/lib/logger";

export default function CollaboratePage() {
    const { user } = useAuth();
    const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
    const [loading, setLoading] = useState(true);
    const [applyingId, setApplyingId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await getCollaborations();
                setCollaborations(data);
                logger.info('COLLAB_FETCH_SUCCESS', { count: data.length, source: 'frontend' });
            } catch (error: any) {
                logger.error('SYSTEM_ERROR', { error: error.message, source: 'frontend' });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleConnect = async (collab: Collaboration) => {
        if (!user) {
            logger.warn('PERMISSION_DENIED', { message: "Auth required for collab", source: 'frontend' });
            return;
        }
        
        setApplyingId(collab.id);
        try {
            await applyToCollaboration({
                collaborationId: collab.id,
                userId: user.uid,
                userName: user.displayName || "A fellow Artisan",
                message: "Interested in this collaboration opportunity."
            });
            logger.info('COLLAB_INTEREST_SUCCESS', { 
                collabId: collab.id, 
                authorId: collab.authorId, 
                applicantId: user.uid,
                source: 'frontend' 
            });
        } catch (e: any) {
            logger.error('SYSTEM_ERROR', { error: e.message, source: 'frontend' });
        } finally {
            setApplyingId(null);
        }
    };

    return (
        <div className="container py-24 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 border-l-2 border-primary/10 pl-8 pb-4">
                <div className="space-y-6 max-w-2xl">
                    <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter">
                        Calls for collaboration
                    </h1>
                    <p className="text-xl text-muted-foreground font-light italic leading-relaxed">
                        Artists and makers seeking collaboration, mentorship, or shared work.
                        Each listing is posted by a real person with a specific need.
                    </p>
                </div>
                <Button size="lg" className="h-16 px-12 rounded-none bg-primary text-[11px] font-bold tracking-[0.2em] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all" asChild>
                    <Link href="/collaborate/create">POST A CALL</Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 text-muted-foreground animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 opacity-20" />
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase">Searching Opportunities</p>
                </div>
            ) : collaborations.length === 0 ? (
                <div className="text-center py-40 border border-dashed border-border/20">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-6 opacity-20" />
                    <h3 className="font-serif text-2xl italic text-muted-foreground">No open calls at this time.</h3>
                    <p className="text-sm text-muted-foreground/50 mt-2 mb-8 font-light">Be the first to post a call for collaboration.</p>
                    <Link href="/collaborate/create">
                        <Button variant="outline" className="h-14 px-10 rounded-none text-[11px] font-bold tracking-[0.3em] uppercase">Post a call</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {collaborations.map((collab) => (
                        <div key={collab.id} className="group border border-border/10 rounded-none overflow-hidden transition-all duration-700 hover:bg-secondary/5">
                            <div className="p-10 space-y-8 h-full flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/60 border border-primary/10 px-3 py-1">
                                            {collab.type}
                                        </div>
                                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-30">
                                            {new Date(collab.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-2xl md:text-3xl font-medium leading-tight group-hover:text-primary transition-colors cursor-pointer">
                                        <Link href={`/collaborate/${collab.id}`}>{collab.title}</Link>
                                    </h3>

                                    <p className="text-muted-foreground font-light leading-relaxed line-clamp-4 italic">
                                        {collab.description}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="w-full space-y-4 pt-8 border-t border-border/10">
                                        <div className="flex items-center gap-4 text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>{collab.location} ({collab.locationType})</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground">
                                            {collab.compensation.type === 'Money' ? (
                                                <DollarSign className="h-3.5 w-3.5" />
                                            ) : (
                                                <RefreshCcw className="h-3.5 w-3.5" />
                                            )}
                                            <span>
                                                {collab.compensation.type === 'Money'
                                                    ? `${collab.compensation.currency} ${collab.compensation.amount}`
                                                    : collab.compensation.type === 'Exchange'
                                                        ? 'Skill exchange'
                                                        : 'Unpaid / pro bono'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-secondary/20 border border-border/10 overflow-hidden shrink-0">
                                                {collab.authorAvatarUrl ? (
                                                    <img src={collab.authorAvatarUrl} alt={collab.authorName} className="h-full w-full object-cover grayscale" />
                                                ) : (
                                                    <div className="h-full w-full bg-primary/5 flex items-center justify-center text-[10px] font-bold text-primary/40 uppercase">
                                                        {collab.authorName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{collab.authorName}</p>
                                                <p className="text-[9px] font-bold tracking-widest text-primary/30 uppercase">Initiator</p>
                                            </div>
                                        </div>
                                        
                                        <Link href={`/collaborate/${collab.id}`}>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="hover:bg-primary/5 text-[9px] font-bold tracking-[0.3em] uppercase group/btn"
                                            >
                                                DETAILS <ArrowRight className="ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
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
