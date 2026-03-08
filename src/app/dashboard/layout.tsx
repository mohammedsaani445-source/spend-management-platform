"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createUserProfile } from "@/lib/db";
import styles from "@/components/layout/Layout.module.css";
import Loader from "@/components/common/Loader";
import { useScrollLock } from "@/hooks/useScrollLock";

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

    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Initial state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved !== null) {
            setIsCollapsed(saved === 'true');
        }
        setIsMounted(true);
    }, []);

    // Save state to localStorage
    const handleToggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', String(newState));
    };

    // Close mobile menu when navigating
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useScrollLock(isMobileMenuOpen);

    if (loading || !isMounted) return <Loader fullScreen={true} text="Authenticating..." />;

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>

            {/* Mobile Overlay */}
            <div
                className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.mobileOverlayOpen : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            <Sidebar
                isCollapsed={isCollapsed}
                onToggle={handleToggleCollapse}
                isMobileMenuOpen={isMobileMenuOpen}
            />

            <div className={`${styles.mainWrapper} ${isCollapsed ? styles.mainWrapperCollapsed : ''}`}>
                <Topbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                <main id="dashboard-main-content" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
