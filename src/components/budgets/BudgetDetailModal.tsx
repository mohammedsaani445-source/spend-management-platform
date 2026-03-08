"use client";

import { useMemo } from "react";
import { Budget, Requisition } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import { X, TrendingUp, AlertTriangle, AlertCircle, PieChart, Info, Building2, User, FileText, CheckCircle2 } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";

interface BudgetDetailModalProps {
    budget: Budget;
    requisitions: Requisition[];
    onClose: () => void;
}

export default function BudgetDetailModal({
    budget,
    requisitions,
    onClose
}: BudgetDetailModalProps) {
    useScrollLock(true);
    const currency = budget.currency || 'USD';
    const totalSpent = requisitions.reduce((sum, r) => sum + r.totalAmount, 0);
    const percentInitial = (totalSpent / budget.amount) * 100;

    // --- Forecasting Logic ---
    // Simple linear projection based on "Day of Fiscal Year"
    // Assuming FY starts Jan 1 (simplified)
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const daysPassed = Math.max(1, Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)));
    const totalDays = 365;

    // Average daily spend so far
    const dailyBurnRate = totalSpent / daysPassed;

    // Projected spend at end of year = current spent + (daily rate * remaining days)
    const projectedTotal = totalSpent + (dailyBurnRate * (totalDays - daysPassed));
    const projectedPercent = (projectedTotal / budget.amount) * 100;

    // Generate Chart Data Points (Monthly)
    const chartData = useMemo(() => {
        const points = [];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Aggregate real spend by month
        const monthlyActuals = new Array(12).fill(0);
        requisitions.forEach(req => {
            const date = new Date(req.createdAt);
            if (date.getFullYear() === today.getFullYear()) {
                monthlyActuals[date.getMonth()] += req.totalAmount;
            }
        });

        let cumulative = 0;
        for (let i = 0; i < 12; i++) {
            const isFuture = i > today.getMonth();
            let value = 0;

            if (!isFuture) {
                cumulative += monthlyActuals[i];
                value = cumulative;
            } else {
                // Add burn rate for future months
                cumulative += (dailyBurnRate * 30);
                value = cumulative;
            }

            points.push({ name: months[i], value, isFuture });
        }
        return points;
    }, [requisitions, dailyBurnRate, today]);

    // Calculate max Y value (Budget or Projected, whichever is higher, plus buffering)
    const maxY = Math.max(budget.amount, projectedTotal) * 1.1;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div className="card" style={{
                width: '1000px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto',
                position: 'relative', padding: 0, border: 'none', display: 'flex', flexDirection: 'column'
            }}>

                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: 'var(--surface-hover)', position: 'sticky', top: 0, zIndex: 10
                }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: 4 }}>Department Budget</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <PieChart size={24} color="var(--brand)" />
                            {budget.department} <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1.25rem' }}>FY{budget.fiscalYear}</span>
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}><X size={28} /></button>
                </div>

                <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', background: 'var(--background)' }}>

                    {/* Top Section: Metrics & Graph */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', marginBottom: '3rem' }}>

                        {/* Key Metrics */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'white', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>Total Budget</span>
                                    <PieChart size={16} />
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: '-0.5px' }}>{formatCurrency(budget.amount, currency)}</div>
                            </div>

                            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--success-bg)', border: '1px solid rgba(0, 171, 85, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--success)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>Actual Spent</span>
                                    <CheckCircle2 size={16} />
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.5px' }}>{formatCurrency(totalSpent, currency)}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--success)', marginTop: '0.25rem', fontWeight: 600 }}>{percentInitial.toFixed(1)}% utilized</div>
                            </div>

                            <div className="card" style={{ padding: '1.5rem', backgroundColor: projectedTotal > budget.amount ? 'var(--error-bg)' : 'var(--warning-bg)', border: `1px solid ${projectedTotal > budget.amount ? 'var(--error)' : 'var(--warning-dark)'}40` }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: projectedTotal > budget.amount ? 'var(--error)' : 'var(--warning-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>Projected End-Year</span>
                                    <TrendingUp size={16} />
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: projectedTotal > budget.amount ? 'var(--error)' : 'var(--warning-dark)', letterSpacing: '-0.5px' }}>{formatCurrency(projectedTotal, currency)}</div>
                                <div style={{ fontSize: '0.875rem', color: projectedTotal > budget.amount ? 'var(--error)' : 'var(--warning-dark)', marginTop: '0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {projectedTotal > budget.amount ? <><AlertTriangle size={14} /> {formatCurrency(projectedTotal - budget.amount, currency)} Overage</> : <><CheckCircle2 size={14} /> Within Budget</>}
                                </div>
                            </div>
                        </div>

                        {/* Forecast Chart (SVG) */}
                        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                                <TrendingUp size={18} color="var(--brand)" /> Spend Forecast
                            </h3>
                            <div style={{ flex: 1, minHeight: '220px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: '3rem', gap: '8px' }}>

                                {/* Y-Axis Label */}
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                    <span>{formatCurrency(maxY, currency)}</span>
                                    <span>{formatCurrency(maxY / 2, currency)}</span>
                                    <span>0</span>
                                </div>

                                {/* Horizontal Grid Lines */}
                                <div style={{ position: 'absolute', left: '3rem', right: 0, top: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                                    <div style={{ borderTop: '1px solid var(--border)', opacity: 0.5, width: '100%' }}></div>
                                    <div style={{ borderTop: '1px solid var(--border)', opacity: 0.5, width: '100%' }}></div>
                                    <div style={{ borderTop: '1px solid var(--border)', opacity: 0.8, width: '100%' }}></div>
                                </div>


                                {/* Budget Line */}
                                <div style={{
                                    position: 'absolute', left: '3rem', right: 0,
                                    bottom: `${(budget.amount / maxY) * 100}%`,
                                    height: '2px', backgroundColor: 'var(--error)', borderTop: '2px dashed var(--error)', opacity: 0.7, zIndex: 2
                                }}>
                                    <span style={{ position: 'absolute', right: 0, top: '-1.4rem', color: 'var(--error)', fontSize: '0.7rem', fontWeight: 800, background: 'var(--error-bg)', padding: '2px 6px', borderRadius: 4 }}>LIMIT</span>
                                </div>

                                {/* Bars */}
                                {chartData.map((d, i) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', alignItems: 'center', zIndex: 1 }}>
                                        <div
                                            style={{
                                                width: '90%',
                                                height: `${(d.value / maxY) * 100}%`,
                                                backgroundColor: d.isFuture ? 'rgba(92, 106, 196, 0.2)' : 'var(--brand)',
                                                border: d.isFuture ? '1px dashed var(--brand)' : 'none',
                                                borderBottom: 'none',
                                                borderRadius: '6px 6px 0 0',
                                                transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                            }}
                                            title={`${d.name}: ${formatCurrency(d.value, currency)}`}
                                        >
                                            <div className="tooltip" style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', background: '#212B36', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: '0.7rem', display: 'none', whiteSpace: 'nowrap' }}>
                                                {formatCurrency(d.value, currency)}
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{d.name}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><div style={{ width: '12px', height: '12px', backgroundColor: 'var(--brand)', borderRadius: '3px' }}></div> Actual Spend</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(92, 106, 196, 0.2)', border: '1px dashed var(--brand)', borderRadius: '3px' }}></div> Projected Spend</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><div style={{ width: '16px', height: '3px', backgroundColor: 'var(--error)' }}></div> Budget Limit</div>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Section: Drill-down Table */}
                    <div className="card" style={{ padding: '1.5rem', background: 'white', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Transaction History</h3>
                        {requisitions.length === 0 ? (
                            <div className="empty-state" style={{ padding: '3rem', background: '#F9FAFB', borderRadius: 8 }}>
                                <div className="empty-state-icon" style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}><FileText size={40} /></div>
                                <h3>No transactions found</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>No spend has been recorded for this fiscal period yet.</p>
                            </div>
                        ) : (
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                <thead style={{ backgroundColor: '#F4F6F8', borderBottom: '1px solid #DFE3E8', borderTop: '1px solid #DFE3E8' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', color: '#637381', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Date</th>
                                        <th style={{ padding: '1rem', color: '#637381', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Requester</th>
                                        <th style={{ padding: '1rem', color: '#637381', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Vendor</th>
                                        <th style={{ padding: '1rem', color: '#637381', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Description</th>
                                        <th style={{ padding: '1rem', color: '#637381', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', textAlign: 'right' }}>Amount</th>
                                        <th style={{ padding: '1rem', color: '#637381', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requisitions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(req => (
                                        <tr key={req.id} style={{ borderBottom: '1px solid #DFE3E8', transition: 'background-color 0.15s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{req.createdAt.toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: 10, fontWeight: 700 }}><User size={12} /></div>
                                                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{req.requesterName}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--text-secondary)' }}><Building2 size={12} /></div>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.vendorName || '-'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                                                {req.items.map(i => i.description).join(", ")}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(req.totalAmount, req.currency)}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "6px", fontWeight: 700, letterSpacing: '0.05em',
                                                    background: req.status === 'APPROVED' || req.status === 'ORDERED' ? 'var(--success-bg)' : req.status === 'REJECTED' ? 'var(--error-bg)' : 'var(--warning-bg)',
                                                    color: req.status === 'APPROVED' || req.status === 'ORDERED' ? 'var(--success)' : req.status === 'REJECTED' ? 'var(--error)' : 'var(--warning-dark)',
                                                }}>
                                                    {req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
