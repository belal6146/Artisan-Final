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

    // 1. Try to fetch artist profile (Public Figure)
    const user = await getUserById(id);

    if (!user) {
        notFound();
    }

    // Adapt AppUser to DetailedArtistProfile for the view component if needed
    // or update the component to accept AppUser. 
    // For now, mapping broadly:
    const profile: any = {
        ...user,
        location: user.location || "Global Business",
        mediums: [], // User type doesn't have mediums yet, assuming empty or need schema update
        verificationStatus: 'verified' // Defaulting for display
    };

    // Helper function to serialize Firestore Timestamps
    const toPlain = (obj: any) => JSON.parse(JSON.stringify(obj));

    // 2. Fetch works from Firestore
    const userArtworksRaw = await getArtworksByArtist(id);
    const userArtworks = toPlain(userArtworksRaw);

    return (
        <div className="container py-12">
            <UserProfileClient profile={toPlain(profile)} artworks={userArtworks} />
        </div>
    );
}
