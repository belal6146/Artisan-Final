"use client";

import { useLocale } from "@/frontend/contexts/LocaleContext";

export default function PrivacyPage() {
    return (
        <div className="container py-32 max-w-3xl space-y-20">
            <div className="space-y-6 text-center">
                <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight">Privacy.</h1>
                <p className="text-muted-foreground italic font-light">Your data, your craft, your choice.</p>
            </div>

            <div className="space-y-12 font-light text-muted-foreground leading-relaxed prose prose-slate max-w-none">
                <section className="space-y-6 text-center italic opacity-60">
                    <p>"We believe privacy is a human right. Our platform is built to protect you, not to exploit your attention."</p>
                </section>

                <section className="space-y-6">
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">Data Sovereignty</h2>
                    <p>We do not use trackers or third-party cookies for behavioral advertising. Your interaction with the platform is logged only for technical improvements and security audits. We do not sell your personal data.</p>
                </section>

                <section className="space-y-6">
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">Secure Storage</h2>
                    <p>All personal and financial information is encrypted and stored in secure, compliance-hardened environments. We use industry-standard authentication to ensure only you can access your profile and history.</p>
                </section>

                <section className="space-y-6">
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">Transparency Report</h2>
                    <p>Twice yearly, we publish an anonymized report of our platform operations, showing how data is handled and what security audits have been performed.</p>
                </section>

                <section className="space-y-6">
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">Your Rights</h2>
                    <p>You have the right to export your data or delete your account at any time. We believe in the right to be forgotten.</p>
                </section>
            </div>
        </div>
    );
}
