"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User,
    LogOut,
    Menu,
    X,
    Loader2,
    Palette,
    Calendar,
    PenTool,
    Layout,
    Heart,
    Home,
    Settings,
    Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/frontend/lib/utils";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useLocale } from "@/frontend/contexts/LocaleContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Header() {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const { t } = useLocale();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 🏆 World-Class Navigation Mapping
    const navLinks = [
        { name: 'HOME', href: "/", icon: Home },
        { name: t('gallery').toUpperCase() || 'GALLERY', href: "/explore", icon: Palette },
        { name: t('workshops').toUpperCase() || 'WORKSHOPS', href: "/events", icon: Calendar },
        { name: t('collaborate').toUpperCase() || 'COLLABORATE', href: "/collaborate", icon: PenTool },
        { name: t('journal').toUpperCase() || 'JOURNAL', href: "/journal", icon: Layout },
        { name: t('mission').toUpperCase() || 'MISSION', href: "/mission", icon: Heart },
    ];

    const closeMenu = () => setIsMenuOpen(false);

    // 🛡️ Prevent scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/5 bg-background shadow-sm">
            <div className="container mx-auto flex h-20 lg:h-28 items-center justify-between px-6 lg:px-0">
                {/* Logo */}
                <Link href="/" className="font-serif text-3xl lg:text-4xl font-medium tracking-tighter hover:opacity-70 transition-all">
                    Artisan.
                </Link>

                {/* Navigation - Desktop (High-Precision) */}
                <nav className="hidden lg:flex items-center gap-12">
                    {navLinks.filter(l => l.href !== "/").map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "nav-link-premium text-[12px] font-bold tracking-[0.5em] uppercase",
                                pathname === link.href ? "text-primary opacity-100" : "text-primary/30"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Auth Actions */}
                <div className="flex items-center gap-2 lg:gap-8">
                    <div className="hidden lg:flex items-center gap-8">
                        <LocaleSwitcher />
                        <span className="h-6 w-[1px] bg-border/20" />
                    </div>

                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/20" />
                    ) : user ? (
                        <div className="flex items-center gap-4 lg:gap-8">
                            <NotificationBell />
                            <Link href={`/profile/${user.uid}`} className="flex items-center gap-3 group">
                                <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center ring-1 ring-border/10 group-hover:ring-primary/30 transition-all overflow-hidden relative">
                                    <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground/50 group-hover:text-primary transition-colors hidden xl:block uppercase">MY STUDIO</span>
                            </Link>
                            <button onClick={logout} className="text-muted-foreground/40 hover:text-destructive transition-colors hidden sm:block">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth" className="hidden sm:block">
                            <Button size="sm" className="px-8 rounded-none bg-primary text-[10px] font-bold tracking-[0.4em] h-10 uppercase transition-all shadow-none">
                                JOIN
                            </Button>
                        </Link>
                    )}

                    {/* 🍔 Premium Mobile Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden h-12 w-12 flex items-center justify-end text-muted-foreground transition-all active:scale-90"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* 🎨 Immersive World-Class Navigation Tray */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    {/* Darker Velvety Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-700"
                        onClick={closeMenu}
                    />

                    {/* Drawer Content - Solid Surface */}
                    <div className="absolute right-0 top-0 h-full w-[88%] bg-background shadow-[0_0_100px_-15px_rgba(0,0,0,0.6)] animate-in slide-in-from-right duration-500 ease-out flex flex-col border-l border-border/10">

                        {/* Drawer Branding */}
                        <div className="flex items-center justify-between p-8 pt-10 border-b border-border/5">
                            <div className="flex flex-col">
                                <span className="font-serif text-3xl tracking-tighter italic text-primary">Studio Hub.</span>
                                <span className="text-[8px] font-bold tracking-[0.6em] text-muted-foreground/40 uppercase mt-1">Artisan Collective</span>
                            </div>
                            <button
                                onClick={closeMenu}
                                className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary/20 hover:bg-secondary/30 transition-all shadow-sm"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Staggered Navigation Grid */}
                        <div className="flex-1 overflow-y-auto px-8 pt-6 pb-20 scrollbar-hide">
                            <div className="grid gap-6">
                                {navLinks.map((link, i) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={closeMenu}
                                        className={cn(
                                            "group flex items-center justify-between p-6 rounded-none border border-border/5 bg-secondary/5 hover:bg-secondary/10 transition-all duration-300",
                                            pathname === link.href ? "bg-primary/5 border-primary/5" : ""
                                        )}
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                                                pathname === link.href ? "bg-primary text-primary-foreground shadow-lg" : "bg-background text-muted-foreground group-hover:text-primary"
                                            )}>
                                                <link.icon className="h-4 w-4" />
                                            </div>
                                            <span className={cn(
                                                "text-xs font-bold tracking-[0.25em] transition-all uppercase",
                                                pathname === link.href ? "text-primary" : "text-muted-foreground/80 group-hover:text-primary"
                                            )}>
                                                {link.name}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* 🕹️ The Thumb-Zone Action Center (World-Class Utility) */}
                        <div className="mt-auto p-8 border-t border-border/5 bg-secondary/5 space-y-8 pb-12">

                            <div className="grid grid-cols-2 gap-4">
                                {!user ? (
                                    <Link href="/auth" onClick={closeMenu} className="col-span-2">
                                        <Button className="w-full h-16 rounded-none bg-primary text-[10px] font-bold tracking-[0.4em] uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                                            JOIN THE COLLECTIVE
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={`/profile/${user.uid}`}
                                            onClick={closeMenu}
                                            className="flex flex-col items-center justify-center p-6 bg-background border border-border/10 group hover:border-primary/20 transition-all h-24"
                                        >
                                            <User className="h-4 w-4 text-muted-foreground group-hover:text-primary mb-3" />
                                            <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-muted-foreground/40 group-hover:text-primary transition-all">MY STUDIO</span>
                                        </Link>
                                        <button
                                            onClick={() => { logout(); closeMenu(); }}
                                            className="flex flex-col items-center justify-center p-6 bg-background border border-border/10 group hover:border-destructive/20 transition-all h-24"
                                        >
                                            <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-destructive mb-3" />
                                            <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-muted-foreground/40 group-hover:text-destructive transition-all">LEAVE</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center gap-3">
                                    <Globe className="h-3 w-3 text-muted-foreground/30" />
                                    <LocaleSwitcher />
                                </div>
                                <div className="flex items-center gap-3 opacity-20">
                                    <Settings className="h-3 w-3" />
                                    <span className="text-[7px] font-bold tracking-[0.3em] uppercase">V 1.0.4 PRODUCTION</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
