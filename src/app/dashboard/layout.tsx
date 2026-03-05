"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

    const [isCollapsed, setIsCollapsed] = useState(false);

    if (loading) return null; // Or a loading spinner

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
            <div style={{
                flex: 1,
                marginLeft: isCollapsed ? '80px' : '260px',
                transition: 'margin-left 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Topbar />
                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
