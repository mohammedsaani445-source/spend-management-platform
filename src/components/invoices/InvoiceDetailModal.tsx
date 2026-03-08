import { useState, useEffect, useMemo } from "react";
import { Invoice, PurchaseOrder, InvoiceStatus, ItemReceipt } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import { getPoReceipts } from "@/lib/receipts";
import { useAuth } from "@/context/AuthContext";
import InvoiceUpload from "./InvoiceUpload";
import { useScrollLock } from "@/hooks/useScrollLock";

interface InvoiceDetailModalProps {
    invoice: Invoice;
    po?: PurchaseOrder;
    onClose: () => void;
    onPay: (id: string) => void;
    onStatusUpdate?: (id: string, status: InvoiceStatus) => void;
}

export default function InvoiceDetailModal({
    invoice,
    po,
    onClose,
    onPay,
    onStatusUpdate
}: InvoiceDetailModalProps) {
    useScrollLock(true);
    const { user } = useAuth();
    const [receipts, setReceipts] = useState<ItemReceipt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReceipts = async () => {
            if (!user || !po?.id) {
                setLoading(false);
                return;
            }
            try {
                const data = await getPoReceipts(user.tenantId, po.id);
                setReceipts(data);
            } catch (error) {
                console.error("Error fetching matching receipts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReceipts();
    }, [user, po?.id]);

    // 3-Way Match Logic
    const matchStatus = useMemo(() => {
        if (!po) return {
            status: 'MISSING_PO',
            match: false,
            poAmount: 0,
            invAmount: invoice.amount,
            receiptAmount: 0
        };

        const poAmount = po.totalAmount;
        const invAmount = invoice.amount;

        // Calculate real receipt total from ItemReceipts
        const receiptAmount = receipts.reduce((sum, r) => {
            return sum + (r.items || []).reduce((itemSum, item) => {
                // We need the PO unit price to calculate the dollar value of the receipt
                const poItem = po.items.find(pi => pi.description === item.description);
                return itemSum + (item.quantityReceived * (poItem?.unitPrice || 0));
            }, 0);
        }, 0);

        const match = Math.abs(poAmount - invAmount) < 0.01 &&
            Math.abs(receiptAmount - invAmount) < 0.01;

        return {
            status: match ? 'MATCH' : 'MISMATCH',
            match,
            poAmount,
            invAmount,
            receiptAmount
        };
    }, [invoice, po, receipts]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }}>
            <div style={{
                display: 'flex', flexDirection: 'column', gap: '1rem',
                width: '900px', maxWidth: '95%', maxHeight: '90vh'
            }}>
                {/* Top Navigation Bar */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    color: 'white'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                    >
                        ← Back to Invoices
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Invoice: {invoice.invoiceNumber}</div>
                        <button
                            onClick={onClose}
                            style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                cursor: 'pointer', fontSize: '1.2rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="card" style={{
                    overflowY: 'auto', padding: '2rem',
                    animation: 'slideIn 0.3s ease-out',
                    backgroundColor: 'var(--surface)', border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Invoice Details</h2>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>#{invoice.invoiceNumber}</div>
                    </div>

                    {/* 3-Way Match Visualizer */}
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>3-Way Matching Validation</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>

                            {/* Connecting Line */}
                            <div style={{
                                position: 'absolute', top: '40px', left: '10%', right: '10%', height: '4px',
                                backgroundColor: matchStatus.match ? 'var(--success)' : 'var(--error)',
                                zIndex: 0, opacity: 0.3
                            }}></div>

                            {/* PO Node */}
                            <div style={{ zIndex: 1, textAlign: 'center', width: '200px' }}>
                                <div style={{
                                    width: '80px', height: '80px', margin: '0 auto 1rem', borderRadius: '50%',
                                    backgroundColor: 'white', border: '3px solid var(--brand)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
                                }}>
                                    📝
                                </div>
                                <div style={{ fontWeight: 600 }}>Purchase Order</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{po ? formatCurrency(po.totalAmount, po.currency) : 'N/A'}</div>
                                {po && <div style={{ fontSize: '0.8rem', color: 'var(--brand)' }}>#{po.poNumber}</div>}
                            </div>

                            {/* Receipt Node */}
                            <div style={{ zIndex: 1, textAlign: 'center', width: '200px' }}>
                                <div style={{
                                    width: '80px', height: '80px', margin: '0 auto 1rem', borderRadius: '50%',
                                    backgroundColor: 'white',
                                    border: `3px solid ${matchStatus.receiptAmount > 0 ? 'var(--success)' : 'var(--warning)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
                                }}>
                                    📦
                                </div>
                                <div style={{ fontWeight: 600 }}>Goods Receipt</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{matchStatus.status === 'MISSING_PO' ? 'N/A' : formatCurrency(matchStatus.receiptAmount, invoice.currency)}</div>
                                <div style={{ fontSize: '0.8rem', color: matchStatus.receiptAmount > 0 ? 'var(--success)' : 'var(--warning)' }}>
                                    {matchStatus.receiptAmount > 0 ? 'Received' : 'Pending Receipt'}
                                </div>
                            </div>

                            {/* Invoice Node */}
                            <div style={{ zIndex: 1, textAlign: 'center', width: '200px' }}>
                                <div style={{
                                    width: '80px', height: '80px', margin: '0 auto 1rem', borderRadius: '50%',
                                    backgroundColor: 'white', border: '3px solid var(--brand)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
                                }}>
                                    🧾
                                </div>
                                <div style={{ fontWeight: 600 }}>Invoice</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formatCurrency(invoice.amount, invoice.currency)}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--brand)' }}>#{invoice.invoiceNumber}</div>
                            </div>

                        </div>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            {matchStatus.match ? (
                                <span style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderRadius: '99px', fontWeight: 600 }}>
                                    ✅ 3-Way Match Successful
                                </span>
                            ) : (
                                <span style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--error-bg)', color: 'var(--error)', borderRadius: '99px', fontWeight: 600 }}>
                                    ⚠️ Mismatch Detected
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                        {/* Invoice Details */}
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Invoice Details</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                <div style={{ color: 'var(--text-secondary)' }}>Status:</div>
                                <div style={{ fontWeight: 500 }}>{invoice.status}</div>

                                <div style={{ color: 'var(--text-secondary)' }}>Vendor:</div>
                                <div style={{ fontWeight: 500 }}>{invoice.vendorName}</div>

                                <div style={{ color: 'var(--text-secondary)' }}>Issue Date:</div>
                                <div style={{ fontWeight: 500 }}>{invoice.issueDate instanceof Date ? invoice.issueDate.toLocaleDateString() : new Date(invoice.issueDate).toLocaleDateString()}</div>

                                <div style={{ color: 'var(--text-secondary)' }}>Due Date:</div>
                                <div style={{ fontWeight: 500 }}>{invoice.dueDate instanceof Date ? invoice.dueDate.toLocaleDateString() : new Date(invoice.dueDate).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* File Upload / Attachment */}
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Invoice Attachment</h3>
                            <InvoiceUpload
                                onUploadComplete={(url, fileName) => {
                                    console.log("Invoice uploaded to:", url);
                                    // In a real app, you'd update the invoice record in DB here
                                    if (onStatusUpdate) {
                                        // A practical implementation would update the invoice's docUrl
                                        // For now we'll log it and the UI will reflect the "Uploaded" state
                                    }
                                }}
                                currentFileName={invoice.fileName}
                            />
                        </div>

                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button onClick={onClose} className="btn" style={{ border: '1px solid var(--border)' }}>Close</button>

                        {invoice.status === 'PENDING' && onStatusUpdate && (
                            <>
                                <button
                                    onClick={() => onStatusUpdate(invoice.id!, 'REJECTED')}
                                    className="btn"
                                    style={{ border: '1px solid var(--error)', color: 'var(--error)' }}
                                >
                                    Reject Invoice
                                </button>
                                <button
                                    onClick={() => onStatusUpdate(invoice.id!, 'APPROVED')}
                                    className="btn btn-accent"
                                    disabled={!matchStatus.match}
                                    style={{ opacity: matchStatus.match ? 1 : 0.5 }}
                                >
                                    Approve for Payment
                                </button>
                            </>
                        )}

                        {invoice.status === 'APPROVED' && (
                            <button
                                onClick={() => onPay(invoice.id!)}
                                className="btn btn-primary"
                                style={{ background: 'var(--success)', border: 'none' }}
                            >
                                Mark as Paid
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
