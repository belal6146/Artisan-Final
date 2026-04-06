"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { logger } from "@/backend/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('SYSTEM_ERROR', { 
        message: "Uncaught root boundary error", 
        error: error.message, 
        digest: error.digest,
        source: 'frontend' 
    });
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-700">
        <div className="space-y-12 max-w-2xl">
            <div className="flex justify-center">
                <div className="h-24 w-px bg-primary/20" />
            </div>
            
            <div className="space-y-4">
                <h2 className="text-sm font-bold tracking-[0.5em] uppercase text-primary/40 leading-none">System Architecture Interrupted</h2>
                <h1 className="font-serif text-6xl md:text-8xl tracking-tighter leading-[0.85] font-medium">
                    Relay failure.
                </h1>
            </div>

            <p className="text-2xl text-muted-foreground font-light italic leading-relaxed opacity-60 max-w-lg mx-auto">
                “Every masterpiece is preceded by a mistake. In this case, our digital relay has encountered a temporary anomaly.”
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-12">
                <Button 
                    onClick={() => reset()} 
                    variant="outline" 
                    size="lg" 
                    className="px-12 group"
                >
                    <RefreshCcw className="mr-2 h-4 w-4 group-active:animate-spin" />
                    REINITIALIZE
                </Button>
                <Button 
                    asChild 
                    variant="ghost" 
                    size="lg" 
                    className="px-12 opacity-60 hover:opacity-100"
                >
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        RETURN TO STUDIO
                    </Link>
                </Button>
            </div>
            
            <div className="pt-24 text-[10px] font-mono tracking-widest uppercase opacity-20">
                REF: {error.digest || 'ROOT_ANOMALY'}
            </div>
        </div>
    </div>
  );
}
