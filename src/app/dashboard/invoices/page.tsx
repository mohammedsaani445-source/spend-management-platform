"use client";

import { useEffect, useState, useMemo } from "react";
import { Invoice, PurchaseOrder, Vendor, InvoiceStatus } from "@/types";
import { getInvoices, createInvoice, updateInvoiceStatus as updateStatus, subscribeToInvoices } from "@/lib/invoices";
import { getPurchaseOrders, subscribeToPurchaseOrders } from "@/lib/purchaseOrders";
import { getVendors } from "@/lib/vendors";
import { formatCurrency } from "@/lib/currencies";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import InvoiceDetailModal from "@/components/invoices/InvoiceDetailModal";
import CustomSelect from "@/components/ui/CustomSelect";
import InvoiceUpload from "@/components/invoices/InvoiceUpload";

const INV_STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
    APPROVED: { bg: 'var(--brand-soft)', color: 'var(--brand)' },
    PAID: { bg: 'var(--success-soft)', color: 'var(--success)' },
    REJECTED: { bg: 'var(--error-bg)', color: 'var(--error)' },
};

export default function InvoicesPage() {
    const { user } = useAuth();
    const { showConfirm, showAlert, showError } = useModal();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [pos, setPos] = useState<PurchaseOrder[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [formData, setFormData] = useState({
        poId: "", invoiceNumber: "", amount: 0, currency: "USD",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        fileName: "", fileUrl: ""
    });

    const stats = useMemo(() => {
        const pending = invoices.filter(i => i.status === 'PENDING').reduce((acc, i) => acc + i.amount, 0);
        const overdue = invoices.filter(i => i.status === 'PENDING' && new Date(i.dueDate) < new Date()).length;
        const totalAmount = invoices.reduce((acc, i) => acc + i.amount, 0);
        const matchRate = invoices.length > 0
            ? Math.round((invoices.filter(i => i.status === 'PAID' || i.status === 'APPROVED').length / invoices.length) * 100)
            : 0;
        const currencyCount = invoices.reduce((acc, i) => {
            const c = i.currency || 'USD';
            acc[c] = (acc[c] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const displayCurrency = Object.keys(currencyCount).sort((a, b) => currencyCount[b] - currencyCount[a])[0] || 'USD';
        return { pending, overdue, totalAmount, matchRate, displayCurrency };
    }, [invoices]);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchQuery, statusFilter]);

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        // Fetch static vendors once
        getVendors(user.tenantId).then(v => setVendors(v));

        // Subscribe to Invoices
        const unsubInvoices = subscribeToInvoices(user, (data) => {
            setInvoices(data);
            setLoading(false); // Only wait for invoices to hide loading state
        });

        // Subscribe to POs for the dropdown
        const unsubPOs = subscribeToPurchaseOrders(user, (data) => {
            setPos(data);
        });

        return () => {
            unsubInvoices();
            unsubPOs();
        };
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const selectedPO = pos.find(p => p.id === formData.poId);
            if (!selectedPO) { await showAlert("Invalid PO", "Please select a valid Purchase Order"); return; }
            if (formData.amount > selectedPO.totalAmount) {
                const confirmed = await showConfirm("3-Way Match Warning",
                    `Invoice amount (${formatCurrency(formData.amount, formData.currency)}) exceeds PO amount (${formatCurrency(selectedPO.totalAmount, selectedPO.currency)}).\n\nContinue?`);
                if (!confirmed) return;
            }
            if (!user) return;
            await createInvoice(user.tenantId, {
                vendorId: selectedPO.vendorId, vendorName: selectedPO.vendorName,
                poId: selectedPO.id, poNumber: selectedPO.poNumber,
                invoiceNumber: formData.invoiceNumber, amount: formData.amount,
                currency: selectedPO.currency,
                issueDate: new Date(formData.issueDate), dueDate: new Date(formData.dueDate),
                status: 'PENDING', department: selectedPO.department
            });
            setShowModal(false);
            setFormData({ poId: "", invoiceNumber: "", amount: 0, currency: "USD", issueDate: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0], fileName: "", fileUrl: "" });
        } catch { await showError("Error", "Error creating invoice"); }
    };

    const handlePay = async (id: string) => {
        const confirmed = await showConfirm("Confirm Payment", "Mark this invoice as PAID?");
        if (!confirmed) return;
        try {
            if (!user) return;
            await updateStatus(user.tenantId, id, 'PAID');
            setSelectedInvoice(null);
        } catch { await showError("Error", "Error updating status"); }
    };

    const handleStatusUpdate = async (id: string, status: InvoiceStatus) => {
        try {
            if (!user) return;
            await updateStatus(user.tenantId, id, status);
            setSelectedInvoice(null);
        } catch { await showError("Error", "Error updating status"); }
    };

    if (loading) return (
        <div className="page-container animate-fade-in">
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading invoices...</div>
        </div>
    );

    return (
        <div className="page-container animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Invoices</h1>
                    <p className="page-subtitle">Manage vendor invoices, 3-way matching, and payment approvals</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Record Invoice</button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Volume', value: formatCurrency(stats.totalAmount, stats.displayCurrency), color: 'var(--brand)', bg: 'var(--brand-soft)', icon: '📊' },
                    { label: 'Pending Payment', value: formatCurrency(stats.pending, stats.displayCurrency), color: 'var(--warning)', bg: 'var(--warning-bg)', icon: '⏳' },
                    { label: 'Overdue', value: `${stats.overdue} invoice${stats.overdue !== 1 ? 's' : ''}`, color: 'var(--error)', bg: 'var(--error-bg)', icon: '⚠️' },
                    { label: 'Match Rate', value: `${stats.matchRate}%`, color: 'var(--success)', bg: 'var(--success-soft)', icon: '🎯' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', borderTop: `4px solid ${s.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>{s.label}</span>
                            <div style={{ width: 32, height: 32, background: s.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>{s.icon}</div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>🔍</span>
                    <input type="text" placeholder="Search invoice # or vendor..."
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="form-input" style={{ paddingLeft: '2.25rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['ALL', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={statusFilter === s ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
                            {s === 'ALL' ? 'All' : s[0] + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Record Invoice Modal */}
            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Record Vendor Invoice</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ display: 'grid', gap: '1rem' }}>
                                <CustomSelect
                                    label="Select Purchase Order"
                                    value={formData.poId}
                                    onChange={(val) => {
                                        const po = pos.find(p => p.id === val);
                                        setFormData({ ...formData, poId: val, currency: po?.currency || 'USD', invoiceNumber: po ? `INV-${po.poNumber}` : "" });
                                    }}
                                    options={[
                                        { label: "-- Select PO --", value: "" },
                                        ...pos.filter(p => p.status !== 'CLOSED').map(po => ({
                                            label: `${po.poNumber} — ${po.vendorName} (${formatCurrency(po.totalAmount, po.currency)})`,
                                            value: po.id!
                                        }))
                                    ]}
                                    placeholder="Select PO"
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label">Invoice #</label>
                                        <input type="text" required className="form-input"
                                            value={formData.invoiceNumber} onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="form-label">Currency</label>
                                        <input type="text" readOnly className="form-input" value={formData.currency}
                                            style={{ background: 'var(--background)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
                                    </div>
                                    <div>
                                        <label className="form-label">Amount ({formData.currency})</label>
                                        <input type="number" step="0.01" required className="form-input"
                                            value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label">Issue Date</label>
                                        <input type="date" required className="form-input"
                                            value={formData.issueDate} onChange={e => setFormData({ ...formData, issueDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="form-label">Due Date</label>
                                        <input type="date" required className="form-input"
                                            value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Invoice Attachment</label>
                                    <InvoiceUpload
                                        onUploadComplete={(url, name) => {
                                            if (url) setFormData({ ...formData, fileName: name, fileUrl: url });
                                            else setFormData({ ...formData, fileName: "", fileUrl: "" });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Invoice</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            {filteredInvoices.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🧾</div>
                        <h3>No invoices found</h3>
                        <p>Try adjusting your filters or record a new invoice.</p>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Record Invoice</button>
                    </div>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Invoice #</th>
                                <th>Vendor / PO</th>
                                <th>Due Date</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                <th style={{ textAlign: 'center' }}>Attach</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv: Invoice) => {
                                const s = INV_STATUS_STYLES[inv.status] || { bg: 'var(--background)', color: 'var(--text-secondary)' };
                                const isOverdue = new Date(inv.dueDate) < new Date() && inv.status === 'PENDING';
                                return (
                                    <tr key={inv.id} onClick={() => setSelectedInvoice(inv)} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--brand)', fontFamily: 'monospace', fontSize: '0.875rem' }}>{inv.invoiceNumber}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Created {new Date(inv.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{inv.vendorName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 600 }}>#{inv.poNumber}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.875rem', color: isOverdue ? 'var(--error)' : 'var(--text-secondary)', fontWeight: isOverdue ? 700 : 400 }}>
                                                {new Date(inv.dueDate).toLocaleDateString()}
                                            </div>
                                            {isOverdue && <div style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: 700, marginTop: 2 }}>OVERDUE</div>}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.9375rem' }}>
                                            {formatCurrency(inv.amount, inv.currency)}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {inv.fileName ? <span title={inv.fileName} style={{ fontSize: '1rem' }}>📎</span> : <span style={{ color: 'var(--border)' }}>—</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedInvoice && (
                <InvoiceDetailModal
                    invoice={selectedInvoice}
                    po={pos.find(p => p.id === selectedInvoice.poId)}
                    onClose={() => setSelectedInvoice(null)}
                    onPay={handlePay}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </div>
    );
}
