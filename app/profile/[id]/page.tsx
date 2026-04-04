import { getUserById } from "@/backend/actions/profile";
import { getArtworksByArtist } from "@/backend/actions/artwork";
import { UserProfileClient } from "@/frontend/components/profile/UserProfileClient";
import { notFound } from "next/navigation";
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
 
    const profile: Record<string, unknown> = {
        ...user,
        location: user.location ?? "",
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
