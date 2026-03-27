"use client";

import { useLocale } from "@/frontend/contexts/LocaleContext";
import { Mail, Phone, MessageSquare, ArrowRight, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen relative font-sans overflow-hidden">
             {/* Artful Blurs */}
             <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />
             <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />

            <div className="container py-32 grid grid-cols-1 lg:grid-cols-2 gap-32 relative z-10">
                {/* Text Column */}
                <div className="space-y-12">
                     <div className="space-y-6">
                         <h1 className="font-serif text-6xl md:text-8xl font-medium tracking-tighter">Get in Touch.</h1>
                         <p className="text-xl md:text-2xl text-muted-foreground font-light italic leading-relaxed max-w-lg">
                             We value human conversation above automation.
                         </p>
                     </div>

                    <div className="space-y-12 pt-12 border-t border-border/10">
                         <div className="flex items-start gap-6">
                             <Mail className="h-6 w-6 text-primary/40 mt-1" />
                             <div className="space-y-1">
                                 <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground/60">Email</h4>
                                 <p className="text-xl font-serif">support@artisan-platform.com</p>
                             </div>
                         </div>
                         <div className="flex items-start gap-6">
                             <Phone className="h-6 w-6 text-primary/40 mt-1" />
                             <div className="space-y-1">
                                 <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground/60">Phone (9AM-5PM IST)</h4>
                                 <p className="text-xl font-serif">+91 98765 43210</p>
                             </div>
                         </div>
                         <div className="flex items-start gap-6">
                             <MessageSquare className="h-6 w-6 text-primary/40 mt-1" />
                             <div className="space-y-1">
                                 <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground/60">Social</h4>
                                 <div className="flex gap-4 pt-2">
                                     <a href="#" className="hover:text-primary transition-colors"><Instagram className="h-4 w-4" /></a>
                                     <a href="#" className="hover:text-primary transition-colors"><Twitter className="h-4 w-4" /></a>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Form Column */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/20 p-12 md:p-16 space-y-10 shadow-2xl relative overflow-hidden">
                     {/* Soft Gradient Overlay */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full blur-3xl pointer-events-none" />

                     <div className="space-y-2">
                         <h3 className="font-serif text-3xl font-medium tracking-tight">Direct Inquiry</h3>
                         <p className="text-sm text-muted-foreground font-light">Expect a human response within 24-48 hours.</p>
                     </div>

                     <form className="space-y-8">
                         <div className="space-y-2 group">
                             <label className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-50 block group-focus-within:opacity-100 transition-opacity">Your Name</label>
                             <input type="text" className="w-full bg-transparent border-b border-border/20 py-4 focus:outline-none focus:border-primary transition-all font-serif text-lg placeholder:opacity-20" placeholder="A Fellow Artist or Collector" />
                         </div>
                         <div className="space-y-2 group">
                             <label className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-50 block group-focus-within:opacity-100 transition-opacity">Email Address</label>
                             <input type="email" className="w-full bg-transparent border-b border-border/20 py-4 focus:outline-none focus:border-primary transition-all font-serif text-lg" />
                         </div>
                         <div className="space-y-2 group">
                             <label className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-50 block group-focus-within:opacity-100 transition-opacity">Message</label>
                             <textarea rows={4} className="w-full bg-transparent border-b border-border/20 py-4 focus:outline-none focus:border-primary transition-all font-serif text-lg resize-none" placeholder="How can we grow together?"></textarea>
                         </div>
                         <Button className="w-full h-16 rounded-none bg-primary text-[10px] font-bold tracking-[0.3em] uppercase hover:scale-[1.02] active:scale-[0.98] shadow-xl transition-all">
                             SEND MESSAGE <ArrowRight className="ml-2 h-4 w-4" />
                         </Button>
                     </form>
                </div>
            </div>
        </div>
    );
}
