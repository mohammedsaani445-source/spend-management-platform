"use client";

import { AppUser } from "@/types";
import SecurityBanner from "@/components/common/SecurityBanner";
import AiAnalyst from "./AiAnalyst";

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

export default function OperationsDashboard({ user, stats = {} as any }: OperationsDashboardProps) {
    return (
        <div style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
            <SecurityBanner user={user} />
            
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Operations & Receiving</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tracking shipments, receipts, and inventory alerts.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Active Tasks', value: stats?.activeCount?.toString() || '0', icon: '⚡', color: 'var(--brand)' },
                    { label: 'Average Time', value: stats?.avgTime || '0d', icon: '🕒', color: 'var(--success)' },
                    { label: 'Compliance Rate', value: stats?.complianceRate || '0%', icon: '🛡️', color: 'var(--info)' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                        </div>
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
            
            {/* AI Analyst Expansion */}
            <AiAnalyst />
        </div>
    );
}
