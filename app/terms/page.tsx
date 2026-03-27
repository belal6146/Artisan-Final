"use client";

import { useLocale } from "@/frontend/contexts/LocaleContext";

export default function TermsPage() {
    return (
        <div className="container py-32 max-w-3xl space-y-20">
            <div className="space-y-6 text-center">
                <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight">Terms.</h1>
                <p className="text-muted-foreground italic font-light">The foundations of our ecosystem.</p>
            </div>

            <div className="space-y-12 font-light text-muted-foreground leading-relaxed prose prose-slate max-w-none">
                <section className="space-y-6">
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">1. Professional Integrity</h2>
                    <p>All artisans and collectors agree to act with the highest level of professional integrity. Our ecosystem is built on mutual respect and the preservation of human craft.</p>
                </section>

                <section className="space-y-6">
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">2. Economic Rights</h2>
                    <p>Artisans retain full ownership of their intellectual property. The platform acts only as a facilitator for global access and secure transactions.</p>
                </section>

                <section className="space-y-6">
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">3. Secure Transactions</h2>
                    <p>Payments are held in escrow until shipping is confirmed, protecting both the buyer and the seller. Disputes are handled manually by our human community team.</p>
                </section>

                <section className="space-y-6">
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">4. Community Fund</h2>
                    <p>10% of every transaction is allocated to the Community Impact Fund. This fund is used to support underrepresented artists and preserve rural heritage.</p>
                </section>
            </div>
        </div>
    );
}
