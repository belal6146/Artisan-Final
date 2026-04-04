"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types";
import { ArtworkCard } from "@/components/art/ArtworkCard";
import { cn } from "@/frontend/lib/utils";
import { Settings, Edit2, History, Grid, Loader2, Calendar, Heart, BookOpen, Check, ArrowRight, Users } from "lucide-react";
import { getEventsByOrganizer } from "@/backend/db/events";
import { collection, query, getDocs } from "firebase/firestore"; // Still needed for reading subcollection (Client Fetch)
import { db } from "@/backend/config/firebase";
import { ImageUpload } from "@/components/ui/image-upload";
import { ArtworkImageUpload } from "@/components/ui/artwork-image-upload";
import { logger } from "@/backend/lib/logger";
import { updateUserProfile } from "@/backend/actions/profile";
import { useLocale } from "@/frontend/contexts/LocaleContext";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ProfileProps {
    profile: any; // Using any for flexibility in this hybrid mock/real setup
    artworks: any[];
}

export function UserProfileClient({ profile, artworks }: ProfileProps) {
    const { user } = useAuth();
    const { t } = useLocale();
    const router = useRouter();
    const isOwnProfile = user?.uid === profile.uid || profile.uid === 'me'; // 'me' handling for dev

    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState(profile.bio || "Art enthusiast and collector.");
    const [location, setLocation] = useState(profile.location || "Global Citizen");
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || profile.photoURL || ""); // New state
    const [userArtworks, setUserArtworks] = useState<any[]>(artworks);
    const [attendingEvents, setAttendingEvents] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [userEvents, setUserEvents] = useState<any[]>([]); // Hosting
    const [userCollaborations, setUserCollaborations] = useState<any[]>([]); // NEW
    const [journalEntries, setJournalEntries] = useState<any[]>([]); // NEW: REAL JOURNAL DATA

    const refreshProfileData = async () => {
        if (!user) return;
        try {
            const targetUid = profile.uid === 'me' ? user.uid : profile.uid;
            logger.debug('ARTWORK_FETCH_SUCCESS', { message: "Refreshing profile", userId: targetUid, source: 'frontend' });

            // 1. Fetch Artworks
            const { getArtworksByArtist } = await import("@/backend/db/artworks");
            const freshArtworks = await getArtworksByArtist(targetUid);
            setUserArtworks(freshArtworks);

            // 2. Fetch Hosted Events
            const { getEventsByOrganizer } = await import("@/backend/db/events");
            const hosted = await getEventsByOrganizer(targetUid);
            setUserEvents(hosted);

            // 3. Fetch Registered/Attending Events
            const { getRSVPsByUser } = await import("@/backend/db/rsvps");
            const { getEventById } = await import("@/backend/db/events");
            const rsvps = await getRSVPsByUser(user.uid);
            const attending = await Promise.all(
                rsvps.map(r => getEventById(r.eventId))
            );
            setAttendingEvents(attending.filter(Boolean));

            // 4. Fetch Real Transactions (Buy/Sell)
            const q = query(collection(db, "users", user.uid, "transactions"));
            const snap = await getDocs(q);
            setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));

            // 5. Fetch Studio Journal
            const { getJournalEntries } = await import("@/backend/actions/journal");
            const entries = await getJournalEntries(targetUid);
            setJournalEntries(entries);

            // 6. Fetch Collaborations
            const { getCollaborationsByAuthorId } = await import("@/backend/actions/collaboration");
            const colabs = await getCollaborationsByAuthorId(targetUid);
            setUserCollaborations(colabs);

        } catch (e) {
            console.error("Failed to refresh profile data:", e);
        }
    };

    useEffect(() => {
        if (isOwnProfile && user) {
            refreshProfileData();
        }
    }, [isOwnProfile, user]);

    const totalSpent = transactions.reduce((acc, t) => acc + (t.type === 'buy' ? t.amount : 0), 0);
    const totalEarned = transactions.reduce((acc, t) => acc + (t.type === 'sell' ? t.amount : 0), 0);

    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isAddingArtwork, setIsAddingArtwork] = useState(false);
    const [isAddingJournal, setIsAddingJournal] = useState(false); // NEW
    
    // Unified Tab handling: URL parameter takes precedence
    const searchParams = useSearchParams();
    const queryTab = searchParams?.get('tab');
    const validTabs = ['collection', 'journal', 'events', 'collaborations', 'history'];
    const initialTab = (queryTab && validTabs.includes(queryTab)) ? queryTab as any : 'collection';

    const [activeTab, setActiveTab] = useState<'collection' | 'journal' | 'events' | 'collaborations' | 'history'>(initialTab);



    const [newArtwork, setNewArtwork] = useState({
        title: '',
        price: '',
        description: '',
        imageUrls: [] as string[],
        primaryImageIndex: 0,
        isForSale: true
    });
    const [newJournal, setNewJournal] = useState({ title: '', content: '', imageUrl: '' }); // NEW
    const [artworkStatus, setArtworkStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [journalStatus, setJournalStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle'); // NEW
    const [supporting, setSupporting] = useState(false);

    const handleSupport = async () => {
        if (!user) {
            router.push(`/auth?redirect=/profile/${profile.uid}`);
            return;
        }

        setSupporting(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                body: JSON.stringify({ itemId: profile.uid, type: 'support' }),
            });

            const { checkoutUrl } = await res.json();
            if (checkoutUrl) {
                logger.info('COMMERCE_CHECKOUT_STARTED', { userId: user.uid, itemId: profile.uid, source: 'frontend' });
                router.push(checkoutUrl);
            }
        } catch (e: any) {
            logger.error('COMMERCE_PAYMENT_FAILED', { userId: user.uid, error: e.message, source: 'frontend' });
            setSupporting(false);
        }
    };

    const handleAddJournalEntry = async () => {
        if (!user) return;
        setJournalStatus('saving');
        try {
            const { createJournalEntry } = await import("@/backend/actions/journal");
            const result = await createJournalEntry(user.uid, newJournal);
            if (result.success) {
                logger.info('USER_RECORD_UPDATED', { message: "Journal entry created", userId: user.uid, source: 'frontend' });
                setJournalStatus('success');
                await refreshProfileData();
                setTimeout(() => {
                    setIsAddingJournal(false);
                    setJournalStatus('idle');
                    setNewJournal({ title: '', content: '', imageUrl: '' });
                }, 1000);
            } else {
                setJournalStatus('error');
                logger.error('SYSTEM_ERROR', { message: "Failed to create journal entry", error: result.error, source: 'frontend' });
            }
        } catch (error: any) {
            setJournalStatus('error');
            logger.error('SYSTEM_ERROR', { message: "Journal entry unexpected error", error: error.message, source: 'frontend' });
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setStatus('saving');

        const result = await updateUserProfile(user.uid, { bio, location, avatarUrl });

        if (result.success) {
            logger.info('USER_RECORD_UPDATED', { userId: user.uid, source: 'frontend' });
            setStatus('success');
            setTimeout(() => {
                setIsEditing(false);
                setStatus('idle');
            }, 1000);
        } else {
            logger.error('SYSTEM_ERROR', { message: "Failed to save profile", error: result.error, source: 'frontend' });
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const handleAddArtwork = async () => {
        if (!user) return;
        setArtworkStatus('saving');

        try {
            const { createArtwork } = await import("@/backend/actions/artwork");

            const result = await createArtwork({
                title: newArtwork.title,
                description: newArtwork.description || "",
                price: parseFloat(newArtwork.price) || 0,
                imageUrl: newArtwork.imageUrls[0] || "", 
                imageUrls: newArtwork.imageUrls,
                primaryImageIndex: 0,
                artistId: user.uid,
                artistName: profile.displayName || "Anonymous",
                location: location,
                currency: "GBP", 
                isForSale: newArtwork.isForSale
            });

            if (result.success) {
                logger.info('ARTWORK_UPLOAD_SUCCESS', { userId: user.uid, artworkId: result.id, source: 'frontend' });
                setArtworkStatus('success');
                await refreshProfileData(); 
                setTimeout(() => {
                    setIsAddingArtwork(false);
                    setArtworkStatus('idle');
                    setNewArtwork({ title: '', price: '', description: '', imageUrls: [], primaryImageIndex: 0, isForSale: true });
                }, 1000);
            } else {
                setArtworkStatus('error');
                logger.error('ARTWORK_UPLOAD_FAILURE', { error: result.error, source: 'frontend' });
                setTimeout(() => setArtworkStatus('idle'), 3000);
            }
        } catch (e: any) {
            logger.error('ARTWORK_UPLOAD_FAILURE', { error: e.message, source: 'frontend' });
            setArtworkStatus('error');
            setTimeout(() => setArtworkStatus('idle'), 3000);
        }
    };

    return (
        <div className="space-y-24 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-12 items-start md:items-center border-l-2 border-primary/20 pl-12 w-full group/header">
                <div className="shrink-0">
                    <div className="relative w-48 h-48 overflow-hidden bg-secondary/10 border border-border/10">
                        <Image
                            src={avatarUrl || profile.avatarUrl || profile.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.displayName}`}
                            alt={profile.displayName || "User"}
                            fill
                            sizes="(max-width: 768px) 100vw, 200px"
                            className="object-cover grayscale transition-all duration-1000 group-hover/header:grayscale-0 group-hover/header:scale-105"
                        />
                        {isOwnProfile && isEditing && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm animate-in fade-in zoom-in-95">
                                <ImageUpload
                                    currentImageUrl={avatarUrl}
                                    onImageUploaded={setAvatarUrl}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6 flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-2">
                            <h1 className="text-5xl md:text-8xl font-serif font-medium tracking-tighter leading-none">
                                {profile.displayName || "Anonymous User"}
                            </h1>
                            <div className="text-muted-foreground flex items-center gap-4 text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">
                                {isEditing ? (
                                    <Input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="h-10 w-48"
                                    />
                                ) : (
                                    <span>{location}</span>
                                )}
                                <span className="w-1 h-1 bg-primary/20 rounded-full" />
                                <span>{profile.role || "Ardent Member"}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 shrink-0">
                            {isOwnProfile ? (
                                <Button variant="outline" className="h-14 px-8" onClick={() => setIsEditing(!isEditing)}>
                                    {isEditing ? <Check className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                                    {isEditing ? "FINALIZE" : "EDIT PROFILE"}
                                </Button>
                            ) : (
                                <div className="flex gap-4">
                                    <Button 
                                        className="shadow-2xl"
                                        onClick={handleSupport}
                                        disabled={supporting}
                                    >
                                        {supporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4 mr-2" />}
                                        {supporting ? "RELAYING..." : "SUPPORT ARTISAN"}
                                    </Button>
                                    <Button variant="outline" className="h-16 px-10" asChild>
                                        <Link href="/collaborate">CONNECT</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="max-w-2xl bg-secondary/5 p-8 border-l border-border/10">
                        {isEditing ? (
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="bg-background"
                                placeholder="Share your creative mission..."
                            />
                        ) : (
                            <p className="text-xl font-light leading-relaxed italic text-muted-foreground">
                                “{bio}”
                            </p>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex gap-4 animate-in slide-in-from-left-4">
                            <Button onClick={handleSave} className="h-12 text-[10px]" disabled={status === 'saving'}>
                                {status === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {status === 'success' && "RELAY SUCCESSFUL"}
                                {status === 'error' && "RELAY FAILED"}
                                {status === 'idle' && "SAVE CHANGES"}
                            </Button>
                            <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-12 text-[10px]" disabled={status === 'saving'}>CANCEL</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Dashboard Tabs (Only if Own Profile) */}
            {isOwnProfile && (
                <div className="grid grid-cols-2 md:grid-cols-4 border border-border/10 divide-x divide-border/10 bg-secondary/5">
                    <div className="p-12 space-y-4">
                        <div className="text-[10px] font-bold tracking-[0.5em] uppercase text-primary/40 leading-none">Aquisitions</div>
                        <div className="text-5xl font-serif font-light tracking-tighter">£{totalSpent.toLocaleString()}</div>
                    </div>
                    <div className="p-12 space-y-4">
                        <div className="text-[10px] font-bold tracking-[0.5em] uppercase text-primary/40 leading-none text-center">Studio Revenue</div>
                        <div className="text-5xl font-serif font-light tracking-tighter text-center">£{totalEarned.toLocaleString()}</div>
                    </div>
                    <div className="p-12 space-y-4">
                        <div className="text-[10px] font-bold tracking-[0.5em] uppercase text-primary/40 leading-none text-center">Masterpieces</div>
                        <div className="text-5xl font-serif font-light tracking-tighter text-center">{userArtworks.filter(a => a.status === 'available').length}</div>
                    </div>
                    <div className="p-12 space-y-4">
                        <div className="text-[10px] font-bold tracking-[0.5em] uppercase text-primary/40 leading-none text-right">Open Calls</div>
                        <div className="text-5xl font-serif font-light tracking-tighter text-right">{userCollaborations.length}</div>
                    </div>
                </div>
            )}

            {/* Content Tabs */}
            <div className="space-y-12">
                <div className="flex gap-12 border-b border-border/10 overflow-x-auto no-scrollbar">
                    <button
                        className={`flex items-center gap-3 font-bold text-[10px] tracking-[0.4em] uppercase pb-6 transition-all relative ${activeTab === 'collection' ? 'text-primary' : 'text-muted-foreground/40 hover:text-foreground'}`}
                        onClick={() => setActiveTab('collection')}
                    >
                        {activeTab === 'collection' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-2" />}
                        <Grid className="h-3 w-3" /> {t('collection')}
                    </button>
                    <button
                        className={`flex items-center gap-3 font-bold text-[10px] tracking-[0.4em] uppercase pb-6 transition-all relative ${activeTab === 'journal' ? 'text-primary' : 'text-muted-foreground/40 hover:text-foreground'}`}
                        onClick={() => setActiveTab('journal')}
                    >
                        {activeTab === 'journal' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-2" />}
                        <BookOpen className="h-3 w-3" /> Studio Journal
                    </button>
                    <button
                        className={`flex items-center gap-3 font-bold text-[10px] tracking-[0.4em] uppercase pb-6 transition-all relative ${activeTab === 'collaborations' ? 'text-primary' : 'text-muted-foreground/40 hover:text-foreground'}`}
                        onClick={() => setActiveTab('collaborations')}
                    >
                        {activeTab === 'collaborations' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-2" />}
                        <Users className="h-3 w-3" /> Open Calls
                    </button>
                    {isOwnProfile && (
                        <>
                            <button
                                className={`flex items-center gap-3 font-bold text-[10px] tracking-[0.4em] uppercase pb-6 transition-all relative ${activeTab === 'events' ? 'text-primary' : 'text-muted-foreground/40 hover:text-foreground'}`}
                                onClick={() => setActiveTab('events')}
                            >
                                {activeTab === 'events' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-2" />}
                                <Calendar className="h-3 w-3" /> Schedule
                            </button>
                            <button
                                className={`flex items-center gap-3 font-bold text-[10px] tracking-[0.4em] uppercase pb-6 transition-all relative ${activeTab === 'history' ? 'text-primary' : 'text-muted-foreground/40 hover:text-foreground'}`}
                                onClick={() => setActiveTab('history')}
                            >
                                {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-2" />}
                                <History className="h-3 w-3" /> History
                            </button>
                        </>
                    )}
                </div>

                {/* Collection Tab */}
                {activeTab === 'collection' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {userArtworks.map((artwork: any) => (
                            <ArtworkCard key={artwork.id} artwork={artwork} />
                        ))}
                        {isOwnProfile && (
                            <button 
                                onClick={() => setIsAddingArtwork(true)}
                                className="aspect-[3/4] border-2 border-dashed border-border/20 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-secondary/5 transition-all group"
                            >
                                <div className="h-12 w-12 rounded-full bg-secondary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Grid className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <span className="text-[10px] font-bold tracking-widest uppercase opacity-40 group-hover:opacity-100">Add New Masterpiece</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Studio Journal Tab */}
                {activeTab === 'journal' && (
                    <div className="space-y-24 max-w-4xl">
                        {journalEntries.map((entry) => (
                            <div key={entry.id} className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start group">
                                <div className="md:col-span-5 aspect-[4/5] relative overflow-hidden bg-secondary/10 border border-border/5">
                                    {entry.imageUrl && (
                                        <Image 
                                            src={entry.imageUrl} 
                                            alt={entry.title} 
                                            fill 
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-105" 
                                        />
                                    )}
                                </div>
                                <div className="md:col-span-7 space-y-6 pt-4">
                                    <div className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">
                                        {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <h4 className="text-4xl font-serif font-medium leading-[1.1]">{entry.title}</h4>
                                    <p className="text-xl text-muted-foreground font-light italic leading-relaxed">
                                        {entry.content}
                                    </p>
                                    <div className="pt-6">
                                        <div className="h-px w-20 bg-primary/20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Collaborations Tab */}
                {activeTab === 'collaborations' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {userCollaborations.map((collab) => (
                            <div key={collab.id} className="p-10 border border-border/10 bg-secondary/5 space-y-6 group">
                                <div className="flex justify-between items-start">
                                    <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/60">{collab.type} CALL</div>
                                    <div className={`px-3 py-1 text-[9px] font-bold tracking-widest uppercase border ${collab.status === 'Open' ? 'border-primary/20 text-primary' : 'border-border text-muted-foreground'}`}>
                                        {collab.status}
                                    </div>
                                </div>
                                <h4 className="text-2xl font-serif">{collab.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 italic">
                                    {collab.description}
                                </p>
                                <div className="flex items-center justify-between pt-6 border-t border-border/10">
                                    <div className="text-[10px] font-bold tracking-widest uppercase opacity-40">{collab.location}</div>
                                    <Button variant="ghost" size="sm" asChild className="gap-2 group/btn">
                                        <Link href={`/collaborate/${collab.id}`}>
                                            Manage Call <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {userCollaborations.length === 0 && (
                            <div className="col-span-full py-24 text-center border border-dashed border-border/20">
                                <p className="font-serif italic text-xl text-muted-foreground">Seeking new creative horizons?</p>
                                <Button variant="link" asChild className="mt-4 uppercase tracking-widest text-[10px] font-bold">
                                    <Link href="/collaborate/create">Initialise Collaboration Call</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h3 className="font-serif text-2xl">Studio Lifecycle</h3>
                            <div className="border border-border/10 divide-y divide-border/10">
                                {transactions.map((tx) => (
                                    <TransactionRow key={tx.id} tx={tx} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* My Schedule Tab */}
                {activeTab === 'events' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userEvents.map((event: any) => (
                            <EventMiniCard key={event.id} event={event} isOwner={true} />
                        ))}
                        {attendingEvents.map((event: any) => (
                            <EventMiniCard key={event.id} event={event} isOwner={false} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function EventMiniCard({ event, isOwner }: { event: any, isOwner: boolean }) {
    if (!event) return null;
    return (
        <div className="group relative border border-border/10 rounded-none overflow-hidden bg-card hover:bg-secondary/5 transition-all">
            <div className="aspect-video relative bg-muted grayscale group-hover:grayscale-0 transition-all duration-700">
                {event.imageUrl ? (
                    <Image 
                        src={event.imageUrl} 
                        alt={event.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover" 
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Calendar className="h-8 w-8 opacity-10" />
                    </div>
                )}
            </div>
            <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-serif font-medium truncate pr-2 text-sm" title={event.title}>{event.title}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            {new Date(event.startTime).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-[10px] font-bold tracking-[0.1em] text-primary/60 border border-primary/10 px-2 py-0.5">
                        {isOwner ? 'ORGANIZER' : 'REGISTERED'}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TransactionRow({ tx }: { tx: any }) {
    return (
        <div className="p-6 flex justify-between items-center hover:bg-secondary/5 transition-colors group">
            <div className="flex items-center gap-6">
                <div className="relative h-16 w-16 bg-muted overflow-hidden border border-border/10 shrink-0">
                    {tx.imageUrl ? (
                        <Image 
                            src={tx.imageUrl} 
                            alt={tx.itemTitle || tx.title} 
                            fill 
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase opacity-20">Art</div>
                    )}
                </div>
                <div>
                    <Link 
                        href={`/artwork/${tx.itemId || tx.id}`} 
                        className="font-serif text-lg hover:text-primary transition-colors block"
                    >
                        {tx.itemTitle || tx.title || "Untitled Masterpiece"}
                    </Link>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">
                        {tx.type === 'sell' ? 'Sold to Collector' : 'Acquired from Artisan'} • {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className={cn(
                    "font-serif text-xl",
                    tx.type === 'sell' ? "text-emerald-600" : "text-foreground"
                )}>
                    {tx.type === 'sell' ? '+' : '-'}£{tx.amount.toLocaleString()}
                </div>
                <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase opacity-40 mt-1">
                    {tx.currency || 'GBP'}
                </div>
            </div>
        </div>
    );
}
