"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getRFP, submitQuotation } from "@/lib/sourcing";
import { RFP, Quotation } from "@/types";
import { Target, Clock, ShieldCheck, Send, Info } from "lucide-react";
import { formatCurrency } from "@/lib/currencies";
import styles from "@/components/layout/Layout.module.css";

export default function SupplierPortalPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const tenantId = searchParams.get('tenant');
    
    const [rfp, setRfp] = useState<RFP | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [vendorName, setVendorName] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [deliveryDays, setDeliveryDays] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!id || !tenantId) return;
        getRFP(tenantId, id).then(data => {
            setRfp(data);
            setLoading(false);
        });
    }, [id, tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rfp || !tenantId) return;

        setSubmitting(true);
        try {
            const quote: Partial<Quotation> = {
                rfpId: rfp.id,
                vendorName,
                vendorId: `manual-${Date.now()}`,
                totalAmount: parseFloat(totalAmount),
                currency: 'USD',
                items: rfp.items.map(it => ({
                    ...it,
                    unitPrice: parseFloat(totalAmount) / it.quantity,
                    totalPrice: parseFloat(totalAmount)
                })),
                deliveryDate: new Date(Date.now() + parseInt(deliveryDays) * 24 * 60 * 60 * 1000),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'SUBMITTED',
                scorecard: {
                    priceScore: 0, // Calculated by admin
                    qualityRating: 8, // Default baseline
                    deliveryDays: parseInt(deliveryDays),
                    riskRating: 9, // Default baseline
                    weightedTotal: 0
                }
            };

            await submitQuotation(tenantId, quote as Quotation);
            setSubmitted(true);
        } catch (error) {
            alert("Failed to submit quote.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading Secure Portal...</div>;

    if (!rfp) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div>
            <h2 style={{ fontWeight: 900 }}>Secure Portal Closed</h2>
            <p style={{ color: 'var(--text-secondary)' }}>This sourcing event is no longer accepting bids.</p>
        </div>
    </div>;

    if (submitted) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
            <div style={{ background: 'white', padding: '3rem', borderRadius: '32px', textAlign: 'center', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', maxWidth: '500px' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--success-soft)', borderRadius: '50%', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 2rem' }}>✅</div>
                <h1 style={{ fontWeight: 900, marginBottom: '1rem' }}>Quote Submitted Successfully</h1>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>Thank you for your response. The procurement team will review your bid and contact you regarding the status of your award.</p>
                <button onClick={() => window.close()} className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>Close Portal</button>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--brand)', borderRadius: '14px', color: 'white' }}>
                            <Target size={24} />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>Supplier Response Portal</h1>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16}/> Deadline: {new Date(rfp.deadline).toLocaleDateString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ShieldCheck size={16}/> Secure SSL Encrypted</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* RFQ Specs */}
                    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem' }}>RFQ Requirements</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', display: 'block', marginBottom: '0.25rem' }}>Project Title</label>
                                <div style={{ fontWeight: 700 }}>{rfp.title}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', display: 'block', marginBottom: '0.25rem' }}>Items Requested</label>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                    {rfp.items.map((it, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{it.description} ({it.quantity} {it.unit})</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {rfp.isAuction && (
                            <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--brand-soft)', borderRadius: '16px', border: '1px solid var(--brand-soft)', color: 'var(--brand)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '6px', height: '6px', background: 'var(--brand)', borderRadius: '50%' }} />
                                    <span style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Live Reverse Auction</span>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                                    {rfp.bestBidValue ? formatCurrency(rfp.bestBidValue, 'USD') : 'No Bids'}
                                </div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>Current Leading Bid (Beat this to win)</div>
                            </div>
                        )}
                    </div>

                    {/* Submission Form */}
                    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800 }}>Submit Your Quote</h3>
                        
                        <div>
                            <label className={styles.label}>Company/Supplier Name</label>
                            <input className={styles.input} value={vendorName} onChange={e => setVendorName(e.target.value)} required />
                        </div>

                        <div>
                            <label className={styles.label}>Total Bid Amount (USD)</label>
                            <input className={styles.input} type="number" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required />
                        </div>

                        <div>
                            <label className={styles.label}>Lead Time (Days)</label>
                            <input className={styles.input} type="number" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} required />
                        </div>

                        <div>
                            <label className={styles.label}>Additional Proposal Notes</label>
                            <textarea className={styles.textarea} rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={submitting}
                            style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
                        >
                            {submitting ? 'Submitting...' : 'Send Secure Response 🚀'}
                        </button>
                    </form>
                </div>
                
                <div style={{ marginTop: '3rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-disabled)', fontSize: '0.75rem' }}>
                    <ShieldCheck size={16} /> Secure Sourcing powered by Apex Procure Enterprise
                </div>
            </div>
        </div>
    );
}
