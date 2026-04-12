"use client";

import { Leaf, Users, Globe, Recycle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { fonts } from "@/frontend/lib/utils";

export default function MissionPage() {
    const { t } = useLocale();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 lg:py-48 px-6 overflow-hidden bg-secondary/5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] lg:w-[800px] h-[600px] lg:h-[800px] bg-primary/5 rounded-full blur-[120px] lg:blur-[160px] opacity-20 pointer-events-none" />
                
                <div className="container mx-auto space-y-12 lg:space-y-16 text-center max-w-6xl relative z-10">
                    <h1 className={`${fonts.display} text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-medium tracking-tighter text-foreground animate-in fade-in slide-in-from-bottom-8 duration-200 leading-[0.85]`}>
                        {t('mission_title')}
                    </h1>
                    <p className="max-w-4xl text-xl md:text-3xl text-muted-foreground font-light leading-relaxed mx-auto italic animate-in fade-in slide-in-from-bottom-10 duration-200 delay-75 opacity-60 text-pretty">
                        {t('mission_subtitle')}
                    </p>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-24 lg:py-48 container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-primary/5 border border-primary/5">
                    {/* Pillar 1: Humanity */}
                    <div className="space-y-10 lg:space-y-12 p-8 lg:p-20 bg-background/40 group hover:bg-secondary/40 transition-all duration-1000">
                        <Users className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors duration-1000" />
                        <div className="space-y-6 lg:space-y-8">
                            <h3 className={`${fonts.display} text-2xl md:text-4xl leading-none`}>{t('humanity_title')}</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed font-light italic text-prose text-pretty">
                                {t('humanity_desc')}
                            </p>
                        </div>
                    </div>

                    {/* Pillar 2: Environment */}
                    <div className="space-y-10 lg:space-y-12 p-8 lg:p-20 bg-background/40 group hover:bg-secondary/40 transition-all duration-1000">
                        <Leaf className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors duration-1000" />
                        <div className="space-y-6 lg:space-y-8">
                            <h3 className={`${fonts.display} text-2xl md:text-4xl leading-none`}>{t('env_title')}</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed font-light italic text-prose text-pretty">
                                {t('env_desc')}
                            </p>
                        </div>
                    </div>

                    {/* Pillar 3: Culture */}
                    <div className="space-y-10 lg:space-y-12 p-8 lg:p-20 bg-background/40 group hover:bg-secondary/40 transition-all duration-1000">
                        <Globe className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors duration-1000" />
                        <div className="space-y-6 lg:space-y-8">
                            <h3 className={`${fonts.display} text-2xl md:text-4xl leading-none`}>{t('culture_title')}</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed font-light italic text-prose text-pretty">
                                {t('culture_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Transparency Commitment */}
            <section className="py-24 lg:py-64 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="container px-6 lg:px-12 text-center relative z-10 space-y-16 lg:space-y-24">
                    <div className="space-y-8 lg:space-y-10">
                        <h2 className={`${fonts.display} text-4xl sm:text-6xl md:text-[8rem] lg:text-[9rem] tracking-tighter leading-none opacity-90`}>{t('radical_transparency')}</h2>
                        <p className="text-xl md:text-3xl font-light opacity-60 max-w-5xl mx-auto italic leading-tight text-balance">
                            {t('transparency_commitment')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
                        <div className="bg-primary p-8 lg:p-12 text-left space-y-4 lg:space-y-6">
                            <h4 className={`${fonts.caps} text-white/30`}>{t('artisan_share')}</h4>
                            <p className="text-lg lg:text-xl font-light leading-relaxed opacity-70 italic">Ensuring the primary value resides with the hand.</p>
                        </div>
                        <div className="bg-primary p-8 lg:p-12 text-left space-y-4 lg:space-y-6 border-l sm:border-l-0 lg:border-l border-white/5">
                            <h4 className={`${fonts.caps} text-white/30`}>{t('material_sourcing')}</h4>
                            <p className="text-lg lg:text-xl font-light leading-relaxed opacity-70 italic">Sustainable pathways for raw, ancestral materials.</p>
                        </div>
                        <div className="bg-primary p-8 lg:p-12 text-left space-y-4 lg:space-y-6 border-l sm:border-l-0 lg:border-l border-white/5">
                            <h4 className={`${fonts.caps} text-white/30`}>{t('platform_fee')}</h4>
                            <p className="text-lg lg:text-xl font-light leading-relaxed opacity-70 italic">Investing in the digital hearth that connects us.</p>
                        </div>
                        <div className="bg-primary p-8 lg:p-12 text-left space-y-4 lg:space-y-6 border-l sm:border-l-0 lg:border-l border-white/5">
                            <h4 className={`${fonts.caps} text-white/30`}>{t('impact_fund')}</h4>
                            <p className="text-lg lg:text-xl font-light leading-relaxed opacity-70 italic">A collective reservoir for the future of craft.</p>
                        </div>
                    </div>
                </div>
                {/* Subtle Geometric Backdrop */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }}></div>
            </section>

            {/* Call to Action */}
            <section className="py-24 lg:py-64 container text-center space-y-12 lg:space-y-20">
                <div className="space-y-8 lg:space-y-10">
                    <h2 className={`${fonts.display} text-5xl sm:text-7xl md:text-[10rem] tracking-tighter leading-[0.85]`}>{t('join_movement')}</h2>
                    <p className="text-xl md:text-3xl font-light italic max-w-2xl mx-auto opacity-40 leading-relaxed text-pretty px-4">
                        “We do not just sell work. We preserve the silence in which masterpieces are born.”
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-6 lg:gap-12 pt-8 px-6">
                    <Link href="/explore" className="w-full sm:w-auto">
                        <Button size="lg" className="h-16 px-16 w-full sm:w-auto group button-artisan bg-primary text-primary-foreground">
                            {t('support_artisans').toUpperCase()} <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </Link>
                    <Link href="/collaborate" className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="h-16 px-16 w-full sm:w-auto button-artisan">
                            {t('share_craft').toUpperCase()}
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
