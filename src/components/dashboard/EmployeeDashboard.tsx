"use client";

import { useMemo } from "react";
import { AppUser, Requisition } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SecurityBanner from "@/components/common/SecurityBanner";

interface EmployeeDashboardProps {
    user: AppUser;
    requisitions: Requisition[];
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { bg: string; color: string }> = {
        PENDING: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
        APPROVED: { bg: 'var(--success-soft)', color: 'var(--success)' },
        REJECTED: { bg: 'var(--error-bg)', color: 'var(--error)' },
        ORDERED: { bg: 'var(--info-bg)', color: 'var(--info)' },
    };
    const s = map[status] || { bg: 'var(--background)', color: 'var(--text-secondary)' };
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color }}>
            {status}
        </span>
    );
}

export default function EmployeeDashboard({ user, requisitions }: EmployeeDashboardProps) {
    const router = useRouter();
    const firstName = (user as any).displayName?.split(' ')[0] || (user as any).name?.split(' ')[0] || 'there';

    const activeRequests = requisitions
        .filter(r => r.status !== 'REJECTED' && r.status !== 'ORDERED')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    const buyAgainItems = useMemo(() => {
        const itemMap = new Map<string, { description: string; unitPrice: number; count: number, currency: string }>();
        requisitions.filter(r => r.status === 'APPROVED' || r.status === 'ORDERED').forEach(r => {
            r.items.forEach(item => {
                const ex = itemMap.get(item.description);
                if (ex) ex.count += 1;
                else itemMap.set(item.description, { ...item, count: 1, currency: r.currency || 'USD' });
            });
        });
        return Array.from(itemMap.values()).sort((a, b) => b.count - a.count).slice(0, 4);
    }, [requisitions]);

    const CATEGORIES = [
        { label: 'General Items', sub: 'Office supplies, equipment', icon: '📦', type: 'general', color: 'var(--brand-soft)', textColor: 'var(--brand)' },
        { label: 'Services', sub: 'Consulting, subscriptions', icon: '🛠', type: 'service', color: 'var(--info-bg)', textColor: 'var(--info)' },
        { label: 'Travel & Expenses', sub: 'Flights, hotels, meals', icon: '✈️', type: 'travel', color: 'var(--warning-bg)', textColor: 'var(--warning)' },
        { label: 'Technology', sub: 'Software, hardware', icon: '💻', type: 'tech', color: 'var(--success-soft)', textColor: 'var(--success)' },
        { label: 'Marketing', sub: 'Ads, events, materials', icon: '📣', type: 'marketing', color: 'var(--error-bg)', textColor: 'var(--error)' },
        { label: 'Other', sub: 'Miscellaneous requests', icon: '📋', type: 'other', color: 'var(--background)', textColor: 'var(--text-secondary)' },
    ];

    return (
        <div style={{ color: 'var(--text-primary)' }}>
            <SecurityBanner user={user} />

            {/* Welcome Banner */}
            <div className="welcome-bar-inner" style={{
                background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)',
                borderRadius: '12px', padding: '1.5rem 2rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '1.5rem', color: 'white'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.375rem', fontWeight: 700, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
                        What do you need, {firstName}?
                    </h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                        Submit a purchase request or track your existing orders below.
                    </p>
                </div>
                <div className="welcome-bar-actions" style={{ display: 'flex' }}>
                    <Link href="/dashboard/requisitions/new" style={{
                        background: 'white', color: 'var(--brand)', fontSize: '0.875rem', fontWeight: 700,
                        padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', display: 'flex'
                    }}>
                        + New Request
                    </Link>
                </div>
            </div>

            {/* Category cards grid */}
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Browse Categories</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {CATEGORIES.map(cat => (
                    <Link key={cat.type} href={`/dashboard/requisitions/new?type=${cat.type}`} style={{ textDecoration: 'none' }}>
                        <div className="card hover-lift" style={{ cursor: 'pointer', padding: '1.25rem' }}>
                            <div style={{ width: '48px', height: '48px', background: cat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.875rem' }}>
                                {cat.icon}
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>{cat.label}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat.sub}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* === KPI CARDS === */}
            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Requests', value: requisitions.length, color: 'var(--brand)', bg: 'var(--brand-soft)' },
                    { label: 'Pending', value: requisitions.filter(r => r.status === 'PENDING').length, color: 'var(--warning)', bg: 'var(--warning-bg)' },
                    { label: 'Approved', value: requisitions.filter(r => r.status === 'APPROVED').length, color: 'var(--success)', bg: 'var(--success-soft)' },
                    { label: 'Ordered', value: requisitions.filter(r => r.status === 'ORDERED').length, color: 'var(--info)', bg: 'var(--info-bg)' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{s.label}</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Main 2-column grid */}
            <div className="dashboard-grid">

                {/* My Recent Requests */}
                <div className="card" style={{ padding: '1.5rem', overflowX: 'auto', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Requests</h2>
                        <Link href="/dashboard/requisitions" style={{ fontSize: '0.8125rem', color: 'var(--brand)', fontWeight: 600 }}>View all</Link>
                    </div>

                    {activeRequests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-disabled)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
                            <div style={{ fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>No active requests</div>
                            <div style={{ fontSize: '0.8125rem' }}>Create your first purchase request to get started.</div>
                        </div>
                    ) : (
                        <div className="responsive-table">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr>
                                        {['REQ #', 'Description', 'Amount', 'Status'].map(h => (
                                            <th key={h} className={h === 'Description' || h === 'REQ #' ? '' : 'hidden-mobile'} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeRequests.map(req => (
                                        <tr key={req.id} onClick={() => router.push('/dashboard/requisitions')} style={{ cursor: 'pointer' }}>
                                            <td data-label="REQ #" style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand)', borderBottom: '1px solid var(--background)' }}>
                                                #{req.id?.slice(-5).toUpperCase()}
                                            </td>
                                            <td data-label="Description" style={{ padding: '0.75rem', borderBottom: '1px solid var(--background)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                                                {(req as any).description || req.vendorName || '—'}
                                            </td>
                                            <td data-label="Amount" style={{ padding: '0.75rem', fontWeight: 700, borderBottom: '1px solid var(--background)' }}>
                                                {formatCurrency(req.totalAmount, req.currency)}
                                            </td>
                                            <td data-label="Status" style={{ padding: '0.75rem', borderBottom: '1px solid var(--background)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <StatusBadge status={req.status} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right: Buy Again + Quick Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Stats */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>My Summary</h3>
                        {[
                            { label: 'Total Requests', value: requisitions.length, color: 'var(--brand)', bg: 'var(--brand-soft)' },
                            { label: 'Pending', value: requisitions.filter(r => r.status === 'PENDING').length, color: 'var(--warning)', bg: 'var(--warning-bg)' },
                            { label: 'Approved', value: requisitions.filter(r => r.status === 'APPROVED').length, color: 'var(--success)', bg: 'var(--success-soft)' },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                                <span style={{ fontWeight: 700, color: s.color, background: s.bg, padding: '2px 10px', borderRadius: '9999px', fontSize: '0.875rem' }}>{s.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Buy Again */}
                    {buyAgainItems.length > 0 && (
                        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Order Again</h3>
                            {buyAgainItems.map(item => (
                                <button key={item.description} className="hover-lift" onClick={() => router.push('/dashboard/requisitions/new')} style={{
                                    width: '100%', textAlign: 'left', padding: '0.625rem 0.75rem',
                                    borderRadius: '8px', border: '1px solid var(--border)', background: '#F9FAFB',
                                    cursor: 'pointer', marginBottom: '0.5rem', fontFamily: 'inherit'
                                }}>
                                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.description}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {formatCurrency(item.unitPrice, item.currency)} · ordered {item.count}×
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
