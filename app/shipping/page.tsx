"use client";

import { useLocale } from "@/frontend/contexts/LocaleContext";
import { Truck, Globe, MapPin, Package } from "lucide-react";

export default function ShippingPage() {
    const { t } = useLocale();

    return (
        <div className="container py-32 max-w-5xl space-y-32">
            <div className="space-y-6 text-center">
                <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight">Shipping.</h1>
                <p className="text-muted-foreground italic font-light">Global reach, local care.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div className="space-y-8">
                    <h2 className="font-serif text-3xl font-medium tracking-tight border-b border-border/10 pb-4">Domestic (India/Region)</h2>
                    <ul className="space-y-6 text-sm text-muted-foreground leading-relaxed font-light">
                        <li>Standard Shipping: 3-5 business days. Free for orders over $50.</li>
                        <li>Express: 1-2 business days. Flat rate of $10.</li>
                        <li>All regional shipments are handled via Carbon-Neutral courier services.</li>
                    </ul>
                </div>

                <div className="space-y-8">
                    <h2 className="font-serif text-3xl font-medium tracking-tight border-b border-border/10 pb-4">Global Shipping</h2>
                    <ul className="space-y-6 text-sm text-muted-foreground leading-relaxed font-light">
                        <li>International: 7-14 business days. Rates calculated at checkout based on weight and provenance.</li>
                        <li>Customs & Duties: Included in the shipping price for most regions, ensuring a seamless experience.</li>
                        <li>All transit carbon is offset 200% via regional reforestation projects.</li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-secondary/10 p-10 space-y-4">
                    <MapPin className="h-6 w-6 text-primary/40" />
                    <h4 className="font-serif text-xl">Direct Origin</h4>
                    <p className="text-xs opacity-70 leading-relaxed font-light">Ships directly from the artist's studio to maintain piece integrity and minimize handling.</p>
                </div>
                <div className="bg-secondary/10 p-10 space-y-4">
                    <ShieldCheck className="h-6 w-6 text-primary/40" />
                    <h4 className="font-serif text-xl">Insured Transit</h4>
                    <p className="text-xs opacity-70 leading-relaxed font-light">Every artifact is insured for its full value from the moment it leaves the studio until it reaches your hands.</p>
                </div>
                <div className="bg-secondary/10 p-10 space-y-4">
                    <Package className="h-6 w-6 text-primary/40" />
                    <h4 className="font-serif text-xl">Zero Plastic</h4>
                    <p className="text-xs opacity-70 leading-relaxed font-light">All packaging is recycled, biodegradable, or compostable. We use natural padding like upcycled cotton scraps.</p>
                </div>
                <div className="bg-secondary/10 p-10 space-y-4">
                    <Globe className="h-6 w-6 text-primary/40" />
                    <h4 className="font-serif text-xl">Carbon Offset</h4>
                    <p className="text-xs opacity-70 leading-relaxed font-light">We calculate and double-offset the carbon for every mile your art travels.</p>
                </div>
            </div>
        </div>
    );
}

import { ShieldCheck } from "lucide-react";
