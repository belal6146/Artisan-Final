import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveRight, Grid, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center -mt-28 px-6 text-center animate-in fade-in duration-1000">
        <div className="space-y-16 max-w-2xl">
            <div className="flex justify-center">
                <div className="h-32 w-px bg-primary/20" />
            </div>
            
            <div className="space-y-6">
                <h2 className="text-sm font-bold tracking-[0.5em] uppercase text-primary/40 leading-none">Coordinates Undefined</h2>
                <h1 className="font-serif text-8xl md:text-[12rem] tracking-tighter leading-[0.8] font-medium">
                    Lost path.
                </h1>
            </div>

            <p className="text-2xl md:text-3xl text-muted-foreground font-light italic leading-relaxed opacity-60 max-w-xl mx-auto">
                “In the search for craft, one sometimes wanders beyond the known map. This resource has dissolved into the decentralized ether.”
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-16">
                <Button 
                    asChild 
                    size="lg" 
                    className="px-16 h-16 group"
                >
                    <Link href="/explore">
                        <Grid className="mr-3 h-5 w-5" />
                        RECURATE GALLERY
                    </Link>
                </Button>
                <div className="h-[1px] w-12 bg-primary/20 sm:h-auto sm:w-px sm:self-stretch" />
                <Button 
                    asChild 
                    variant="ghost" 
                    size="lg" 
                    className="px-12 opacity-60 hover:opacity-100 uppercase tracking-widest text-[10px] font-bold h-16"
                >
                    <Link href="/">
                        <Home className="mr-3 h-5 w-5" />
                        RETURN HOME
                    </Link>
                </Button>
            </div>
            
            <div className="pt-32 text-[10px] font-mono tracking-[0.4em] uppercase opacity-20 flex justify-center items-center gap-4">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/20 animate-pulse" />
                RELAY OFFLINE
                <span className="h-1.5 w-1.5 rounded-full bg-primary/20 animate-pulse" />
            </div>
        </div>
    </div>
  );
}
