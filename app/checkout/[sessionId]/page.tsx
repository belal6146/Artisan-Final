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
import { logger } from "@/backend/lib/logger";

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
        logger.info('COMMERCE_CHECKOUT_START', { userId: user?.uid, sessionId, source: 'frontend' });

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL for fallback, but for embedded we usually handle it here
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: 'if_required' 
        });

        if (error) {
            logger.error('COMMERCE_CHECKOUT_FAILURE', { userId: user?.uid, sessionId, error: error.message, source: 'frontend' });
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "Something went wrong.");
            } else {
                setMessage("An unexpected error occurred.");
            }
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            setIsSuccess(true);
            logger.info('COMMERCE_CHECKOUT_SUCCESS', { userId: user?.uid, sessionId, paymentIntentId: paymentIntent.id, source: 'frontend' });
            
            // Persist Transaction via Server Action
            if (user) {
                try {
                    await recordTransaction(user.uid, {
                        type: 'buy',
                        itemId: searchParams.get("itemId") || 'real_item_id',
                        itemTitle: searchParams.get("title") || `${type === 'event' ? 'Event Ticket' : 'Artwork'} Purchase`,
                        imageUrl: searchParams.get("imageUrl") || "",
                        amount: paymentIntent.amount / 100,
                        currency: paymentIntent.currency.toUpperCase(),
                        paymentIntentId: paymentIntent.id
                    });
                } catch (err: any) {
                    logger.error('SYSTEM_ERROR', { userId: user.uid, message: "Checkout tx record failed", error: err.message, source: 'frontend' });
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
                size="lg"
                className="w-full shadow-2xl"
            >
                {isLoading ? (
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        PROCESSING SECURE RELAY...
                    </div>
                ) : (
                    "CONFIRM SECURE ACQUISITION"
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
        <div className="min-h-screen flex items-center justify-center bg-secondary/5 py-24 px-6 md:px-12 selection:bg-primary selection:text-primary-foreground animate-in fade-in duration-200">
            <div className="bg-background rounded-none shadow-2xl border border-border/10 overflow-hidden max-w-6xl w-full flex flex-col md:flex-row animate-in slide-in-from-bottom-12 duration-200">
                
                {/* Order Summary Left Panel */}
                <div className="bg-primary text-primary-foreground p-12 md:w-[45%] flex flex-col justify-between space-y-24">
                    <div className="space-y-16">
                        <div className="flex items-center gap-4 text-primary-foreground/40 group/lock">
                            <Lock className="h-4 w-4 transition-colors group-hover/lock:text-primary-foreground" />
                            <span className="text-[10px] font-bold tracking-[0.4em] uppercase group-hover/lock:text-primary-foreground transition-colors leading-none">Secure Acquisition</span>
                        </div>
                        
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <p className="text-primary-foreground/40 text-[10px] font-bold tracking-[0.4em] uppercase leading-none">Order Architecture</p>
                                <h3 className="text-4xl md:text-5xl font-serif tracking-tighter leading-none capitalize">{type === 'artwork' ? 'Curated Masterpiece' : 'Artisan Workshop'}</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <p className="text-primary-foreground/40 text-[10px] font-bold tracking-[0.4em] uppercase leading-none">Economic Protocol</p>
                                <div className="text-6xl md:text-7xl font-serif tracking-tighter flex items-baseline gap-4 leading-none">
                                    <span className="text-2xl opacity-40 font-sans tracking-normal">GBP</span>
                                    <span>Calculated</span>
                                </div>
                                <p className="text-primary-foreground/40 text-sm font-light italic leading-relaxed max-w-sm">
                                    “Includes all service architecture and secure human-to-human handling. Every transaction supports the global artisan movement.”
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6 text-[10px] font-bold tracking-[0.4em] uppercase text-primary-foreground/40 pt-10 border-t border-primary-foreground/10">
                        <div className="flex justify-between items-center">
                            <span>Reference Block</span>
                            <span className="font-mono text-primary-foreground">{sessionId.split('_')[1]?.toUpperCase() || sessionId.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Platform Status</span>
                            <span className="text-primary-foreground flex items-center gap-3">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
                                ACQUISITION READY
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Stripe Form */}
                <div className="p-12 md:w-[55%] bg-background space-y-12">
                    <Elements 
                        stripe={stripePromise} 
                        options={{
                            clientSecret,
                            appearance: {
                                theme: undefined,
                                variables: {
                                    colorPrimary: 'hsl(var(--primary))',
                                    colorBackground: 'hsl(var(--background))',
                                    colorText: 'hsl(var(--foreground))',
                                    colorDanger: 'hsl(var(--destructive))',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    spacingUnit: '6px',
                                    borderRadius: '0px',
                                },
                                rules: {
                                    '.Input': {
                                        border: '1px solid hsl(var(--border)/0.2)',
                                        boxShadow: 'none',
                                        padding: '16px',
                                        fontSize: '14px',
                                    },
                                    '.Input:focus': {
                                        border: '1px solid hsl(var(--primary))',
                                    },
                                    '.Label': {
                                        color: 'hsl(var(--muted-foreground))',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.2em',
                                        fontSize: '10px',
                                        marginBottom: '8px',
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
