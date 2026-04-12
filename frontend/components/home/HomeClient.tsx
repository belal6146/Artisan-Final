"use client";

import Link from "next/link";
import { Button } from "@/frontend/components/ui/button";
import { ArtworkCard } from "@/frontend/components/art/ArtworkCard";
import { ArrowRight, ShieldCheck, Globe, Users } from "lucide-react";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { fonts } from "@/frontend/lib/utils";

interface HomeClientProps {
    initialArtworks: any[];
}

export function HomeClient({ initialArtworks }: HomeClientProps) {
    const { t } = useLocale();

    return (
        <div className={`flex flex-col min-h-screen relative ${fonts.body}`}>
            {/* Hero Section - The "Hook" */}
            <section className="relative min-h-[85vh] flex flex-col items-center justify-center py-20 lg:py-32 overflow-hidden">
                {/* Artistic Blur Backgrounds */}
                <div className="absolute top-1/4 -left-20 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-primary/5 rounded-full blur-[80px] lg:blur-[120px] opacity-60 pointer-events-none" />
                <div className="absolute bottom-1/4 -right-20 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-primary/5 rounded-full blur-[80px] lg:blur-[120px] opacity-60 pointer-events-none" />

                <div className="container max-w-5xl z-10 text-center space-y-12 lg:space-y-16">
                <div className="space-y-6 lg:space-y-8">
                    <h1 className={`${fonts.display} text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-medium text-foreground text-balance animate-in fade-in slide-in-from-bottom-8 duration-200 leading-[0.85]`}>
                        {t('home_hero_title')}
                    </h1>
                    <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl font-light leading-relaxed mx-auto italic text-pretty animate-in fade-in slide-in-from-bottom-10 duration-200 delay-75 opacity-60 px-4">
                        {t('home_hero_subtitle')}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-12 duration-200 delay-150">
                    <Link href="/explore" className="w-full sm:w-auto">
                        <Button size="lg" className="h-14 px-12 w-full sm:w-auto text-[11px] tracking-[0.3em] font-bold">
                            {t('explore_gallery').toUpperCase()} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/collaborate" className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="h-14 px-12 w-full sm:w-auto text-[11px] tracking-[0.3em] font-bold">
                            {t('find_collaborators').toUpperCase()}
                        </Button>
                    </Link>
                </div>
                </div>
            </section>

            {/* Featured Works - The "Proof" */}
            <section className="py-20 lg:py-48 bg-secondary/10">
                <div className="container space-y-16 lg:space-y-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 lg:gap-12 border-l-2 border-primary/20 pl-8 lg:pl-12 pr-12 pb-4">
                    <div className="space-y-4 lg:space-y-6">
                    <h2 className={`${fonts.display} text-4xl sm:text-5xl md:text-7xl font-medium tracking-tight leading-none`}>{t('featured_selection')}</h2>
                    <p className="text-muted-foreground max-w-xl text-lg lg:text-xl font-light leading-relaxed italic opacity-60">
                        {t('featured_subtitle')}
                    </p>
                    </div>
                    <Link href="/explore" className={`text-[11px] lg:text-[12px] font-bold tracking-[0.5em] uppercase hover:text-primary transition-all border-b border-primary/10 pb-2 inline-block`}>
                        {t('view_collection')}
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 px-2 lg:px-0">
                    {initialArtworks.map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                </div>
                </div>
            </section>

            {/* Philosophy - The "Value" */}
            <section className="py-20 lg:py-64 bg-background relative overflow-hidden">
                <div className="container grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
                    <div className="space-y-8 group bg-secondary/10 p-10 lg:p-16 hover:bg-secondary/20 transition-all duration-1000 border border-primary/5">
                    <ShieldCheck className="h-8 lg:h-10 w-8 lg:w-10 text-primary/30 group-hover:text-primary transition-colors duration-1000" />
                    <h3 className={`${fonts.display} text-2xl lg:text-3xl font-medium`}>{t('true_transparency')}</h3>
                    <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-light italic">
                        {t('transparency_desc')}
                    </p>
                    </div>
                    <div className="space-y-8 group bg-secondary/10 p-10 lg:p-16 hover:bg-secondary/20 transition-all duration-1000 border border-primary/5">
                    <Globe className="h-8 lg:h-10 w-8 lg:w-10 text-primary/30 group-hover:text-primary transition-colors duration-1000" />
                    <h3 className={`${fonts.display} text-2xl lg:text-3xl font-medium`}>{t('global_connection')}</h3>
                    <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-light italic">
                        {t('connection_desc')}
                    </p>
                    </div>
                    <div className="space-y-8 group bg-secondary/10 p-10 lg:p-16 hover:bg-secondary/20 transition-all duration-1000 border border-primary/5">
                    <Users className="h-8 lg:h-10 w-8 lg:w-10 text-primary/30 group-hover:text-primary transition-colors duration-1000" />
                    <h3 className={`${fonts.display} text-2xl lg:text-3xl font-medium`}>{t('community_owned')}</h3>
                    <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-light italic">
                        {t('community_desc')}
                    </p>
                    </div>
                </div>
            </section>

            {/* Journal CTA - The "Connection" */}
            <section className="py-24 lg:py-64 border-t border-primary/5 bg-secondary/10 relative overflow-hidden group/journal-cta">
                <div className="container max-w-6xl text-center space-y-12 lg:space-y-16 relative z-10 px-6">
                    <h2 className={`${fonts.display} text-5xl sm:text-7xl md:text-[11rem] font-medium leading-[0.85] group-hover/journal-cta:scale-[1.01] transition-transform duration-[2000ms]`}>{t('read_stories')}</h2>
                    <p className="text-xl md:text-3xl text-muted-foreground max-w-3xl mx-auto font-light italic opacity-50 leading-relaxed text-pretty">
                        {t('journal_subtitle')}
                    </p>
                    <Link href="/journal" className="inline-block mt-8 lg:mt-12 w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="h-16 lg:h-20 px-12 lg:px-24 w-full sm:w-auto button-artisan text-base lg:text-lg tracking-[0.2em] uppercase font-light italic border-primary/10">
                            ENTER THE CHRONICLE
                        </Button>
                    </Link>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] lg:w-[1000px] h-[600px] lg:h-[1000px] bg-primary/5 rounded-full blur-[120px] lg:blur-[200px] opacity-20 pointer-events-none group-hover/journal-cta:scale-110 transition-transform duration-[3000ms]" />
            </section>
        </div>
    );
}
