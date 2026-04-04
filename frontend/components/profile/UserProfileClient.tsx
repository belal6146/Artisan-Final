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
import { Settings, Edit2, History, Grid, Loader2, Calendar, Heart, BookOpen, Check, ArrowRight } from "lucide-react";
import { getEventsByOrganizer } from "@/backend/db/events";
import { collection, query, getDocs } from "firebase/firestore"; // Still needed for reading subcollection (Client Fetch)
import { db } from "@/backend/config/firebase";
import { ImageUpload } from "@/components/ui/image-upload";
import { ArtworkImageUpload } from "@/components/ui/artwork-image-upload";
import { updateUserProfile } from "@/backend/actions/profile";
import { useLocale } from "@/frontend/contexts/LocaleContext";

import { useRouter } from "next/navigation";
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
    const [journalEntries, setJournalEntries] = useState<any[]>([]); // NEW: REAL JOURNAL DATA

    const refreshProfileData = async () => {
        if (!user) return;
        try {
            console.log("🔄 Refreshing comprehensive profile data for:", profile.uid);
            
            // 1. Fetch Artworks
            const { getArtworksByArtist } = await import("@/backend/db/artworks");
            const freshArtworks = await getArtworksByArtist(profile.uid === 'me' ? user.uid : profile.uid);
            setUserArtworks(freshArtworks);

            // 2. Fetch Hosted Events
            const { getEventsByOrganizer } = await import("@/backend/db/events");
            const hosted = await getEventsByOrganizer(profile.uid === 'me' ? user.uid : profile.uid);
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
            const entries = await getJournalEntries(profile.uid === 'me' ? user.uid : profile.uid);
            setJournalEntries(entries);

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
    const [activeTab, setActiveTab] = useState<'collection' | 'journal' | 'events' | 'history'>('collection');

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
                router.push(checkoutUrl);
            }
        } catch (e) {
            console.error(e);
            alert("Payment gateway failed to initialize. Please try again.");
            setSupporting(false);
        }
    };

    const handleAddJournalEntry = async () => {
        if (!user) return;
        setJournalStatus('saving');
        const { createJournalEntry } = await import("@/backend/actions/journal");
        const result = await createJournalEntry(user.uid, newJournal);
        if (result.success) {
            setJournalStatus('success');
            await refreshProfileData();
            setTimeout(() => {
                setIsAddingJournal(false);
                setJournalStatus('idle');
                setNewJournal({ title: '', content: '', imageUrl: '' });
            }, 1000);
        } else {
            setJournalStatus('error');
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setStatus('saving');

        const result = await updateUserProfile(user.uid, { bio, location, avatarUrl });

        if (result.success) {
            setStatus('success');
            setTimeout(() => {
                setIsEditing(false);
                setStatus('idle');
            }, 1000);
        } else {
            console.error(result.error);
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
                currency: "GBP", // Match user screenshot
                isForSale: newArtwork.isForSale
            });

            if (result.success) {
                setArtworkStatus('success');
                await refreshProfileData(); // REFRESH ENTIRE PROFILE DATA
                setTimeout(() => {
                    setIsAddingArtwork(false);
                    setArtworkStatus('idle');
                    setNewArtwork({ title: '', price: '', description: '', imageUrls: [], primaryImageIndex: 0, isForSale: true });
                }, 1000);
            } else {
                setArtworkStatus('error');
                setTimeout(() => setArtworkStatus('idle'), 3000);
            }
        } catch (e) {
            console.error(e);
            setArtworkStatus('error');
        }
    };

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-border pb-12 w-full">
                <div className="shrink-0">
                    <div className="relative w-40 h-40 overflow-hidden bg-muted/20 border border-border/10 group">
                        <Image
                            src={avatarUrl || profile.avatarUrl || profile.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.displayName}`}
                            alt={profile.displayName || "User"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
                        />
                        {isOwnProfile && isEditing && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <ImageUpload
                                    currentImageUrl={avatarUrl}
                                    onImageUploaded={setAvatarUrl}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 flex-1 w-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-serif font-medium tracking-tight mb-1">
                                {profile.displayName || "Anonymous User"}
                            </h1>
                            <div className="text-muted-foreground flex items-center gap-2">
                                {isEditing ? (
                                    <Input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="h-8 w-48"
                                    />
                                ) : (
                                    <span>{location}</span>
                                )}
                                <span>•</span>
                                <span className="capitalize">{profile.role || "Member"}</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {isOwnProfile ? (
                                <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                                    {isEditing ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                                </Button>
                            ) : (
                                <div className="flex gap-3">
                                    <Button 
                                        className="gap-2 h-12 px-8 rounded-none bg-primary text-[11px] font-bold tracking-[0.2em] uppercase transition-all hover:scale-105 active:scale-95 shadow-xl"
                                        onClick={handleSupport}
                                        disabled={supporting}
                                    >
                                        {supporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4 fill-current" />}
                                        {supporting ? "Processing..." : "Support Artisan (£5)"}
                                    </Button>
                                    <Button variant="outline" className="h-12 px-8 rounded-none text-[11px] font-bold tracking-[0.2em] uppercase" asChild>
                                        <Link href="/collaborate">Connect</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="max-w-xl">
                        {isEditing ? (
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="resize-none"
                                rows={3}
                            />
                        ) : (
                            <p className="text-lg font-light leading-relaxed">
                                {bio}
                            </p>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex gap-2">
                            <Button onClick={handleSave} size="sm" disabled={status === 'saving'}>
                                {status === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {status === 'success' && "Saved!"}
                                {status === 'error' && "Failed"}
                                {status === 'idle' && "Save Changes"}
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)} size="sm" disabled={status === 'saving'}>Cancel</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Dashboard Tabs (Only if Own Profile) */}
            {isOwnProfile && (
                <div className="grid grid-cols-2 md:grid-cols-4 border border-border/10 divide-x divide-border/10">
                    <div className="p-10 space-y-4">
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40">Total Acquisitions</div>
                        <div className="text-4xl font-serif font-light">£{totalSpent.toLocaleString()}</div>
                    </div>
                    <div className="p-10 space-y-4 text-center">
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40">Studio Earnings</div>
                        <div className="text-4xl font-serif font-light">£{totalEarned.toLocaleString()}</div>
                    </div>
                    <div className="p-10 space-y-4 text-center">
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40">Active Listings</div>
                        <div className="text-4xl font-serif font-light">{userArtworks.filter(a => a.status === 'available').length}</div>
                    </div>
                    <div className="p-10 space-y-4 text-right">
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40">Since</div>
                        <div className="text-4xl font-serif font-light">MMXXIV</div>
                    </div>
                </div>
            )}

            {/* Content Tabs */}
            <div className="space-y-6">
                <div className="flex gap-8 border-b border-border pb-4 justify-between items-center">
                    <div className="flex gap-8">
                        <button
                            className={`flex items-center gap-2 font-medium pb-4 -mb-5 transition-colors ${activeTab === 'collection' ? 'border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setActiveTab('collection')}
                        >
                            <Grid className="h-4 w-4" /> {t('collection')}
                        </button>
                        <button
                            className={`flex items-center gap-2 font-medium pb-4 -mb-5 transition-colors ${activeTab === 'journal' ? 'border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setActiveTab('journal')}
                        >
                            <BookOpen className="h-4 w-4" /> Studio Journal
                        </button>
                        {isOwnProfile && (
                            <>
                                <button
                                    className={`flex items-center gap-2 pb-4 -mb-5 transition-colors ${activeTab === 'events' ? 'border-b-2 border-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setActiveTab('events')}
                                >
                                    <Calendar className="h-4 w-4" /> Schedule
                                </button>
                                <button
                                    className={`flex items-center gap-2 pb-4 -mb-5 transition-colors ${activeTab === 'history' ? 'border-b-2 border-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setActiveTab('history')}
                                >
                                    <History className="h-4 w-4" /> Transactions
                                </button>
                            </>
                        )}
                    </div>
                    {isOwnProfile && activeTab === 'collection' && (
                        <Button size="sm" onClick={() => setIsAddingArtwork(true)} variant="outline">
                            + {t('add_piece')}
                        </Button>
                    )}
                    {isOwnProfile && activeTab === 'journal' && (
                        <Button size="sm" onClick={() => setIsAddingJournal(true)} variant="outline">
                            + New Entry
                        </Button>
                    )}
                    {isOwnProfile && activeTab === 'events' && (
                        <Button size="sm" asChild variant="outline">
                            <a href="/events/create">+ Host Event</a>
                        </Button>
                    )}
                </div>

                {/* Collection Tab */}
                {activeTab === 'collection' && (
                    <>
                        {isAddingArtwork && (
                            <div className="p-6 border border-border rounded-lg bg-secondary/10 mb-8 animate-in fade-in slide-in-from-top-4">
                                <h3 className="text-lg font-serif font-medium mb-4">List New Artwork</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <ArtworkImageUpload
                                            imageUrls={newArtwork.imageUrls}
                                            onImagesChange={(urls) => setNewArtwork({ ...newArtwork, imageUrls: urls })}
                                            maxImages={5}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="Title"
                                            value={newArtwork.title}
                                            onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                                        />
                                        <Input
                                            placeholder="Price"
                                            type="number"
                                            value={newArtwork.price}
                                            onChange={(e) => setNewArtwork({ ...newArtwork, price: e.target.value })}
                                        />
                                        <Textarea
                                            placeholder="Description"
                                            value={newArtwork.description}
                                            onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                                        />
                                        <div className="flex items-center gap-2 py-2">
                                            <input
                                                type="checkbox"
                                                id="forSale"
                                                checked={newArtwork.isForSale}
                                                onChange={(e) => setNewArtwork({ ...newArtwork, isForSale: e.target.checked })}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <label htmlFor="forSale" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Available for Sale
                                            </label>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" onClick={() => setIsAddingArtwork(false)}>Cancel</Button>
                                            <Button onClick={handleAddArtwork} disabled={artworkStatus === 'saving' || newArtwork.imageUrls.length === 0}>
                                                {artworkStatus === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {artworkStatus === 'success' && "Listed!"}
                                                {artworkStatus === 'idle' && "List Item"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-12">
                            {/* For Sale Section */}
                            {userArtworks.filter(a => a.status === 'available').length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="font-serif text-2xl">{t('available_for_sale')}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {userArtworks.filter(a => a.status === 'available').map((artwork: any, index) => (
                                            <ArtworkCard key={artwork.id} artwork={artwork} priority={index < 4} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Private Collection Section */}
                            {userArtworks.filter(a => a.status === 'collection').length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="font-serif text-2xl">{t('private_collection')}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {userArtworks.filter(a => a.status === 'collection').map((artwork: any) => (
                                            <ArtworkCard key={artwork.id} artwork={artwork} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {userArtworks.length === 0 && !isAddingArtwork && (
                                <div className="py-20 text-center bg-secondary/10 rounded-lg">
                                    <p className="text-muted-foreground">{t('no_artworks')}</p>
                                    {isOwnProfile && <Button variant="link" asChild><a href="/explore">{t('start_collecting')}</a></Button>}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Studio Journal Tab */}
                {activeTab === 'journal' && (
                    <div className="space-y-12 max-w-4xl">
                        {isAddingJournal && (
                            <div className="p-10 border border-border rounded-none bg-secondary/5 space-y-8 animate-in fade-in slide-in-from-top-4">
                                <h3 className="font-serif text-3xl">Log Artwork Evolution</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <ImageUpload onImageUploaded={(url: string) => setNewJournal({ ...newJournal, imageUrl: url })} currentImageUrl={newJournal.imageUrl} />
                                        {!newJournal.imageUrl && (
                                            <div className="aspect-[4/5] border-2 border-dashed border-border/20 flex flex-col items-center justify-center bg-secondary/10">
                                                <Loader2 className="h-8 w-8 mx-auto opacity-20" />
                                                <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">Add Visual Proof</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        <Input placeholder="Entry Title" value={newJournal.title} onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })} className="h-14 font-serif text-xl" />
                                        <Textarea placeholder="Behind the scenes..." value={newJournal.content} onChange={(e) => setNewJournal({ ...newJournal, content: e.target.value })} className="min-h-[200px] leading-relaxed italic" />
                                        <div className="flex gap-2">
                                            <Button variant="ghost" onClick={() => setIsAddingJournal(false)}>Discard Entry</Button>
                                            <Button onClick={handleAddJournalEntry} disabled={journalStatus === 'saving'}>Publish Story</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-24">
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

                            {journalEntries.length === 0 && !isAddingJournal && (
                                <div className="py-32 text-center border-y border-border/10">
                                    <p className="font-serif italic text-2xl text-muted-foreground mb-4">Sharing the studio secrets soon.</p>
                                    <div className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-30">No Journal Entries Found</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* My Schedule Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-16">
                        {/* Hosting Section */}
                        <div className="space-y-6">
                            <h3 className="font-serif text-2xl flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                Hosted Events
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userEvents.map((event: any) => (
                                    <EventMiniCard key={event.id} event={event} isOwner={true} />
                                ))}
                                {userEvents.length === 0 && (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed border-border/20 rounded-lg">
                                        <p className="text-muted-foreground text-sm italic">You haven't hosted any events yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attending Section */}
                        <div className="space-y-6">
                            <h3 className="font-serif text-2xl flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                                Registered Sessions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {attendingEvents.map((event: any) => (
                                    <EventMiniCard key={event.id} event={event} isOwner={false} />
                                ))}
                                {attendingEvents.length === 0 && (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed border-border/20 rounded-lg">
                                        <p className="text-muted-foreground text-sm italic">You haven't registered for any events yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && isOwnProfile && (
                    <div className="pt-6 space-y-12">
                        <div>
                            <h3 className="font-serif text-2xl mb-6">Bought Artworks</h3>
                            <div className="border rounded-md divide-y overflow-hidden">
                                {transactions.filter(t => t.type === 'buy').length > 0 ? (
                                    transactions.filter(t => t.type === 'buy').map((tx) => (
                                        <TransactionRow key={tx.id} tx={tx} />
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground">No purchases yet.</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-serif text-2xl mb-6">Sold Artworks</h3>
                            <div className="border rounded-md divide-y overflow-hidden">
                                {transactions.filter(t => t.type === 'sell').length > 0 ? (
                                    transactions.filter(t => t.type === 'sell').map((tx) => (
                                        <TransactionRow key={tx.id} tx={tx} />
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground">No sales yet.</div>
                                )}
                            </div>
                        </div>
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
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" asChild className="h-8 w-8 rounded-none">
                        <a href={isOwner ? `/events/${event.id}/edit` : `/events/${event.id}`}>
                            {isOwner ? <Edit2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                        </a>
                    </Button>
                </div>
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
        <div className="p-6 flex justify-between items-center hover:bg-secondary/5 transition-colors border-b border-border/5 last:border-0">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-none border text-xs font-bold",
                    tx.type === 'sell' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                )}>
                    {tx.type === 'sell' ? 'Σ' : 'Ω'}
                </div>
                <div>
                    <div className="font-serif text-base">{tx.itemTitle || tx.title}</div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {tx.type === 'sell' ? 'Sold to Collector' : 'Acquired from Artisan'} • {new Date(tx.date).toLocaleDateString()}
                    </div>
                </div>
            </div>
            <div className={`font-serif text-lg ${tx.type === 'sell' ? 'text-emerald-600' : 'text-foreground'}`}>
                {tx.type === 'sell' ? '+' : '-'}£{tx.amount.toLocaleString()}
            </div>
        </div>
    );
}
