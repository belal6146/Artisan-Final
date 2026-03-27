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
                authorId: user.uid,
                authorName: user.displayName || "Anonymous",
                authorAvatarUrl: user.photoURL || undefined
            });

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
            <div className="container py-12 px-4 max-w-2xl mx-auto">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Collaborate
                </Button>

                <h1 className="font-serif text-3xl font-medium mb-2">Post an Opportunity</h1>
                <p className="text-muted-foreground mb-8">Share your project or request skills from the community.</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input name="title" required placeholder="e.g. Seeking Potter for Joint Exhibition" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea name="description" required rows={5} placeholder="Describe the project, what you're looking for, and the timeline..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                    <option value="Project">Project</option>
                                    <option value="Mentorship">Mentorship</option>
                                    <option value="Event">Event</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location Setting</label>
                                <select name="locationType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                    <option value="Remote">Remote</option>
                                    <option value="On-site">On-site</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location (City/Country)</label>
                            <Input name="location" required placeholder="e.g. Amsterdam, NL or Remote" />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-border pt-8">
                        <h3 className="font-medium text-lg">Compensation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Compensation Type</label>
                                <select name="compType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                    <option value="Money">Paid (Monetary Budget)</option>
                                    <option value="Exchange">Skill Equilibrium (Reciprocal)</option>
                                    <option value="Unpaid">Pro-Bono / Community (Social Impact only)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estimated Budget / Value</label>
                                <div className="flex gap-2">
                                    <select name="compCurrency" className="w-20 flex h-10 rounded-md border border-input bg-background px-2 py-2 text-sm">
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                    <Input name="compAmount" type="number" placeholder="Enter amount..." required />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">Transparency check: All project posts must declare a budget range.</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Additional Details</label>
                            <Input name="compDetails" placeholder="e.g. Travel expenses covered, Lunch provided..." />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : 'Post Opportunity'}
                        </Button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}
