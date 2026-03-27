"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types";
import { ArtworkCard } from "@/components/art/ArtworkCard";
import { Settings, Edit2, History, Grid, Loader2, Calendar, Heart, BookOpen } from "lucide-react";
import { getEventsByOrganizer } from "@/backend/db/events";
import { collection, query, getDocs } from "firebase/firestore"; // Still needed for reading subcollection (Client Fetch)
import { db } from "@/backend/config/firebase";
import { ImageUpload } from "@/components/ui/image-upload";
import { ArtworkImageUpload } from "@/components/ui/artwork-image-upload";
import { updateUserProfile } from "@/backend/actions/profile";
import { useLocale } from "@/frontend/contexts/LocaleContext";

import { useRouter } from "next/navigation";

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
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        if (isOwnProfile && user) {
            // Fetch real transactions
            const q = query(collection(db, "users", user.uid, "transactions"));
            getDocs(q).then(snap => {
                setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        }
    }, [isOwnProfile, user]);

    const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);

    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isAddingArtwork, setIsAddingArtwork] = useState(false);
    const [activeTab, setActiveTab] = useState<'collection' | 'journal' | 'events' | 'history'>('collection');
    const [userEvents, setUserEvents] = useState<any[]>([]);

    const [newArtwork, setNewArtwork] = useState({
        title: '',
        price: '',
        description: '',
        imageUrls: [] as string[], // Changed from single imageUrl
        primaryImageIndex: 0,
        isForSale: true
    });
    const [artworkStatus, setArtworkStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
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

    useEffect(() => {
        if (isOwnProfile && user) {
            getEventsByOrganizer(user.uid).then(setUserEvents).catch(console.error);
        }
    }, [isOwnProfile, user]);

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
            // dynamic import to avoid server/client issues if not properly set up
            const { createArtwork } = await import("@/backend/actions/artwork");

            const result = await createArtwork({
                title: newArtwork.title,
                description: newArtwork.description || "",
                price: parseFloat(newArtwork.price) || 0,
                imageUrl: newArtwork.imageUrls[newArtwork.primaryImageIndex] || "", // for legacy compatibility
                imageUrls: newArtwork.imageUrls,
                primaryImageIndex: newArtwork.primaryImageIndex,
                artistId: user.uid,
                artistName: profile.displayName || "Anonymous",
                location: location,
                currency: "EUR",
                isForSale: newArtwork.isForSale
            });

            if (result.success) {
                setArtworkStatus('success');
                setTimeout(() => {
                    setIsAddingArtwork(false);
                    setArtworkStatus('idle');
                    setNewArtwork({ title: '', price: '', description: '', imageUrls: [], primaryImageIndex: 0, isForSale: true });
                    // Ideally refresh works list here
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
                        {isOwnProfile ? (
                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                                {isEditing ? <CheckIcon /> : <Edit2 className="h-4 w-4" />}
                            </Button>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2 bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 hover:text-rose-700"
                                onClick={handleSupport}
                                disabled={supporting}
                            >
                                {supporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                                {supporting ? "Processing..." : "Support Studio (€5)"}
                            </Button>
                        )}
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
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40">Acquisitions</div>
                        <div className="text-4xl font-serif font-light">€{totalSpent.toLocaleString()}</div>
                    </div>
                    <div className="p-10 space-y-4 text-center">
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40">Studio Earnings</div>
                        <div className="text-4xl font-serif font-light">€{transactions.filter(t => t.type === 'sell').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}</div>
                    </div>
                    <div className="p-10 space-y-4 text-center">
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40">Vaulted Works</div>
                        <div className="text-4xl font-serif font-light">{artworks.length}</div>
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
                            <BookOpen className="h-4 w-4" /> {t('studio_journal')}
                        </button>
                        {isOwnProfile && (
                            <>
                                <button
                                    className={`flex items-center gap-2 pb-4 -mb-5 transition-colors ${activeTab === 'events' ? 'border-b-2 border-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setActiveTab('events')}
                                >
                                    <Calendar className="h-4 w-4" /> {t('my_events')}
                                </button>
                                <button
                                    className={`flex items-center gap-2 pb-4 -mb-5 transition-colors ${activeTab === 'history' ? 'border-b-2 border-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setActiveTab('history')}
                                >
                                    <History className="h-4 w-4" /> {t('activity_history')}
                                </button>
                            </>
                        )}
                    </div>
                    {isOwnProfile && activeTab === 'collection' && (
                        <Button size="sm" onClick={() => setIsAddingArtwork(true)} variant="outline">
                            + {t('add_piece')}
                        </Button>
                    )}
                    {isOwnProfile && activeTab === 'events' && (
                        <Button size="sm" asChild variant="outline">
                            <a href="/events/create">+ Create Event</a>
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
                                            placeholder="Price (€)"
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
                            {artworks.filter(a => a.status === 'available').length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="font-serif text-2xl">{t('available_for_sale')}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {artworks.filter(a => a.status === 'available').map((artwork: any, index) => (
                                            <ArtworkCard key={artwork.id} artwork={artwork} priority={index < 4} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Private Collection Section */}
                            {artworks.filter(a => a.status === 'collection').length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="font-serif text-2xl">{t('private_collection')}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {artworks.filter(a => a.status === 'collection').map((artwork: any) => (
                                            <ArtworkCard key={artwork.id} artwork={artwork} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {artworks.length === 0 && !isAddingArtwork && (
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
                    <div className="space-y-8 max-w-2xl bg-secondary/5 rounded-xl border border-border p-8">
                        <div className="flex items-center justify-between pb-6 border-b border-border">
                            <h3 className="font-serif text-2xl">Behind the Scenes</h3>
                            {isOwnProfile && <Button size="sm" variant="outline"><Edit2 className="h-4 w-4 mr-2" /> New Entry</Button>}
                        </div>

                        <div className="space-y-12 pb-4">
                            {/* Dummy Journal Entry 1 */}
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">March 24, 2026</div>
                                <h4 className="text-xl font-medium">Mixing new natural pigments</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    Today I spent the morning foraging for buckthorn berries near the studio. The yellow lake pigment process is tedious, but the raw color payoff on the canvas is entirely worth it compared to commercial tubes.
                                </p>
                                <div className="aspect-video relative rounded-md overflow-hidden bg-secondary w-full max-w-md">
                                    <Image src="https://picsum.photos/seed/artist-studio/600/400" alt="Studio view" fill className="object-cover" />
                                </div>
                            </div>
                            
                            {/* Dummy Journal Entry 2 */}
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">March 15, 2026</div>
                                <h4 className="text-xl font-medium">Preparing for the Gallery Opening</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    Varnishing complete. It always takes longer to dry in this humidity, but the collection is finally ready. 
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* My Events Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userEvents.map((event: any) => (
                                <div key={event.id} className="group relative border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow">
                                    <div className="aspect-video relative bg-muted">
                                        {event.imageUrl ? (
                                            <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                <Calendar className="h-8 w-8 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="secondary" asChild className="h-8 w-8">
                                                <a href={`/events/${event.id}/edit`}><Edit2 className="h-4 w-4" /></a>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium truncate pr-2" title={event.title}>{event.title}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(event.startTime).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                                                {event.currentAttendees}/{event.capacity}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {userEvents.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-secondary/10 rounded-lg">
                                    <p className="text-muted-foreground">You haven't created any events yet.</p>
                                    <Button variant="link" asChild><a href="/events/create">Create Event</a></Button>
                                </div>
                            )}
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

function TransactionRow({ tx }: { tx: any }) {
    return (
        <div className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
            <div>
                <div className="font-medium">{tx.itemTitle || tx.title}</div>
                <div className="text-sm text-muted-foreground capitalize">{tx.type} • {new Date(tx.date).toLocaleDateString()}</div>
            </div>
            <div className={`font-mono font-medium ${tx.type === 'sell' ? 'text-green-600' : 'text-foreground'}`}>
                {tx.type === 'sell' ? '+' : '-'}€{tx.amount.toLocaleString()}
            </div>
        </div>
    );
}

function CheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    )
}
