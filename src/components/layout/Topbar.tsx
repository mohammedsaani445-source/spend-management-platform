"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import styles from "./Layout.module.css";
import NotificationDropdown from "./NotificationDropdown";
import UserMenu from "./UserMenu";
import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Logo } from "../common/Logo";

const ROUTE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/approvals': 'Approvals',
    '/dashboard/requisitions': 'Purchase Requisitions',
    '/dashboard/purchase-orders': 'Purchase Orders',
    '/dashboard/receiving': 'Receiving',
    '/dashboard/invoices': 'Invoices',
    '/dashboard/payments': 'Payments',
    '/dashboard/receipts': 'Receipts',
    '/dashboard/vendors': 'Vendors',
    '/dashboard/contracts': 'Contracts',
    '/dashboard/budgets': 'Budgets',
    '/dashboard/inventory': 'Inventory',
    '/dashboard/assets': 'Asset Register',
    '/dashboard/analytics': 'Spend Analytics',
    '/dashboard/sourcing': 'Sourcing',
    '/dashboard/compliance': 'Compliance',
    '/dashboard/notifications': 'Notifications',
    '/dashboard/integrations': 'Integrations',
    '/dashboard/support': 'Support',
    '/dashboard/settings': 'Settings',
};

interface TopbarProps {
    onMobileMenuToggle?: () => void;
}

export default function Topbar({ onMobileMenuToggle }: TopbarProps) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [search, setSearch] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const pageTitle = ROUTE_TITLES[pathname] || 'Dashboard';
    const parentSection = pageTitle === 'Dashboard' ? null : 'Dashboard';

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <header className={styles.topbar}>
            {/* Mobile Menu Toggle */}
            {onMobileMenuToggle && (
                <div className={styles.mobileMenuToggle} onClick={onMobileMenuToggle} title="Open Menu">
                    <Logo size={28} className={styles.logoIcon} />
                </div>
            )}

            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                {parentSection && (
                    <>
                        <span>{parentSection}</span>
                        <span className={styles.breadcrumbSep}>›</span>
                    </>
                )}
                <span className={styles.breadcrumbActive}>{pageTitle}</span>
            </div>

            {/* Search bar */}
            <div className={`${styles.searchBar} hidden-mobile`}>
                <Search className={styles.searchIcon} size={16} color="#6B7280" />
                <input
                    ref={searchInputRef}
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search requisitions, orders, vendors..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className={styles.searchShortcut}>
                    <span>Ctrl</span> K
                </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <NotificationDropdown />
                <UserMenu />
            </div>
        </header>
    );
}
