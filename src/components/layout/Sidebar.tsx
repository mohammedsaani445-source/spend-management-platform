"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from '../common/Logo'; // Added this import
import {
    Home, ShieldCheck, ShoppingBag, FileText, Package,
    ReceiptText, CreditCard, Receipt,
    Store, Handshake, Wallet, Boxes, Server,
    LineChart, Target, ClipboardCheck, BarChart3, Shield,
    Blocks, LayoutDashboard
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
            { name: "Vendors", href: "/dashboard/vendors", icon: <LayoutDashboard size={20} /> },
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
            { name: "Reports", href: "/dashboard/reports", icon: <BarChart3 size={20} /> },
            { name: "Sourcing", href: "/dashboard/sourcing", icon: <Target size={20} /> },
            { name: "Compliance", href: "/dashboard/compliance", icon: <ClipboardCheck size={20} /> },
            { name: "Audit Trail", href: "/dashboard/audit-trail", icon: <Shield size={20} /> },
        ]
    }
];


const ADMIN_ITEMS = [
    { name: "Integrations", href: "/dashboard/integrations", icon: <Blocks size={20} /> },
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

    const getVisibleItems = () => {
        if (!user) return [];

        const role = user.role || 'STANDARD_REQUESTER';

        // Admin roles see everything
        if (['ADMIN', 'PLATFORM_SUPERUSER', 'WORKSPACE_ADMIN', 'SUPERUSER'].includes(role)) return NAV_GROUPS;

        const filteredGroups = NAV_GROUPS.map(group => {
            const visibleItems = group.items.filter(item => {
                const name = item.name;

                // Mappings based on Technical Specifications
                switch (role) {
                    case 'STANDARD_REQUESTER':
                        return ['Dashboard', 'Requisitions', 'Purchase Orders'].includes(name);
                    case 'AUTHORIZED_APPROVER':
                        return ['Dashboard', 'Approvals', 'Purchase Orders', 'Budgets'].includes(name);
                    case 'PROCUREMENT_OFFICER':
                        return ['Dashboard', 'Requisitions', 'Purchase Orders', 'Receiving', 'Inventory', 'Vendors', 'Contracts', 'Sourcing'].includes(name);
                    case 'OPERATIONS_RECEIVER':
                        return ['Dashboard', 'Requisitions', 'Purchase Orders', 'Receiving', 'Inventory', 'Assets'].includes(name);
                    case 'ACCOUNTS_PAYABLE':
                        return ['Dashboard', 'Invoices', 'Payments', 'Vendors'].includes(name);
                    case 'FINANCE_MANAGER':
                        return ['Dashboard', 'Approvals', 'Invoices', 'Payments', 'Budgets', 'Analytics'].includes(name);
                    case 'FINANCE_SPECIALIST':
                        return ['Dashboard', 'Invoices', 'Payments', 'Budgets', 'Vendors', 'Analytics', 'Compliance'].includes(name);
                    case 'STRATEGIC_SOURCER':
                        return ['Dashboard', 'Budgets', 'Vendors', 'Contracts', 'Sourcing', 'Analytics'].includes(name);
                    case 'DATA_ANALYST':
                        return ['Dashboard', 'Analytics', 'Sourcing', 'Compliance'].includes(name);
                    case 'WORKSPACE_ADMIN':
                    case 'PLATFORM_SUPERUSER':
                    case 'ADMIN':
                        return true;
                    default:
                        return ['Dashboard'].includes(name);
                }
            });

            return { ...group, items: visibleItems };
        }).filter(group => group.items.length > 0);

        return filteredGroups;
    };

    const visibleGroups = getVisibleItems();

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
                {visibleGroups.map((group) => (
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
                                        title={item.name}
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
                            // Only Admin roles see Admin items
                            const show = ['WORKSPACE_ADMIN', 'PLATFORM_SUPERUSER', 'ADMIN', 'SYSTEM_ADMIN'].includes(user?.role || '');
                            if (!show) return null;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                                        title={item.name}
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
