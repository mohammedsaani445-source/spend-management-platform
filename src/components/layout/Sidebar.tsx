"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from '../common/Logo'; // Added this import
import {
    Home, ShieldCheck, ShoppingBag, FileText, Package,
    ReceiptText, CreditCard,
    Store, Handshake, Wallet, Boxes, Server,
    LineChart, Target, ClipboardCheck,
    Blocks, LifeBuoy, Settings as SettingsIcon
} from "lucide-react";
import styles from "./Layout.module.css";

const NAV_GROUPS = [
    {
        label: "Procure",
        items: [
            { name: "Dashboard", href: "/dashboard", icon: <Home size={20} />, exact: true },
            { name: "Approvals", href: "/dashboard/approvals", icon: <ShieldCheck size={20} /> },
            { name: "Requisitions", href: "/dashboard/requisitions", icon: <ShoppingBag size={20} /> },
            { name: "Purchase Orders", href: "/dashboard/purchase-orders", icon: <FileText size={20} /> },
            { name: "Receiving", href: "/dashboard/receiving", icon: <Package size={20} /> },
        ]
    },
    {
        label: "Pay",
        items: [
            { name: "Invoices", href: "/dashboard/invoices", icon: <ReceiptText size={20} /> },
            { name: "Payments", href: "/dashboard/payments", icon: <CreditCard size={20} /> },
        ]
    },
    {
        label: "Manage",
        items: [
            { name: "Vendors", href: "/dashboard/vendors", icon: <Store size={20} /> },
            { name: "Contracts", href: "/dashboard/contracts", icon: <Handshake size={20} /> },
            { name: "Budgets", href: "/dashboard/budgets", icon: <Wallet size={20} /> },
            { name: "Inventory", href: "/dashboard/inventory", icon: <Boxes size={20} /> },
            { name: "Assets", href: "/dashboard/assets", icon: <Server size={20} /> },
        ]
    },
    {
        label: "Insights",
        items: [
            { name: "Analytics", href: "/dashboard/analytics", icon: <LineChart size={20} /> },
            { name: "Sourcing", href: "/dashboard/sourcing", icon: <Target size={20} /> },
            { name: "Compliance", href: "/dashboard/compliance", icon: <ClipboardCheck size={20} /> },
        ]
    }
];


const ADMIN_ITEMS = [
    { name: "Integrations", href: "/dashboard/integrations", icon: <Blocks size={20} /> },
    { name: "Support", href: "/dashboard/support", icon: <LifeBuoy size={20} /> },
    { name: "Settings", href: "/dashboard/settings", icon: <SettingsIcon size={20} /> },
];

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
    isMobileMenuOpen?: boolean;
}

export default function Sidebar({ isCollapsed = false, onToggle, isMobileMenuOpen = false }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuth();

    const initials = user?.displayName
        ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() || 'U';

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''} ${isMobileMenuOpen ? styles.sidebarMobileOpen : ''}`}>
            {/* Logo */}
            <div className={styles.logoContainer} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                <Logo size={32} className={styles.logoIcon} />
                {!isCollapsed && <div className={styles.logoText}>APEX PROCURE</div>}
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
                                        <span className={styles.navIcon} style={typeof item.icon === 'string' ? { fontFamily: 'monospace', fontSize: '1.25rem' } : { display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                        <span className={styles.navIcon} style={typeof item.icon === 'string' ? { fontFamily: 'monospace', fontSize: '1.25rem' } : { display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        </aside>
    );
}
