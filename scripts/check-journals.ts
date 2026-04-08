import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, "utf-8");
    env.split("\n").forEach(line => {
        const [key, ...rest] = line.trim().split("=");
        if (key && rest.length) {
            let val = rest.join("=").trim();
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            process.env[key] = val;
        }
    });
    console.log("📍 Env system synchronized from .env.local");
}

async function checkJournals() {
    console.log("🔍 Scanning for Journal Entries (CollectionGroup)...");
    try {
        const { adminDb } = await import("../backend/lib/firebase-admin");
        const { seedDatabase } = await import("../backend/lib/seed");
        
        console.log("🌱 Syncing Seeder Baseline...");
        await seedDatabase();
        
        const snap = await adminDb.collectionGroup("journal_entries").get();
        const topSnap = await adminDb.collection("journals").get();
        const groupSnap = await adminDb.collection("journal").get();

        if (snap.empty && topSnap.empty && groupSnap.empty) {
            console.log("❌ No journal entries found in subcollections, 'journals', or 'journal'.");
            
            // Check if any users exist
            const usersSnap = await adminDb.collection("users").limit(10).get();
            console.log(`👤 Found ${usersSnap.size} users.`);
            if (usersSnap.size > 0) {
                console.log("User IDs found:", usersSnap.docs.map(d => d.id).join(", "));
            }
            return;
        }
        
        console.log(`✅ Found ${snap.size} journal entries.`);
        snap.docs.forEach(doc => {
            const data = doc.data();
            console.log(`\n📄 [${doc.id}] Title: ${data.title}`);
            console.log(`   ✍️ Author: ${data.author} (${data.userId})`);
            console.log(`   🔗 Parent: ${doc.ref.parent.parent?.id}`);
        });
    } catch (e: any) {
        console.error("❌ Error checking journals:", e.message);
    }
}

checkJournals();
