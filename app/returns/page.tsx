"use client";

import { useLocale } from "@/frontend/contexts/LocaleContext";
import { Mail, Phone, MessageSquare, ArrowRight } from "lucide-react";

export default function ReturnsPage() {
    return (
        <div className="container py-32 max-w-3xl space-y-20">
            <div className="space-y-6 text-center">
                <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight">Returns.</h1>
                <p className="text-muted-foreground italic font-light">Honoring the craft, respecting the journey.</p>
            </div>

            <div className="space-y-12">
                <div className="space-y-6">
                    <h2 className="font-serif text-3xl font-medium tracking-tight">Our Policy</h2>
                    <p className="text-muted-foreground leading-relaxed font-light">
                        Because each item is handcrafted specifically for you, we handle returns on a case-by-case basis. We prioritize fairness to both the collector and the artisan. 
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-border/10">
                    <div className="space-y-4">
                        <h4 className="font-serif text-xl font-medium tracking-tight">30-Day Window</h4>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">Returns for damage or defects must be initiated within 30 days of receipt.</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-serif text-xl font-medium tracking-tight">No Returns on Custom</h4>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">Custom commissioned works are final sale unless damaged during transit.</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-serif text-xl font-medium tracking-tight">Return Process</h4>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">Email orders@artisan-platform.com with your Order # and photos of the item.</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-serif text-xl font-medium tracking-tight">Restocking Fee</h4>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">A 10% fund contribution is subtracted from non-defect returns to cover community labor.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
