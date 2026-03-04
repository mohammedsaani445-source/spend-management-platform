"use client";

import { useMemo } from "react";
import { Budget, Requisition } from "@/types";
import { formatCurrency } from "@/lib/currencies";

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
                    backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10
                }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Department Budget</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{budget.department} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>FY{budget.fiscalYear}</span></h2>
                    </div>
                    <button onClick={onClose} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>

                    {/* Top Section: Metrics & Graph */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', marginBottom: '3rem' }}>

                        {/* Key Metrics */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Budget</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{formatCurrency(budget.amount, currency)}</div>
                            </div>

                            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-bg)' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--success)', marginBottom: '0.5rem' }}>Actual Spent</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{formatCurrency(totalSpent, currency)}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--success)', marginTop: '0.25rem' }}>{percentInitial.toFixed(1)}% utilized</div>
                            </div>

                            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-bg)' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--warning-dark)', marginBottom: '0.5rem' }}>Projected End-Year</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning-dark)' }}>{formatCurrency(projectedTotal, currency)}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--warning-dark)', marginTop: '0.25rem' }}>
                                    {projectedTotal > budget.amount ? `⚠️ ${formatCurrency(projectedTotal - budget.amount, currency)} Overage` : '✅ Within Budget'}
                                </div>
                            </div>
                        </div>

                        {/* Forecast Chart (SVG) */}
                        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Spend Forecast</h3>
                            <div style={{ flex: 1, minHeight: '200px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: '2rem', gap: '10px' }}>

                                {/* Y-Axis Label */}
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                    <span>{formatCurrency(maxY, currency)}</span>
                                    <span>{formatCurrency(maxY / 2, currency)}</span>
                                    <span>0</span>
                                </div>

                                {/* Budget Line */}
                                <div style={{
                                    position: 'absolute', left: '2rem', right: 0,
                                    bottom: `${(budget.amount / maxY) * 100}%`,
                                    height: '2px', backgroundColor: 'var(--error)', borderTop: '1px dashed var(--error)', opacity: 0.5
                                }}>
                                    <span style={{ position: 'absolute', right: 0, top: '-1.2rem', color: 'var(--error)', fontSize: '0.75rem', fontWeight: 'bold' }}>BUDGET LIMIT</span>
                                </div>

                                {/* Bars */}
                                {chartData.map((d, i) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', alignItems: 'center' }}>
                                        <div
                                            style={{
                                                width: '80%',
                                                height: `${(d.value / maxY) * 100}%`,
                                                backgroundColor: d.isFuture ? 'var(--border)' : 'var(--brand)', // Grey for future, Brand for actual
                                                borderRadius: '4px 4px 0 0',
                                                transition: 'height 0.3s ease-out',
                                                backgroundImage: d.isFuture ? 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.5) 5px, rgba(255,255,255,0.5) 10px)' : 'none'
                                            }}
                                            title={`${d.name}: ${formatCurrency(d.value, currency)}`}
                                        ></div>
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{d.name}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', backgroundColor: 'var(--brand)', borderRadius: '2px' }}></div> Actual</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', backgroundColor: 'var(--border)', borderRadius: '2px' }}></div> Projected</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '2px', backgroundColor: 'var(--error)' }}></div> Limit</div>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Section: Drill-down Table */}
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Transaction History</h3>
                        {requisitions.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No transactions found for this fiscal period.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                <thead style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                                    <tr>
                                        <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Requester</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Vendor</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requisitions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(req => (
                                        <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem 1rem' }}>{req.createdAt.toLocaleDateString()}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>{req.requesterName}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>{req.vendorName || '-'}</td>
                                            <td style={{ padding: '0.75rem 1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {req.items.map(i => i.description).join(", ")}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(req.totalAmount, req.currency)}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--surface-hover)' }}>{req.status}</span>
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
