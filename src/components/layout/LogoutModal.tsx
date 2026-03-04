"use client";

import styles from "./Layout.module.css";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    if (!isOpen) return null;

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Give a moment for the "Securing session" feel
            await new Promise(resolve => setTimeout(resolve, 800));
            await auth.signOut();
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
        }
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.logoutModal} onClick={e => e.stopPropagation()}>
                <div className={styles.logoutIcon}>
                    {isLoggingOut ? "⏳" : "🔒"}
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                    {isLoggingOut ? "Securing Session..." : "Confirm Sign Out"}
                </h2>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
                    {isLoggingOut
                        ? "We're safely terminating your encrypted session and clearing local caches."
                        : "Are you sure you want to sign out? You will need to re-authenticate to access your financial data dashboard."}
                </p>

                {!isLoggingOut && (
                    <div className={styles.modalButtons}>
                        <button className={`${styles.btnFull} ${styles.btnOutline}`} onClick={onClose}>
                            Stay Logged In
                        </button>
                        <button className={`${styles.btnFull} ${styles.btnDanger}`} onClick={handleLogout}>
                            Secure Sign Out
                        </button>
                    </div>
                )}

                {isLoggingOut && (
                    <div style={{ marginTop: '2rem' }}>
                        <div className="shimmer-line" style={{ height: '4px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                    </div>
                )}
            </div>
        </div>
    );
}
