"use client";

import { Leaf, Users, Globe, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/frontend/contexts/LocaleContext";

export default function MissionPage() {
    const { t } = useLocale();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-32 px-6 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />
                
                <div className="container mx-auto space-y-12 text-center max-w-5xl">
                    <h1 className="font-serif text-6xl md:text-9xl font-medium tracking-tighter text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {t('mission_title')}
                    </h1>
                    <p className="max-w-3xl text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mx-auto italic animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                        {t('mission_subtitle')}
                    </p>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-32 container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    {/* Pillar 1: Humanity */}
                    <div className="space-y-8 p-12 border border-border/5 hover:border-border/20 transition-all bg-muted/5">
                        <Users className="w-8 h-8 text-primary/40" />
                        <div className="space-y-4">
                            <h3 className="font-serif text-2xl font-medium tracking-tight">{t('humanity_title')}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-light">
                                {t('humanity_desc')}
                            </p>
                        </div>
                    </div>

                    {/* Pillar 2: Environment */}
                    <div className="space-y-8 p-12 border border-border/5 hover:border-border/20 transition-all bg-muted/5">
                        <Leaf className="w-8 h-8 text-green-600/40" />
                        <div className="space-y-4">
                            <h3 className="font-serif text-2xl font-medium tracking-tight">{t('env_title')}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-light">
                                {t('env_desc')}
                            </p>
                        </div>
                    </div>

                    {/* Pillar 3: Culture */}
                    <div className="space-y-8 p-12 border border-border/5 hover:border-border/20 transition-all bg-muted/5">
                        <Globe className="w-8 h-8 text-amber-600/40" />
                        <div className="space-y-4">
                            <h3 className="font-serif text-2xl font-medium tracking-tight">{t('culture_title')}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-light">
                                {t('culture_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Transparency Commitment */}
            <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pattern-dots" /> {/* Abstract pattern placeholder */}
                <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
                    <h2 className="font-serif text-4xl md:text-5xl mb-8">{t('radical_transparency')}</h2>
                    <p className="text-xl md:text-2xl font-light opacity-90 max-w-4xl mx-auto mb-12">
                        {t('transparency_commitment')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto text-left">
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h4 className="font-bold text-lg mb-2">{t('artisan_share')}</h4>
                            <p className="text-sm opacity-80">Direct compensation for time, skill, and labor.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h4 className="font-bold text-lg mb-2">{t('material_sourcing')}</h4>
                            <p className="text-sm opacity-80">Sustainable, high-quality raw materials.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h4 className="font-bold text-lg mb-2">{t('platform_fee')}</h4>
                            <p className="text-sm opacity-80">Keeping the lights on and the servers running.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h4 className="font-bold text-lg mb-2">{t('impact_fund')}</h4>
                            <p className="text-sm opacity-80">Reinvested into community education & tools.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 text-center px-6">
                <h2 className="font-serif text-4xl mb-6">{t('join_movement')}</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                    Whether you are a creator or a collector, your choices shape the world. Choose wisely.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button asChild size="lg" className="rounded-full px-8 text-base">
                        <Link href="/explore">{t('support_artisans')}</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base">
                        <Link href="/collaborate">{t('share_craft')}</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
