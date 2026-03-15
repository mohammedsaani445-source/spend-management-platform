"use client";

import { AppUser } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import Link from "next/link";
import SecurityBanner from "@/components/common/SecurityBanner";

interface ApproverDashboardProps {
    user: AppUser;
    stats: any;
    currency: string;
}

const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.5rem',
};

export default function ApproverDashboard({ user, stats, currency }: ApproverDashboardProps) {
    return (
        <div style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
            <SecurityBanner user={user} />
            
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Approvals Control</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Reviewing pending requests and departmental exposure.</p>
            </div>

            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {[
                    { label: 'Pending My Action', value: stats.pendingCount.toString(), sub: 'Priority items', color: 'var(--warning)', icon: '⚖️' },
                    { label: 'Dept. Utilization', value: `${Math.round(stats.budgetUsage.percent)}%`, sub: 'Current budget', color: 'var(--info)', icon: '📊' },
                    { label: 'Avg Cycle Time', value: `${stats.avgApprovalDays}d`, sub: 'Approval speed', color: 'var(--success)', icon: '🕒' },
                ].map(kpi => (
                    <div className="card" key={kpi.label} style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{kpi.label}</span>
                            <span>{kpi.icon}</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{kpi.sub}</div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Priority Queue</h2>
                        <Link href="/dashboard/approvals" style={{ fontSize: '0.8125rem', color: 'var(--brand)', fontWeight: 600 }}>Review all</Link>
                    </div>
                    {stats.pendingCount > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {stats.activityFeed.filter((a: any) => a.status === 'PENDING').slice(0, 3).map((item: any) => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.description}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{formatCurrency(item.amount, item.currency)}</div>
                                        <Link href="/dashboard/approvals" style={{ fontSize: '0.7rem', color: 'var(--brand)', background: 'var(--brand-soft)', padding: '2px 8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600 }}>Action</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-disabled)' }}>
                            <div style={{ fontSize: '2rem' }}>☕</div>
                            <p style={{ margin: 0 }}>Queue clear. Time for a break!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
