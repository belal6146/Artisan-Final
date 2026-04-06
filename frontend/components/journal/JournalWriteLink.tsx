"use client";

import Link from "next/link";
import { useAuth } from "@/frontend/contexts/AuthContext";

export function JournalWriteLink() {
    const { user } = useAuth();
    const writeHref = user ? `/profile/${user.uid}?tab=journal` : "/auth?redirect=/journal";

    return (
        <p className="text-sm text-muted-foreground pt-4 border-t border-border/15">
            <Link href={writeHref} className="underline underline-offset-4 hover:text-foreground">
                {user ? "Add a post from your profile" : "Sign in to write a post"}
            </Link>
        </p>
    );
}
