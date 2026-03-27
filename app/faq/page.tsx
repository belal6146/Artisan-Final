"use client";

import { useLocale } from "@/frontend/contexts/LocaleContext";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/frontend/lib/utils";

export default function FAQPage() {
    const { t } = useLocale();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const questions = [
        {
            q: "How does the price breakdown work?",
            a: "At Artisan, transparency is non-negotiable. Every price includes the artist's labor (60%), material sourcing (25%), community impact fund (10%), and platform operations (5%). You are not just buying art; you are investing in a sustainable community."
        },
        {
            q: "Where do you ship from?",
            a: "We ship directly from the artist's location to reduce our carbon footprint and ensure the piece's provenance remains intact. Most works are shipped from rural hubs in Southeast Asia, Africa, and South America."
        },
        {
            q: "What is the Impact Fund?",
            a: "The Impact Fund is used to provide interest-free loans for equipment, subsidize healthcare for artisan families, and fund local workshops for the next generation of makers."
        },
        {
            q: "How is authenticity verified?",
            a: "Every piece comes with a physical certificate and a digital record of work (the 'Process Journal'). We use community verification where local elders or established masters vet new talent."
        }
    ];

    return (
        <div className="container py-32 max-w-3xl space-y-20">
            <div className="space-y-6 text-center">
                <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight">FAQ.</h1>
                <p className="text-muted-foreground italic font-light">Navigating our professional ecosystem.</p>
            </div>

            <div className="space-y-8">
                {questions.map((item, idx) => (
                    <div 
                        key={idx}
                        className="group border border-border/10 p-8 hover:bg-muted/5 transition-all cursor-pointer"
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif text-xl md:text-2xl font-medium tracking-tight group-hover:text-primary transition-colors">
                                {item.q}
                            </h3>
                            <ChevronDown className={cn("h-5 w-5 text-muted-foreground/40 transition-transform duration-500", openIndex === idx && "rotate-180")} />
                        </div>
                        {openIndex === idx && (
                            <p className="mt-6 text-muted-foreground leading-relaxed font-light animate-in fade-in slide-in-from-top-2 duration-500">
                                {item.a}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="pt-20 border-t border-border/10 text-center">
                <p className="text-sm text-muted-foreground/60 mb-6">Still have questions? Our human support team is ready to help.</p>
                <a href="/contact" className="text-[10px] font-bold tracking-[0.3em] uppercase border border-primary/20 px-10 py-4 hover:bg-primary hover:text-white transition-all">
                    Contact Us
                </a>
            </div>
        </div>
    );
}
