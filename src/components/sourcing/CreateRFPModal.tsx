"use client";

import { useState, useEffect } from "react";
import { Requisition, RFP, Vendor } from "@/types";
import { createRFP, getRFPSubmissionLink } from "@/lib/sourcing";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { X, Target, Info, Search } from "lucide-react";
import { ref, get } from "firebase/database";
import { db, DB_PREFIX } from "@/lib/firebase";

interface CreateRFPModalProps {
    initialData: Requisition;
    tenantId: string;
    onClose: () => void;
    onCreated?: (rfpId: string) => void;
}

export default function CreateRFPModal({ initialData, tenantId, onClose, onCreated }: CreateRFPModalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState(`Strategic Sourcing: PR #${initialData.id?.slice(-6).toUpperCase() || 'NEW'}`);
    const [description, setDescription] = useState(initialData.justification || "");
    const [deadline, setDeadline] = useState("");
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAuction, setIsAuction] = useState(false);
    const [weights, setWeights] = useState({
        price: 50,
        quality: 20,
        delivery: 20,
        risk: 10
    });

    useScrollLock(true);

    useEffect(() => {
        // Fetch vendors for invitation
        const vendorsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/vendors`);
        get(vendorsRef).then(snapshot => {
            if (snapshot.exists()) {
                setVendors(Object.values(snapshot.val()));
            }
        });
    }, [tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !deadline || selectedVendors.length === 0) {
            alert("Please select a deadline and at least one vendor.");
            return;
        }

        const totalWeight = weights.price + weights.quality + weights.delivery + weights.risk;
        if (totalWeight !== 100) {
            alert("Evaluation weights must sum to exactly 100%.");
            return;
        }

        setLoading(true);
        try {
            const rfp: RFP = {
                tenantId: user!.tenantId,
                requisitionId: initialData.id!,
                title,
                description,
                department: initialData.department,
                status: 'OPEN',
                currency: initialData.currency || 'USD',
                deadline: new Date(deadline),
                invitedVendors: selectedVendors,
                weightedCriteria: {
                    price: weights.price / 100,
                    quality: weights.quality / 100,
                    delivery: weights.delivery / 100,
                    risk: weights.risk / 100
                },
                isAuction,
                items: initialData.items.map(i => ({
                    description: i.description,
                    quantity: i.quantity,
                    unit: 'EA'
                })),
                createdBy: user.uid,
                createdAt: new Date()
            };

            const id = await createRFP(tenantId, rfp, user);
            const portalLink = getRFPSubmissionLink(tenantId, id!);

            alert(`RFQ Launched Successfully! \n\nVendors have been invited. You can also share this secure portal link with them: \n${portalLink}`);

            if (onCreated) onCreated(id!);
            onClose();
        } catch (error) {
            console.error("Error creating RFP:", error);
            alert("Failed to create RFQ.");
        } finally {
            setLoading(false);
        }
    };

    const toggleVendor = (vendorId: string) => {
        setSelectedVendors(prev =>
            prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
        );
    };

    return (
        <div className="modal-backdrop" style={{ zIndex: 9999 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="premium-card" style={{ 
                width: '750px', 
                maxWidth: '95%', 
                maxHeight: '90vh', 
                background: 'white', 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: '32px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                {/* Modal Header */}
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--brand)', borderRadius: '14px', color: 'white' }}>
                            <Target size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Strategic Sourcing Setup</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Configuring competitive bidding for {initialData.department}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ borderRadius: '50%' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                        
                        {/* Left Column: Event Details */}
                        <div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: '0.5rem', display: 'block' }}>Event Title</label>
                                <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: '0.5rem', display: 'block' }}>Submission Deadline</label>
                                <input type="date" className={styles.input} value={deadline} onChange={e => setDeadline(e.target.value)} required />
                            </div>

                            <div style={{ background: 'var(--surface-2)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>Weighted Criteria %</label>
                                    <div style={{ fontSize: '0.7rem', color: weights.price + weights.quality + weights.delivery + weights.risk === 100 ? 'var(--success)' : 'var(--error)', fontWeight: 800 }}>
                                        {weights.price + weights.quality + weights.delivery + weights.risk}% Total
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {Object.entries(weights).map(([key, val]) => (
                                        <div key={key}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'capitalize' }}>{key}</div>
                                            <input 
                                                type="number" className={styles.input} value={val} 
                                                onChange={(e) => setWeights(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                                                style={{ height: '38px', textAlign: 'center', fontWeight: 700 }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Suppliers & Mode */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '24px', color: 'white', border: '1px solid #1e293b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <input 
                                        type="checkbox" checked={isAuction} onChange={(e) => setIsAuction(e.target.checked)}
                                        style={{ width: '20px', height: '20px', accentColor: 'var(--brand)' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>Enable Reverse Auction</div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Allow suppliers to outbid each other in real-time.</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: '0.5rem', display: 'block' }}>Invite Suppliers ({selectedVendors.length})</label>
                                <div style={{ border: '1px solid var(--border)', borderRadius: '20px', maxHeight: '250px', overflowY: 'auto' }}>
                                    {vendors.map(v => (
                                        <div
                                            key={v.id}
                                            onClick={() => toggleVendor(v.id!)}
                                            style={{
                                                padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                borderBottom: '1px solid var(--border)', background: selectedVendors.includes(v.id!) ? 'var(--brand-soft)' : 'transparent'
                                            }}
                                        >
                                            <input type="checkbox" checked={selectedVendors.includes(v.id!)} readOnly />
                                            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{v.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Discard</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.875rem 2.5rem' }}>
                            {loading ? 'Launching...' : 'Activate Sourcing Event 🚀'}
                        </button>
                    </div>
                </form>
            </div>
            
            <style jsx>{`
                .modal-backdrop {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: #0f172aee;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
}
