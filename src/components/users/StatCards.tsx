import React from 'react';
import { Users, UserPlus, ShieldCheck, Activity } from 'lucide-react';

interface StatCardsProps {
    totalUsers: number;
    pendingInvites: number;
    activeAdmins: number;
    activeSessions: number;
}

const StatCards: React.FC<StatCardsProps> = ({ totalUsers, pendingInvites, activeAdmins, activeSessions }) => {
    const stats = [
        { label: "Staff Directory", value: totalUsers, sub: "Total members", icon: Users, color: "var(--brand)" },
        { label: "Pending Invites", value: pendingInvites, sub: "Awaiting acceptance", icon: UserPlus, color: "var(--warning)" },
        { label: "Active Admins", value: activeAdmins, sub: "With full access", icon: ShieldCheck, color: "var(--success)" },
        { label: "Active Sessions", value: activeSessions, sub: "Currently online", icon: Activity, color: "var(--text-primary)" },
    ];

    return (
        <div className="metric-grid">
            {stats.map((s, i) => (
                <div 
                    key={s.label}
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px',
                        padding: '1.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.2s ease',
                        cursor: 'default'
                    }}
                >
                    {/* Background watermark icon */}
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                        <s.icon size={80} color={s.color} />
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{s.label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: s.color, fontWeight: 700 }}>{s.sub}</div>
                </div>
            ))}
        </div>
    );
};

export default StatCards;
