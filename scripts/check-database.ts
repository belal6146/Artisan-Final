
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBMZlmM2cX-K2GNIdzjKjsNjwTWBEAmM8E",
    authDomain: "artisian-61ac9.firebaseapp.com",
    projectId: "artisian-61ac9",
    storageBucket: "artisian-61ac9.firebasestorage.app",
    messagingSenderId: "195039579524",
    appId: "1:195039579524:web:ef706a43064095594b21d1"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function main() {
    const artistId = "Vs5mWkmDLQU6pKyhkqCNSoYFWyp2";
    console.log(`🔍 Checking database for Artist: ${artistId}`);
    
    const q = query(collection(db, "artworks"), where("artistId", "==", artistId));
    const snap = await getDocs(q);
    
    if (snap.empty) {
        console.log("❌ No artworks found for this artist.");
        return;
    }

    snap.docs.forEach(doc => {
        const data = doc.data();
        console.log(`\n📄 [${doc.id}] Title: ${data.title}`);
        console.log(`   🔗 URL: ${data.imageUrl}`);
        console.log(`   🖼️ Multi-URLs: ${JSON.stringify(data.imageUrls)}`);
    });
}

main();
