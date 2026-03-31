"use client";

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
        weightedScore: calculateWeightedScore(rfp, q)
    })).sort((a, b) => b.weightedScore - a.weightedScore);

    return (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Comparative Evaluation Matrix</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        Auto-ranked using {(rfp.weightedCriteria?.price || 0.5) * 100}% Price, {(rfp.weightedCriteria?.quality || 0.2) * 100}% Quality weights.
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
