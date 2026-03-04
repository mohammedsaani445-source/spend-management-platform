"use client";

import { useMemo, useState } from "react";
import { Requisition, Budget } from "@/types";
import { formatCurrency } from "@/lib/currencies";

interface ApprovalDetailModalProps {
    requisition: Requisition;
    budget?: Budget; // Optional: Budget for the department
    deptSpend: number; // Total spend for the department so far
    onClose: () => void;
    onApprove: (id: string, comment?: string) => void;
    onReject: (id: string, comment?: string) => void;
    onRevision?: (id: string, comment?: string) => void;
}

export default function ApprovalDetailModal({
    requisition,
    budget,
    deptSpend,
    onClose,
    onApprove,
    onReject,
    onRevision
}: ApprovalDetailModalProps) {

    const [comment, setComment] = useState("");

    // Calculate Budget Impact
    const impact = useMemo(() => {
        if (!budget) return null;

        const currentUsage = (deptSpend / budget.amount) * 100;
        const purchaseImpact = (requisition.totalAmount / budget.amount) * 100;
        const newUsage = currentUsage + purchaseImpact;

        return {
            currentUsage,
            newUsage,
            isOverBudget: newUsage > 100,
            remaining: budget.amount - deptSpend - requisition.totalAmount
        };
    }, [budget, deptSpend, requisition.totalAmount]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div className="card" style={{
                width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto',
                animation: 'slideIn 0.3s ease-out', position: 'relative', border: 'none'
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
                            Approval Request
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{requisition.items[0]?.description || 'Purchase Request'}</h2>
                    </div>
                    <button onClick={onClose} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem' }}>

                        {/* Main Info */}
                        <div>
                            {/* Budget Insight */}
                            {budget && impact && (
                                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: impact.isOverBudget ? '#fff1f2' : '#f0fdf4', borderRadius: 'var(--radius-md)', border: `1px solid ${impact.isOverBudget ? '#fecad1' : '#bbf7d0'}` }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: impact.isOverBudget ? '#991b1b' : '#166534' }}>Budget Impact Analysis</h3>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                        <span>Current Spend: <strong>{formatCurrency(deptSpend, budget.currency)}</strong></span>
                                        <span>Limit: {formatCurrency(budget.amount, budget.currency)}</span>
                                    </div>

                                    <div style={{ height: '10px', width: '100%', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '5px', overflow: 'hidden', position: 'relative', marginBottom: '1rem' }}>
                                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(impact.currentUsage, 100)}%`, backgroundColor: 'rgba(0,0,0,0.3)' }}></div>
                                        <div style={{
                                            position: 'absolute',
                                            left: `${Math.min(impact.currentUsage, 100)}%`,
                                            top: 0, bottom: 0,
                                            width: `${Math.min(impact.newUsage - impact.currentUsage, 100 - impact.currentUsage)}%`,
                                            backgroundColor: impact.isOverBudget ? 'var(--error)' : 'var(--primary)',
                                        }}></div>
                                    </div>

                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: impact.isOverBudget ? 'var(--error)' : 'var(--success)' }}>
                                        {impact.isOverBudget
                                            ? `⚠️ EXCEEDS BUDGET BY ${formatCurrency(Math.abs(impact.remaining), budget.currency)}`
                                            : `✅ Within Budget (${formatCurrency(impact.remaining, budget.currency)} remaining)`
                                        }
                                    </div>
                                </div>
                            )}

                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Line Items</h3>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                                        <tr>
                                            <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Qty</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requisition.items.map((item, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{item.description}</div>
                                                    {item.glCode && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GL: {item.glCode}</div>}
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total, requisition.currency)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot style={{ backgroundColor: '#f9fafb', fontWeight: 800 }}>
                                        <tr>
                                            <td colSpan={2} style={{ padding: '1rem', textAlign: 'right' }}>Total Amount</td>
                                            <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--primary)', fontSize: '1.1rem' }}>{formatCurrency(requisition.totalAmount, requisition.currency)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="card" style={{ backgroundColor: '#f8fafc', padding: '1.25rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 700 }}>Approval Chain</div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                                    {/* History */}
                                    {requisition.approvalHistory?.map((entry, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                                            <div style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{entry.stepName}</div>
                                                <div style={{ color: 'var(--text-secondary)' }}>{entry.actorName} approved</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{new Date(entry.timestamp).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Current/Future Placeholder */}
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', opacity: 0.6 }}>
                                        <div style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>○</div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>Pending Review</div>
                                            <div style={{ fontStyle: 'italic' }}>Sequential Tier {(requisition.currentStepIndex || 0) + 1}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ backgroundColor: '#f8fafc', padding: '1.25rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Justification</div>
                                <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{requisition.justification}</div>
                            </div>
                        </div>
                    </div>

                    {/* Comment Field */}
                    <div style={{ marginTop: '2rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Decision Comment (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a reason for your approval or rejection..."
                            rows={2}
                            style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)', padding: '0.75rem' }}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <button onClick={onClose} className="btn" style={{ padding: '0.75rem 1.5rem' }}>Cancel</button>
                        {onRevision && (
                            <button onClick={() => onRevision(requisition.id!, comment)} className="btn" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border)' }}>Request Revision</button>
                        )}
                        <button onClick={() => onReject(requisition.id!, comment)} className="btn" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecad1' }}>Reject</button>
                        <button onClick={() => onApprove(requisition.id!, comment)} className="btn btn-primary" style={{ padding: '0.75rem 2.5rem', fontWeight: 700 }}>Approve Request</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
