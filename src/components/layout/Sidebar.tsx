"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./Layout.module.css";

const NAV_GROUPS = [
    {
        label: "Procure",
        items: [
            { name: "Dashboard", href: "/dashboard", icon: "⊞", exact: true },
            { name: "Approvals", href: "/dashboard/approvals", icon: "✓" },
            { name: "Requisitions", href: "/dashboard/requisitions", icon: "≡" },
            { name: "Purchase Orders", href: "/dashboard/purchase-orders", icon: "◫" },
            { name: "Receiving", href: "/dashboard/receiving", icon: "📦" },
        ]
    },
    {
        label: "Pay",
        items: [
            { name: "Invoices", href: "/dashboard/invoices", icon: "◻" },
            { name: "Payments", href: "/dashboard/payments", icon: "💳" },
        ]
    },
    {
        label: "Manage",
        items: [
            { name: "Vendors", href: "/dashboard/vendors", icon: "⬡" },
            { name: "Contracts", href: "/dashboard/contracts", icon: "⊕" },
            { name: "Budgets", href: "/dashboard/budgets", icon: "◑" },
            { name: "Inventory", href: "/dashboard/inventory", icon: "⊟" },
            { name: "Assets", href: "/dashboard/assets", icon: "⬖" },
        ]
    },
    {
        label: "Insights",
        items: [
            { name: "Analytics", href: "/dashboard/analytics", icon: "◕" },
            { name: "Sourcing", href: "/dashboard/sourcing", icon: "◎" },
            { name: "Compliance", href: "/dashboard/compliance", icon: "◉" },
        ]
    }
];


const ADMIN_ITEMS = [
    { name: "Notifications", href: "/dashboard/notifications", icon: "◌" },
    { name: "Integrations", href: "/dashboard/integrations", icon: "⌘" },
    { name: "Support", href: "/dashboard/support", icon: "?" },
    { name: "Settings", href: "/dashboard/settings", icon: "⚙" },
];

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuth();

    const initials = user?.displayName
        ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() || 'U';

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
            {/* Logo */}
            <div className={styles.logoContainer} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                <div className={styles.logoIcon} title="Megapex">M</div>
                {!isCollapsed && <div className={styles.logoText}>MEGAPEX</div>}
                <button onClick={onToggle} className={styles.collapseToggle} title={isCollapsed ? "Expand Menu" : "Collapse Menu"}>
                    {isCollapsed ? '»' : '«'}
                </button>
            </div>

            {/* Navigation */}
            <nav className={styles.navSection}>
                {NAV_GROUPS.map((group) => (
                    <div key={group.label}>
                        <div className={styles.sectionTitle}>
                            {!isCollapsed ? group.label : <span style={{ opacity: 0.5 }}>—</span>}
                        </div>
                        <ul style={{ listStyle: 'none' }}>
                            {group.items.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`${styles.navLink} ${isActive(item.href, item.exact) ? styles.navLinkActive : ''}`}
                                        title={isCollapsed ? item.name : undefined}
                                        style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '0' : '0 1rem' }}
                                    >
                                        <span className={styles.navIcon} style={{ fontFamily: 'monospace', fontSize: '1.25rem' }}>
                                            {item.icon}
                                        </span>
                                        {!isCollapsed && item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Admin / extra items */}
                <div>
                    <div className={styles.sectionTitle}>
                        {!isCollapsed ? "Admin" : <span style={{ opacity: 0.5 }}>—</span>}
                    </div>
                    <ul style={{ listStyle: 'none' }}>
                        {ADMIN_ITEMS.map((item) => {
                            const show = item.href === '/dashboard/notifications' || user?.role === 'ADMIN';
                            if (!show) return null;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                                        title={isCollapsed ? item.name : undefined}
                                        style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '0' : '0 1rem' }}
                                    >
                                        <span className={styles.navIcon} style={{ fontFamily: 'monospace', fontSize: '1.25rem' }}>
                                            {item.icon}
                                        </span>
                                        {!isCollapsed && item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>

            {/* Bottom user profile */}
            <div className={styles.bottomSection}>
                <div className={styles.userProfile} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '0.5rem 0' : '0.5rem 0.625rem' }}>
                    <div className={styles.userAvatar} title={isCollapsed ? user?.displayName || 'User' : undefined}>{initials}</div>
                    {!isCollapsed && (
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>{user?.displayName || 'User'}</div>
                            <div className={styles.userRole}>{user?.role || 'Member'}</div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
