"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArtworkCard } from "@/components/art/ArtworkCard";
import { Select } from "@/components/ui/select-minimal";
import type { ArtworkMedium } from "@/types/schema";
import { NOT_PROVIDED, textOrMissing } from "@/frontend/lib/artwork-display";
import { cn } from "@/frontend/lib/utils";
import { Edit2, History, Grid, Loader2, Calendar, Heart, Check, ArrowRight } from "lucide-react";
import { collection, query, getDocs } from "firebase/firestore"; // Still needed for reading subcollection (Client Fetch)
import { db } from "@/backend/config/firebase";
import { ImageUpload } from "@/components/ui/image-upload";
import { ArtworkImageUpload } from "@/components/ui/artwork-image-upload";
import { logger } from "@/backend/lib/logger";
import { updateUserProfile } from "@/backend/actions/profile";
import { useLocale } from "@/frontend/contexts/LocaleContext";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const ARTWORK_MEDIA: ArtworkMedium[] = [
    "Painting",
    "Sculpture",
    "Photography",
    "Digital",
    "Textile",
    "Mixed Media",
    "Other",
];

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
    const [bio, setBio] = useState(profile.bio ?? "");
    const [location, setLocation] = useState(profile.location ?? "");
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || profile.photoURL || "");
    const [yearsOfPracticeStr, setYearsOfPracticeStr] = useState(
        profile.yearsOfPractice != null ? String(profile.yearsOfPractice) : ""
    );
    const [craftStatement, setCraftStatement] = useState(profile.craftStatement ?? "");
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
            const { getArtworksByArtist } = await import("@/backend/actions/artwork");
            const freshArtworks = await getArtworksByArtist(targetUid);
            setUserArtworks(freshArtworks);

            // 2. Fetch Hosted Events
            const { getEventsByOrganizer } = await import("@/backend/actions/event");
            const hosted = await getEventsByOrganizer(targetUid);
            setUserEvents(hosted);

            // 3. Fetch Registered/Attending Events
            const { getRSVPsByUser } = await import("@/backend/actions/rsvp");
            const { getEventById } = await import("@/backend/actions/event");
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

        } catch (e: any) {
            logger.error('SYSTEM_ERROR', { message: "Failed to refresh profile data", error: e.message, source: 'frontend' });
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
        title: "",
        price: "",
        description: "",
        medium: "Other" as ArtworkMedium,
        origin: "",
        process: "",
        materialsText: "",
        timeSpent: "",
        peopleInvolved: "",
        artisanStory: "",
        pieceMeaning: "",
        workValues: "",
        impactMetrics: "",
        aspirations: "",
        imageUrls: [] as string[],
        primaryImageIndex: 0,
        isForSale: true,
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: profile.uid, type: 'support', userId: user.uid }),
            });

            const { checkoutUrl } = await res.json();
            if (checkoutUrl) {
                logger.info('COMMERCE_CHECKOUT_START', { userId: user.uid, itemId: profile.uid, source: 'frontend' });
                router.push(checkoutUrl);
            }
        } catch (e: any) {
            logger.error('PAYMENT_FAILURE', { userId: user.uid, error: e.message, source: 'frontend' });
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
                logger.info('JOURNAL_CREATE_SUCCESS', { message: "Journal entry created", userId: user.uid, source: 'frontend' });
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

        const yp =
            yearsOfPracticeStr.trim() === ""
                ? undefined
                : parseInt(yearsOfPracticeStr.trim(), 10);
        const yearsPayload =
            yp !== undefined && !Number.isNaN(yp) ? yp : undefined;

        const result = await updateUserProfile(user.uid, {
            bio,
            location,
            avatarUrl,
            ...(yearsPayload !== undefined ? { yearsOfPractice: yearsPayload } : {}),
            craftStatement: craftStatement.trim() || undefined,
        });

        if (result.success) {
            logger.info('USER_UPDATE_SUCCESS', { userId: user.uid, source: 'frontend' });
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

            const materials = newArtwork.materialsText
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            const result = await createArtwork({
                title: newArtwork.title,
                description: newArtwork.description.trim() || undefined,
                price: parseFloat(newArtwork.price) || 0,
                imageUrl: newArtwork.imageUrls[0] || "",
                imageUrls: newArtwork.imageUrls,
                primaryImageIndex: newArtwork.primaryImageIndex,
                medium: newArtwork.medium,
                artistId: user.uid,
                artistName: profile.displayName || "Anonymous",
                location: location.trim() || undefined,
                currency: "GBP",
                isForSale: newArtwork.isForSale,
                origin: newArtwork.origin.trim() || undefined,
                process: newArtwork.process.trim() || undefined,
                materials: materials.length ? materials : undefined,
                timeSpent: newArtwork.timeSpent.trim() || undefined,
                peopleInvolved: newArtwork.peopleInvolved.trim() || undefined,
                artisanStory: newArtwork.artisanStory.trim() || undefined,
                pieceMeaning: newArtwork.pieceMeaning.trim() || undefined,
                workValues: newArtwork.workValues.trim() || undefined,
                impactMetrics: newArtwork.impactMetrics.trim() || undefined,
                aspirations: newArtwork.aspirations.trim() || undefined,
            });

            if (result.success) {
                logger.info('ARTWORK_CREATE_SUCCESS', { userId: user.uid, artworkId: result.id, source: 'frontend' });
                setArtworkStatus('success');
                await refreshProfileData(); 
                setTimeout(() => {
                    setIsAddingArtwork(false);
                    setArtworkStatus('idle');
                    setNewArtwork({
                        title: "",
                        price: "",
                        description: "",
                        medium: "Other",
                        origin: "",
                        process: "",
                        materialsText: "",
                        timeSpent: "",
                        peopleInvolved: "",
                        artisanStory: "",
                        pieceMeaning: "",
                        workValues: "",
                        impactMetrics: "",
                        aspirations: "",
                        imageUrls: [],
                        primaryImageIndex: 0,
                        isForSale: true,
                    });
                }, 1000);
            } else {
                setArtworkStatus('error');
                logger.error('ARTWORK_CREATE_FAILURE', { error: result.error, source: 'frontend' });
                setTimeout(() => setArtworkStatus('idle'), 3000);
            }
        } catch (e: any) {
            logger.error('ARTWORK_CREATE_FAILURE', { error: e.message, source: 'frontend' });
            setArtworkStatus('error');
            setTimeout(() => setArtworkStatus('idle'), 3000);
        }
    };

    const roleLabel = profile.role?.trim()
        ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1).toLowerCase()
        : NOT_PROVIDED;

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row gap-8 items-start w-full">
                <div className="shrink-0">
                    <div className="relative w-40 h-40 overflow-hidden bg-muted/30 border border-border/10">
                        <Image
                            src={avatarUrl || profile.avatarUrl || profile.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.displayName}`}
                            alt={profile.displayName || "User"}
                            fill
                            sizes="(max-width: 768px) 100vw, 200px"
                            className="object-cover"
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

                <div className="space-y-5 flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">
                                {profile.displayName || "Anonymous"}
                            </h1>
                            <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                                {isEditing ? (
                                    <Input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="h-9 max-w-xs"
                                    />
                                ) : (
                                    <span>{textOrMissing(location)}</span>
                                )}
                                <span>·</span>
                                <span>{roleLabel}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            {isOwnProfile ? (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                                    {isEditing ? <Check className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                                    {isEditing ? "Done" : "Edit"}
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" onClick={handleSupport} disabled={supporting}>
                                        {supporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4 mr-2" />}
                                        {supporting ? "…" : "Support"}
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/collaborate">Collaborate</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="max-w-2xl space-y-5">
                        {isEditing ? (
                            <>
                                <div className="space-y-1">
                                    <label className="text-sm text-muted-foreground">Bio</label>
                                    <Textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="min-h-[88px]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-muted-foreground">Years in practice</label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={80}
                                        value={yearsOfPracticeStr}
                                        onChange={(e) => setYearsOfPracticeStr(e.target.value)}
                                        className="max-w-[100px]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-muted-foreground">Practice</label>
                                    <Textarea
                                        value={craftStatement}
                                        onChange={(e) => setCraftStatement(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 text-muted-foreground leading-relaxed">
                                <p>{bio.trim() ? bio : NOT_PROVIDED}</p>
                                <p className="text-sm">
                                    {(() => {
                                        const y = parseInt(yearsOfPracticeStr, 10);
                                        return yearsOfPracticeStr.trim() && !Number.isNaN(y) && y > 0
                                            ? `${y} years`
                                            : NOT_PROVIDED;
                                    })()}
                                </p>
                                <p>{craftStatement.trim() ? craftStatement : NOT_PROVIDED}</p>
                            </div>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSave} disabled={status === "saving"}>
                                {status === "saving" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {status === "success" && "Saved"}
                                {status === "error" && "Error"}
                                {status === "idle" && "Save"}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={status === "saving"}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {isOwnProfile && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/20 rounded-sm overflow-hidden text-sm">
                    <div className="bg-background p-5 space-y-1">
                        <div className="text-muted-foreground">Purchases</div>
                        <div className="font-serif text-2xl">£{totalSpent.toLocaleString()}</div>
                    </div>
                    <div className="bg-background p-5 space-y-1 text-center md:text-left">
                        <div className="text-muted-foreground">Sales</div>
                        <div className="font-serif text-2xl">£{totalEarned.toLocaleString()}</div>
                    </div>
                    <div className="bg-background p-5 space-y-1 text-center md:text-left">
                        <div className="text-muted-foreground">Listed</div>
                        <div className="font-serif text-2xl">{userArtworks.filter((a) => a.status === "available").length}</div>
                    </div>
                    <div className="bg-background p-5 space-y-1 text-right md:text-left">
                        <div className="text-muted-foreground">Calls</div>
                        <div className="font-serif text-2xl">{userCollaborations.length}</div>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border/15 pb-3 text-sm">
                    <button
                        type="button"
                        className={activeTab === "collection" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}
                        onClick={() => setActiveTab("collection")}
                    >
                        {t("collection")}
                    </button>
                    <button
                        type="button"
                        className={activeTab === "journal" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}
                        onClick={() => setActiveTab("journal")}
                    >
                        Journal
                    </button>
                    <button
                        type="button"
                        className={activeTab === "collaborations" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}
                        onClick={() => setActiveTab("collaborations")}
                    >
                        Calls
                    </button>
                    {isOwnProfile && (
                        <>
                            <button
                                type="button"
                                className={activeTab === "events" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}
                                onClick={() => setActiveTab("events")}
                            >
                                Events
                            </button>
                            <button
                                type="button"
                                className={activeTab === "history" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}
                                onClick={() => setActiveTab("history")}
                            >
                                History
                            </button>
                        </>
                    )}
                </div>

                {/* Collection Tab */}
                {activeTab === 'collection' && (
                    <div className="space-y-8">
                        {isOwnProfile && isAddingArtwork && (
                            <div className="border border-border/15 p-6 space-y-5 bg-muted/10">
                                <h3 className="font-serif text-xl">New listing</h3>
                                <p className="text-sm text-muted-foreground">Empty fields show as &ldquo;Not provided&rdquo; on the piece page.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Title</label>
                                        <Input value={newArtwork.title} onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-muted-foreground">Price (GBP)</label>
                                        <Input type="number" min={0} step="0.01" value={newArtwork.price} onChange={(e) => setNewArtwork({ ...newArtwork, price: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-muted-foreground">Medium</label>
                                        <Select
                                            value={newArtwork.medium}
                                            onChange={(e) =>
                                                setNewArtwork({
                                                    ...newArtwork,
                                                    medium: e.target.value as ArtworkMedium,
                                                })
                                            }
                                        >
                                            {ARTWORK_MEDIA.map((m) => (
                                                <option key={m} value={m}>
                                                    {m}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Images</label>
                                        <ArtworkImageUpload
                                            imageUrls={newArtwork.imageUrls}
                                            onImagesChangeAction={(urls: string[]) =>
                                                setNewArtwork({ ...newArtwork, imageUrls: urls })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Origin</label>
                                        <Textarea value={newArtwork.origin} onChange={(e) => setNewArtwork({ ...newArtwork, origin: e.target.value })} className="min-h-[64px]" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Process</label>
                                        <Textarea value={newArtwork.process} onChange={(e) => setNewArtwork({ ...newArtwork, process: e.target.value })} className="min-h-[72px]" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Materials (comma-separated)</label>
                                        <Input value={newArtwork.materialsText} onChange={(e) => setNewArtwork({ ...newArtwork, materialsText: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-muted-foreground">Time</label>
                                        <Input value={newArtwork.timeSpent} onChange={(e) => setNewArtwork({ ...newArtwork, timeSpent: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-muted-foreground">People</label>
                                        <Input value={newArtwork.peopleInvolved} onChange={(e) => setNewArtwork({ ...newArtwork, peopleInvolved: e.target.value })} />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Maker note</label>
                                        <Textarea value={newArtwork.artisanStory} onChange={(e) => setNewArtwork({ ...newArtwork, artisanStory: e.target.value })} className="min-h-[72px]" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Meaning</label>
                                        <Textarea value={newArtwork.pieceMeaning} onChange={(e) => setNewArtwork({ ...newArtwork, pieceMeaning: e.target.value })} className="min-h-[64px]" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Values</label>
                                        <Textarea value={newArtwork.workValues} onChange={(e) => setNewArtwork({ ...newArtwork, workValues: e.target.value })} className="min-h-[64px]" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Impact</label>
                                        <Textarea value={newArtwork.impactMetrics} onChange={(e) => setNewArtwork({ ...newArtwork, impactMetrics: e.target.value })} className="min-h-[64px]" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Aspirations</label>
                                        <Textarea value={newArtwork.aspirations} onChange={(e) => setNewArtwork({ ...newArtwork, aspirations: e.target.value })} className="min-h-[64px]" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Extra note</label>
                                        <Textarea value={newArtwork.description} onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })} className="min-h-[56px]" />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm md:col-span-2">
                                        <input
                                            type="checkbox"
                                            checked={newArtwork.isForSale}
                                            onChange={(e) =>
                                                setNewArtwork({
                                                    ...newArtwork,
                                                    isForSale: e.target.checked,
                                                })
                                            }
                                            className="rounded-none border-border/40"
                                        />
                                        For sale
                                    </label>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        onClick={handleAddArtwork}
                                        disabled={artworkStatus === "saving" || !newArtwork.title.trim() || !newArtwork.imageUrls[0]}
                                    >
                                        {artworkStatus === "saving" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {artworkStatus === "success" ? "Saved" : "Publish"}
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingArtwork(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {userArtworks.map((artwork: any) => (
                                <ArtworkCard key={artwork.id} artwork={artwork} />
                            ))}
                            {isOwnProfile && (
                                <button
                                    type="button"
                                    onClick={() => setIsAddingArtwork(true)}
                                    className="aspect-[3/4] border border-dashed border-border/30 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted/20"
                                >
                                    <Grid className="h-5 w-5 opacity-50" />
                                    Add work
                                </button>
                            )}
                        </div>
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
                                            className="object-cover grayscale transition-all duration-1000 scale-100 group-hover:scale-105" 
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
                            <h3 className="font-serif text-2xl tracking-tight">Activity</h3>
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
            <div className="aspect-video relative bg-muted grayscale transition-all duration-700">
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
                            className="object-cover grayscale transition-all duration-700" 
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
                        {tx.itemTitle || tx.title || "Untitled work"}
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
