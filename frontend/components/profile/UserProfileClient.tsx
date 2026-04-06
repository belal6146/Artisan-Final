"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/frontend/contexts/AuthContext";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import { ArtworkCard } from "@/frontend/components/art/ArtworkCard";
import { Select } from "@/frontend/components/ui/select-minimal";
import type { ArtworkMedium } from "@/types/schema";
import { NOT_PROVIDED, textOrMissing } from "@/frontend/lib/artwork-display";
import { cn } from "@/frontend/lib/utils";
import { Edit2, Grid, Loader2, Calendar, Heart, Check, ArrowRight } from "lucide-react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/backend/config/firebase";
import { ImageUpload } from "@/frontend/components/ui/image-upload";
import { ArtworkImageUpload } from "@/frontend/components/ui/artwork-image-upload";
import { logger } from "@/backend/lib/logger";
import { updateUserProfile } from "@/backend/actions/profile";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createArtwork, getArtworksByArtist } from "@/backend/actions/artwork";

const ARTWORK_MEDIA: ArtworkMedium[] = [
    "Painting", "Sculpture", "Photography", "Digital", "Textile", "Mixed Media", "Other",
];

const INITIAL_ARTWORK_STATE = {
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
};

interface ProfileProps {
    profile: any;
    artworks: any[];
}

export function UserProfileClient({ profile, artworks }: ProfileProps) {
    const { user } = useAuth();
    const { t } = useLocale();
    const router = useRouter();
    const isOwnProfile = user?.uid === profile.uid || profile.uid === 'me';

    // UI state
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'collection' | 'journal' | 'events' | 'collaborations' | 'history'>('collection');
    const [isAddingArtwork, setIsAddingArtwork] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [artworkStatus, setArtworkStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Profile state
    const [bio, setBio] = useState(profile.bio ?? "");
    const [location, setLocation] = useState(profile.location ?? "");
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || profile.photoURL || "");
    const [yearsOfPracticeStr, setYearsOfPracticeStr] = useState(profile.yearsOfPractice != null ? String(profile.yearsOfPractice) : "");
    const [craftStatement, setCraftStatement] = useState(profile.craftStatement ?? "");

    // Data state
    const [userArtworks, setUserArtworks] = useState<any[]>(artworks);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [userCollaborations, setUserCollaborations] = useState<any[]>([]);

    // Form state
    const [newArtwork, setNewArtwork] = useState(INITIAL_ARTWORK_STATE);

    const refreshProfileData = async () => {
        if (!user) return;
        try {
            const targetUid = profile.uid === 'me' ? user.uid : profile.uid;
            
            // Re-fetch artworks (Server-side query enabled)
            const freshArtworks = await getArtworksByArtist(targetUid);
            setUserArtworks(freshArtworks);

            // Transactions (Subcollection Client Read - Rules protected)
            const q = query(collection(db, "users", targetUid, "transactions"));
            const snap = await getDocs(q);
            setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));

        } catch (e: any) {
            logger.error('SYSTEM_ERROR', { message: "Refresh failed", error: e.message, source: 'frontend' });
        }
    };

    // Prevent redundant mount fetch by checking if we already have data
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        if (!hasMounted) {
            setHasMounted(true);
            return;
        }
        if (isOwnProfile && user) refreshProfileData();
    }, [isOwnProfile, user, hasMounted]);

    const handleSave = async () => {
        if (!user) return;
        setStatus('saving');
        try {
            const idToken = await (user as any).getIdToken();
            const result = await updateUserProfile({
                bio, location, avatarUrl,
                yearsOfPractice: parseInt(yearsOfPracticeStr, 10) || 0,
                craftStatement: craftStatement.trim() || undefined,
            }, idToken);

            if (result.success) {
                setStatus('success');
                setTimeout(() => { setIsEditing(false); setStatus('idle'); }, 1500);
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    const handleAddArtwork = async () => {
        if (!user) return;
        setArtworkStatus('saving');
        try {
            const idToken = await (user as any).getIdToken();
            const result = await createArtwork({
                ...newArtwork,
                price: parseFloat(newArtwork.price) || 0,
                imageUrl: newArtwork.imageUrls[0] || "",
                artistName: profile.displayName || "Anonymous",
            }, idToken);

            if (result.success) {
                setArtworkStatus('success');
                setNewArtwork(INITIAL_ARTWORK_STATE);
                await refreshProfileData();
                setTimeout(() => { setIsAddingArtwork(false); setArtworkStatus('idle'); }, 1500);
            } else {
                setArtworkStatus('error');
            }
        } catch (e) {
            setArtworkStatus('error');
        }
    };

    const totalSpent = transactions.reduce((acc, t: any) => acc + (t.type === 'buy' ? t.amount : 0), 0);
    const totalEarned = transactions.reduce((acc, t: any) => acc + (t.type === 'sell' ? t.amount : 0), 0);

    return (
        <div className="space-y-16 animate-in fade-in duration-700 max-w-7xl mx-auto px-4 py-8">
            {/* Header / Meta */}
            <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="relative w-48 h-48 bg-muted/20 border border-border/5 group overflow-hidden">
                    <Image
                        src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.displayName}`}
                        alt={profile.displayName}
                        fill
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
                    {isOwnProfile && isEditing && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ImageUpload currentImageUrl={avatarUrl} onImageUploaded={setAvatarUrl} />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-baseline gap-4">
                        <div>
                            <h1 className="text-6xl font-serif font-medium tracking-tight mb-2">{profile.displayName || "Artisan"}</h1>
                            <p className="text-muted-foreground font-sans tracking-wide uppercase text-[10px] opacity-60">
                                {textOrMissing(location)} · {profile.role}
                            </p>
                        </div>
                        {isOwnProfile && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100"
                            >
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </Button>
                        )}
                    </div>

                    <div className="max-w-2xl text-muted-foreground leading-relaxed italic opacity-80 font-serif text-lg">
                        {isEditing ? (
                            <Textarea 
                                value={bio} 
                                onChange={e => setBio(e.target.value)} 
                                className="min-h-[120px] bg-transparent border-border/20" 
                                placeholder="Your artistic journey..."
                            />
                        ) : (
                            <p className="line-clamp-4">{bio || NOT_PROVIDED}</p>
                        )}
                    </div>

                    {isEditing && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-left-4 duration-500">
                             <Input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
                             <Input placeholder="Years of Practice" value={yearsOfPracticeStr} onChange={e => setYearsOfPracticeStr(e.target.value)} type="number" />
                             <Button onClick={handleSave} disabled={status === 'saving'} className="md:col-span-2">
                                {status === 'saving' ? "Syncing..." : "Update Narrative"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            {isOwnProfile && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/10 border-y border-border/10">
                    <div className="bg-background py-8 px-6 text-center">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Acquisitions</p>
                        <p className="text-3xl font-serif">£{totalSpent}</p>
                    </div>
                    <div className="bg-background py-8 px-6 text-center">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Revenue</p>
                        <p className="text-3xl font-serif">£{totalEarned}</p>
                    </div>
                    <div className="bg-background py-8 px-6 text-center">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Cataloged</p>
                        <p className="text-3xl font-serif">{userArtworks.length}</p>
                    </div>
                    <div className="bg-background py-8 px-6 text-center">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Collaborations</p>
                        <p className="text-3xl font-serif">{userCollaborations.length}</p>
                    </div>
                </div>
            )}

            {/* Main Tabs */}
            <div className="space-y-12">
                <div className="flex gap-12 border-b border-border/10 pb-4 text-[11px] uppercase tracking-widest font-bold">
                    <button onClick={() => setActiveTab('collection')} className={cn("transition-all duration-500 pb-4 -mb-[17px]", activeTab === 'collection' ? "border-b-2 border-primary" : "opacity-40")}>Collection</button>
                    <button onClick={() => setActiveTab('journal')} className={cn("transition-all duration-500 pb-4 -mb-[17px]", activeTab === 'journal' ? "border-b-2 border-primary" : "opacity-40")}>Journal</button>
                    <button onClick={() => setActiveTab('collaborations')} className={cn("transition-all duration-500 pb-4 -mb-[17px]", activeTab === 'collaborations' ? "border-b-2 border-primary" : "opacity-40")}>Calls</button>
                    <button onClick={() => setActiveTab('history')} className={cn("transition-all duration-500 pb-4 -mb-[17px]", activeTab === 'history' ? "border-b-2 border-primary" : "opacity-40")}>Provenance</button>
                </div>
  
                {activeTab === 'history' && (
                    <div className="space-y-24 max-w-4xl py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="space-y-4">
                            <h2 className="font-serif text-5xl italic opacity-30">Chronicle</h2>
                            <p className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">Verifiable movement through the ecosystem</p>
                        </div>

                        <div className="relative border-l border-border/10 pl-16 space-y-20">
                            {/* Grouping logic can be complex, so we'll keep it explicit */}
                            {[...userArtworks]
                                .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((artwork, idx) => (
                                <div key={artwork.id} className="relative group/time">
                                    <div className="absolute -left-[69px] top-4 w-2 h-2 bg-primary/20 ring-4 ring-background transition-all group-hover/time:bg-primary/60 group-hover/time:scale-125" />
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-30">
                                            {new Date(artwork.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                                        </p>
                                        <div className="grid md:grid-cols-2 gap-12 items-baseline">
                                            <div className="space-y-4">
                                                <h3 className="font-serif text-3xl leading-none">
                                                    <Link href={`/artwork/${artwork.id}`} className="hover:text-primary transition-colors underline-offset-8 decoration-border/20 decoration-1 hover:underline">
                                                        {artwork.title}
                                                    </Link>
                                                </h3>
                                                <p className="text-sm italic text-muted-foreground leading-relaxed opacity-60">
                                                    {artwork.artisanStory || "The narrative for this piece remains captured in the physical form."}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/40">
                                                <div className="space-y-1">
                                                    <span>Medium</span>
                                                    <p className="text-foreground/60">{artwork.medium}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span>Status</span>
                                                    <p className="text-foreground/60">{artwork.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {userArtworks.length === 0 && (
                                <p className="font-serif text-2xl italic opacity-20">No provenance entries recorded yet.</p>
                            )}
                        </div>
                    </div>
                )}
  
                {activeTab === 'collection' && (
                    <div className="space-y-12">
                        {isOwnProfile && (
                            <div className="flex justify-start">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setIsAddingArtwork(!isAddingArtwork)}
                                    className="border-primary/20 hover:border-primary/50 text-[10px] tracking-widest uppercase py-6 px-12"
                                >
                                    {isAddingArtwork ? "Discard Form" : "Catalog New Provenance"}
                                </Button>
                            </div>
                        )}

                        {isAddingArtwork && (
                            <div className="p-12 border border-border/10 bg-secondary/5 space-y-8 animate-in slide-in-from-top-4 duration-700">
                                <h3 className="font-serif text-3xl">Entry of New Work</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Input placeholder="Title" value={newArtwork.title} onChange={e => setNewArtwork({...newArtwork, title: e.target.value})} className="bg-transparent" />
                                        <Input placeholder="Valuation (GBP)" type="number" value={newArtwork.price} onChange={e => setNewArtwork({...newArtwork, price: e.target.value})} className="bg-transparent" />
                                        <Select 
                                            value={newArtwork.medium} 
                                            onChange={(e) => setNewArtwork({...newArtwork, medium: e.target.value as ArtworkMedium})} 
                                        >
                                            {ARTWORK_MEDIA.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="space-y-4">
                                        <ArtworkImageUpload 
                                            imageUrls={newArtwork.imageUrls} 
                                            onImagesChangeAction={(urls) => setNewArtwork({...newArtwork, imageUrls: urls})} 
                                        />
                                    </div>
                                    <Textarea 
                                        placeholder="The story, the meaning, the journey of this piece..." 
                                        value={newArtwork.artisanStory} 
                                        onChange={e => setNewArtwork({...newArtwork, artisanStory: e.target.value})} 
                                        className="md:col-span-2 min-h-[160px] bg-transparent" 
                                    />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <Button 
                                        onClick={handleAddArtwork} 
                                        disabled={artworkStatus === 'saving'}
                                        className="px-12 py-6 bg-primary text-primary-foreground"
                                    >
                                        {artworkStatus === 'saving' ? "Recording..." : "Seal Record"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                            {userArtworks.map(artwork => (
                                <ArtworkCard key={artwork.id} artwork={artwork} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
