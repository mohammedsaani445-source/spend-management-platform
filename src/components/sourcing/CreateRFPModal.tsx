"use client";

import { useState } from "react";
import { Requisition, RFP, Vendor } from "@/types";
import { createRFP, getRFPSubmissionLink } from "@/lib/sourcing";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";

interface CreateRFPModalProps {
    requisition: Requisition;
    vendors: Vendor[];
    onClose: () => void;
    onCreated: (rfpId: string) => void;
}

export default function CreateRFPModal({ requisition, vendors, onClose, onCreated }: CreateRFPModalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState(`RFP: ${requisition.items[0]?.description || 'Equipment Purchase'}`);
    const [description, setDescription] = useState(requisition.justification);
    const [deadline, setDeadline] = useState("");
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useScrollLock(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !deadline || selectedVendors.length === 0) {
            alert("Please select a deadline and at least one vendor.");
            return;
        }

        setLoading(true);
        try {
            const rfp: RFP = {
                requisitionId: requisition.id!,
                title,
                description,
                department: requisition.department,
                status: 'OPEN',
                deadline: new Date(deadline),
                invitedVendors: selectedVendors,
                items: requisition.items.map(i => ({
                    description: i.description,
                    quantity: i.quantity,
                    unit: 'Each'
                })),
                createdBy: user.uid,
                createdAt: new Date()
            };

            const id = await createRFP(user.tenantId, rfp, user);
            const portalLink = getRFPSubmissionLink(user.tenantId, id!);

            alert(`RFP Launched Successfully! \n\nVendors have been invited. You can also share this secure portal link with them: \n${portalLink}`);

            onCreated(id!);
        } catch (error) {
            console.error("Error creating RFP:", error);
            alert("Failed to create RFP.");
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
        <div className="modal-backdrop">
            <div className="modal" style={{ width: '600px', maxWidth: '95%', maxHeight: '90vh' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Initiate Strategic Sourcing</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.label}>RFP Title</label>
                        <input
                            className={styles.input}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.label}>Scope/Description</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.label}>Response Deadline</label>
                        <input
                            type="date"
                            className={styles.input}
                            value={deadline}
                            onChange={e => setDeadline(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className={styles.label}>Invite Vendors ({selectedVendors.length} selected)</label>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                            {vendors.map(v => (
                                <div
                                    key={v.id}
                                    onClick={() => toggleVendor(v.id!)}
                                    style={{
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: selectedVendors.includes(v.id!) ? '#f1f5f9' : 'transparent',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <input type="checkbox" checked={selectedVendors.includes(v.id!)} readOnly />
                                    <span>{v.name} ({v.category})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Launch RFP 🚀'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
