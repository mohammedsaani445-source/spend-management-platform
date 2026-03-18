"use client";

import { useMemo, useState } from "react";
import { Requisition, Budget } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import { useScrollLock } from "@/hooks/useScrollLock";
import Portal from "@/components/common/Portal";
import { 
    X, 
    Calendar, 
    Building, 
    FileText, 
    Repeat, 
    ExternalLink, 
    ShieldCheck, 
    AlertCircle,
    User,
    ChevronRight,
    MessageSquare,
    Zap,
    TrendingUp,
    TrendingDown,
    History,
    CheckCircle2,
    Clock
} from "lucide-react";

interface ApprovalFocusModalProps {
    requisition: Requisition;
    budget?: Budget;
    deptSpend: number;
    onClose: () => void;
    onApprove: (id: string, comment?: string) => void;
    onReject: (id: string, comment?: string) => void;
}

export default function ApprovalFocusModal({
    requisition,
    budget,
    deptSpend,
    onClose,
    onApprove,
    onReject
}: ApprovalFocusModalProps) {
    useScrollLock(true);
    const [comment, setComment] = useState("");

    const metrics = useMemo(() => {
        if (!budget) return null;
        const currentUsage = (deptSpend / budget.amount) * 100;
        const purchaseImpact = (requisition.totalAmount / budget.amount) * 100;
        const newUsage = currentUsage + purchaseImpact;
        
        return {
            currentUsage,
            newUsage,
            isOverBudget: newUsage > 100,
            remaining: budget.amount - deptSpend - requisition.totalAmount,
            utilization: newUsage.toFixed(1)
        };
    }, [budget, deptSpend, requisition.totalAmount]);

    // Simulated Price Benchmarking
    const priceAnalysis = useMemo(() => {
        const items = requisition.items;
        return items.map(item => {
            const avgHistorical = item.total / item.quantity * 0.92; // Simulated higher history
            const diff = ((item.total / item.quantity - avgHistorical) / avgHistorical) * 100;
            return {
                ...item,
                avgHistorical,
                diff,
                iscompetitive: diff < 5
            };
        });
    }, [requisition.items]);

    return (
        <Portal>
            <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <div className="premium-card" style={{ 
                    width: '1100px', 
                    maxWidth: '95%', 
                    height: '90vh', 
                    maxHeight: '900px',
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: 'var(--background)',
                    position: 'relative',
                    animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    {/* Header - Fixed */}
                    <div style={{ 
                        padding: '1.25rem 2.5rem', 
                        borderBottom: '1px solid var(--border)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        backgroundColor: 'white',
                        zIndex: 10
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.625rem', background: 'var(--brand-soft)', borderRadius: '12px', color: 'var(--brand)' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Review Approval Request</h2>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>#{requisition.id?.slice(-8).toUpperCase()}</span>
                                    <span>•</span>
                                    <span>Tier {(requisition.currentStepIndex || 0) + 1} Executive Review</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ width: '40px', height: '40px' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Split Responsive Container */}
                    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }} className="responsive-modal-container">
                        
                        {/* Left Panel: Document View (Scrollable) */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', backgroundColor: '#f8fafc' }}>
                            <div className="document-view" style={{ 
                                padding: '3rem', 
                                boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                                backgroundColor: 'white'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', borderBottom: '2px solid var(--border)', paddingBottom: '2rem' }}>
                                    <div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Purchase Order Request</div>
                                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14}/> {new Date().toLocaleDateString()}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Building size={14}/> {requisition.department}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amount Due</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{formatCurrency(requisition.totalAmount, requisition.currency)}</div>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                            <th style={{ textAlign: 'left', padding: '1rem 0', color: 'var(--text-disabled)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Description</th>
                                            <th style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-disabled)', fontSize: '0.7rem', textTransform: 'uppercase', width: '80px' }}>Qty</th>
                                            <th style={{ textAlign: 'right', padding: '1rem 0', color: 'var(--text-disabled)', fontSize: '0.7rem', textTransform: 'uppercase', width: '120px' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requisition.items.map((item, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '1.5rem 0' }}>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.description}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.25rem' }}>Asset Category: Office Supplies</div>
                                                </td>
                                                <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(item.total, requisition.currency)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ background: 'var(--surface-2)', padding: '2rem', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                                        <FileText size={18} color="var(--brand)" />
                                        <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand)' }}>Business Justification</h5>
                                    </div>
                                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', fontStyle: 'italic', margin: 0 }}>
                                        "{requisition.justification}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: Decision Hub (White/Orange Theme) */}
                        <div className="right-panel" style={{ 
                            width: '420px', 
                            backgroundColor: 'white', 
                            borderLeft: '1px solid var(--border)',
                            overflowY: 'auto',
                            padding: '2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', background: 'var(--brand-soft)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                                    <Zap size={18} />
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Decision Hub</h3>
                            </div>

                            {/* Budget Visualization */}
                            {metrics && (
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Budget Context</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{metrics.utilization}% <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Capacity</span></div>
                                        </div>
                                        <div style={{ padding: '4px 10px', background: metrics.isOverBudget ? '#fee2e2' : '#f0fdf4', borderRadius: '6px', color: metrics.isOverBudget ? '#ef4444' : '#10b981', fontSize: '0.7rem', fontWeight: 800 }}>
                                            {metrics.isOverBudget ? 'RISK: OVER' : 'OPTIMAL'}
                                        </div>
                                    </div>

                                    {/* Modern Progress Bar */}
                                    <div style={{ height: '32px', background: 'white', borderRadius: '10px', overflow: 'hidden', display: 'flex', border: '1px solid #e2e8f0', marginBottom: '1rem', position: 'relative' }}>
                                        <div style={{ width: `${Math.min(metrics.currentUsage, 100)}%`, height: '100%', background: '#e2e8f0' }} />
                                        <div style={{ 
                                            width: `${Math.min(requisition.totalAmount / (budget?.amount || 1) * 100, 100 - metrics.currentUsage)}%`, 
                                            height: '100%', 
                                            background: metrics.isOverBudget ? '#ef4444' : 'var(--brand)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            fontWeight: 900
                                        }}>
                                            REQ
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Spent: {formatCurrency(deptSpend, budget?.currency)}</span>
                                        <span style={{ fontWeight: 700 }}>Rem: {formatCurrency(metrics.remaining, budget?.currency)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Price Benchmarking */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <TrendingUp size={16} color="var(--brand)" />
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', margin: 0 }}>Price Analysis</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {priceAnalysis.map((item, i) => (
                                        <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.description}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>Market Avg: {formatCurrency(item.avgHistorical, requisition.currency)}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: item.diff < 0 ? '#10b981' : '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>
                                                {item.diff < 0 ? <TrendingDown size={14}/> : <TrendingUp size={14}/>}
                                                {Math.abs(item.diff).toFixed(1)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Approval Timeline */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                    <History size={16} color="var(--brand)" />
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', margin: 0 }}>Approval Path</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '0.5rem' }}>
                                    <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '16px', width: '2px', background: '#f1f5f9' }} />
                                    
                                    {requisition.approvalHistory?.map((entry, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', border: '2px solid #10b981' }}>
                                                <CheckCircle2 size={14} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{entry.actorName}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>{entry.stepName} • Approved</div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', border: '2px solid var(--brand)' }}>
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Current Decision</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Workflow Tier {(requisition.currentStepIndex || 0) + 1}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Comment Input */}
                            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px dotted #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <MessageSquare size={16} color="var(--text-secondary)" />
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Rationale</label>
                                </div>
                                <textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add notes for the requester..."
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.875rem', background: '#f8fafc', outline: 'none' }}
                                    rows={3}
                                />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button 
                                    onClick={() => onReject(requisition.id!, comment)}
                                    className="btn" 
                                    style={{ flex: 1, padding: '1rem', background: '#fff1f2', color: '#e11d48', border: '1px solid #fda4af', fontWeight: 800, borderRadius: '12px' }}
                                >
                                    Reject
                                </button>
                                <button 
                                    onClick={() => onApprove(requisition.id!, comment)}
                                    className="btn"
                                    style={{ flex: 2, padding: '1rem', background: 'var(--brand)', color: 'white', border: 'none', fontWeight: 900, borderRadius: '12px', boxShadow: '0 4px 15px rgba(232, 87, 42, 0.3)' }}
                                >
                                    Approve Request
                                </button>
                            </div>
                        </div>
                    </div>

                    <style jsx>{`
                        @media (max-width: 1024px) {
                            .premium-card {
                                width: 100vw !important;
                                height: 100vh !important;
                                max-height: 100vh !important;
                                border-radius: 0 !important;
                                top: 0 !important;
                                left: 0 !important;
                                margin: 0 !important;
                            }
                            .responsive-modal-container {
                                flex-direction: column !important;
                                overflow-y: auto !important;
                            }
                            .right-panel {
                                width: 100% !important;
                                border-left: none !important;
                                border-top: 1px solid var(--border) !important;
                                padding: 2rem !important;
                            }
                            .document-view {
                                padding: 1.5rem !important;
                            }
                        }
                        @keyframes modalSlideUp {
                            from { opacity: 0; transform: translateY(40px) scale(0.95); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                    `}</style>
                </div>
            </div>
        </Portal>
    );
}
