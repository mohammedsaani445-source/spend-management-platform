"use client";

import { useMemo } from "react";
import { Requisition, RequisitionStatus } from "@/types";
import { formatCurrency } from "@/lib/currencies";

interface RequisitionDetailModalProps {
    requisition: Requisition;
    onClose: () => void;
    onDuplicate?: (req: Requisition) => void;
    onSource?: () => void;
}

export default function RequisitionDetailModal({
    requisition,
    onClose,
    onDuplicate,
    onSource
}: RequisitionDetailModalProps) {

    // Status Timeline Logic
    const steps = [
        { status: 'DRAFT', label: 'Draft' }, // Assumed start
        { status: 'PENDING', label: 'Pending Approval' },
        { status: 'APPROVED', label: 'Approved' },
        { status: 'ORDERED', label: 'Ordered' },
        { status: 'RECEIVED', label: 'Received' } // Future state
    ];

    const currentStepIndex = useMemo(() => {
        if (requisition.status === 'REJECTED') return -1;
        // Map current status to index
        const map: Record<string, number> = {
            'PENDING': 1,
            'APPROVED': 2,
            'ORDERED': 3,
            'RECEIVED': 4
        };
        return map[requisition.status] || 0;
    }, [requisition.status]);

    const getStepStatus = (index: number) => {
        if (requisition.status === 'REJECTED') return 'inactive';
        if (index < currentStepIndex) return 'completed';
        if (index === currentStepIndex) return 'current';
        return 'inactive';
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div className="card" style={{
                width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto',
                animation: 'slideIn 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            Requisition #{requisition.id?.slice(-6).toUpperCase()}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{requisition.items[0]?.description || 'Purchase Requisition'}</h2>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <span style={{ padding: '0.25rem 0.5rem', background: 'var(--surface-2)', color: 'var(--text-secondary)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                📅 {requisition.createdAt.toLocaleDateString()}
                            </span>
                            <span style={{ padding: '0.25rem 0.5rem', background: 'var(--surface-2)', color: 'var(--text-secondary)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                🏢 {requisition.department}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        &times;
                    </button>
                </div>

                {/* Timeline Tracker */}
                <div style={{ marginBottom: '2.5rem', padding: '1rem', backgroundColor: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Request Status</h3>

                    {requisition.status === 'REJECTED' ? (
                        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: 'var(--error)', borderRadius: '6px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>❌</span>
                            <span style={{ fontWeight: 600 }}>This request has been Rejected.</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                            {/* Connecting Line */}
                            <div style={{ position: 'absolute', top: '12px', left: '0', right: '0', height: '2px', backgroundColor: 'var(--border)', zIndex: 0 }}></div>

                            {steps.map((step, i) => {
                                const status = getStepStatus(i);
                                const isCompleted = status === 'completed';
                                const isCurrent = status === 'current';

                                return (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            backgroundColor: isCompleted || isCurrent ? 'var(--brand)' : 'white',
                                            border: `2px solid ${isCompleted || isCurrent ? 'var(--brand)' : 'var(--border)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: '0.75rem', fontWeight: 'bold',
                                            marginBottom: '0.5rem', transition: 'all 0.3s ease'
                                        }}>
                                            {isCompleted && '✓'}
                                            {isCurrent && <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }} />}
                                        </div>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            fontWeight: isCurrent ? 600 : 400,
                                            color: isCompleted || isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)'
                                        }}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                    {/* Line Items */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', borderBottom: '2px solid var(--brand)', display: 'inline-block', paddingBottom: '0.25rem' }}>Line Items</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item Description</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Price</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requisition.items.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--surface-2)' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ fontWeight: 500 }}>{item.description}</div>
                                            {item.glCode && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GL: {item.glCode}</div>}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(item.unitPrice, requisition.currency)}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total, requisition.currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot style={{ borderTop: '2px solid var(--border)' }}>
                                <tr>
                                    <td colSpan={3} style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>Total Amount</td>
                                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand)' }}>
                                        {formatCurrency(requisition.totalAmount, requisition.currency)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Metadata */}
                    <div style={{ backgroundColor: 'var(--surface-2)', padding: '1.5rem', borderRadius: '8px', height: 'fit-content' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Vendor</div>
                            <div style={{ fontWeight: 600 }}>{requisition.vendorName || 'Not Specified'}</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Business Justification</div>
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                "{requisition.justification}"
                            </p>
                        </div>

                        {requisition.approverName && (
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Approver</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>👤</div>
                                    <div style={{ fontWeight: 500 }}>{requisition.approverName}</div>
                                </div>
                            </div>
                        )}

                        {/* ✨ Phase 6: Compliance Insights Widget */}
                        {requisition.complianceScore !== undefined && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: requisition.complianceScore > 0 ? '#fffbeb' : '#f0fdf4', borderRadius: '8px', border: `1px solid ${requisition.complianceScore > 0 ? '#fde68a' : '#bbf7d0'}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.1rem' }}>{requisition.complianceScore > 0 ? '🚩' : '✅'}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Compliance Insights</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Risk Score: <span style={{ fontWeight: 800, color: requisition.complianceScore > 30 ? 'var(--error)' : 'inherit' }}>{requisition.complianceScore}</span>
                                </div>
                                {requisition.complianceFindings && requisition.complianceFindings.length > 0 && (
                                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#92400e' }}>
                                        {requisition.complianceFindings.map((f, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{f}</li>)}
                                    </ul>
                                )}
                            </div>
                        )}

                        {onSource && requisition.status === 'APPROVED' && (
                            <button
                                onClick={onSource}
                                style={{
                                    width: '100%', marginTop: '1rem', padding: '0.75rem',
                                    backgroundColor: 'var(--brand)', color: 'white',
                                    border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                ⚖️ Strategic Sourcing
                            </button>
                        )}

                        {onDuplicate && (
                            <button
                                onClick={() => onDuplicate(requisition)}
                                style={{
                                    width: '100%', marginTop: '2rem', padding: '0.75rem',
                                    backgroundColor: 'white', border: '1px solid var(--brand)', color: 'var(--brand)',
                                    borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                🔁 Duplicate Request
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
