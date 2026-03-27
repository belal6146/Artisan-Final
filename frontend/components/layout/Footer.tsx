"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/frontend/contexts/LocaleContext";

export function Footer() {
    const { language, currency, t } = useLocale();
    return (
        <footer className="w-full border-t border-border/10 py-16 bg-muted/5 font-sans">
            <div className="container mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="md:col-span-1 space-y-6">
                    <Link href="/" className="font-serif text-3xl font-medium tracking-tighter">
                        Artisan.
                    </Link>
                    <p className="text-[13px] leading-relaxed text-muted-foreground/80 max-w-xs">
                        {t('brand_tagline')}
                    </p>
                    <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-primary/40 pt-2 border-t border-border/10">
                        Human-to-Human Connection
                    </div>
                    <div className="flex gap-4 pt-2">
                            <Instagram className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                            <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                            <Facebook className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                    </div>
                </div>

                {/* Explore Column */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-card-foreground">{t('explore')}</h4>
                    <ul className="space-y-4">
                        <li><Link href="/explore" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">{t('gallery')} <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                        <li><Link href="/events" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t('workshops')}</Link></li>
                        <li><Link href="/collaborate" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t('collaborate')}</Link></li>
                        <li><Link href="/journal" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t('journal')}</Link></li>
                    </ul>
                </div>

                {/* Support Column */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-card-foreground">{t('support')}</h4>
                    <ul className="space-y-4">
                        <li><Link href="/faq" className="text-xs text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
                        <li><Link href="/shipping" className="text-xs text-muted-foreground hover:text-primary transition-colors">Shipping</Link></li>
                        <li><Link href="/returns" className="text-xs text-muted-foreground hover:text-primary transition-colors">Returns</Link></li>
                        <li><Link href="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                    </ul>
                </div>

                {/* Legal Column */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-card-foreground">{t('legal')}</h4>
                    <ul className="space-y-4">
                        <li><Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                        <li><Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-6 sm:px-12 mt-16 pt-8 border-t border-border/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-[10px] font-medium tracking-widest text-muted-foreground/40 uppercase">
                    © {new Date().getFullYear()} Artisan Platform. Dedicated to Human Craft.
                </p>
                <div className="flex gap-6">
                    <span className="text-[10px] font-medium tracking-widest text-muted-foreground/40 uppercase cursor-pointer hover:text-primary transition-colors">{language}</span>
                    <span className="text-[10px] font-medium tracking-widest text-muted-foreground/40 uppercase cursor-pointer hover:text-primary transition-colors">{currency}</span>
                </div>
            </div>
        </footer>
    );
}
