"use client";

import { useState } from "react";
import { PurchaseOrder, AppUser, ItemReceipt, GoodsReceiptLine } from "@/types";
import { createReceipt } from "@/lib/receipts";
import { useModal } from "@/context/ModalContext";
import { formatCurrency } from "@/lib/currencies";
import { CheckCircle2, AlertCircle, Package, ShieldCheck, X } from "lucide-react";

interface ReceiveOrderModalProps {
    po: PurchaseOrder;
    user: AppUser;
    onClose: () => void;
    onSuccess: (receiptId: string) => void;
}

export default function ReceiveOrderModal({ po, user, onClose, onSuccess }: ReceiveOrderModalProps) {
    const { showAlert, showError, showConfirm } = useModal();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lines, setLines] = useState<GoodsReceiptLine[]>(
        po.items.map((item, index) => ({
            itemIndex: index,
            itemId: item.id || '',
            description: item.description,
            orderedQty: item.quantity,
            receivedQty: item.quantity,
            qualityStatus: 'PASSED',
            unitPrice: item.unitPrice
        }))
    );

    const handleLineChange = (index: number, field: keyof GoodsReceiptLine, value: any) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setLines(newLines);
    };

    const handleSubmit = async () => {
        const hasFailedItems = lines.some(l => l.qualityStatus === 'FAILED');
        if (hasFailedItems) {
            const confirmed = await showConfirm(
                "Failed Items Detected",
                "Some items are marked as FAILED. This will flag a discrepancy for investigation. Proceed?"
            );
            if (!confirmed) return;
        }

        setIsSubmitting(true);
        try {
            const receiptData: Omit<ItemReceipt, 'id' | 'createdAt'> = {
                poId: po.id!,
                poNumber: po.poNumber,
                tenantId: user.tenantId,
                lines,
                isAutoReceive: false,
                overallQualityStatus: lines.every(l => l.qualityStatus === 'PASSED') ? 'PASSED' : 'PARTIAL',
                receivedBy: user.uid,
                receivedByName: user.displayName || 'Procurement Officer'
            };

            const receiptId = await createReceipt(user.tenantId, receiptData, user);
            await showAlert("Success", "Goods receipt has been recorded successfully.");
            onSuccess(receiptId);
        } catch (error) {
            console.error(error);
            await showError("Submission Failed", "Could not record the goods receipt. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="card modal-content" style={{ width: '900px', maxWidth: '95vw', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-raised)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Receive Goods</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>PO #{po.poNumber} • {po.vendorName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                    <div className="alert info" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <ShieldCheck size={18} style={{ marginTop: '0.2rem' }} />
                        <div style={{ fontSize: '0.85rem' }}>
                            <strong>Quality Control:</strong> Please verify item quantities and condition. Failed items will automatically trigger a match discrepancy for procurement review.
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Item Description</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '120px' }}>Ordered</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '120px' }}>Received</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '200px' }}>Quality Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((line, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{line.description}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unit Price: {formatCurrency(line.unitPrice, po.currency)}</div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>
                                        {line.orderedQty}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <input
                                            type="number"
                                            value={line.receivedQty}
                                            onChange={(e) => handleLineChange(idx, 'receivedQty', parseFloat(e.target.value) || 0)}
                                            style={{ width: '100%', textAlign: 'right', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)' }}
                                            min="0"
                                        />
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => handleLineChange(idx, 'qualityStatus', 'PASSED')}
                                                style={{
                                                    flex: 1, padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                    background: line.qualityStatus === 'PASSED' ? '#ecfdf5' : 'transparent',
                                                    color: line.qualityStatus === 'PASSED' ? '#059669' : 'var(--text-secondary)',
                                                    border: `1px solid ${line.qualityStatus === 'PASSED' ? '#10b981' : 'var(--border)'}`,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                PASSED
                                            </button>
                                            <button
                                                onClick={() => handleLineChange(idx, 'qualityStatus', 'FAILED')}
                                                style={{
                                                    flex: 1, padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                    background: line.qualityStatus === 'FAILED' ? '#fef2f2' : 'transparent',
                                                    color: line.qualityStatus === 'FAILED' ? '#dc2626' : 'var(--text-secondary)',
                                                    border: `1px solid ${line.qualityStatus === 'FAILED' ? '#ef4444' : 'var(--border)'}`,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                FAILED
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--surface-raised)' }}>
                    <button className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px', justifyContent: 'center' }}
                    >
                        {isSubmitting ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                Record Receipt
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
