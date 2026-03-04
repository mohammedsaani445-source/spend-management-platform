"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db, DB_PREFIX } from "@/lib/firebase";
import { ref, get, update, onValue } from "firebase/database";
import { AppUser } from "@/types";

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    updateProfile: (data: Partial<AppUser>) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    updateProfile: async () => { },
    logout: async () => { }
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeTenant: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            if (unsubscribeTenant) {
                unsubscribeTenant();
                unsubscribeTenant = null;
            }

            if (firebaseUser) {
                const tenantMappingRef = ref(db, `${DB_PREFIX}/userTenants/${firebaseUser.uid}`);

                // Subscribe to tenant mapping to handle the client-side signup race condition smoothly
                unsubscribeTenant = onValue(tenantMappingRef, async (tenantMappingSnap) => {
                    if (tenantMappingSnap.exists()) {
                        setLoading(true);
                        const tenantId = tenantMappingSnap.val().tenantId;

                        try {
                            const userRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${firebaseUser.uid}`);
                            const snapshot = await get(userRef);

                            if (snapshot.exists()) {
                                const userData = snapshot.val();

                                if (userData.isActive === false) {
                                    await auth.signOut();
                                    setUser(null);
                                    setLoading(false);
                                    return;
                                }

                                setUser({
                                    uid: firebaseUser.uid,
                                    tenantId: tenantId,
                                    email: firebaseUser.email || "",
                                    displayName: userData.displayName || firebaseUser.displayName || "User",
                                    photoURL: firebaseUser.photoURL || undefined,
                                    role: userData.role || 'REQUESTER',
                                    userType: userData.userType || 'PRO',
                                    department: userData.department || 'General',
                                    locationId: userData.locationId || 'default',
                                    isActive: userData.isActive !== false,
                                    createdAt: new Date(userData.createdAt || Date.now())
                                });
                                setLoading(false);
                            } else {
                                console.error("[Auth] User mapped to tenant but profile missing.");
                                setUser(null);
                                setLoading(false);
                            }
                        } catch (err) {
                            console.error("[Auth] Error fetching user profile:", err);
                            setUser(null);
                            setLoading(false);
                        }
                    } else {
                        // No tenant mapping
                        // Could be mid-signup. We set user to null so protected routes block them, 
                        // but we don't sign them out so signup can complete.
                        setUser(null);
                        setLoading(false);
                    }
                }, (error) => {
                    console.error("[Auth] onValue error", error);
                    setUser(null);
                    setLoading(false);
                });

            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeTenant) unsubscribeTenant();
        };
    }, []);

    const updateProfile = async (data: Partial<AppUser>) => {
        if (!user) return;
        try {
            const userRef = ref(db, `${DB_PREFIX}/tenants/${user.tenantId}/users/${user.uid}`);
            await update(userRef, data);
            setUser(prev => prev ? { ...prev, ...data } : null);
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await auth.signOut();
            setUser(null);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, updateProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
