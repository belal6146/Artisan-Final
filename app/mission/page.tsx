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
            <section className="relative py-48 px-6 overflow-hidden bg-secondary/5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] opacity-20 pointer-events-none" />
                
                <div className="container mx-auto space-y-16 text-center max-w-6xl relative z-10">
                    <h1 className="font-serif text-8xl md:text-[10rem] font-medium tracking-tighter text-foreground animate-in fade-in slide-in-from-bottom-8 duration-200 leading-[0.85]">
                        {t('mission_title')}
                    </h1>
                    <p className="max-w-4xl text-2xl md:text-3xl text-muted-foreground font-light leading-relaxed mx-auto italic animate-in fade-in slide-in-from-bottom-10 duration-200 delay-75 opacity-60">
                        {t('mission_subtitle')}
                    </p>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-48 container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-border/20 border border-border/20">
                    {/* Pillar 1: Humanity */}
                    <div className="space-y-12 p-16 bg-background group hover:bg-secondary/10 transition-colors duration-700">
                        <Users className="w-10 h-10 text-primary/40 group-hover:text-primary transition-colors duration-700" />
                        <div className="space-y-6">
                            <h3 className="font-serif text-3xl font-medium tracking-tight leading-none">{t('humanity_title')}</h3>
                            <p className="text-base text-muted-foreground leading-relaxed font-light italic">
                                “{t('humanity_desc')}”
                            </p>
                        </div>
                    </div>

                    {/* Pillar 2: Environment */}
                    <div className="space-y-12 p-16 bg-background group hover:bg-secondary/10 transition-colors duration-700">
                        <Leaf className="w-10 h-10 text-primary/40 group-hover:text-primary transition-colors duration-700" />
                        <div className="space-y-6">
                            <h3 className="font-serif text-3xl font-medium tracking-tight leading-none">{t('env_title')}</h3>
                            <p className="text-base text-muted-foreground leading-relaxed font-light italic">
                                “{t('env_desc')}”
                            </p>
                        </div>
                    </div>

                    {/* Pillar 3: Culture */}
                    <div className="space-y-12 p-16 bg-background group hover:bg-secondary/10 transition-colors duration-700">
                        <Globe className="w-10 h-10 text-primary/40 group-hover:text-primary transition-colors duration-700" />
                        <div className="space-y-6">
                            <h3 className="font-serif text-3xl font-medium tracking-tight leading-none">{t('culture_title')}</h3>
                            <p className="text-base text-muted-foreground leading-relaxed font-light italic">
                                “{t('culture_desc')}”
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Transparency Commitment */}
            <section className="py-48 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 text-center relative z-10 space-y-16">
                    <div className="space-y-8">
                        <h2 className="font-serif text-6xl md:text-8xl tracking-tighter leading-none">{t('radical_transparency')}</h2>
                        <p className="text-2xl md:text-3xl font-light opacity-60 max-w-4xl mx-auto italic">
                            {t('transparency_commitment')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1px bg-white/10 border border-white/10">
                        <div className="bg-primary p-10 text-left space-y-4">
                            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">{t('artisan_share')}</h4>
                            <p className="text-lg font-light leading-relaxed">Direct compensation for time, skill, and labor.</p>
                        </div>
                        <div className="bg-primary p-10 text-left space-y-4">
                            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">{t('material_sourcing')}</h4>
                            <p className="text-lg font-light leading-relaxed">Sustainable, high-quality raw materials.</p>
                        </div>
                        <div className="bg-primary p-10 text-left space-y-4">
                            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">{t('platform_fee')}</h4>
                            <p className="text-lg font-light leading-relaxed">System-wide operational integrity & scale.</p>
                        </div>
                        <div className="bg-primary p-10 text-left space-y-4">
                            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">{t('impact_fund')}</h4>
                            <p className="text-lg font-light leading-relaxed">Collective reinvestment into tools & craft.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-48 text-center px-6 space-y-12">
                <div className="space-y-6">
                    <h2 className="font-serif text-6xl md:text-8xl tracking-tighter leading-none">{t('join_movement')}</h2>
                    <p className="text-muted-foreground text-xl md:text-2xl font-light italic max-w-2xl mx-auto opacity-60">
                        “Whether you are a creator or a collector, your choices shape the legacy of human craft.”
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-8 pt-8">
                    <Button asChild size="lg" className="px-16">
                        <Link href="/explore">{t('support_artisans')}</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="px-16">
                        <Link href="/collaborate">{t('share_craft')}</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
