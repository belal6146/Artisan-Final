"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/frontend/lib/firebase";
import { syncUserToFirestore } from "@/backend/actions/profile";
import { logger } from "@/backend/lib/logger";

/** Plain fields only — never put Firebase `User` in React state (cyclic internals break React dev error formatting). */
export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

function toAuthUser(u: FirebaseUser): AuthUser {
    return {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
    } as any;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithEmail: async () => { },
    signUpWithEmail: async () => { },
    logout: async () => { },
    getIdToken: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 🛡️ Force Persistence (Critical for ngrok/tunnel environments)
        const initAuth = async () => {
            try {
                await setPersistence(auth, browserLocalPersistence);
            } catch (error: any) {
                logger.error('AUTH_INITIALIZATION_ERROR', { error: error.message, source: 'frontend' });
            }
        };

        void initAuth();

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const plain = toAuthUser(currentUser);
                setUser(plain);
                void syncUserToFirestore(plain).catch((e: unknown) => {
                    logger.error("SYSTEM_ERROR", { message: "Sync failed", source: "frontend" });
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        logger.info('AUTH_LOGIN_START', { provider: 'google', source: 'frontend' });
        try {
            const result = await signInWithPopup(auth, provider);
            if (result.user) {
                setUser(toAuthUser(result.user));
                logger.info('AUTH_LOGIN_SUCCESS', { userId: result.user.uid, provider: 'google', source: 'frontend' });
            }
        } catch (error: any) {
            logger.error('AUTH_LOGIN_FAILURE', { provider: 'google', error: error.message, source: 'frontend' });
            throw error;
        }
    }, []);

    const signInWithEmail = useCallback(async (email: string, password: string) => {
        logger.info('AUTH_LOGIN_START', { provider: 'email', source: 'frontend' });
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            logger.info('AUTH_LOGIN_SUCCESS', { userId: result.user.uid, provider: 'email', source: 'frontend' });
        } catch (error: any) {
            logger.error('AUTH_LOGIN_FAILURE', { provider: 'email', error: error.message, source: 'frontend' });
            throw error;
        }
    }, []);

    const signUpWithEmail = useCallback(async (email: string, password: string) => {
        logger.info('AUTH_LOGIN_START', { provider: 'email_signup', source: 'frontend' });
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            logger.info('USER_CREATE_SUCCESS', { userId: result.user.uid, source: 'frontend' });
            logger.info('AUTH_LOGIN_SUCCESS', { userId: result.user.uid, provider: 'email_signup', source: 'frontend' });
        } catch (error: any) {
            logger.error('AUTH_LOGIN_FAILURE', { provider: 'email_signup', error: error.message, source: 'frontend' });
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        const currentUserId = user?.uid;
        try {
            await signOut(auth);
            logger.info('AUTH_LOGOUT', { userId: currentUserId, source: 'frontend' });
        } catch (error: any) {
            logger.error('SYSTEM_ERROR', { userId: currentUserId, message: "Standard logout failed", error: error.message, source: 'frontend' });
        }
    }, [user?.uid]);

    const getIdToken = useCallback(async () => {
        if (!auth.currentUser) return null;
        return auth.currentUser.getIdToken();
    }, []);

    const value = useMemo(
        () => ({ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout, getIdToken }),
        [user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout, getIdToken]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
