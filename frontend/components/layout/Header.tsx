"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/frontend/lib/utils";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useLocale } from "@/frontend/contexts/LocaleContext";

export function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const { t } = useLocale();

    const navLinks = [
        { name: t('gallery').toUpperCase(), href: "/explore" },
        { name: t('workshops').toUpperCase(), href: "/events" },
        { name: t('collaborate').toUpperCase(), href: "/collaborate" },
        { name: t('journal').toUpperCase(), href: "/journal" },
        { name: t('mission').toUpperCase(), href: "/mission" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/60 backdrop-blur-xl">
            <div className="container mx-auto flex h-20 items-center justify-between px-6 sm:px-12">
                {/* Logo */}
                <Link href="/" className="font-serif text-3xl font-medium tracking-tighter hover:opacity-70 transition-opacity">
                    Artisan.
                </Link>

                {/* Navigation - Desktop */}
                <nav className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.href} 
                            href={link.href} 
                            className={cn(
                                "text-[11px] font-semibold tracking-[0.2em] transition-all hover:text-primary/70",
                                pathname === link.href ? "text-primary border-b border-primary/40 pb-1" : "text-muted-foreground"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Auth Actions */}
                <div className="flex items-center gap-6">
                    <LocaleSwitcher />
                    <span className="h-6 w-[1px] bg-border/10 hidden sm:block" />
                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link href={`/profile/${user.uid}`} className="flex items-center gap-2 group">
                                <div className="h-8 w-8 rounded-full bg-secondary/30 flex items-center justify-center ring-1 ring-border/20 group-hover:ring-primary/40 transition-all">
                                    <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-[10px] font-bold tracking-widest text-muted-foreground group-hover:text-primary transition-colors hidden sm:block uppercase">PROFILE</span>
                            </Link>
                            <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth">
                            <Button size="sm" className="px-8 rounded-none bg-primary text-[11px] font-bold tracking-widest h-10 uppercase transition-all hover:scale-105 active:scale-95">
                                SIGN IN
                            </Button>
                        </Link>
                    )}
                    {/* Mobile Menu Icon */}
                    <Menu className="lg:hidden h-5 w-5 text-muted-foreground cursor-pointer" />
                </div>
            </div>
        </header>
    );
}
