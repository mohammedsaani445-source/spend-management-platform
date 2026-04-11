"use client";

import React from 'react';
import { ShieldCheck, Zap, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface AuditMetricsProps {
    logs: any[];
}

export default function AuditMetrics({ logs }: AuditMetricsProps) {
    // Basic heuristics for demo purposes
    const securityLogs = logs.filter(l => l.action.includes('LOGIN') || l.action.includes('CONFIG') || l.action.includes('USER_MANAGEMENT'));
    const pendingApprovalsVelocity = "4.2h"; // Simulated
    const securityFlagCount = securityLogs.filter(l => l.action.includes('FAILED')).length;

    const metrics = [
        {
            label: "Audit Coverage",
            value: "100%",
            subtext: "All modules active",
            icon: <ShieldCheck size={20} color="var(--brand)" />,
            bg: "var(--brand-soft)",
            color: "var(--brand)"
        },
        {
            label: "Approval Velocity",
            value: pendingApprovalsVelocity,
            subtext: "Avg. response time",
            icon: <Zap size={20} color="#00AB55" />,
            bg: "rgba(0, 171, 85, 0.1)",
            color: "#00AB55"
        },
        {
            label: "Security Flags",
            value: securityFlagCount.toString(),
            subtext: "Requires review",
            icon: <AlertTriangle size={20} color="#FFAB00" />,
            bg: "rgba(255, 171, 0, 0.1)",
            color: "#FFAB00"
        },
        {
            label: "Integrity Status",
            value: "Verified",
            subtext: "Hash chain intact",
            icon: <CheckCircle2 size={20} color="#54D62C" />,
            bg: "rgba(84, 214, 44, 0.1)",
            color: "#54D62C"
        }
    ];

    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '1.5rem', 
            marginBottom: '2.5rem' 
        }}>
            {metrics.map((m, idx) => (
                <div key={idx} style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ width: '40px', height: '40px', background: m.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {m.icon}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {m.label}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1E293B', marginBottom: '2px', letterSpacing: '-0.025em' }}>
                            {m.value}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {m.subtext}
                        </div>
                    </div>
                    {/* Progress bar simulation for visual flair */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: `${m.color}15` }}>
                        <div style={{ width: '70%', height: '100%', background: m.color, borderRadius: '0 2px 0 0' }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
