import { getUserById } from "@/backend/db/users";
import { getArtworksByArtist } from "@/backend/db/artworks";
import { UserProfileClient } from "@/frontend/components/profile/UserProfileClient";
import { notFound } from "next/navigation";
import { DetailedArtistProfile } from "@/types/schema";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
    const { id } = await params;

    // 1. Fetch artist profile and works in parallel to eliminate request waterfall
    const [user, userArtworksRaw] = await Promise.all([
        getUserById(id),
        getArtworksByArtist(id)
    ]);
 
    if (!user) {
        notFound();
    }
 
    // Adapt AppUser to DetailedArtistProfile for the view component if needed
    const profile: any = {
        ...user,
        location: user.location || "Global Business",
        mediums: [], 
        verificationStatus: 'verified' 
    };
 
    // Helper function to serialize Firestore Timestamps
    const toPlain = (obj: any) => JSON.parse(JSON.stringify(obj));
    const userArtworks = toPlain(userArtworksRaw);

    return (
        <div className="container py-12">
            <UserProfileClient profile={toPlain(profile)} artworks={userArtworks} />
        </div>
    );
}
