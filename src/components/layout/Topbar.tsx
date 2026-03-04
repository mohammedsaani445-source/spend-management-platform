"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import styles from "./Layout.module.css";
import NotificationDropdown from "./NotificationDropdown";
import UserMenu from "./UserMenu";
import { useState } from "react";

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

export default function Topbar() {
    const { user } = useAuth();
    const pathname = usePathname();
    const [search, setSearch] = useState('');

    const pageTitle = ROUTE_TITLES[pathname] || 'Dashboard';
    const parentSection = pageTitle === 'Dashboard' ? null : 'Dashboard';

    return (
        <header className={styles.topbar}>
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
            <div className={styles.searchBar}>
                <span className={styles.searchIcon} style={{ fontSize: '0.9rem' }}>🔍</span>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search requisitions, orders, vendors..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <NotificationDropdown />
                <UserMenu />
            </div>
        </header>
    );
}
