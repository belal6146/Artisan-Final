"use client";

import { seedDatabase } from "@/backend/lib/seed";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/backend/lib/logger";

export default function SeedPage() {
    const [status, setStatus] = useState("Idle");

    const handleSeed = async () => {
        setStatus("Seeding...");
        logger.info('SYSTEM_START', { action: 'admin_seed', source: 'frontend' });
        try {
            await seedDatabase();
            setStatus("Success! DB Seeded.");
            logger.info('SYSTEM_SUCCESS', { action: 'admin_seed', source: 'frontend' });
        } catch (e: any) {
            logger.error('SYSTEM_ERROR', { action: 'admin_seed', error: e.message, source: 'frontend' });
            setStatus("Error.");
        }
    };

    return (
        <div className="container py-20 flex flex-col items-center gap-4">
            <h1 className="text-2xl font-serif">Database Seeder</h1>
            <p>This will overwrite Firestore with Mock Data.</p>
            <div className="p-4 bg-muted rounded-md">{status}</div>
            <Button onClick={handleSeed}>Run Seed</Button>
        </div>
    );
}
