"use client";

import { AppUser } from "@/types";
import SecurityBanner from "@/components/common/SecurityBanner";

interface OperationsDashboardProps {
    user: AppUser;
    stats: any;
}

const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-xl)'
};

export default function OperationsDashboard({ user, stats }: OperationsDashboardProps) {
    return (
        <div style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
            <SecurityBanner user={user} />
            
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Operations & Receiving</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tracking shipments, receipts, and inventory alerts.</p>
            </div>

            <div className="kpi-grid">
                {[
                    { label: 'Outbound POs', value: stats.activeCount.toString(), sub: 'Awaiting fulfillment', icon: '📤' },
                    { label: 'Pending Receipts', value: '12', sub: 'Needs entry', icon: '📥' },
                    { label: 'Stock Alerts', value: '4', sub: 'Below threshold', icon: '⚠️' },
                    { label: 'Warehouse Capacity', value: '82%', sub: 'Utilization', icon: '🏟️' },
                ].map(kpi => (
                    <div className="card" key={kpi.label} style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{kpi.label}</span>
                            <span>{kpi.icon}</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{kpi.value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{kpi.sub}</div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Receiving Queue</h2>
                    <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '8px', color: 'var(--text-disabled)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚚</div>
                        <p style={{ margin: 0 }}>No shipments scheduled for the next 24 hours.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
