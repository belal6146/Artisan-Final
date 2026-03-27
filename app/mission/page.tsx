import { Leaf, Users, Globe, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function MissionPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-32 px-6 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />
                
                <div className="container mx-auto space-y-12 text-center max-w-5xl">
                    <h1 className="font-serif text-6xl md:text-9xl font-medium tracking-tighter text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        The Mission.
                    </h1>
                    <p className="max-w-3xl text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mx-auto italic animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                        We are a window to the world’s hidden heritage. 
                        Protecting the makers, preserving the craft, and bridging the gap between global demand and rural opportunity.
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
                            <h3 className="font-serif text-2xl font-medium tracking-tight">Humanity First</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-light">
                                We guarantee an living wage for every artisan. By eliminating middlemen, we ensure that creators receive the lion's share of the value they create.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 2: Environment */}
                    <div className="space-y-8 p-12 border border-border/5 hover:border-border/20 transition-all bg-muted/5">
                        <Leaf className="w-8 h-8 text-green-600/40" />
                        <div className="space-y-4">
                            <h3 className="font-serif text-2xl font-medium tracking-tight">Environmental Stewardship</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-light">
                                Zero-plastic packaging. Carbon-neutral shipping. We prioritize renewable materials and organic dyes, ensuring our footprint is as light as our touch.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 3: Culture */}
                    <div className="space-y-8 p-12 border border-border/5 hover:border-border/20 transition-all bg-muted/5">
                        <Globe className="w-8 h-8 text-amber-600/40" />
                        <div className="space-y-4">
                            <h3 className="font-serif text-2xl font-medium tracking-tight">Cultural Preservation</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-light">
                                We document the stories behind every craft. We don't just sell products; we safeguard the intangible heritage of rural communities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Transparency Commitment */}
            <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pattern-dots" /> {/* Abstract pattern placeholder */}
                <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
                    <h2 className="font-serif text-4xl md:text-5xl mb-8">Radical Transparency</h2>
                    <p className="text-xl md:text-2xl font-light opacity-90 max-w-4xl mx-auto mb-12">
                        Trust is earned, not given. That's why we show you exactly where your money goes.
                        Every product page features a detailed price breakdown, so you can buy with confidence.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto text-left">
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h4 className="font-bold text-lg mb-2">Artisan Share</h4>
                            <p className="text-sm opacity-80">Direct compensation for time, skill, and labor.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h4 className="font-bold text-lg mb-2">Material Cost</h4>
                            <p className="text-sm opacity-80">Sustainable, high-quality raw materials.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h4 className="font-bold text-lg mb-2">Platform Fee</h4>
                            <p className="text-sm opacity-80">Keeping the lights on and the servers running.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h4 className="font-bold text-lg mb-2">Impact Fund</h4>
                            <p className="text-sm opacity-80">Reinvested into community education & tools.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 text-center px-6">
                <h2 className="font-serif text-4xl mb-6">Join the Movement</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                    Whether you are a creator or a collector, your choices shape the world. Choose wisely.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button asChild size="lg" className="rounded-full px-8 text-base">
                        <Link href="/explore">Support Artisans</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base">
                        <Link href="/collaborate">Share Your Craft</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
