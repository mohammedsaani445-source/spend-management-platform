"use client";
import { useState, useEffect } from "react";

import { RFP, Quotation } from "@/types";
import { calculateWeightedScore } from "@/lib/sourcing";
import { Award, Info, Star, Clock, ShieldAlert } from "lucide-react";
import { formatCurrency } from "@/lib/currencies";

interface SourcingEvaluationProps {
    rfp: RFP;
    quotes: Quotation[];
}

export default function SourcingEvaluation({ rfp, quotes }: SourcingEvaluationProps) {
    // Sort quotes by weighted score (descending)
    const scoredQuotes = quotes.map(q => ({
        ...q,
        weightedScore: calculateWeightedScore(rfp, q) as number
    })).sort((a, b) => (b.weightedScore as number) - (a.weightedScore as number));

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ 
                padding: '2rem', 
                borderBottom: '1px solid var(--border)', 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '1rem' : '0'
            }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 900 }}>Comparative Evaluation Matrix</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        Auto-ranked using {(rfp.weightedCriteria?.price || 0.5) * 100}% Price, {(rfp.weightedCriteria?.quality || 0.2) * 100}% Quality.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ 
                        padding: '0.5rem 1rem', background: 'var(--brand-soft)', color: 'var(--brand)', 
                        borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' 
                    }}>
                        {quotes.length} Total Bids
                    </div>
                </div>
            </div>

            {/* Bid Variance Analytics */}
            <div style={{ padding: '2rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'flex-start' : 'flex-end', 
                    marginBottom: '1.5rem',
                    gap: isMobile ? '0.5rem' : '0'
                }}>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                            Strategic Variance Analysis
                        </h4>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-disabled)', fontSize: '0.75rem' }}>
                            Cross-bidder performance indexing across weighted sourcing dimensions.
                        </p>
                    </div>
                </div>
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(140px, 1fr))' : `repeat(${Math.min(scoredQuotes.length, 4)}, 1fr)`, 
                    gap: '2rem' 
                }}>
                    {scoredQuotes.slice(0, 4).map((q: any, i) => {
                        const breakdown: any = (calculateWeightedScore(rfp, q, true) as any).breakdown;
                        const metrics = [
                            { label: 'PRC', value: (breakdown.price as number), color: '#6366f1' },
                            { label: 'QLT', value: (breakdown.quality as number), color: '#10b981' },
                            { label: 'DLV', value: (breakdown.delivery as number), color: '#f59e0b' },
                            { label: 'RSK', value: (breakdown.risk as number), color: '#ef4444' }
                        ];

                        return (
                            <div key={q.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {q.vendorName}
                                    </span>
                                    {i === 0 && <Award size={14} color="var(--warning)" />}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', padding: '0 0.5rem' }}>
                                    {metrics.map(m => (
                                        <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                            <div 
                                                title={`${m.label}: ${m.value.toFixed(0)}%`}
                                                style={{ 
                                                    width: '100%', 
                                                    height: `${m.value}%`, 
                                                    background: m.color,
                                                    borderRadius: '2px 2px 0 0',
                                                    opacity: i === 0 ? 1 : 0.4,
                                                    transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }} 
                                            />
                                            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-disabled)' }}>{m.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-2)' }}>
                            <th style={{ textAlign: 'left', padding: '1rem 2rem', fontSize: '0.75rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Supplier</th>
                            <th style={{ textAlign: 'right', padding: '1rem 2rem', fontSize: '0.75rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Weighted Score</th>
                            <th style={{ textAlign: 'right', padding: '1rem 2rem', fontSize: '0.75rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Total Price</th>
                            <th style={{ textAlign: 'center', padding: '1rem 2rem', fontSize: '0.75rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Lead Time</th>
                            <th style={{ textAlign: 'center', padding: '1rem 2rem', fontSize: '0.75rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Quality</th>
                            <th style={{ textAlign: 'center', padding: '1rem 2rem', fontSize: '0.75rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scoredQuotes.map((q, i) => (
                            <tr key={q.id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ 
                                            width: '32px', height: '32px', background: i === 0 ? 'var(--warning-soft)' : 'var(--surface-2)', 
                                            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            color: i === 0 ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 900, fontSize: '0.8125rem' 
                                        }}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{q.vendorName}</div>
                                            {i === 0 && <div style={{ fontSize: '0.65rem', color: 'var(--brand)', fontWeight: 900, textTransform: 'uppercase' }}>Best Value Winner</div>}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                        <div style={{ width: '100px', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${q.weightedScore}%`, height: '100%', background: i === 0 ? 'var(--brand)' : 'var(--text-disabled)' }} />
                                        </div>
                                        <span style={{ fontWeight: 900, fontSize: '1rem', color: i === 0 ? 'var(--brand)' : 'inherit' }}>{q.weightedScore.toFixed(1)}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem 2rem', textAlign: 'right', fontWeight: 800, fontSize: '1rem' }}>
                                    {formatCurrency(q.totalAmount, q.currency)}
                                </td>
                                <td style={{ padding: '1.5rem 2rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={16} color="var(--text-disabled)" />
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{q.scorecard?.deliveryDays || '—'} Days</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem 2rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                        <Star size={16} color="var(--warning)" />
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{q.scorecard?.qualityRating || '—'}/10</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem 2rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                        <ShieldAlert size={16} color={q.scorecard?.riskRating && q.scorecard.riskRating > 7 ? 'var(--success)' : 'var(--error)'} />
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{q.scorecard?.riskRating || '—'}/10</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Insights Footer */}
            <div style={{ padding: '1.5rem 2rem', background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--brand)', fontSize: '0.8125rem' }}>
                <Info size={18} />
                <span>
                    <strong>Procurement Insight:</strong> Supplier <strong>{scoredQuotes[0]?.vendorName}</strong> offers the best overall value when accounting for delivery speed and risk profile, despite {(scoredQuotes[0]?.totalAmount || 0) > (scoredQuotes[1]?.totalAmount || 0) ? 'not being the absolute lowest price' : 'also being the lowest price'}.
                </span>
            </div>
        </div>
    );
}
