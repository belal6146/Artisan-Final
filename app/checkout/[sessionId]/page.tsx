"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Lock, Loader2, AlertCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { 
    Elements, 
    PaymentElement, 
    useStripe, 
    useElements 
} from "@stripe/react-stripe-js";

import { useAuth } from "@/contexts/AuthContext";
import { recordTransaction } from "@/backend/actions/transaction";

// Initialize Stripe outside of component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function CheckoutForm({ clientSecret, sessionId }: { clientSecret: string, sessionId: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get("type");

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL for fallback, but for embedded we usually handle it here
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: 'if_required' 
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "Something went wrong.");
            } else {
                setMessage("An unexpected error occurred.");
            }
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            setIsSuccess(true);
            
            // Persist Transaction via Server Action
            if (user) {
                try {
                    await recordTransaction(user.uid, {
                        type: 'buy',
                        itemId: searchParams.get("itemId") || 'real_item_id',
                        itemTitle: `${type === 'event' ? 'Event Ticket' : 'Artwork'} Purchase`,
                        amount: paymentIntent.amount / 100,
                        currency: paymentIntent.currency.toUpperCase()
                    });
                } catch (err) {
                    console.error("Failed to record transaction", err);
                }
            }

            // Redirect after success
            setTimeout(() => {
                if (type === 'event') {
                    router.push('/events?success=true');
                } else {
                    router.push('/explore?success=true');
                }
            }, 2500);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-4 py-12 animate-in fade-in zoom-in duration-500">
                <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Check className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-serif font-medium">Payment Successful</h1>
                <p className="text-muted-foreground text-lg">Your transaction has been secured. Redirecting you back to Artisan...</p>
                <div className="flex justify-center mt-8">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                </div>
            </div>
        );
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Secure Acquisition</h2>
            
            <PaymentElement id="payment-element" options={{ layout: 'accordion' }} />
            
            {message && (
                <div id="payment-message" className="p-4 rounded-md bg-red-50 text-red-700 flex items-center gap-3 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {message}
                </div>
            )}

            <Button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full h-16 rounded-none bg-primary text-[11px] font-bold tracking-[0.3em] uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                    </div>
                ) : (
                    "Confirm Secure Payment"
                )}
            </Button>

            <div className="space-y-4 pt-4">
                <p className="text-xs text-center text-muted-foreground">
                    Secured by Stripe SSL-Encryption. Artisan does not store your card details.
                </p>
                <div className="flex justify-center flex-wrap gap-4 grayscale opacity-50">
                    {/* Placeholder for card icons */}
                    <div className="h-5 w-8 bg-slate-200 rounded" />
                    <div className="h-5 w-8 bg-slate-200 rounded" />
                    <div className="h-5 w-8 bg-slate-200 rounded" />
                    <div className="h-5 w-8 bg-slate-200 rounded" />
                </div>
            </div>
        </form>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}

function CheckoutContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const sessionId = params?.sessionId as string;
    const clientSecret = searchParams.get("clientSecret");
    const type = searchParams.get("type");

    if (!clientSecret) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center space-y-4 max-w-sm w-full border border-red-100">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <h1 className="text-2xl font-medium">Session Error</h1>
                    <p className="text-muted-foreground">This checkout session could not be initialized. Please try again from the gallery.</p>
                    <Button variant="outline" className="w-full" onClick={() => window.location.href='/explore'}>
                        Return to Gallery
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] py-12 px-4 selection:bg-slate-200">
            <div className="bg-white rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden max-w-5xl w-full flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-8 duration-1000">
                
                {/* Order Summary Left Panal */}
                <div className="bg-slate-900 text-white p-10 md:w-[45%] flex flex-col justify-between">
                    <div className="space-y-12">
                        <div className="flex items-center gap-3 text-slate-400 group">
                            <Lock className="h-4 w-4 transition-colors group-hover:text-blue-400" />
                            <span className="text-sm font-medium tracking-wide group-hover:text-slate-200 transition-colors uppercase">Secure Artisan Checkout</span>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-3">Order Type</p>
                                <h3 className="text-2xl font-serif capitalize text-slate-100">{type === 'artwork' ? 'Curated Artwork' : 'Community Workshop'}</h3>
                            </div>
                            
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-3">Total Amount</p>
                                <div className="text-5xl font-serif text-white tracking-tight flex items-baseline gap-2">
                                    <span className="text-3xl opacity-50 font-sans">€</span>
                                    <span>Calculated</span>
                                </div>
                                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                                    Includes all service fees and secure handling. Tax calculated based on shipping/billing region.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4 text-[13px] text-slate-400 mt-16 pt-8 border-t border-slate-800">
                        <div className="flex justify-between">
                            <span>Reference</span>
                            <span className="font-mono text-slate-200 uppercase tracking-tighter">{sessionId.split('_')[1] || sessionId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Platform Status</span>
                            <span className="text-blue-400 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Payment Ready
                            </span>
                        </div>
                        <p className="pt-6 text-slate-500 font-light leading-relaxed italic">
                            Connecting artisans directly to patrons through the decentralized gallery network.
                        </p>
                    </div>
                </div>

                {/* Right Panel - Stripe Form */}
                <div className="p-10 md:w-[55%] bg-white">
                    <Elements 
                        stripe={stripePromise} 
                        options={{
                            clientSecret,
                            appearance: {
                                theme: 'stripe',
                                variables: {
                                    colorPrimary: '#0f172a',
                                    colorBackground: '#ffffff',
                                    colorText: '#1e293b',
                                    colorDanger: '#df1b41',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    spacingUnit: '4px',
                                    borderRadius: '8px',
                                },
                                rules: {
                                    '.Input': {
                                        border: '1px solid #e2e8f0',
                                        boxShadow: 'none',
                                    },
                                    '.Input:focus': {
                                        border: '1px solid #0f172a',
                                    }
                                }
                            }
                        }}
                    >
                        <CheckoutForm clientSecret={clientSecret} sessionId={sessionId} />
                    </Elements>
                </div>
            </div>
        </div>
    );
}
