"use client";

import { AppUser, DashboardEvent } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SpendBarChart, BudgetDonutChart } from "@/components/charts/SimpleCharts";
import { VendorPerformance } from "@/lib/vendorAnalytics";
import AiAnalyst from "./AiAnalyst";

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
    };
    vendorPerf: VendorPerformance[];
    currency: string;
    onCurrencyChange: (currency: string) => void;
}

const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.5rem',
};

const statCardStyle = (borderColor: string): React.CSSProperties => ({
    background: '#FFFFFF',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    borderTop: `3px solid ${borderColor}`,
});

export default function ExecutiveDashboard({ user, stats, vendorPerf, currency, onCurrencyChange }: ExecutiveDashboardProps) {
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
        <div style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>

            {/* === WELCOME BAR === */}
            <div className="welcome-bar-inner" style={{
                background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)',
                borderRadius: '12px', padding: '1.5rem 2rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '1.5rem', color: 'white'
            }}>
                <div>
                    <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: '0.25rem' }}>
                        {greeting},
                    </div>
                    <h1 style={{ fontSize: '1.375rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                        {firstName}!
                        {stats.pendingCount > 0 && (
                            <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: '0.75rem', color: 'rgba(255,255,255,0.85)' }}>
                                You have {stats.pendingCount} approval{stats.pendingCount !== 1 ? 's' : ''} waiting.
                            </span>
                        )}
                    </h1>
                </div>
                <div className="welcome-bar-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link href="/dashboard/requisitions/new" style={{
                        background: 'white', color: 'var(--brand)', fontSize: '0.875rem',
                        fontWeight: 700, padding: '0.5rem 1rem', borderRadius: '8px',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem'
                    }}>
                        + New Request
                    </Link>
                    {stats.pendingCount > 0 && (
                        <Link href="/dashboard/approvals" style={{
                            background: 'rgba(255,255,255,0.15)', color: 'white',
                            fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 1rem',
                            borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)',
                            textDecoration: 'none'
                        }}>
                            Review Approvals ({stats.pendingCount})
                        </Link>
                    )}
                </div>
            </div>

            {/* === KPI CARDS === */}
            <div className="kpi-grid">
                {[
                    {
                        label: 'Pending Approvals',
                        value: stats.pendingCount.toString(),
                        sub: 'Awaiting review',
                        color: stats.pendingCount > 0 ? 'var(--warning)' : 'var(--success)',
                        bg: stats.pendingCount > 0 ? 'var(--warning-bg)' : 'var(--success-soft)',
                        icon: '⏰',
                        href: '/dashboard/approvals'
                    },
                    {
                        label: 'Total Spend YTD',
                        value: formatCurrency(stats.totalSpend, currency),
                        sub: 'This fiscal year',
                        color: 'var(--brand)',
                        bg: 'var(--brand-soft)',
                        icon: '💳',
                        href: '/dashboard/analytics'
                    },
                    {
                        label: 'Budget Remaining',
                        value: formatCurrency(availableBudget, currency),
                        sub: `${Math.round(stats.budgetUsage.percent)}% utilized`,
                        color: availableBudget > 0 ? 'var(--success)' : 'var(--error)',
                        bg: availableBudget > 0 ? 'var(--success-soft)' : 'var(--error-bg)',
                        icon: '🏦',
                        href: '/dashboard/budgets'
                    },
                    {
                        label: 'Savings YTD',
                        value: formatCurrency(stats.savings, currency),
                        sub: 'Negotiated savings',
                        color: 'var(--info)',
                        bg: 'var(--info-bg)',
                        icon: '📈',
                        href: '/dashboard/analytics'
                    },
                ].map(kpi => (
                    <Link href={kpi.href} key={kpi.label} style={{ textDecoration: 'none' }}>
                        <div className="card hover-lift" style={{ cursor: 'pointer', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {kpi.label}
                                </span>
                                <div style={{ width: '32px', height: '32px', background: kpi.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                                    {kpi.icon}
                                </div>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                                {kpi.value}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: kpi.color, fontWeight: 500 }}>{kpi.sub}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* === MAIN GRID === */}
            <div className="dashboard-grid">

                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

                    {/* Spend Chart */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Spend Overview</h2>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.125rem 0 0' }}>Monthly expenditure breakdown</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    value={currency}
                                    onChange={e => onCurrencyChange(e.target.value)}
                                    style={{ height: '32px', padding: '0 0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8125rem', color: 'var(--text-primary)', background: 'white', outline: 'none' }}
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
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Spend by Category</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.spendByCategory && Object.entries(stats.spendByCategory)
                                .sort(([, a], [, b]) => b - a).slice(0, 5)
                                .map(([cat, amount], i) => {
                                    const COLORS = ['var(--brand)', 'var(--success)', 'var(--info)', 'var(--warning)', 'var(--text-secondary)'];
                                    const pct = stats.totalSpend > 0 ? Math.round((amount / stats.totalSpend) * 100) : 0;
                                    return (
                                        <div key={cat}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                                                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{cat}</span>
                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{pct}%</span>
                                                    <span style={{ fontWeight: 700 }}>{formatCurrency(amount, currency)}</span>
                                                </div>
                                            </div>
                                            <div style={{ height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: COLORS[i], borderRadius: '3px', transition: 'width 0.6s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            {(!stats.spendByCategory || Object.keys(stats.spendByCategory).length === 0) && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-disabled)', fontSize: '0.875rem' }}>
                                    No spend data yet. Create a purchase order to get started.
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
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Budget Health</h2>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                            <BudgetDonutChart total={stats.budgetUsage.total || 1} used={stats.budgetUsage.used || 0} />
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                {Math.round(stats.budgetUsage.percent)}%
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Budget Utilized</div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {[
                                { label: 'Allocated', value: formatCurrency(stats.budgetUsage.total || 0, currency), color: 'var(--text-primary)' },
                                { label: 'Spent (YTD)', value: formatCurrency(stats.budgetUsage.used || 0, currency), color: 'var(--error)' },
                                { label: 'Remaining', value: formatCurrency(availableBudget || 0, currency), color: availableBudget >= 0 ? 'var(--success)' : 'var(--error)' },
                            ].map(row => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                                    <span style={{ fontWeight: 700, color: row.color }}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Vendors */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Top Vendors</h2>
                            <Link href="/dashboard/vendors" style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: 600 }}>View all</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {vendorPerf.slice(0, 4).map((v, i) => (
                                <div key={v.vendorId} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '8px',
                                        background: i === 0 ? 'var(--brand-soft)' : 'var(--background)',
                                        color: i === 0 ? 'var(--brand)' : 'var(--text-secondary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: '0.875rem', flexShrink: 0
                                    }}>
                                        {v.vendorName?.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.vendorName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.totalOrders} orders</div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{formatCurrency(v.totalSpend, currency)}</div>
                                        <div style={{
                                            fontSize: '0.7rem', fontWeight: 600, color: v.reliabilityScore >= 95 ? 'var(--success)' : 'var(--warning)'
                                        }}>{v.reliabilityScore}%</div>
                                    </div>
                                </div>
                            ))}
                            {vendorPerf.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-disabled)', fontSize: '0.8rem' }}>
                                    No vendor data available.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Quick Actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[
                                { label: 'New Purchase Request', href: '/dashboard/requisitions', icon: '📝', color: 'var(--brand-soft)', textColor: 'var(--brand)' },
                                { label: 'Upload Invoice', href: '/dashboard/invoices', icon: '🧾', color: 'var(--success-soft)', textColor: 'var(--success)' },
                                { label: 'Add Vendor', href: '/dashboard/vendors', icon: '🏢', color: 'var(--info-bg)', textColor: 'var(--info)' },
                                { label: 'View Reports', href: '/dashboard/analytics', icon: '📊', color: 'var(--warning-bg)', textColor: 'var(--warning)' },
                            ].map(a => (
                                <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.625rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
                                        transition: 'background 0.15s',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.background = a.color)}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div style={{ width: '28px', height: '28px', background: a.color, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>
                                            {a.icon}
                                        </div>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{a.label}</span>
                                        <span style={{ marginLeft: 'auto', color: 'var(--text-disabled)', fontSize: '0.75rem' }}>→</span>
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
