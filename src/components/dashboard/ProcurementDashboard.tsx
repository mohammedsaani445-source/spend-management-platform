"use client";

import React, { useMemo } from "react";
import { AppUser, PurchaseOrder } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import SecurityBanner from "@/components/common/SecurityBanner";

interface ProcurementDashboardProps {
    user: AppUser;
    stats: any;
    pos: PurchaseOrder[];
    currency: string;
}

const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.5rem',
};

export default function ProcurementDashboard({ user, stats, pos, currency }: ProcurementDashboardProps) {

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
            <SecurityBanner user={user} />
            
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Procurement Operations</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Managing vendors, purchase orders, and sourcing efficiency.</p>
            </div>

            <div className="kpi-grid">
                {[
                    { label: 'Active POs', value: pos.filter(p => !['CANCELLED', 'CLOSED'].includes(p.status)).length.toString(), sub: 'In pipeline', color: 'var(--brand)', icon: '📦' },
                    { label: 'Top Vendor', value: 'Apex Global', sub: 'Primary supplier', color: 'var(--info)', icon: '🏢' },
                    { label: 'Est. Savings', value: formatCurrency(stats.savings, currency), sub: 'Negotiated value', color: 'var(--success)', icon: '💎' },
                    { label: 'CO2e Footprint', value: `${Math.round(stats.carbonFootprint?.totalCo2e || 0)}kg`, sub: 'Sustainability index', color: 'var(--warning)', icon: '🌱' },
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

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Active Purchase Orders</h3>
                        <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = '/dashboard/purchase-orders'}>View All →</button>
                    </div>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>PO #</th>
                                    <th>Vendor</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pos.filter(p => !['CANCELLED', 'CLOSED'].includes(p.status)).slice(0, 5).map(po => (
                                    <tr key={po.id}>
                                        <td style={{ fontWeight: 700, fontSize: '0.8rem' }}>{po.poNumber}</td>
                                        <td>{po.vendorName}</td>
                                        <td style={{ fontWeight: 700 }}>{formatCurrency(po.totalAmount, po.currency)}</td>
                                        <td>
                                            <span style={{ 
                                                fontSize: '0.7rem', 
                                                padding: '2px 8px', 
                                                borderRadius: 999,
                                                background: po.status === 'DISCREPANCY_FLAGGED' ? '#fee2e2' : 'var(--brand-soft)',
                                                color: po.status === 'DISCREPANCY_FLAGGED' ? '#ef4444' : 'var(--brand)'
                                            }}>
                                                {po.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
