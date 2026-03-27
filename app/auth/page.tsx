"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
            // Auth state listener will handle redirect
            router.push("/explore");
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        try {
            await signInWithGoogle();
            router.push("/explore");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6 font-sans">
            {/* Background elements */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] opacity-40 pointer-events-none" />
            
            <div className="w-full max-w-lg bg-white/5 border border-border/10 p-12 md:p-20 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tighter">
                        {isLogin ? "Welcome Back." : "The Collective."}
                    </h1>
                    <p className="text-muted-foreground text-sm font-light italic tracking-wide">
                        {isLogin ? "Resume your journey through the craft." : "Join our decentralized artisan community."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11 bg-secondary/20 border-border/60"
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 bg-secondary/20 border-border/60"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-16 rounded-none bg-primary text-[11px] font-bold tracking-[0.3em] uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all" disabled={loading}>
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
                    </Button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/60" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <Button variant="outline" type="button" className="w-full h-16 rounded-none text-[11px] font-bold tracking-[0.3em] uppercase border-border/10 hover:bg-muted/5 transition-all" onClick={handleGoogleSignIn}>
                    <svg className="mr-3 h-4 w-4 opacity-60" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
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
