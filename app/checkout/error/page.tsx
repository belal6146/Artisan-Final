"use client";

import Link from "next/link";
import { XCircle, RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get("error") || "The transaction was declined by the provider.";

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center container max-w-2xl text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-200">
            <div className="relative">
                <div className="absolute inset-0 bg-destructive/10 rounded-full blur-3xl animate-pulse" />
                <div className="relative h-24 w-24 bg-destructive text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <XCircle className="h-12 w-12" />
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter">
                    Payment Failed.
                </h1>
                <p className="text-xl text-muted-foreground font-light italic leading-relaxed">
                    We were unable to secure your acquisition. No funds were removed from your account.
                </p>
            </div>

            <div className="w-full bg-secondary/10 border border-border/10 p-8 rounded-none space-y-6">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">System Message</p>
                    <p className="text-sm font-medium text-destructive/80 italic">{reason}</p>
                </div>
                
                <div className="border-t border-border/10 pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="h-14 px-10 rounded-none bg-primary text-[11px] font-bold tracking-[0.2em] uppercase transition-all hover:scale-105 active:scale-95 shadow-xl">
                        <Link href="/explore">
                            <RefreshCw className="mr-2 h-4 w-4" /> RETRY ACQUISITION
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-none text-[11px] font-bold tracking-[0.2em] uppercase border-border/10">
                        <Link href="/contact">
                            CONTACT SUPPORT <HelpCircle className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">
                Error Code: AUTH_GENERIC_FAILURE • Artisan Ledger
            </p>
        </div>
    );
}

export default function ErrorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center opacity-0 animate-in fade-in duration-500">Checking state...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
