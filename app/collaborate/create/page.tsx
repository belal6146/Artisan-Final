"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft } from "lucide-react";
import { createCollaboration } from "@/backend/actions/collaboration";
import { Select } from "@/components/ui/select-minimal";

export default function CreateCollaborationPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        if (!user) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const idToken = await (user as any).getIdToken();
            const result = await createCollaboration({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as any,
                compensation: {
                    type: formData.get('compType') as any,
                    amount: formData.get('compAmount') ? Number(formData.get('compAmount')) : undefined,
                    currency: formData.get('compCurrency') as string || 'EUR',
                    details: formData.get('compDetails') as string
                },
                location: formData.get('location') as string,
                locationType: formData.get('locationType') as any,
            }, idToken);

            if (result.success) {
                router.push('/collaborate');
            } else {
                setError(result.error || "Failed to post opportunity");
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <ProtectedRoute>
            <div className="container py-24 px-6 max-w-4xl mx-auto space-y-16">
                <div className="space-y-12">
                    <Button variant="ghost" className="h-10 px-0 hover:bg-transparent hover:text-primary text-[10px] font-bold tracking-widest uppercase transition-all group" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Collaborate
                    </Button>

                    <div className="space-y-6 border-l-2 border-primary/20 pl-8">
                        <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter leading-none">
                            Post an Opportunity
                        </h1>
                        <p className="text-xl text-muted-foreground font-light italic leading-relaxed max-w-2xl">
                            Share your project or request skills from the community. Let's build the human-powered network together.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-6 bg-red-500/5 border border-red-500/10 text-red-600 text-xs font-bold tracking-widest uppercase animate-in fade-in">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-16 bg-secondary/5 border border-border/10 p-12 md:p-16">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Strategic Title</label>
                            <Input name="title" required placeholder="e.g. Seeking Potter for Joint Exhibition" className="bg-background" />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Narrative & Scope</label>
                            <Textarea name="description" required placeholder="Describe the project, what you're looking for, and the timeline..." className="bg-background" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                 <label className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Collective Type</label>
                                 <Select name="type" required className="bg-background">
                                     <option value="Project">Project</option>
                                     <option value="Mentorship">Mentorship</option>
                                     <option value="Event">Event</option>
                                     <option value="Other">Other</option>
                                 </Select>
                             </div>
                             <div className="space-y-4">
                                 <label className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Regional Context</label>
                                 <Select name="locationType" required className="bg-background">
                                     <option value="Remote">Remote</option>
                                     <option value="On-site">On-site</option>
                                     <option value="Hybrid">Hybrid</option>
                                 </Select>
                             </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Primary Location</label>
                            <Input name="location" required placeholder="e.g. Amsterdam, NL or Global" className="bg-background" />
                        </div>
                    </div>

                    <div className="space-y-8 pt-12 border-t border-border/10">
                        <div className="space-y-2">
                            <h3 className="font-serif text-3xl font-medium tracking-tight">Reciprocity Architecture</h3>
                            <p className="text-sm text-muted-foreground italic font-light">Transparency check: All project posts must declare a budget range or value exchange.</p>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                 <label className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Compensation Model</label>
                                 <Select name="compType" required className="bg-background">
                                     <option value="Money">Paid (Monetary Budget)</option>
                                     <option value="Exchange">Skill Equilibrium (Reciprocal)</option>
                                     <option value="Unpaid">Pro-Bono / Community (Impact only)</option>
                                 </Select>
                             </div>
                             <div className="space-y-4">
                                 <label className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Economic Allocation</label>
                                 <div className="flex gap-4">
                                     <Select name="compCurrency" className="w-[120px] bg-background">
                                         <option value="EUR">EUR</option>
                                         <option value="USD">USD</option>
                                         <option value="GBP">GBP</option>
                                     </Select>
                                     <Input name="compAmount" type="number" placeholder="Value..." required className="bg-background" />
                                 </div>
                             </div>
                         </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Direct Benefits</label>
                            <Input name="compDetails" placeholder="e.g. Travel expenses covered, Materials provided..." className="bg-background" />
                        </div>
                    </div>

                    <div className="pt-12 flex flex-col md:flex-row justify-end gap-6 items-center border-t border-border/10">
                        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-40">Commitment to transparency required</span>
                        <div className="flex gap-4 w-full md:w-auto">
                            <Button variant="outline" type="button" className="h-16 px-10 flex-1 md:flex-none" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="h-16 px-16 flex-1 md:flex-none shadow-2xl transition-all">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Relaying...
                                    </>
                                ) : 'Initialise Call'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}
