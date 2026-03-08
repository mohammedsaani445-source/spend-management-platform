"use client";

import { useEffect, useState, useMemo } from "react";
import { Invoice, PurchaseOrder, Vendor, InvoiceStatus } from "@/types";
import { getInvoices, createInvoice, updateInvoiceStatus as updateStatus, subscribeToInvoices, checkDuplicateInvoice } from "@/lib/invoices";
import { getPurchaseOrders, subscribeToPurchaseOrders } from "@/lib/purchaseOrders";
import { getVendors } from "@/lib/vendors";
import { formatCurrency } from "@/lib/currencies";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import InvoiceDetailModal from "@/components/invoices/InvoiceDetailModal";
import CustomSelect from "@/components/ui/CustomSelect";
import InvoiceUpload from "@/components/invoices/InvoiceUpload";
import Loader from "@/components/common/Loader";
import { ReceiptCaptureModal } from "@/components/receipts/ReceiptCaptureModal";
import { Zap, Edit2, AlertTriangle } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { recordCorrection } from "@/lib/feedback";

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
    const [isScanOpen, setIsScanOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    // Global Scroll Lock for Modals
    useScrollLock(showModal || !!selectedInvoice || isScanOpen);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [formData, setFormData] = useState({
        poId: "", invoiceNumber: "", amount: 0, currency: "USD",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        fileName: "", fileUrl: "",
        confidence: null as number | null,
        confidenceReasoning: "",
        hasFraudAlert: false,
        fraudCheckReason: "",
        autoExtracted: false
    });
    const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
    const [lastAiData, setLastAiData] = useState<any>(null);

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
        const aiAccuracy = invoices.filter(i => i.autoExtracted).length > 0
            ? Math.round(invoices.filter(i => i.autoExtracted).reduce((acc, i) => acc + (i.confidence || 0), 0) / invoices.filter(i => i.autoExtracted).length)
            : 99.4;
        const anomalies = invoices.filter(i => i.hasFraudAlert).length;
        return { pending, overdue, totalAmount, matchRate, displayCurrency, aiAccuracy, anomalies };
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

            // Final duplicate check before save
            if (await checkDuplicateInvoice(user.tenantId, selectedPO.vendorName, formData.invoiceNumber)) {
                const proceed = await showConfirm("Duplicate Warning",
                    `An invoice with number ${formData.invoiceNumber} already exists for ${selectedPO.vendorName}. Do you really want to save this duplicate?`);
                if (!proceed) return;
            }

            await createInvoice(user.tenantId, {
                vendorId: selectedPO.vendorId, vendorName: selectedPO.vendorName,
                poId: selectedPO.id, poNumber: selectedPO.poNumber,
                invoiceNumber: formData.invoiceNumber, amount: formData.amount,
                currency: selectedPO.currency,
                issueDate: new Date(formData.issueDate), dueDate: new Date(formData.dueDate),
                status: 'PENDING', department: selectedPO.department,
                fileName: formData.fileName, fileUrl: formData.fileUrl,
                confidence: formData.confidence || 0,
                confidenceReasoning: formData.confidenceReasoning || "",
                hasFraudAlert: formData.hasFraudAlert,
                fraudCheckReason: formData.fraudCheckReason,
                autoExtracted: formData.autoExtracted
            });
            setShowModal(false);
            setFormData({
                poId: "", invoiceNumber: "", amount: 0, currency: "USD",
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                fileName: "", fileUrl: "",
                confidence: null, confidenceReasoning: "", hasFraudAlert: false, fraudCheckReason: "", autoExtracted: false
            });
            setDuplicateWarning(null);
            setLastAiData(null);
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

    const handleScanSuccess = async (data: any) => {
        setIsScanOpen(false);
        setLastAiData(data);

        const po = pos.find(p =>
            (data.poNumber && p.poNumber.includes(data.poNumber)) ||
            (data.vendorName && p.vendorName.toLowerCase().includes(data.vendorName.toLowerCase()))
        );

        if (user && data.vendorName && data.invoiceNumber) {
            const isDuplicate = await checkDuplicateInvoice(user.tenantId, data.vendorName, data.invoiceNumber);
            if (isDuplicate) {
                setDuplicateWarning(`Invoice #${data.invoiceNumber} already exists for this vendor.`);
            } else {
                setDuplicateWarning(null);
            }
        }

        setFormData({
            ...formData,
            poId: po?.id || "",
            invoiceNumber: data.invoiceNumber || "",
            amount: data.totalAmount || 0,
            currency: data.currency || "USD",
            issueDate: data.issueDate ? new Date(data.issueDate).toISOString().split('T')[0] : formData.issueDate,
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : formData.dueDate,
            confidence: data.confidenceScore || 0,
            confidenceReasoning: data.confidenceReasoning || "",
            autoExtracted: true,
            hasFraudAlert: data.isDuplicate || false,
            fraudCheckReason: data.isDuplicate ? "AI identified visual markers of a duplicate document." : ""
        });

        if (data.poNumber) {
            showAlert("AI Scan Complete", `Extracted details for invoice from ${data.vendorName || 'Unknown'}.`);
        }
    };

    const handleCorrection = async (field: string, newValue: any) => {
        if (!user || !lastAiData) return;
        const originalValue = lastAiData[field];
        if (originalValue !== undefined && originalValue !== newValue) {
            const selectedPO = pos.find(p => p.id === formData.poId);
            if (selectedPO?.vendorId) {
                await recordCorrection(user.tenantId, selectedPO.vendorId, field, String(originalValue), String(newValue));
            }
        }
    };

    if (loading) return (
        <div className="page-container">
            <Loader text="Loading invoices..." />
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Volume', value: formatCurrency(stats.totalAmount, stats.displayCurrency), color: 'var(--brand)', bg: 'var(--brand-soft)', icon: '📊' },
                    { label: 'Pending Payment', value: formatCurrency(stats.pending, stats.displayCurrency), color: 'var(--warning)', bg: 'var(--warning-bg)', icon: '⏳' },
                    { label: 'AI Accuracy', value: `${stats.aiAccuracy}%`, color: 'var(--success)', bg: 'var(--success-soft)', icon: '🎯' },
                    { label: 'Fraud Alerts', value: stats.anomalies, color: 'var(--error)', bg: 'var(--error-bg)', icon: '🛡️' },
                    { label: 'Match Rate', value: `${stats.matchRate}%`, color: 'var(--brand)', bg: 'var(--brand-soft)', icon: '🤝' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', borderTop: `4px solid ${s.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>{s.label}</span>
                            <div style={{ width: 28, height: 28, background: s.bg, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{s.icon}</div>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</div>
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
                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--brand-soft)',
                                    borderRadius: '12px',
                                    border: '1px dashed var(--brand)',
                                    marginBottom: '0.5rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand)', marginBottom: '0.25rem' }}>
                                        <Zap size={14} style={{ marginRight: '4px' }} /> Automated AI Extraction
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        Upload your document below, and our AI will instantly extract details and match them to your Purchase Order.
                                    </div>
                                </div>

                                {duplicateWarning && (
                                    <div style={{
                                        padding: '1rem',
                                        background: 'var(--error-bg)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--error)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        color: 'var(--error)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}>
                                        <AlertTriangle size={18} />
                                        {duplicateWarning}
                                    </div>
                                )}
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label className="form-label">Invoice #</label>
                                            {formData.autoExtracted && <Edit2 size={12} style={{ color: 'var(--brand)', cursor: 'help' }} />}
                                        </div>
                                        <input type="text" required className="form-input"
                                            value={formData.invoiceNumber}
                                            onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                            onBlur={e => handleCorrection('invoiceNumber', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Currency</label>
                                        <input type="text" readOnly className="form-input" value={formData.currency}
                                            style={{ background: 'var(--background)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label className="form-label">Amount ({formData.currency})</label>
                                            {formData.autoExtracted && <Edit2 size={12} style={{ color: 'var(--brand)', cursor: 'help' }} />}
                                        </div>
                                        <input type="number" step="0.01" required className="form-input"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                            onBlur={e => handleCorrection('totalAmount', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label className="form-label">Issue Date</label>
                                            {formData.autoExtracted && <Edit2 size={12} style={{ color: 'var(--brand)', cursor: 'help' }} />}
                                        </div>
                                        <input type="date" required className="form-input"
                                            value={formData.issueDate}
                                            onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                                            onBlur={e => handleCorrection('issueDate', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label className="form-label">Due Date</label>
                                            {formData.autoExtracted && <Edit2 size={12} style={{ color: 'var(--brand)', cursor: 'help' }} />}
                                        </div>
                                        <input type="date" required className="form-input"
                                            value={formData.dueDate}
                                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                            onBlur={e => handleCorrection('dueDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Invoice Attachment & AI Analysis</label>
                                    <InvoiceUpload
                                        onUploadComplete={(url, name, aiData) => {
                                            if (url) {
                                                // If AI data is provided (merged flow), populate the form
                                                if (aiData) {
                                                    handleScanSuccess(aiData);
                                                }
                                                setFormData({ ...formData, fileName: name, fileUrl: url });
                                            } else {
                                                setFormData({ ...formData, fileName: "", fileUrl: "" });
                                            }
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
                                <th>AI Confidence</th>
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
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', width: '60px' }}>
                                                    <div style={{
                                                        height: '100%',
                                                        backgroundColor: (inv.confidence ?? 0) > 98 ? 'var(--success)' : 'var(--warning)',
                                                        width: `${inv.confidence ?? 0}%`,
                                                        borderRadius: '2px'
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{inv.confidence ?? 0}%</span>
                                            </div>
                                            {inv.hasFraudAlert && <div style={{ fontSize: '0.65rem', color: 'var(--error)', fontWeight: 700, marginTop: 2 }}>⚠️ FRAUD ALERT</div>}
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
            <ReceiptCaptureModal
                isOpen={isScanOpen}
                onClose={() => setIsScanOpen(false)}
                onSuccess={handleScanSuccess}
                mode="INVOICE"
            />
        </div>
    );
}
