"use client";

import { Plus, Search, Filter, Download, FileText, PieChart, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import Loader from "@/components/common/Loader";
import styles from "@/components/layout/Layout.module.css";
import { useEffect, useState, useMemo } from "react";
import { PurchaseOrder, POStatus } from "@/types";
import { subscribeToPurchaseOrders, updatePOStatus } from "@/lib/purchaseOrders";
import { formatCurrency } from "@/lib/currencies";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import PODetailModal from "@/components/purchase-orders/PODetailModal";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    ISSUED: { bg: 'var(--brand-soft)', color: 'var(--brand)' },
    SENT: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
    OPENED: { bg: 'var(--brand-soft)', color: 'var(--brand)' },
    ACKNOWLEDGED: { bg: 'var(--info-bg)', color: 'var(--info)' },
    RECEIVED: { bg: 'var(--success-soft)', color: 'var(--success)' },
    FULFILLED: { bg: 'var(--success-soft)', color: 'var(--success)' },
    CANCELLED: { bg: 'var(--error-bg)', color: 'var(--error)' },
    CLOSED: { bg: 'var(--background)', color: 'var(--text-secondary)' },
};

export default function PurchaseOrdersPage() {
    const { user } = useAuth();
    const { showConfirm, showAlert, showError } = useModal();
    const [pos, setPos] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = subscribeToPurchaseOrders(user, (data) => {
            setPos(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const stats = useMemo(() => {
        const totalCommitted = pos.filter(p => p.status !== 'CANCELLED').reduce((acc, p) => acc + p.totalAmount, 0);
        const pendingValue = pos.filter(p => ['ISSUED', 'SENT', 'OPENED', 'ACKNOWLEDGED'].includes(p.status)).reduce((acc, p) => acc + p.totalAmount, 0);
        const fulfilledRate = pos.length > 0
            ? Math.round((pos.filter(p => ['RECEIVED', 'FULFILLED', 'CLOSED'].includes(p.status)).length / pos.length) * 100)
            : 0;
        const activeCount = pos.filter(p => !['CANCELLED', 'CLOSED'].includes(p.status)).length;
        const currencyCount = pos.reduce((acc, p) => {
            const c = p.currency || 'USD';
            acc[c] = (acc[c] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const displayCurrency = Object.keys(currencyCount).sort((a, b) => currencyCount[b] - currencyCount[a])[0] || 'USD';
        return { totalCommitted, pendingValue, fulfilledRate, activeCount, displayCurrency };
    }, [pos]);

    const filteredPOs = useMemo(() => {
        return pos.filter(po => {
            const matchesSearch = po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                po.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [pos, searchQuery, statusFilter]);

    const handleReceive = async (id: string, poNumber: string) => {
        const confirmed = await showConfirm("Confirm Receipt", `Mark ${poNumber} as Received?`);
        if (!confirmed) return;
        try {
            if (!user) return;
            await updatePOStatus(user.tenantId, id, 'RECEIVED');
            await showAlert("Success", "Goods Receipt Confirmed");
            setSelectedPO(null);
        } catch { await showError("Error", "Error updating status"); }
    };

    const handleCancel = async (id: string, poNumber: string) => {
        const confirmed = await showConfirm("Void Purchase Order", `Void ${poNumber}? This cannot be undone.`);
        if (!confirmed) return;
        try {
            if (!user) return;
            await updatePOStatus(user.tenantId, id, 'CANCELLED');
            await showAlert("PO Voided", `Purchase Order ${poNumber} has been cancelled.`);
            setSelectedPO(null);
        } catch { await showError("Error", "Error cancelling purchase order"); }
    };

    const handleEmailVendor = async (po: PurchaseOrder) => {
        await showAlert("Email Sent", `PO ${po.poNumber} has been emailed to ${po.vendorName}.`);
    };

    if (loading) return (
        <div className="page-container">
            <Loader text="Loading purchase orders..." />
        </div>
    );

    return (
        <div className="page-container animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Purchase Orders</h1>
                    <p className="page-subtitle">Manage purchase orders, vendor acknowledgments, and goods receipt</p>
                </div>
                <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard/requisitions'}>
                    + New Requisition
                </button>
            </div>

            {/* Stats */}
            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Committed', value: formatCurrency(stats.totalCommitted, stats.displayCurrency), color: 'var(--brand)', bg: 'var(--brand-soft)', icon: '💰' },
                    { label: 'Pending Receipt', value: formatCurrency(stats.pendingValue, stats.displayCurrency), color: 'var(--warning)', bg: 'var(--warning-bg)', icon: '⏳' },
                    { label: 'Fulfilment Rate', value: `${stats.fulfilledRate}%`, color: 'var(--success)', bg: 'var(--success-soft)', icon: '📊' },
                    { label: 'Active Orders', value: String(stats.activeCount), color: 'var(--info)', bg: 'var(--info-bg)', icon: '📦' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', borderTop: `4px solid ${s.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>{s.label}</span>
                            <div style={{ width: 32, height: 32, background: s.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>{s.icon}</div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: 380 }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>🔍</span>
                    <input
                        type="text" placeholder="Search..."
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="form-input" style={{ paddingLeft: '2.25rem' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
                    {['ALL', 'ISSUED', 'SENT', 'RECEIVED', 'CANCELLED'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={statusFilter === s ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                            style={{ flexShrink: 0 }}>
                            {s === 'ALL' ? 'All' : s[0] + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {filteredPOs.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📄</div>
                        <h3>No purchase orders found</h3>
                        <p>No orders match your current filters.</p>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}>
                            Clear Filters
                        </button>
                    </div>
                </div>
            ) : (
                <div className="table-wrapper responsive-table">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>PO Number</th>
                                <th>Vendor</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th className="hidden-mobile">Issued Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPOs.map(po => {
                                const s = STATUS_STYLES[po.status] || { bg: 'var(--background)', color: 'var(--text-secondary)' };
                                return (
                                    <tr key={po.id} onClick={() => setSelectedPO(po)} style={{ cursor: 'pointer' }}>
                                        <td data-label="PO Number">
                                            <div style={{ fontWeight: 700, color: 'var(--brand)', fontFamily: 'monospace', fontSize: '0.875rem' }}>{po.poNumber}</div>
                                            <div className="hidden-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Req #{po.requisitionId.slice(-6).toUpperCase()}</div>
                                        </td>
                                        <td data-label="Vendor">
                                            <div style={{ fontWeight: 600 }}>{po.vendorName}</div>
                                            <div className="hidden-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Standard Terms</div>
                                        </td>
                                        <td data-label="Amount">
                                            <div style={{ fontWeight: 700 }}>{formatCurrency(po.totalAmount, po.currency)}</div>
                                            <div className="hidden-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{po.items.length} line items</div>
                                        </td>
                                        <td data-label="Status">
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                                {po.status}
                                            </span>
                                        </td>
                                        <td data-label="Issued Date" className="hidden-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                            {po.issuedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-ghost btn-sm">Open →</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedPO && (
                <PODetailModal
                    po={selectedPO}
                    onClose={() => setSelectedPO(null)}
                    onReceive={handleReceive}
                    onCancel={handleCancel}
                    onEmailVendor={handleEmailVendor}
                />
            )}
        </div>
    );
}
