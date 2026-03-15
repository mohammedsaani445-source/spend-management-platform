"use client";

import { AppUser, DashboardEvent, PurchaseOrder } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SpendBarChart, BudgetDonutChart } from "@/components/charts/SimpleCharts";
import AiAnalyst from "./AiAnalyst";
import SecurityBanner from "@/components/common/SecurityBanner";
import { 
    ChevronRight,
    ArrowUpRight,
    Zap,
    Package,
    Database,
    AlertTriangle,
    CreditCard,
    TrendingUp,
    Banknote,
    Clock,
    FileText,
    Building2,
    BarChart3,
    Plus
} from "lucide-react";

interface ExecutiveDashboardProps {
    user: AppUser;
    stats: {
        pendingCount: number;
        activeCount: number;
        totalSpend: number;
        savings: number;
        budgetUsage: { total: number; used: number; percent: number };
        monthlyData: any[];
        spendByCategory?: Record<string, number>;
        carbonFootprint?: { totalCo2e: number; byDepartment: Record<string, number> };
        assetCount?: number;
        inventoryValue?: number;
        lowStockItems?: number;
    };
    vendorPerf?: any[];
    pos: PurchaseOrder[];
    currency: string;
    onCurrencyChange: (currency: string) => void;
}

export default function ExecutiveDashboard({ user, stats, pos, currency, onCurrencyChange }: ExecutiveDashboardProps) {
    const [greeting, setGreeting] = useState("Good Morning");
    const availableBudget = (stats.budgetUsage.total || 0) - (stats.budgetUsage.used || 0);
    const firstName = (user as any).displayName?.split(' ')[0] || (user as any).name?.split(' ')[0] || 'there';

    useEffect(() => {
        const h = new Date().getHours();
        if (h < 12) setGreeting("Good morning");
        else if (h < 17) setGreeting("Good afternoon");
        else setGreeting("Good evening");
    }, []);

    return (
        <div className="animate-in" style={{ background: 'var(--surface-2)', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
            <SecurityBanner user={user} />

            {/* === WELCOME BAR === */}
            <div className="welcome-bar-inner" style={{
                background: 'var(--brand)',
                borderRadius: '16px', padding: '1.75rem 2.25rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '2rem', color: 'white',
                boxShadow: '0 8px 32px rgba(232, 87, 42, 0.2)',
                border: 'none'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ 
                        width: '56px', height: '56px', borderRadius: '14px', 
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem'
                    }}>
                        👋
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginBottom: '0.25rem' }}>
                            {greeting},
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
                            {firstName}!
                            {stats.pendingCount > 0 && (
                                <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: '1rem', color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '99px' }}>
                                    {stats.pendingCount} approvals pending
                                </span>
                            )}
                        </h1>
                    </div>
                </div>
                <div className="welcome-bar-actions" style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/dashboard/requisitions/new" style={{
                        background: 'white', color: 'var(--brand)', 
                        fontSize: '0.9375rem', fontWeight: 700, padding: '0.625rem 1.25rem', borderRadius: '10px',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} className="hover-scale">
                        <Plus size={18} strokeWidth={3} />
                        New Request
                    </Link>
                    {stats.pendingCount > 0 && (
                        <Link href="/dashboard/approvals" style={{
                            background: 'rgba(255,255,255,0.1)', color: 'white',
                            fontSize: '0.9375rem', fontWeight: 600, padding: '0.625rem 1.25rem',
                            borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)',
                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            backdropFilter: 'blur(5px)'
                        }} className="hover-scale">
                            Review All
                            <ChevronRight size={18} />
                        </Link>
                    )}
                </div>
            </div>

            {/* === KPI GRID === */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <Link href="/dashboard/purchase-orders" style={{ textDecoration: 'none' }}>
                    <div className="hover-lift" style={{ borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                                <CreditCard size={20} />
                            </div>
                            <TrendingUp size={16} color="var(--success)" />
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Commitment</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.25rem', color: 'var(--text-primary)' }}>{formatCurrency(stats.totalSpend, currency)}</div>
                    </div>
                </Link>

                <Link href="/dashboard/budgets" style={{ textDecoration: 'none' }}>
                    <div className="hover-lift" style={{ borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                                <Banknote size={20} />
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: stats.budgetUsage.percent > 90 ? 'var(--error)' : 'var(--success)' }}>{Math.round(stats.budgetUsage.percent)}% Used</div>
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Budget Utilization</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.25rem', color: 'var(--text-primary)' }}>{formatCurrency(availableBudget, currency)}</div>
                    </div>
                </Link>

                <Link href="/dashboard/assets" style={{ textDecoration: 'none' }}>
                    <div className="hover-lift" style={{ borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--warning-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                                <Database size={20} />
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)' }}>Fleet Active</div>
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enterprise Assets</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.25rem', color: 'var(--text-primary)' }}>{(stats as any).assetCount || 0} Items</div>
                    </div>
                </Link>

                <Link href="/dashboard/inventory" style={{ textDecoration: 'none' }}>
                    <div className="hover-lift" style={{ borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                <Package size={20} />
                            </div>
                            {(stats as any).lowStockItems ? (
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <AlertTriangle size={12} /> {(stats as any).lowStockItems} Low
                                </div>
                            ) : (
                                <Zap size={16} color="var(--success)" />
                            )}
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inventory Value</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.25rem', color: 'var(--text-primary)' }}>{formatCurrency((stats as any).inventoryValue || 0, currency)}</div>
                    </div>
                </Link>
            </div>

            {/* === MAIN GRID === */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

                    {/* Spend Chart */}
                    <div className="premium-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Financial Pulse</h2>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>Real-time treasury expenditure analysis</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Baseline:</span>
                                <select
                                    value={currency}
                                    onChange={e => onCurrencyChange(e.target.value)}
                                    style={{ 
                                        height: '36px', padding: '0 0.875rem', 
                                        border: '1px solid var(--border)', borderRadius: '8px', 
                                        fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', 
                                        background: 'var(--surface-2)', outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                    className="hover-glow"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="GHS">GHS (₵)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>
                        <SpendBarChart data={stats.monthlyData} currency={currency} />
                    </div>

                    {/* Category Breakdown */}
                    <div className="premium-card" style={{ padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Allocation Dynamics</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {stats.spendByCategory && Object.entries(stats.spendByCategory)
                                .sort(([, a], [, b]) => b - a).slice(0, 5)
                                .map(([cat, amount], i) => {
                                    const COLORS = ['var(--brand)', 'var(--success)', 'var(--info)', 'var(--warning)', 'var(--text-secondary)'];
                                    const pct = stats.totalSpend > 0 ? Math.round((amount / stats.totalSpend) * 100) : 0;
                                    return (
                                        <div key={cat} className="animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i] }} />
                                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500 }}>{pct}% Intensity</span>
                                                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{formatCurrency(amount, currency)}</span>
                                                </div>
                                            </div>
                                            <div style={{ height: '8px', background: 'var(--brand-xsoft)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS[i]} 0%, ${COLORS[i]}cc 100%)`, borderRadius: '4px', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            {(!stats.spendByCategory || Object.keys(stats.spendByCategory).length === 0) && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-disabled)', fontSize: '0.9375rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
                                    Industrial data streams pending initialization...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Analyst */}
                    <AiAnalyst />
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Budget Health */}
                    <div className="premium-card" style={{ padding: '1.5rem', background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
                            <Zap size={18} color="var(--brand)" fill="var(--brand)" />
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Budget Integrity</h2>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                            <BudgetDonutChart total={stats.budgetUsage.total || 1} used={stats.budgetUsage.used || 0} />
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '-0.25rem' }}>
                                    {Math.round(stats.budgetUsage.percent)}%
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Load</div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(232, 87, 42, 0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(232, 87, 42, 0.08)' }}>
                            {[
                                { label: 'Allocated Limit', value: formatCurrency(stats.budgetUsage.total || 0, currency), color: 'var(--text-primary)' },
                                { label: 'Burn Rate (YTD)', value: formatCurrency(stats.budgetUsage.used || 0, currency), color: 'var(--error)' },
                                { label: 'Available Capital', value: formatCurrency(availableBudget || 0, currency), color: availableBudget >= 0 ? 'var(--success)' : 'var(--error)' },
                            ].map(row => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{row.label}</span>
                                    <span style={{ fontWeight: 800, color: row.color }}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Quick Actions */}
                    <div className="premium-card" style={{ padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>Strategic Shortcuts</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                            {[
                                { label: 'New Request', href: '/dashboard/requisitions/new', icon: <Plus size={18} />, color: 'var(--brand)', bg: 'var(--brand-soft)' },
                                { label: 'Scan Invoices', href: '/dashboard/invoices', icon: <FileText size={18} />, color: 'var(--success)', bg: 'var(--success-soft)' },
                                { label: 'Onboard Vendor', href: '/dashboard/vendors', icon: <Building2 size={18} />, color: 'var(--info)', bg: 'var(--info-bg)' },
                                { label: 'Analytics Hub', href: '/dashboard/analytics', icon: <BarChart3 size={18} />, color: 'var(--warning)', bg: 'var(--warning-bg)' },
                            ].map(a => (
                                <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        padding: '0.875rem 1rem', borderRadius: '12px', cursor: 'pointer',
                                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface)'
                                    }}
                                        className="hover-premium"
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = a.color;
                                            e.currentTarget.style.background = a.bg;
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                            e.currentTarget.style.background = 'var(--surface)';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <div style={{ 
                                            width: '36px', height: '36px', background: a.bg, borderRadius: '8px', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color 
                                        }}>
                                            {a.icon}
                                        </div>
                                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{a.label}</span>
                                        <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-disabled)' }} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
