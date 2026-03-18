"use client";

import { useMemo, useState } from "react";
import { Requisition, Vendor } from "@/types";
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
    Search
} from "lucide-react";

interface RequisitionDetailModalProps {
    requisition: Requisition;
    onClose: () => void;
    onDuplicate?: (id: string) => void;
    onSource?: (id: string) => void;
}

export default function RequisitionDetailModal({
    requisition,
    onClose,
    onDuplicate,
    onSource
}: RequisitionDetailModalProps) {
    useScrollLock(true);

    return (
        <Portal>
            <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <div className="premium-card" style={{ 
                    width: '1000px', 
                    maxWidth: '95%', 
                    height: '85vh',
                    maxHeight: '850px',
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    position: 'relative',
                    animation: 'modalFadeIn 0.3s ease-out'
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
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Requisition Details</h2>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>#{requisition.id?.slice(-8).toUpperCase()}</span>
                                    <span>•</span>
                                    <span style={{ color: 'var(--brand)', textTransform: 'uppercase' }}>{requisition.status}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ width: '40px', height: '40px' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                        
                        <div className="responsive-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
                            
                            {/* Main Document Area */}
                            <div>
                                <div className="document-view" style={{ 
                                    padding: '3rem', 
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                    backgroundColor: 'white',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', borderBottom: '2px solid var(--border)', paddingBottom: '2rem' }}>
                                        <div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Purchase Requisition</div>
                                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14}/> {new Date().toLocaleDateString()}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14}/> {requisition.requesterName}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Amount</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand)' }}>{formatCurrency(requisition.totalAmount, requisition.currency)}</div>
                                        </div>
                                    </div>

                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                                <th style={{ textAlign: 'left', padding: '1rem 0', color: 'var(--text-disabled)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Line Item Description</th>
                                                <th style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-disabled)', fontSize: '0.7rem', textTransform: 'uppercase', width: '80px' }}>Qty</th>
                                                <th style={{ textAlign: 'right', padding: '1rem 0', color: 'var(--text-disabled)', fontSize: '0.7rem', textTransform: 'uppercase', width: '120px' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requisition.items.map((item, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '1.5rem 0' }}>
                                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.description}</div>
                                                        {item.glCode && <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.25rem' }}>General Ledger: {item.glCode}</div>}
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(item.total, requisition.currency)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                                            <FileText size={18} color="var(--brand)" />
                                            <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand)' }}>Business Justification</h5>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', fontStyle: 'italic', margin: 0, background: 'var(--surface-2)', padding: '1.5rem', borderRadius: '12px' }}>
                                            "{requisition.justification}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Compliance Card */}
                                <div className="intelligence-card" style={{ background: 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <ShieldCheck size={18} color="var(--brand)" />
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', margin: 0 }}>Compliance Insight</h4>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>{100 - (requisition.complianceScore || 0)}%</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Policy Alignment Score</div>
                                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${100 - (requisition.complianceScore || 0)}%`, height: '100%', background: (requisition.complianceScore || 0) > 20 ? 'var(--error)' : 'var(--brand)' }} />
                                    </div>
                                </div>

                                {/* Vendor Info */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <h5 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: '1rem' }}>Vendor Details</h5>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'var(--surface-2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🏢</div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{requisition.vendorName || 'Multiple Vendors'}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>Preferred Supplier</div>
                                        </div>
                                    </div>
                                    <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', fontSize: '0.75rem' }}>
                                        View Vendor Profile <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                                    </button>
                                </div>

                                {/* Department Info */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <h5 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: '1rem' }}>Cost Allocation</h5>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'var(--brand-soft)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                                            <Building size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{requisition.department}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>Department Head: Sarah Chen</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                            <button onClick={onClose} className="btn" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px' }}>Close</button>
                            
                            {onDuplicate && (
                                <button onClick={() => onDuplicate(requisition.id!)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
                                    <Repeat size={16} /> Duplicate
                                </button>
                            )}

                            {onSource && requisition.status === 'APPROVED' && (
                                <button onClick={() => onSource(requisition.id!)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                                    <Search size={16} /> Strategic Sourcing
                                </button>
                            )}
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
                            .responsive-layout-grid {
                                grid-template-columns: 1fr !important;
                            }
                            .document-view {
                                padding: 1.5rem !important;
                            }
                        }
                        @keyframes modalFadeIn {
                            from { opacity: 0; transform: translateY(30px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>
            </div>
        </Portal>
    );
}
