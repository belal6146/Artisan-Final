"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, DollarSign, RefreshCcw, Briefcase } from "lucide-react";
import { getCollaborations } from "@/backend/actions/collaboration";
import { Collaboration } from "@/types/schema";

export default function CollaboratePage() {
    const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getCollaborations();
                setCollaborations(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="container py-24 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 border-l-2 border-primary/10 pl-8 pb-4">
                <div className="space-y-6 max-w-2xl">
                    <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter">
                        Opportunities
                    </h1>
                    <p className="text-xl text-muted-foreground font-light italic leading-relaxed">
                        Discover collaborations, mentorships, and collective building. 
                        Find your next project partner or share your expertise.
                    </p>
                </div>
                <Button size="lg" className="h-16 px-12 rounded-none bg-primary text-[11px] font-bold tracking-[0.2em] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all" asChild>
                    <Link href="/collaborate/create">POST OPPORTUNITY</Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : collaborations.length === 0 ? (
                <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-border/50">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">No opportunities yet</h3>
                    <p className="text-muted-foreground mb-6">Be the first to post a collaboration request.</p>
                    <Button variant="outline" asChild>
                        <Link href="/collaborate/create">Create Post</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {collaborations.map((collab) => (
                        <div key={collab.id} className="group relative bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col items-start p-6">
                            <div className="flex justify-between items-start w-full mb-4">
                                <Badge variant="secondary" className="font-medium">
                                    {collab.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                                    {new Date(collab.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="font-serif text-xl font-medium mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                {collab.title}
                            </h3>

                            <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">
                                {collab.description}
                            </p>

                            <div className="w-full space-y-3 pt-4 border-t border-border/50">
                                <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{collab.location} ({collab.locationType})</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    {collab.compensation.type === 'Money' ? (
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <RefreshCcw className="h-4 w-4 text-blue-600" />
                                    )}
                                    <span className="font-medium">
                                        {collab.compensation.type === 'Money'
                                            ? `${collab.compensation.currency} ${collab.compensation.amount}`
                                            : collab.compensation.type === 'Exchange'
                                                ? 'Skill Exchange'
                                                : 'Unpaid / Volunteer'}
                                    </span>
                                </div>
                                {collab.compensation.details && (
                                    <p className="text-xs text-muted-foreground pl-6">
                                        Includes: {collab.compensation.details}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 flex items-center gap-3 w-full">
                                <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden">
                                    {/* Avatar placeholder if no image */}
                                    {collab.authorAvatarUrl ? (
                                        <img src={collab.authorAvatarUrl} alt={collab.authorName} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                            {collab.authorName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">
                                    By {collab.authorName}
                                </span>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="ml-auto hover:bg-primary/10 hover:text-primary"
                                    onClick={() => alert(`Connection request sent to ${collab.authorName}! They will be notified via their registered email.`)}
                                >
                                    Connect
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
