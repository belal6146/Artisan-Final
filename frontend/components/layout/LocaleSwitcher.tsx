"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { Globe, Coins, ChevronDown } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/lib/utils";

export function LocaleSwitcher() {
    const { language, setLanguage, currency, setCurrency } = useLocale();
    const [langOpen, setLangOpen] = useState(false);
    const [curOpen, setCurOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);
    const curRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(event.target as Node)) setLangOpen(false);
            if (curRef.current && !curRef.current.contains(event.target as Node)) setCurOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const languages = [
        { code: "en", label: "English" },
        { code: "fr", label: "Français" },
        { code: "es", label: "Español" },
        { code: "de", label: "Deutsch" }
    ];

    const currencies = [
        { code: "EUR", label: "EUR (€)" },
        { code: "USD", label: "USD ($)" },
        { code: "GBP", label: "GBP (£)" },
        { code: "JPY", label: "JPY (¥)" }
    ];

    return (
        <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
                <button 
                    onClick={() => { setLangOpen(!langOpen); setCurOpen(false); }}
                    className="flex items-center gap-2 h-8 px-2 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-all duration-300"
                >
                    <Globe className="h-3 w-3" /> {language}
                    <ChevronDown className={cn("h-3 w-3 transition-transform duration-500", langOpen && "rotate-180")} />
                </button>
                
                {langOpen && (
                    <div className="absolute top-full right-0 mt-2 py-2 bg-white border border-slate-100 shadow-2xl z-[100] min-w-[120px] animate-in fade-in slide-in-from-top-1 duration-300">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => { setLanguage(lang.code as any); setLangOpen(false); }}
                                className={cn(
                                    "w-full text-left px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-slate-50 transition-colors",
                                    language === lang.code ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <span className="h-4 w-[1px] bg-border/20 mx-1" />

            {/* Currency Switcher */}
            <div className="relative" ref={curRef}>
                <button 
                    onClick={() => { setCurOpen(!curOpen); setLangOpen(false); }}
                    className="flex items-center gap-2 h-8 px-2 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-all duration-300"
                >
                    <Coins className="h-3 w-3" /> {currency}
                    <ChevronDown className={cn("h-3 w-3 transition-transform duration-500", curOpen && "rotate-180")} />
                </button>
                
                {curOpen && (
                    <div className="absolute top-full right-0 mt-2 py-2 bg-white border border-slate-100 shadow-2xl z-[100] min-w-[120px] animate-in fade-in slide-in-from-top-1 duration-300">
                        {currencies.map((cur) => (
                            <button
                                key={cur.code}
                                onClick={() => { setCurrency(cur.code as any); setCurOpen(false); }}
                                className={cn(
                                    "w-full text-left px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-slate-50 transition-colors",
                                    currency === cur.code ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {cur.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
