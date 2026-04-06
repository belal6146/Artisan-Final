import { getArtworks } from "@/backend/actions/artwork";
import { HomeClient } from "@/frontend/components/home/HomeClient";

export default async function Home() {
  const featuredArtworks = await getArtworks(4);

  return (
    <HomeClient initialArtworks={JSON.parse(JSON.stringify(featuredArtworks))} />
  );
}
