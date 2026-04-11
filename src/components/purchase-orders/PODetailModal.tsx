"use client";

import { useState, useEffect, useMemo } from "react";
import { PurchaseOrder, CommunicationLog, AppUser } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import EmailComposerModal from "./EmailComposerModal";
import { getCommunicationHistory } from "@/lib/communications";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useModal } from "@/context/ModalContext";
import { resolveDiscrepancy } from "@/lib/purchaseOrders";
import { 
    AlertTriangle, 
    CheckCircle2, 
    XCircle, 
    Package, 
    Mail, 
    Printer, 
    History, 
    Activity, 
    Truck, 
    Eye, 
    FileText, 
    Navigation,
    Ban,
    ArrowLeft,
    X
} from "lucide-react";
import ReceiveOrderModal from "./ReceiveOrderModal";

interface PODetailModalProps {
    po: PurchaseOrder;
    user: AppUser;
    onClose: () => void;
    onReceive: (id: string, poNumber: string) => void;
    onCancel?: (id: string, poNumber: string) => void;
    onEmailVendor?: (po: PurchaseOrder) => void;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
}

export default function PODetailModal({
    po,
    user,
    onClose,
    onReceive,
    onCancel,
    onEmailVendor,
    onApprove,
    onReject
}: PODetailModalProps) {
    useScrollLock(true);
    const { showConfirm, showAlert, showError } = useModal();
    const [isResolving, setIsResolving] = useState(false);
    const [showEmailComposer, setShowEmailComposer] = useState(false);
    const [communicationHistory, setCommunicationHistory] = useState<CommunicationLog[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [liveDeliveryHistory, setLiveDeliveryHistory] = useState(po.deliveryHistory || []);
    const [tenantSettings, setTenantSettings] = useState<any>(null);

    // Load communication history and tenant settings
    useEffect(() => {
        if (po.id && po.tenantId) {
            getCommunicationHistory(po.tenantId, po.id).then(setCommunicationHistory);
            import("firebase/database").then(({ ref, get }) => {
                import("@/lib/firebase").then(({ db, DB_PREFIX }) => {
                    get(ref(db, `${DB_PREFIX}/tenants/${po.tenantId}/settings`))
                        .then(snap => {
                            if (snap.exists()) setTenantSettings(snap.val());
                        });
                });
            });
        }
    }, [po.id, po.tenantId]);

    const isAuthorizedToResolve = ['ADMIN', 'WORKSPACE_ADMIN', 'PLATFORM_SUPERUSER', 'administrator', 'FINANCE_MANAGER', 'PROCUREMENT_OFFICER'].includes(user.role);

    const handleResolve = async (action: 'MATCH' | 'REJECT') => {
        const confirmed = await showConfirm(
            action === 'MATCH' ? "Force Match PO" : "Reject Discrepancy",
            action === 'MATCH' 
                ? "This will accept the variance and move the PO to Billed status. Proceed?" 
                : "This will maintain the discrepancy status until record adjustment. Proceed?"
        );
        if (!confirmed) return;

        setIsResolving(true);
        try {
            await resolveDiscrepancy(user.tenantId, po.id!, action, "Manual resolution from detail view", user);
            await showAlert("Success", `PO discrepancy ${action === 'MATCH' ? 'resolved' : 'noted'}.`);
            onClose();
        } catch (error) {
            await showError("Resolution Failed", "Could not update status.");
        } finally {
            setIsResolving(false);
        }
    };

    const handlePrint = () => {
        // Temporarily remove overflow: hidden to allow full page print in Chrome
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'visible';
        
        setTimeout(() => {
            window.print();
            // Restore overflow after print dialog closes
            document.body.style.overflow = originalOverflow || 'hidden';
        }, 100);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.92)',
            zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem', overflowY: 'auto',
            pointerEvents: 'auto'
        }}>
            <style>{`
                .adaptive-paper {
                    background-color: #ffffff !important;
                }
                [data-theme='dark'] .adaptive-paper {
                    background-color: #e2e8f0 !important;
                }
                @media print {
                    @page { margin: 0; }
                    body * { visibility: hidden; }
                    .print-container, .print-container * { visibility: visible; }
                    .print-container {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        padding: 2rem !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        background: white !important;
                    }
                    .no-print { display: none !important; }
                    .modal-backdrop { 
                        position: static !important;
                        display: block !important;
                        background: none !important;
                        backdrop-filter: none !important;
                        padding: 0 !important;
                    }
                }
            `}</style>
            {/* Main Container - Split View */}
            <div style={{
                display: 'flex', gap: '2rem', height: '100%', maxHeight: '900px', width: '1200px',
                flexDirection: 'column', position: 'relative'
            }}>

                {/* Top Navigation Bar (Enterprise Detail Header) */}
                <div className="no-print" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0', color: 'white'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'none', border: 'none', color: '#cbd5e1',
                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                            padding: '0.5rem 0', transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                    >
                        <ArrowLeft size={18} /> Back to Purchase Orders
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Reference: {po.poNumber}</div>
                        <button
                            onClick={onClose}
                            style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#334155', border: 'none', color: 'white',
                                cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', height: '100%', overflow: 'hidden' }}>
                    {/* Left: Document Preview (A4 Paper Ratio) */}
                    <div style={{
                        flex: '1',
                        backgroundColor: 'var(--data-theme) === "dark" ? "#f1f5f9" : "#ffffff"', // Note: inline logic for paper tone
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-premium)',
                        overflowY: 'auto',
                        padding: '3rem',
                        position: 'relative',
                        fontFamily: 'serif',
                        color: '#0f172a' // Always dark text on paper for realism
                    }} className="print-container adaptive-paper">

                        {/* Watermark for status */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)',
                            fontSize: '6rem', fontWeight: 'bold',
                            color: po.status === 'ISSUED' ? '#eff6ff' : po.status === 'RECEIVED' ? '#ecfdf5' : po.status === 'CANCELLED' ? 'var(--error-bg)' : 'var(--background)',
                            zIndex: 0, pointerEvents: 'none',
                            border: `8px solid ${po.status === 'ISSUED' ? '#dbeafe' : po.status === 'RECEIVED' ? '#d1fae5' : po.status === 'CANCELLED' ? '#fecaca' : 'var(--border)'}`,
                            padding: '1rem 4rem', opacity: 0.5
                        }}>
                            {po.status}
                        </div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                                <div>
                                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'Arial, sans-serif' }}>PURCHASE ORDER</h1>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>PO Number: <strong>{po.poNumber}</strong></div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date: {po.issuedAt.toLocaleDateString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.25rem' }}>{tenantSettings?.companyName || "Acme Corp Inc."}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{tenantSettings?.companyAddress || "123 Enterprise Blvd, Tech City, TC 94043"}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{tenantSettings?.companyEmail || "billing@example.com"}</div>
                                </div>
                            </div>

                            {/* Vendor & Ship To */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', gap: '2rem' }}>
                                <div style={{ flex: 1, border: '1px solid var(--border)', padding: '1rem' }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Vendor</h3>
                                    <div style={{ fontWeight: 'bold' }}>{po.vendorName}</div>
                                    <div>Attn: Sales Dept</div>
                                    <div>vendor@example.com</div>
                                </div>
                                <div style={{ flex: 1, border: '1px solid var(--border)', padding: '1rem' }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Ship To</h3>
                                    <div style={{ fontWeight: 'bold' }}>{tenantSettings?.companyName ? `${tenantSettings.companyName} Warehouse` : 'Acme Corp Warehouse'}</div>
                                    <div>Receiving Dock B</div>
                                    <div>{tenantSettings?.companyAddress || "123 Enterprise Blvd, Tech City"}</div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--text-primary)', color: 'white' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>Description</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>Quantity</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>Unit Price</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {po.items.map((item, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem' }}>{item.description}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(item.unitPrice, po.currency)}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(item.total, po.currency)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4rem' }}>
                                <div style={{ width: '250px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(po.totalAmount, po.currency)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <span>Tax (0%):</span>
                                        <span>{formatCurrency(0, po.currency)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '0.5rem' }}>
                                        <span>Total:</span>
                                        <span>{formatCurrency(po.totalAmount, po.currency)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Signature */}
                            <div style={{ display: 'flex', gap: '3rem', marginTop: 'auto' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ height: '1px', backgroundColor: 'black', marginBottom: '0.5rem' }}></div>
                                    <div style={{ fontSize: '0.8rem' }}>Authorized Signature</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ height: '1px', backgroundColor: 'black', marginBottom: '0.5rem' }}></div>
                                    <div style={{ fontSize: '0.8rem' }}>Date</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions Panel (App UI) */}
                    <div style={{
                        width: '350px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        overflowY: 'auto',
                        maxHeight: '100%',
                        backgroundColor: 'var(--background)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem'
                    }} className="no-print">

                        {/* 3-Way Match Resolution Logic Gate */}
                        {po.status === 'DISCREPANCY_FLAGGED' && (
                            <div className="card" style={{ 
                                backgroundColor: '#fff7ed', 
                                border: '2px solid #f97316',
                                padding: '1.25rem'
                            }}>
                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <AlertTriangle color="#f97316" size={24} style={{ flexShrink: 0 }} />
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#9a3412', margin: '0 0 0.25rem 0' }}>3-Way Match Discrepancy</h3>
                                        <p style={{ fontSize: '0.75rem', color: '#c2410c', margin: 0, lineHeight: 1.4 }}>
                                            {po.discrepancyNote || "Record variance detected between PO, Receipt, and Invoice."}
                                        </p>
                                    </div>
                                </div>

                                {isAuthorizedToResolve ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <button 
                                            className="btn btn-primary" 
                                            style={{ width: '100%', backgroundColor: '#f97316', borderColor: '#ea580c' }}
                                            onClick={() => handleResolve('MATCH')}
                                            disabled={isResolving}
                                        >
                                            <CheckCircle2 size={16} /> Force Match (Resolve)
                                        </button>
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ width: '100%', borderColor: '#f97316', color: '#f97316' }}
                                            onClick={() => handleResolve('REJECT')}
                                            disabled={isResolving}
                                        >
                                            <XCircle size={16} /> Request Correction
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '0.7rem', color: '#9a3412', fontStyle: 'italic', textAlign: 'center' }}>
                                        Awaiting review by Finance or Procurement officer.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Approval Action Gate */}
                        {po.status === 'PENDING' && (
                            <div className="card" style={{ border: '2px solid var(--brand)', backgroundColor: 'var(--brand-soft)' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--brand)' }}>Pending Approval</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    This purchase order requires authorization before it can be issued to the vendor.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        onClick={() => onApprove && onApprove(po.id!)}
                                    >
                                        <CheckCircle2 size={18} /> Approve & Issue PO
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }}
                                        onClick={() => onReject && onReject(po.id!)}
                                    >
                                        <XCircle size={18} /> Reject Purchase Order
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="card" style={{ backgroundColor: 'var(--surface)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Actions</h3>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem' }}
                                onClick={() => setShowEmailComposer(true)}
                            >
                                <Mail size={18} /> Compose Email to Vendor
                            </button>

                            <button
                                className="btn"
                                style={{
                                    width: '100%', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    border: '1px solid var(--border)', background: 'white', color: '#0f172a', padding: '0.875rem', fontWeight: 700
                                }}
                                onClick={handlePrint}
                            >
                                <Printer size={18} /> Print / Download PDF
                            </button>
                        </div>

                        {/* Live Tracking Timeline */}
                        <div className="card" style={{ padding: '1rem' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}>
                                <Navigation size={18} className="text-brand" /> Live Delivery Tracking
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                                    <div style={{ width: '2px', backgroundColor: 'var(--success)', position: 'absolute', top: '12px', bottom: '-20px', left: '10px', zIndex: 0 }}></div>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', zIndex: 1 }}>✓</div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>PO Issued</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{po.issuedAt.toLocaleString()}</div>
                                    </div>
                                </div>

                                {liveDeliveryHistory.map((log, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                                        {idx < liveDeliveryHistory.length - 1 && (
                                            <div style={{ width: '2px', backgroundColor: 'var(--success)', position: 'absolute', top: '12px', bottom: '-20px', left: '10px', zIndex: 0 }}></div>
                                        )}
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            backgroundColor: log.action === 'SENT' ? 'var(--accent)' : 
                                                            log.action === 'SHIPPED' ? '#0369a1' : 'var(--success)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', zIndex: 1
                                        }}>
                                            {log.action === 'SENT' ? <Mail size={12} /> : 
                                             log.action === 'OPENED' ? <Eye size={12} /> : 
                                             log.action === 'SHIPPED' ? <Truck size={12} /> : <CheckCircle2 size={12} />}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                                {log.action === 'SENT' ? 'Link Emailed' : 
                                                 log.action === 'OPENED' ? 'Opened by Vendor' : 
                                                 log.action === 'SHIPPED' ? 'Order Shipped' : 'Acknowledged by Vendor'}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                {new Date(log.timestamp).toLocaleString()} {log.performedBy === 'VENDOR' ? '(Ref: Vendor Port)' : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {liveDeliveryHistory.length === 0 && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', paddingLeft: '1.75rem' }}>
                                        Pending delivery to vendor...
                                    </div>
                                )}
                            </div>

                            {po.shippingDetails && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>📦 Shipping Information</h4>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Carrier</div>
                                            <div>{po.shippingDetails.carrier}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Tracking #</div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand)' }}>{po.shippingDetails.trackingNumber}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Est. Delivery</div>
                                            <div>{po.shippingDetails.estimatedDelivery ? new Date(po.shippingDetails.estimatedDelivery).toLocaleDateString() : 'TBD'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {po.firstViewedAt && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem' }}>
                                    <strong>Total Views:</strong> {liveDeliveryHistory.filter(h => h.action === 'OPENED').length || 0}
                                </div>
                            )}
                        </div>

                        {(po.status === 'ISSUED' || po.status === 'SHIPPED') && (
                            <div className="card" style={{ border: '2px solid var(--accent)', backgroundColor: 'var(--surface)' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Goods Receipt</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    Confirm that the items have been delivered and verify quality.
                                </p>
                                <button
                                    className="btn btn-accent"
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={() => setShowReceiveModal(true)}
                                >
                                    <Package size={18} /> Record Goods Receipt
                                </button>
                            </div>
                        )}
                        {/* Communication History - Solid Enterprise View */}
                        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)', background: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}>
                                    <FileText size={18} className="text-brand" /> Comm. History
                                </h3>
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    style={{
                                        background: 'var(--brand-soft)', border: 'none', cursor: 'pointer',
                                        color: 'var(--brand)', fontSize: '0.75rem', fontWeight: 800,
                                        padding: '0.4rem 0.75rem', borderRadius: '6px'
                                    }}
                                >
                                    {showHistory ? 'HIDE' : `VIEW (${communicationHistory.length})`}
                                </button>
                            </div>

                            {showHistory && (
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {communicationHistory.length === 0 ? (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', border: '1px dashed var(--border)', borderRadius: '4px' }}>
                                            No communications recorded for this PO.
                                            <br />
                                            Use "Compose Email" to start a thread.
                                        </div>
                                    ) : (
                                        communicationHistory.map((log, idx) => (
                                            <div
                                                key={log.id || idx}
                                                style={{
                                                    padding: '0.75rem', marginBottom: '0.5rem',
                                                    borderLeft: '3px solid var(--accent)',
                                                    backgroundColor: 'var(--background)',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>
                                                        {log.type}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                        {new Date(log.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                                    {log.subject}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    By: {log.sentByName}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cancel Section */}
                        {po.status !== 'CANCELLED' && po.status !== 'CLOSED' && onCancel && (
                            <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--error-bg)', border: '1px solid #fecaca' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--error)', marginBottom: '0.5rem' }}>
                                    ⚠️ Administrative Actions
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginBottom: '1rem' }}>
                                    Voiding this PO will notify the vendor and release committed funds.
                                </p>
                                <button
                                    className="btn"
                                    style={{ width: '100%', backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fee2e2', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={() => onCancel(po.id!, po.poNumber)}
                                >
                                    <Ban size={16} /> Void Purchase Order
                                </button>
                            </div>
                        )}

                        <div style={{ marginTop: 'auto' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    width: '100%', padding: '1rem',
                                    backgroundColor: '#1e293b', color: 'white',
                                    border: 'none', borderRadius: '12px',
                                    cursor: 'pointer', fontWeight: 800,
                                    fontSize: '0.95rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                Close Document Preview
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Composer Modal */}
            {showEmailComposer && (
                <EmailComposerModal
                    po={po}
                    onClose={() => setShowEmailComposer(false)}
                    onSent={() => {
                        // Refresh communication history and local delivery tracking
                        if (po.id && po.tenantId) {
                            getCommunicationHistory(po.tenantId, po.id).then(setCommunicationHistory);
                            setLiveDeliveryHistory(prev => [...prev, {
                                timestamp: new Date().toISOString(),
                                action: 'SENT',
                                performedBy: 'User'
                            }]);
                            // Also open the history to show the new communication
                            setShowHistory(true);
                        }
                    }}
                />
            )}
            {/* Receive Goods Modal */}
            {showReceiveModal && (
                <ReceiveOrderModal
                    po={po}
                    user={user}
                    onClose={() => setShowReceiveModal(false)}
                    onSuccess={(receiptId) => {
                        setShowReceiveModal(false);
                        if (onReceive) onReceive(po.id!, po.poNumber);
                        onClose();
                    }}
                />
            )}
        </div>
    );
}
