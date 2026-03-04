"use client";

import { useEffect, useState } from "react";
import { SpendSummary, getSpendAnalytics } from "@/lib/analytics";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import ReportBuilder from "@/components/analytics/ReportBuilder";
import { formatCurrency } from "@/lib/currencies";

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<SpendSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REPORTS'>('OVERVIEW');

    useEffect(() => {
        if (!user) return;
        getSpendAnalytics(user).then(d => {
            setData(d);
            setLoading(false);
        });
    }, [user]);

    if (loading || !data) return (
        <div className="page-container">
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Generating insights...</div>
        </div>
    );

    // Helper for max value to scale charts
    const maxDeptSpend = Math.max(...Object.values(data.spendByDepartment), 1);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Insights on spend, efficiency, and vendor performance</p>
                </div>
                {/* Tab Switcher */}
                <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface-hover)', padding: '0.25rem', borderRadius: 10 }}>
                    {(['OVERVIEW', 'REPORTS'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', fontWeight: 600,
                            fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
                            background: activeTab === tab ? 'white' : 'transparent',
                            color: activeTab === tab ? 'var(--brand)' : 'var(--text-secondary)',
                            boxShadow: activeTab === tab ? '0 1px 3px rgba(232,87,42,0.1)' : 'none'
                        }}>
                            {tab === 'OVERVIEW' ? 'Overview' : 'Custom Reports'}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'OVERVIEW' ? (
                <>
                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="card">
                            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Spend (YTD)</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {formatCurrency(data.totalSpend, data.baseCurrency)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                                {formatCurrency(data.savings, data.baseCurrency)} identified savings
                            </div>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Overview stats</h3>
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--brand)' }}>{data.recentTransactions.length}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active POs</div>
                                </div>
                                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--brand)' }}>{data.avgApprovalDays}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Approval Days</div>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Top Vendor</h3>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                {Object.entries(data.spendByVendor).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Greatest volume by spend
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                        {/* Department Chart */}
                        <div className="card">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Spend by Department</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {Object.entries(data.spendByDepartment).sort(([, a], [, b]) => b - a).map(([dept, amount]) => (
                                    <div key={dept}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                            <span style={{ fontWeight: 500 }}>{dept}</span>
                                            <span>{formatCurrency(amount, data.baseCurrency)}</span>
                                        </div>
                                        <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${(amount / maxDeptSpend) * 100}%`,
                                                backgroundColor: 'var(--brand)',
                                                borderRadius: '4px',
                                                transition: 'width 1s ease-in-out'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Vendor Table */}
                        <div className="card">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Top Vendors</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {Object.entries(data.spendByVendor)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 5)
                                        .map(([vendor, amount], idx) => (
                                            <tr key={vendor} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '0.75rem 0', fontWeight: 500, fontSize: '0.9rem' }}>
                                                    <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem', fontSize: '0.8rem' }}>#{idx + 1}</span>
                                                    {vendor}
                                                </td>
                                                <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>
                                                    {formatCurrency(amount, data.baseCurrency)}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </>
            ) : (
                <ReportBuilder />
            )}
        </div>
    );
}

