"use client";

import { useState } from "react";
import { RFP, Quotation } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import tableStyles from "@/components/assets/Assets.module.css";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";

interface BidComparisonModalProps {
    rfp: RFP;
    bids: Quotation[];
    onClose: () => void;
    onAward: (bidId: string) => void;
}

export default function BidComparisonModal({ rfp, bids, onClose, onAward }: BidComparisonModalProps) {
    const [selectedBidId, setSelectedBidId] = useState<string | null>(null);

    useScrollLock(true);

    const isLocked = new Date() < new Date(rfp.deadline) && rfp.status === 'OPEN';

    return (
        <div className="modal-backdrop">
            <div className="modal" style={{ width: '900px', maxWidth: '95%', maxHeight: '90vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                            {isLocked ? "🔒 Blind Bidding in Progress" : `Bid Comparison: ${rfp.title}`}
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            {isLocked
                                ? `Bids are automatically blinded until the deadline: ${new Date(rfp.deadline).toLocaleDateString()}`
                                : "Evaluate vendor responses and award the contract."}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div className={tableStyles.tableWrapper}>
                    <table className={tableStyles.table}>
                        <thead>
                            <tr>
                                <th>Vendor</th>
                                <th>Total Price</th>
                                <th>Delivery Date</th>
                                <th>Valid Until</th>
                                <th>Status</th>
                                <th>Select</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bids.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={tableStyles.empty}>No bids received yet.</td>
                                </tr>
                            ) : (
                                bids.map((bid) => (
                                    <tr
                                        key={bid.id}
                                        className={tableStyles.row}
                                        onClick={() => !isLocked && setSelectedBidId(bid.id!)}
                                        style={{ opacity: isLocked ? 0.8 : 1 }}
                                    >
                                        <td>
                                            <div style={{ fontWeight: 600 }}>
                                                {isLocked ? `Vendor #${bid.id?.slice(-4).toUpperCase()}` : bid.vendorName}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Submitted: {new Date(bid.submittedAt).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ fontWeight: 700, color: isLocked ? '#94a3b8' : 'var(--primary)' }}>
                                            {isLocked ? "●●●●●●" : formatCurrency(bid.totalAmount, bid.currency)}
                                        </td>
                                        <td>{isLocked ? "Locked" : new Date(bid.deliveryDate).toLocaleDateString()}</td>
                                        <td>{new Date(bid.validUntil).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                background: isLocked ? '#f1f5f9' : '#dcfce7',
                                                color: isLocked ? '#64748b' : '#15803d'
                                            }}>
                                                {isLocked ? "SEALED" : bid.status}
                                            </span>
                                        </td>
                                        <td>
                                            <input type="radio" checked={selectedBidId === bid.id} disabled={isLocked} readOnly />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {isLocked && bids.length > 0 && (
                    <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.5rem' }}>🛡️</div>
                        <div style={{ fontSize: '0.875rem', color: '#9a3412' }}>
                            <strong>Competitive Integrity Active:</strong> To ensure objective evaluation, vendor names and pricing are hidden until the RFP deadline. You can award the bid once the deadline has passed.
                        </div>
                    </div>
                )}

                {selectedBidId && (
                    <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Award Conclusion</h3>
                                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Selected: <strong>{bids.find(b => b.id === selectedBidId)?.vendorName}</strong></p>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => onAward(selectedBidId)}
                            >
                                Confirm Award & Create PO
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
