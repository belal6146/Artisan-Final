import { getArtworks } from "@/backend/actions/artwork";
import { HomeClient } from "@/frontend/components/home/HomeClient";
import { serialize } from "@/frontend/lib/serialization";

export default async function Home() {
  const featuredArtworks = await getArtworks(4);

  return (
    <HomeClient initialArtworks={serialize(featuredArtworks)} />
  );
}
