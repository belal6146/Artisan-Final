"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { logger } from "@/backend/lib/logger";

export default function AuthPage() {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams?.get("redirect") || "/explore";
    const { user: authUser } = useAuth(); // renamed to avoid conflict

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                logger.info('AUTH_LOGIN_START', { email, source: 'frontend' });
                await signInWithEmail(email, password);
                logger.info('AUTH_LOGIN_SUCCESS', { email, source: 'frontend' });
            } else {
                logger.info('USER_CREATE_START', { email, source: 'frontend' });
                await signUpWithEmail(email, password);
                logger.info('USER_CREATE_SUCCESS', { email, source: 'frontend' });
            }
            router.push(redirect);
        } catch (err: any) {
             if (isLogin) {
                logger.error('AUTH_LOGIN_FAILURE', { email, error: err.message, source: 'frontend' });
            } else {
                logger.error('USER_CREATE_FAILURE', { email, error: err.message, source: 'frontend' });
            }
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        logger.info('AUTH_LOGIN_START', { method: 'google', source: 'frontend' });
        try {
            await signInWithGoogle();
            logger.info('AUTH_LOGIN_SUCCESS', { method: 'google', source: 'frontend' });
            router.push(redirect);
        } catch (err: any) {
            logger.error('AUTH_LOGIN_FAILURE', { method: 'google', error: err.message, source: 'frontend' });
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6 font-sans">
            {/* Background elements */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] opacity-40 pointer-events-none" />
            
            <div className="w-full max-w-lg bg-secondary/5 border border-border/10 p-12 md:p-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-16 space-y-6">
                    <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter leading-none">
                        {isLogin ? "Welcome Back." : "The Collective."}
                    </h1>
                    <p className="text-xl text-muted-foreground font-light italic leading-relaxed">
                        {isLogin ? "Resume your journey through the craft." : "Join our decentralized artisan community."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Artisan Credentials</label>
                        <Input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-[10px] font-bold tracking-widest uppercase text-destructive bg-destructive/5 p-4 border border-destructive/10">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
                    </Button>
                </form>

                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/10" />
                    </div>
                    <div className="relative flex justify-center text-[9px] font-bold tracking-[0.4em] uppercase">
                        <span className="bg-background px-4 text-muted-foreground/40">Or relay via</span>
                    </div>
                </div>

                <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn}>
                    <svg className="mr-3 h-4 w-4 opacity-40" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    CONTINUE WITH GOOGLE
                </Button>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-medium text-primary hover:underline underline-offset-4"
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}
