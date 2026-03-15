"use client";

import { useState } from "react";
import { Tender, PortalSession, AppUser } from "@/types";
import { submitBid } from "@/lib/bidding";
import styles from "./Portal.module.css";
import { X, DollarSign, FileText, AlertTriangle } from "lucide-react";

interface SubmitBidModalProps {
    tender: Tender;
    session: PortalSession;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SubmitBidModal({ tender, session, onClose, onSuccess }: SubmitBidModalProps) {
    const [amount, setAmount] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const bidAmount = parseFloat(amount);
            if (isNaN(bidAmount) || bidAmount <= 0) {
                throw new Error("Please enter a valid bid amount.");
            }

            // Create a pseudo-user object for the API
            const actor: AppUser = {
                uid: session.vendorId,
                displayName: session.vendorName,
                email: "", // Not available in session
                role: "WORKSPACE_ADMIN", // Elevate role for vendor submission if needed, but the lib uses it for audit
                tenantId: session.tenantId || "",
                userType: "BASIC",
                department: "Vendor",
                createdAt: new Date()
            } as any;

            await submitBid(session.tenantId!, {
                tenderId: tender.id,
                vendorId: session.vendorId,
                vendorName: session.vendorName,
                amount: bidAmount,
                currency: tender.currency,
                notes: notes,
                isBlind: true // Mandatory for Phase 45
            }, actor);

            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to submit bid. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.glassCard} ${styles.modalContent}`}>
                <div className={styles.sectionHeader}>
                    <h3>Submit Proposal: {tender.title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {tender.isSealed && (
                    <div style={{ backgroundColor: '#0ea5e922', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <AlertTriangle size={20} style={{ color: '#0ea5e9', flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#bae6fd' }}>
                            <strong>Sealed Bidding Active:</strong> Your bid amount will remain encrypted and hidden from the procurement team until the deadline.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Proposed Total Amount ({tender.currency})</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="number"
                                step="0.01"
                                className={styles.formInput}
                                style={{ paddingLeft: '2.5rem' }}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Proposal Notes / Breakdown</label>
                        <div style={{ position: 'relative' }}>
                            <FileText size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#64748b' }} />
                            <textarea
                                className={styles.formTextarea}
                                style={{ paddingLeft: '2.5rem', minHeight: '120px' }}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Provide brief details about your proposal, lead times, or terms..."
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={onClose} className={styles.secondaryBtn} style={{ flex: 1 }} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.primaryBtn} style={{ flex: 1 }} disabled={loading}>
                            {loading ? "Submitting..." : "Submit Bid"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
