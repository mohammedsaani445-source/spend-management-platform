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
    Clock,
    Sparkles,
    PieChart,
    ZapOff
} from "lucide-react";

import { HistoricalPrice } from "@/lib/purchaseOrders";

interface ApprovalFocusModalProps {
    requisition: Requisition;
    budget?: Budget;
    deptSpend: number;
    historicalData: Record<string, HistoricalPrice>;
    onClose: () => void;
    onToggleView: () => void;
    onApprove: (id: string, comment?: string) => void;
    onReject: (id: string, comment?: string) => void;
}

export default function ApprovalFocusModal({
    requisition,
    budget,
    deptSpend,
    historicalData,
    onClose,
    onToggleView,
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
            const desc = item.description.toLowerCase().trim();
            const history = historicalData[desc];
            
            // If we have history, use it. Otherwise, show as "New Item" with 0 diff
            const avgHistorical = history?.avgPrice || (item.total / item.quantity);
            const diff = history ? ((item.total / item.quantity - avgHistorical) / avgHistorical) * 100 : 0;
            
            return {
                ...item,
                avgHistorical,
                diff,
                iscompetitive: !history || diff < 5,
                hasHistory: !!history,
                sampleSize: history?.sampleSize || 0
            };
        });
    }, [requisition.items, historicalData]);

    return (
        <Portal>
            <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <div className="premium-card" style={{ 
                    width: '650px', 
                    maxWidth: '95%', 
                    maxHeight: '90vh',
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: '#f8fafc',
                    position: 'relative',
                    animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    borderRadius: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
                }}>
                    {/* Header */}
                    <div style={{ 
                        padding: '1.25rem 2rem', 
                        borderBottom: '1px solid var(--border)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        backgroundColor: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.6rem', background: 'var(--brand-soft)', borderRadius: '10px', color: 'var(--brand)' }}>
                                <Zap size={22} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Fast-Track Approval</h2>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', fontWeight: 600 }}>Decision Hub • Tier {(requisition.currentStepIndex || 0) + 1}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button 
                                onClick={onToggleView} 
                                className="btn btn-ghost" 
                                style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 800, 
                                    color: 'var(--brand)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--brand-soft)'
                                }}
                            >
                                <FileText size={14} />
                                Full Detail
                            </button>
                            <button onClick={onClose} className="btn btn-ghost btn-icon">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            
                            {/* Summary Card */}
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-disabled)', fontWeight: 800, marginBottom: '0.25rem' }}>Amount</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand)' }}>{formatCurrency(requisition.totalAmount, requisition.currency)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-disabled)', fontWeight: 800, marginBottom: '0.25rem' }}>Department</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{requisition.department}</div>
                                </div>
                            </div>

                            {/* Price Analysis */}
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Sparkles size={18} style={{ color: 'var(--brand)' }} />
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 900, margin: 0 }}>INTELLIGENCE SCAN</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {priceAnalysis.map((item, i) => (
                                        <div key={i} style={{ padding: '1rem', borderRadius: '12px', background: item.hasHistory ? (item.iscompetitive ? '#f0fdf4' : '#fef2f2') : '#eff6ff', border: '1px solid transparent' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{item.description}</div>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: item.hasHistory ? (item.iscompetitive ? '#166534' : '#991b1b') : '#1d4ed8' }}>
                                                    {item.hasHistory ? (item.diff > 0 ? `+${item.diff}%` : `${item.diff}%`) : 'NEW ITEM'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                {item.hasHistory ? `Historical Avg: ${formatCurrency(item.avgHistorical, requisition.currency)}` : 'No history found'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Budget Context */}
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <PieChart size={18} style={{ color: 'var(--info)' }} />
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 900, margin: 0 }}>BUDGET IMPACT</h4>
                                </div>
                                {budget ? (
                                    <>
                                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                            <div style={{ width: `${Math.min((deptSpend / budget.amount) * 100, 100)}%`, height: '100%', background: 'var(--info)', borderRadius: '4px' }} />
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            Utilization: <strong>{((deptSpend / budget.amount) * 100).toFixed(1)}%</strong> of {formatCurrency(budget.amount, budget.currency)}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: '0.75rem' }}>No budget pool found.</div>
                                )}
                            </div>

                            {/* Item Count Label */}
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>
                                    Reviewing {requisition.items.length} line items
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add internal note..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem', minHeight: '60px', outline: 'none' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                            <button onClick={() => onReject(requisition.id!, comment)} className="btn btn-ghost" style={{ fontWeight: 800, color: '#ef4444' }}>Reject</button>
                            <button onClick={() => onApprove(requisition.id!, comment)} className="btn btn-primary" style={{ fontWeight: 900, fontSize: '1rem' }}>APPROVE NOW</button>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </Portal>
    );
}
