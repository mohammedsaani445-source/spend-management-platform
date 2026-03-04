"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { RFP, Quotation, Vendor } from "@/types";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { submitQuotation } from "@/lib/sourcing";
import { getVendors } from "@/lib/vendors";
import { formatCurrency } from "@/lib/currencies";
import styles from "@/components/layout/Layout.module.css";

export default function PublicRFPPage() {
    const params = useParams();
    const rfpId = params.id as string;

    const [rfp, setRfp] = useState<RFP | null>(null);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendor, setSelectedVendor] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    // Quote State
    const [itemPrices, setItemPrices] = useState<Record<number, number>>({});
    const [deliveryDate, setDeliveryDate] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const loadRFP = async () => {
            const tenantId = 'default-tenant'; // Fallback for legacy public route
            const rfpSnap = await get(ref(db, `v2_production/tenants/${tenantId}/rfps/${rfpId}`));
            const allVendors = await getVendors(tenantId);
            if (rfpSnap.exists()) {
                setRfp(rfpSnap.val());
                setVendors(allVendors.filter(v => rfpSnap.val().invitedVendors.includes(v.id)));
            }
            setLoading(false);
        };
        loadRFP();
    }, [rfpId]);

    const calculateTotal = () => {
        if (!rfp) return 0;
        return rfp.items.reduce((sum, item, i) => sum + (item.quantity * (itemPrices[i] || 0)), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVendor || !deliveryDate) {
            alert("Please complete all required fields.");
            return;
        }

        const vendor = vendors.find(v => v.id === selectedVendor);
        const tenantId = 'default-tenant';

        const quote: Quotation = {
            rfpId,
            vendorId: selectedVendor,
            vendorName: vendor?.name || "Unknown Vendor",
            status: 'SUBMITTED',
            totalAmount: calculateTotal(),
            currency: 'USD', // Default or from RFP
            items: rfp!.items.map((item, i) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: itemPrices[i] || 0,
                totalPrice: item.quantity * (itemPrices[i] || 0)
            })),
            deliveryDate: new Date(deliveryDate),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            notes,
            submittedAt: new Date()
        };

        try {
            await submitQuotation(tenantId, quote);
            setSubmitted(true);
        } catch (error) {
            alert("Failed to submit quote.");
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Sourcing Event...</div>;
    if (!rfp) return <div style={{ padding: '4rem', textAlign: 'center' }}>RFP Not Found or Expired.</div>;

    if (submitted) {
        return (
            <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center' }} className="card">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Bid Submitted Successfully</h1>
                <p style={{ color: '#64748b', marginTop: '1rem' }}>
                    Thank you for your proposal for <strong>{rfp.title}</strong>.
                    Our procurement team will review your bid after the deadline passes.
                </p>
            </div>
        );
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>BIDDING PORTAL</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{rfp.title}</h1>
                    <div style={{ color: '#ef4444', fontWeight: 600, marginTop: '0.5rem' }}>
                        Deadline: {new Date(rfp.deadline).toLocaleDateString()}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>1. RFP Information</h2>
                        <p style={{ color: '#475569', lineHeight: 1.6 }}>{rfp.description}</p>

                        <div style={{ marginTop: '1.5rem' }}>
                            <label className={styles.label}>Identify Your Organization</label>
                            <select
                                className={styles.select}
                                value={selectedVendor}
                                onChange={e => setSelectedVendor(e.target.value)}
                                required
                            >
                                <option value="">Select Vendor...</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>2. Pricing Proposal</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem' }}>Item</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Price (USD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rfp.items.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.75rem' }}>{item.description}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                            <input
                                                type="number"
                                                className={styles.input}
                                                style={{ width: '120px', textAlign: 'right' }}
                                                value={itemPrices[i] || ""}
                                                onChange={e => setItemPrices({ ...itemPrices, [i]: parseFloat(e.target.value) })}
                                                step="0.01"
                                                required
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2} style={{ padding: '1rem', textAlign: 'right', fontWeight: 700 }}>Total Bid:</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem' }}>
                                        {calculateTotal().toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>3. Delivery & Notes</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label className={styles.label}>Proposed Delivery Date</label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    value={deliveryDate}
                                    onChange={e => setDeliveryDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className={styles.label}>Bid Valid Until</label>
                                <input type="text" className={styles.input} value="30 Days from submission" disabled />
                            </div>
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <label className={styles.label}>Additional Notes / Terms</label>
                            <textarea
                                className={styles.textarea}
                                rows={4}
                                placeholder="E.g. Bulk discount applied, warranty information..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                            Submit Secure Bid 🛡️
                        </button>
                    </div>
                </form>

                <div style={{ textAlign: 'center', marginTop: '3rem', color: '#64748b', fontSize: '0.8rem' }}>
                    This is a secure procurement portal using end-to-end blind bidding protocols.
                </div>
            </div>
        </div>
    );
}
