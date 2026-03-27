"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { seedDatabase } from "@/backend/lib/seed";

export default function SeedPage() {
    const [status, setStatus] = useState("Idle");
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        setStatus("Starting seed...");

        try {
            await seedDatabase();
            setStatus("Success! Database populated.");
        } catch (error: any) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-20 flex flex-col items-center gap-6">
            <h1 className="text-2xl font-serif">Database Seeder</h1>
            <p className="text-muted-foreground">Populate Firestore with Mock Data</p>

            <div className="p-4 bg-secondary rounded-lg font-mono text-sm w-full max-w-md text-center">
                {status}
            </div>

            <Button onClick={handleSeed} disabled={loading} size="lg">
                {loading ? "Seeding..." : "Run Seed"}
            </Button>
        </div>
    );
}
