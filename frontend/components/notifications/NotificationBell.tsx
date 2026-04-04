"use client";

import { useState, useEffect } from "react";
import { Bell, Heart, Calendar, ShoppingBag, Loader2 } from "lucide-react";
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import { db } from "@/backend/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/frontend/lib/utils";
import Link from "next/link";

import { logger } from "@/backend/lib/logger";

export function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.read).length);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            const docRef = doc(db, "notifications", id);
            await updateDoc(docRef, { read: true });
        } catch (e: any) {
            logger.error('SYSTEM_ERROR', { userId: user?.uid, message: "Mark as read failed", error: e.message, source: 'frontend' });
        }
    };

    const markAllRead = async () => {
        try {
            const promises = notifications.filter(n => !n.read).map(n => 
                updateDoc(doc(db, "notifications", n.id), { read: true })
            );
            await Promise.all(promises);
        } catch (e: any) {
            logger.error('SYSTEM_ERROR', { userId: user?.uid, message: "Mark all as read failed", error: e.message, source: 'frontend' });
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'event_rsvp': return <Calendar className="h-4 w-4" />;
            case 'artwork_purchase': return <ShoppingBag className="h-4 w-4" />;
            case 'support': return <Heart className="h-4 w-4" />;
            default: return <Bell className="h-4 w-4" />;
        }
    };

    if (!user) return null;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative h-8 w-8 flex items-center justify-center rounded-none bg-secondary/30 ring-1 ring-border/20 hover:ring-primary/40 transition-all group"
            >
                <Bell className={cn("h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors", unreadCount > 0 && "animate-pulse")} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background flex items-center justify-center text-[6px] font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-background border border-border/10 shadow-2xl z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border/10 flex justify-between items-center bg-secondary/10">
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/60">ALERTS</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[9px] font-bold tracking-widest text-muted-foreground hover:text-primary uppercase underline underline-offset-4 decoration-border transition-all">Mark all as read</button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-border/5">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto opacity-10" />
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={cn(
                                        "p-5 flex gap-4 transition-colors hover:bg-secondary/5",
                                        !n.read && "bg-primary/[0.02] border-l-2 border-primary"
                                    )}
                                    onMouseEnter={() => !n.read && markAsRead(n.id)}
                                >
                                    <div className="shrink-0 pt-1 text-primary/40 leading-none">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-serif leading-tight">
                                            {n.message}
                                        </p>
                                        <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <p className="font-serif italic text-muted-foreground text-sm">Quiet moments in the studio.</p>
                                <div className="text-[9px] font-bold tracking-widest uppercase opacity-20">NO NOTIFICATIONS</div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-border/10">
                        <Link 
                            href={`/profile/${user.uid}?tab=history`} 
                            onClick={() => setIsOpen(false)}
                            className="block w-full py-2 text-center text-[10px] font-bold tracking-[0.2em] bg-secondary/20 hover:bg-primary hover:text-white transition-all uppercase"
                        >
                            View Entire History
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
