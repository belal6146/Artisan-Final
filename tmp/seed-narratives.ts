
import { db } from "../backend/config/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

async function seedNarratives() {
  console.log("🏺 Starting Narrative Seeding...");
  
  const artworksRef = collection(db, "artworks");
  const snap = await getDocs(artworksRef);
  
  const richData = [
    {
      title: "Ancient Echoes",
      origin: "Hand-harvested from the Black Forest region, specifically selected for its resilience and unique grain density.",
      process: "Involves a 14-stage kiln-drying and hand-carving process, finished with local organic beeswax and heritage oils.",
      materials: ["Reclaimed Oak", "Beeswax", "Natural Pigment"],
      timeSpent: "148 hours of focused hand-craftsmanship over 4 months.",
      peopleInvolved: "One Master Carver and a dedicated Finishing Artisan.",
      impactMetrics: "100% Carbon-neutral production; supporting local timber preservation.",
      pieceMeaning: "A meditation on the intersection of ancient carpentry and modern fluid dynamics.",
      workValues: "Heritage, Precision, Sustainability, and the 'Beauty of Imperfection'.",
      artisanStory: "Born from the desire to give a second life to fallen trees, honoring their age and character.",
      aspirations: "To bridge the gap between ancestral techniques and contemporary living spaces."
    },
    {
      title: "Glacial Flow",
      origin: "Specially sourced high-fire stoneware clay from the family-owned deposits in the English West Country.",
      process: "Wheel-thrown and hand-altered, followed by a 48-hour wood-fired reduction in a traditional anagama kiln.",
      materials: ["Stoneware", "Wood-ash Glaze", "River Quartz"],
      timeSpent: "85 hours involving 3 distinct firings reaching 1300°C.",
      peopleInvolved: "A single master potter assisted by two fire-tenders.",
      impactMetrics: "Utilizes local wood-firing scraps as the primary heat source.",
      pieceMeaning: "Represents the slow, inexorable movement of water and ice across the landscape.",
      workValues: "Patience, Heat, Earth-Connection, and Elemental Resilience.",
      artisanStory: "Inspired by the rugged cliffs of Cornwall where the land meets the Atlantic.",
      aspirations: "To create vessels that carry the weight and silence of the earth."
    },
    {
        title: "Woven Silence",
        origin: "Linen fibers traditionally spun and dyed with local woad and madder in the French countryside.",
        process: "Double-warp weaving on a custom-restored 19th-century jacquard loom, finished with hand-rolled hems.",
        materials: ["Natural Linen", "Indigo Dye", "Heritage Silk Thread"],
        timeSpent: "Over 200 hours of preparatory threading and 60 hours of active weaving.",
        peopleInvolved: "A master weaver and a structural textile engineer.",
        impactMetrics: "Preserving nearly-extict weaving patterns through modern adaptation.",
        pieceMeaning: "Capturing the stillness and mathematical rhythm of the loom's movement.",
        workValues: "Rhythm, Structure, Historical Preservation, and Tactile Memory.",
        artisanStory: "Continuing a four-generation legacy of Flemish weaving traditions.",
        aspirations: "To make the 'Ancient Future' visible through the language of fiber."
    }
  ];

  let i = 0;
  for (const artworkDoc of snap.docs) {
    const data = richData[i % richData.length];
    const update = {
        ...data,
        artistName: "Marcus Thorne", // Standardizing for the demo
        location: "United Kingdom",
        visibility: "public",
        status: "available"
    };

    console.log(`Updating ${artworkDoc.id} (${artworkDoc.data().title || 'Untitled'}) with rich narrative...`);
    await updateDoc(doc(db, "artworks", artworkDoc.id), update);
    i++;
  }

  console.log("✅ Narrative Seeding Complete. The gallery is now ALIVE.");
  process.exit(0);
}

seedNarratives().catch(err => {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
});
