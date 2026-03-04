"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createUserProfile } from "@/lib/db";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else {
                // Sync user profile to Firestore whenever they access the dashboard
                createUserProfile(user);
            }
        }
    }, [user, loading, router]);

    if (loading) return null; // Or a loading spinner

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
                <Topbar />
                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
