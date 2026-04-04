"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "firebase/auth";
import { auth } from "@/backend/config/firebase";
import { syncUserToFirestore } from "@/backend/actions/profile";
import { logger } from "@/backend/lib/logger";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithEmail: async () => { },
    signUpWithEmail: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // "Database Sync" requirement: Ensure record exists
                await syncUserToFirestore(currentUser);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        logger.info('AUTH_LOGIN_START', { provider: 'google', source: 'frontend' });
        try {
            const result = await signInWithPopup(auth, provider);
            logger.info('AUTH_LOGIN_SUCCESS', { userId: result.user.uid, provider: 'google', source: 'frontend' });
        } catch (error: any) {
            logger.error('AUTH_LOGIN_FAILURE', { provider: 'google', error: error.message, source: 'frontend' });
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        logger.info('AUTH_LOGIN_START', { provider: 'email', source: 'frontend' });
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            logger.info('AUTH_LOGIN_SUCCESS', { userId: result.user.uid, provider: 'email', source: 'frontend' });
        } catch (error: any) {
            logger.error('AUTH_LOGIN_FAILURE', { provider: 'email', error: error.message, source: 'frontend' });
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        logger.info('AUTH_LOGIN_START', { provider: 'email_signup', source: 'frontend' });
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            logger.info('USER_CREATE_SUCCESS', { userId: result.user.uid, source: 'frontend' });
            logger.info('AUTH_LOGIN_SUCCESS', { userId: result.user.uid, provider: 'email_signup', source: 'frontend' });
        } catch (error: any) {
            logger.error('AUTH_LOGIN_FAILURE', { provider: 'email_signup', error: error.message, source: 'frontend' });
            throw error;
        }
    };

    const logout = async () => {
        const currentUserId = user?.uid;
        try {
            await signOut(auth);
            logger.info('AUTH_LOGOUT', { userId: currentUserId, source: 'frontend' });
        } catch (error: any) {
            logger.error('SYSTEM_ERROR', { userId: currentUserId, message: "Standard logout failed", error: error.message, source: 'frontend' });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout }}>
            {!loading && children}
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
