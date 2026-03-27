"use client";

import Link from "next/link";
import { Button } from "@/frontend/components/ui/button";
import { ArtworkCard } from "@/frontend/components/art/ArtworkCard";
import { ArrowRight, ShieldCheck, Globe, Users } from "lucide-react";
import { useLocale } from "@/frontend/contexts/LocaleContext";

interface HomeClientProps {
    initialArtworks: any[];
}

export function HomeClient({ initialArtworks }: HomeClientProps) {
    const { t } = useLocale();

    return (
        <div className="flex flex-col min-h-screen relative font-sans">
            {/* Hero Section - The "Hook" */}
            <section className="relative h-[90vh] flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
                {/* Artistic Blur Backgrounds */}
                <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />
                <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />

                <div className="container mx-auto max-w-5xl z-10 text-center space-y-12">
                <div className="space-y-6">
                    <h1 className="font-serif text-7xl md:text-9xl font-medium tracking-tighter text-foreground text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {t('home_hero_title')}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-light leading-relaxed mx-auto italic text-pretty animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                        {t('home_hero_subtitle')}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
                    <Link href="/explore">
                        <Button size="lg" className="h-16 px-12 rounded-none bg-primary text-[11px] font-bold tracking-[0.2em] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            {t('explore_gallery')} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/collaborate">
                        <Button variant="outline" size="lg" className="h-16 px-12 rounded-none border-border/40 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-secondary/40 transition-all">
                            {t('find_collaborators')}
                        </Button>
                    </Link>
                </div>
                </div>
            </section>

            {/* Featured Works - The "Proof" */}
            <section className="py-32 bg-secondary/5">
                <div className="container mx-auto space-y-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-2 border-primary/10 pl-8">
                    <div className="space-y-4">
                    <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight">{t('featured_selection')}</h2>
                    <p className="text-muted-foreground max-w-md text-sm leading-relaxed tracking-wide">
                        {t('featured_subtitle')}
                    </p>
                    </div>
                    <Link href="/explore" className="text-[10px] font-bold tracking-[0.3em] uppercase border-b border-primary/20 pb-1 hover:border-primary transition-all">
                        {t('view_collection')}
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
                    {initialArtworks.map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                </div>
                </div>
            </section>

            {/* Philosophy - The "Value" */}
            <section className="py-40 bg-background relative overflow-hidden">
                <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-20">
                    <div className="space-y-6 p-8 border border-border/5 hover:border-border/20 transition-all">
                    <ShieldCheck className="h-8 w-8 text-primary/60 mb-8" />
                    <h3 className="font-serif text-2xl font-medium">{t('true_transparency')}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('transparency_desc')}
                    </p>
                    </div>
                    <div className="space-y-6 p-8 border border-border/5 hover:border-border/20 transition-all">
                    <Globe className="h-8 w-8 text-primary/60 mb-8" />
                    <h3 className="font-serif text-2xl font-medium">{t('global_connection')}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('connection_desc')}
                    </p>
                    </div>
                    <div className="space-y-6 p-8 border border-border/5 hover:border-border/20 transition-all">
                    <Users className="h-8 w-8 text-primary/60 mb-8" />
                    <h3 className="font-serif text-2xl font-medium">{t('community_owned')}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('community_desc')}
                    </p>
                    </div>
                </div>
            </section>

            {/* Journal CTA - The "Connection" */}
            <section className="py-32 border-t border-border/10">
                <div className="container mx-auto max-w-4xl text-center space-y-10">
                    <h2 className="font-serif text-4xl md:text-5xl font-medium">{t('explore')} {t('journal')}</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
                        {t('journal_subtitle')}
                    </p>
                    <Link href="/journal">
                        <Button variant="outline" size="lg" className="rounded-none px-12 h-14 tracking-widest text-[10px] font-bold">
                            {t('read_stories')}
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
