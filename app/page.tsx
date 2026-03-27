import { getArtworks } from "@/backend/db/artworks";
import { HomeClient } from "@/frontend/components/home/HomeClient";

export default async function Home() {
  const featuredArtworks = (await getArtworks()).slice(0, 4);

  return (
    <HomeClient initialArtworks={JSON.parse(JSON.stringify(featuredArtworks))} />
  );
}
