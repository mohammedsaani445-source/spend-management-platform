"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./Layout.module.css";
import LogoutModal from "./LogoutModal";
import Link from "next/link";
import { ChevronDown, ChevronUp, User as UserIcon, Settings, HelpCircle, Shield, LogOut } from "lucide-react";

export default function UserMenu() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className={styles.userMenuWrapper} ref={menuRef}>
            <button
                className={styles.userProfile}
                style={{ cursor: 'pointer', border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border)' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.userAvatar}>
                    {user.displayName?.[0] || 'U'}
                </div>
                <div className={styles.userInfo} style={{ textAlign: 'left' }}>
                    <div className={styles.userName}>{user.displayName}</div>
                    <div className={styles.userRole}>{user.role}</div>
                </div>
                <div style={{ opacity: 0.5, display: 'flex' }}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>

            {isOpen && (
                <div className={styles.userMenuDropdown}>
                    <div className={styles.menuHeader}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {user.department || 'General'} Department
                        </div>
                    </div>

                    <Link href="/dashboard/settings?tab=profile" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                        <UserIcon size={16} className="text-cool-slate" style={{ marginRight: '8px' }} /> My Profile
                    </Link>
                    <Link href="/dashboard/settings?tab=security" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                        <Settings size={16} className="text-cool-slate" style={{ marginRight: '8px' }} /> Account Settings
                    </Link>
                    <div className={styles.menuItem} onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-help-center'));
                        setIsOpen(false);
                    }}>
                        <HelpCircle size={16} className="text-cool-slate" style={{ marginRight: '8px' }} /> Help & Support
                    </div>
                    <div className={styles.menuItem}>
                        <Shield size={16} className="text-cool-slate" style={{ marginRight: '8px' }} /> Security & Privacy
                    </div>





                    <div
                        className={`${styles.menuItem} ${styles.menuItemDanger}`}
                        onClick={() => {
                            setIsOpen(false);
                            setIsLogoutModalOpen(true);
                        }}
                    >
                        <LogOut size={16} style={{ marginRight: '8px' }} /> Secure Sign Out
                    </div>
                </div>
            )}

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
            />
        </div>
    );
}
