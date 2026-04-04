"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const [reference, setReference] = useState("");

    useEffect(() => {
        const ref = searchParams.get("payment_intent");
        if (ref) setReference(ref);
    }, [searchParams]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center container max-w-2xl text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-200">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="relative h-24 w-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <CheckCircle className="h-12 w-12" />
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter">
                    Acquisition Secured.
                </h1>
                <p className="text-xl text-muted-foreground font-light italic leading-relaxed">
                    Thank you for supporting the global artisan network. Your contribution goes directly toward preserving human craftsmanship.
                </p>
            </div>

            <div className="w-full bg-secondary/10 border border-border/10 p-8 rounded-none space-y-6">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
                    <span>Reference Number</span>
                    <span className="font-mono">{reference || "ART-SEC-88219"}</span>
                </div>
                
                <div className="border-t border-border/10 pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="h-14 px-10 rounded-none bg-primary text-[11px] font-bold tracking-[0.2em] uppercase transition-all hover:scale-105 active:scale-95 shadow-xl">
                        <Link href="/explore">
                            <ShoppingBag className="mr-2 h-4 w-4" /> CONTINUE COLLECTING
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-none text-[11px] font-bold tracking-[0.2em] uppercase border-border/10">
                        <Link href="/profile/me?tab=history">
                            VIEW TRANSCRIPT <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">
                Processed via Artisan Secure Ledger • 2026 Platform
            </p>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center opacity-0 animate-in fade-in duration-500">Processing Proof...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
