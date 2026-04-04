"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
    Loader2, 
    MapPin, 
    DollarSign, 
    RefreshCcw, 
    Briefcase, 
    ArrowLeft, 
    User, 
    Send,
    MessageSquare,
    Globe,
    Calendar,
    Clock
} from "lucide-react";
import { getCollaborationById, applyToCollaboration, getApplicationsByCollabId } from "@/backend/actions/collaboration";
import { Collaboration, CollaborationApplication } from "@/types/schema";
import { useAuth } from "@/frontend/contexts/AuthContext";
import { logger } from "@/backend/lib/logger";

export default function CollaborationDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    
    const [collab, setCollab] = useState<Collaboration | null>(null);
    const [applications, setApplications] = useState<CollaborationApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const isOwner = user?.uid === collab?.authorId;

    useEffect(() => {
        async function load() {
            if (!id) return;
            try {
                const data = await getCollaborationById(id as string);
                if (!data) throw new Error("Collaboration not found");
                setCollab(data);
                
                // If owner, fetch applications
                if (user?.uid === data.authorId) {
                    const apps = await getApplicationsByCollabId(id as string);
                    setApplications(apps);
                }
                
                // Using valid logger event or skipping read logging based on recent pass output
                // logger.info('COLLAB_FETCH_SUCCESS', { collabId: id, source: 'frontend' });
            } catch (error: any) {
                logger.error('SYSTEM_ERROR', { error: error.message, source: 'frontend' });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, user]);

    const handleApply = async () => {
        if (!user || !collab) return;
        setApplying(true);
        setStatus("idle");
        try {
            await applyToCollaboration({
                collaborationId: collab.id,
                userId: user.uid,
                userName: user.displayName || "Anonymous Artisan",
                message: message || "I am interested in this collaboration opportunity."
            });
            logger.info('COLLAB_INTEREST_SUCCESS', { 
                collabId: collab.id, 
                authorId: collab.authorId, 
                applicantId: user.uid,
                source: 'frontend' 
            });
            setStatus("success");
            setMessage("");
        } catch (e: any) {
            logger.error('SYSTEM_ERROR', { error: e.message, source: 'frontend' });
            setStatus("error");
        } finally {
            setApplying(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground opacity-20" />
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Connecting to Network</p>
        </div>
    );

    if (!collab) return (
        <div className="container py-40 text-center space-y-6">
            <h1 className="font-serif text-4xl">Collaboration not found.</h1>
            <Button variant="outline" asChild>
                <Link href="/collaborate">Return to Opportunities</Link>
            </Button>
        </div>
    );

    return (
        <div className="container py-24 px-6 max-w-7xl animate-in fade-in duration-1000">
            <Button variant="ghost" className="h-10 px-0 hover:bg-transparent hover:text-primary text-[10px] font-bold tracking-widest uppercase transition-all mb-12 group" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Opportunities
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                {/* Left Side: Detail & Content */}
                <div className="lg:col-span-8 space-y-16">
                    <div className="space-y-8 border-l-2 border-primary/20 pl-8">
                        <div className="flex flex-wrap gap-4">
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-primary/5 text-primary/60 px-3 py-1">
                                {collab.type} CALL
                            </span>
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-emerald-500/5 text-emerald-600 px-3 py-1">
                                {collab.status}
                            </span>
                        </div>
                        <h1 className="font-serif text-5xl md:text-8xl font-medium tracking-tighter leading-none">
                            {collab.title}
                        </h1>
                        <div className="flex items-center gap-4 text-muted-foreground pt-4">
                            <div className="h-12 w-12 rounded-full bg-secondary/20 overflow-hidden shrink-0 border border-border/10">
                                {collab.authorAvatarUrl ? (
                                    <img src={collab.authorAvatarUrl} alt={collab.authorName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {collab.authorName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">Initialised by {collab.authorName}</p>
                                <p className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-40">Collective Leader</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-16">
                        <div className="prose prose-zinc lg:prose-xl max-w-none">
                            <p className="text-2xl text-muted-foreground/90 font-light leading-relaxed italic">
                                “{collab.description}”
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-border/10">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40 flex items-center gap-3">
                                    <Globe className="h-4 w-4" /> Strategic Context
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between border-b border-border/5 pb-2">
                                        <span className="text-muted-foreground/60">Registry</span>
                                        <span className="font-medium">{collab.location}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/5 pb-2">
                                        <span className="text-muted-foreground/60">Presence</span>
                                        <span className="font-medium underline decoration-primary/20 underline-offset-4">{collab.locationType}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/5 pb-2">
                                        <span className="text-muted-foreground/60">Chronology</span>
                                        <span className="font-medium">Continuous Deployment</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40 flex items-center gap-3">
                                    <DollarSign className="h-4 w-4" /> Reciprocity Model
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between border-b border-border/5 pb-2">
                                        <span className="text-muted-foreground/60">Paradigm</span>
                                        <span className="font-medium">{collab.compensation.type}</span>
                                    </div>
                                    {collab.compensation.type === 'Money' && (
                                        <div className="flex justify-between border-b border-border/5 pb-2">
                                            <span className="text-muted-foreground/60">Economic Allocation</span>
                                            <span className="font-medium">{collab.compensation.currency} {collab.compensation.amount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-b border-border/5 pb-2">
                                        <span className="text-muted-foreground/60">Direct Value</span>
                                        <span className="font-medium text-xs max-w-[200px] text-right truncate" title={collab.compensation.details}>
                                            {collab.compensation.details || "Artisan Equity"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Actions & Applications */}
                <div className="lg:col-span-4 space-y-8">
                    {!isOwner ? (
                        <div className="bg-secondary/5 border border-border/10 p-10 space-y-10 sticky top-24 group/sidebar">
                            <div className="space-y-6">
                                <h3 className="font-serif text-3xl font-medium tracking-tight">Express Interest</h3>
                                <p className="text-sm text-muted-foreground italic leading-relaxed font-light">
                                    Synchronise with {collab.authorName} to explore this collective act. Your credentials will be attached.
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Proposal Narrative</label>
                                <Textarea 
                                    className="bg-background"
                                    placeholder="Explain why you're the right fit for this collective act..."
                                    value={message}
                                    onChange={(e: any) => setMessage(e.target.value)}
                                />
                            </div>

                            <Button 
                                className="w-full shadow-2xl"
                                onClick={handleApply}
                                disabled={applying || status === 'success'}
                            >
                                {applying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                {status === 'success' ? "RELAY SUCCESSFUL" : "INITIATE CALL"}
                            </Button>

                            {status === 'success' && (
                                <p className="text-center text-[10px] font-bold text-emerald-600 tracking-[0.3em] uppercase animate-in slide-in-from-top-2">
                                    Relay acknowledged. Review pending.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-zinc-900 border border-zinc-800 p-10 space-y-12 sticky top-24">
                            <div className="space-y-6">
                                <h3 className="font-serif text-3xl font-medium text-white leading-none">Dashboard</h3>
                                <p className="text-zinc-600 text-[10px] uppercase tracking-[0.4em] font-bold">Registry Management</p>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-8">
                                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-700 border-b border-zinc-800/50 pb-4 flex justify-between">
                                        Received Signals <span>({applications.length})</span>
                                    </h4>
                                    
                                    <div className="space-y-6">
                                        {applications.map((app) => (
                                            <div key={app.id} className="p-8 bg-zinc-800/30 border border-zinc-800/50 group hover:border-zinc-700 transition-all space-y-6">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <p className="font-serif text-lg text-zinc-100">{app.userName}</p>
                                                        <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Artisan Applicant</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-zinc-400 italic leading-relaxed line-clamp-3 font-light">
                                                    “{app.message}”
                                                </p>
                                                <Button variant="outline" size="sm" className="w-full text-zinc-100 border-zinc-800 hover:bg-white hover:text-black shadow-none transition-all h-14">
                                                    SYNCHRONISE
                                                </Button>
                                            </div>
                                        ))}

                                        {applications.length === 0 && (
                                            <div className="py-16 text-center space-y-6 opacity-30">
                                                <Clock className="h-8 w-8 mx-auto text-zinc-600" />
                                                <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-zinc-600">Pending signals</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-zinc-800/50">
                                    <Button variant="ghost" className="w-full text-zinc-700 hover:text-red-400 hover:bg-red-400/5 h-12 text-[10px]">
                                        ARCHIVE CALL
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
