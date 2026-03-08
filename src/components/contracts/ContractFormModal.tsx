"use client";

import { useState } from "react";
import { Contract, ContractType, ContractStatus, Vendor } from "@/types";
import { createContract, updateContract } from "@/lib/contracts";
import { useAuth } from "@/context/AuthContext";
import FileUploader from "@/components/common/FileUploader";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";

interface ContractFormModalProps {
    contract?: Contract; // If provided, we are in EDIT mode
    vendors: Vendor[];
    onClose: () => void;
    onSaved: () => void;
}

export default function ContractFormModal({ contract, vendors, onClose, onSaved }: ContractFormModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    useScrollLock(true);

    const [formData, setFormData] = useState({
        title: contract?.title || "",
        vendorId: contract?.vendorId || "",
        type: contract?.type || 'MSA' as ContractType,
        status: contract?.status || 'ACTIVE' as ContractStatus,
        startDate: contract?.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : "",
        endDate: contract?.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : "",
        value: contract?.value || 0,
        currency: contract?.currency || "USD",
        autoRenew: contract?.autoRenew || false,
        attachmentUrl: contract?.attachmentUrl || "",
        notes: contract?.notes || ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const selectedVendor = vendors.find(v => v.id === formData.vendorId);
            const data = {
                ...formData,
                vendorName: selectedVendor?.name || "Unknown Vendor",
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate),
                value: Number(formData.value)
            };

            if (contract?.id) {
                await updateContract(user.tenantId, contract.id, data, user);
            } else {
                await createContract(data, user);
            }
            onSaved();
        } catch (error) {
            alert("Failed to save contract.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {contract ? 'Edit Contract' : 'Register New Contract'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>×</button>
                </div>

                <div className="modal-body">

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className={styles.label}>Contract Title</label>
                                <input
                                    className={styles.input}
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. FY26 Cloud Services MSA"
                                    required
                                />
                            </div>
                            <div>
                                <label className={styles.label}>Vendor</label>
                                <select
                                    className={styles.input}
                                    value={formData.vendorId}
                                    onChange={e => setFormData({ ...formData, vendorId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Vendor</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className={styles.label}>Contract Type</label>
                                <select
                                    className={styles.input}
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as ContractType })}
                                >
                                    <option value="MSA">MSA (Master Service Agreement)</option>
                                    <option value="SOW">SOW (Statement of Work)</option>
                                    <option value="NDA">NDA (Non-Disclosure Agreement)</option>
                                    <option value="SERVICE_AGREEMENT">Service Agreement</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className={styles.label}>Current Status</label>
                                <select
                                    className={styles.input}
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as ContractStatus })}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="EXPIRING">Expiring Soon</option>
                                    <option value="RENEGOTIATION">In Renegotiation</option>
                                    <option value="EXPIRED">Expired</option>
                                    <option value="TERMINATED">Terminated</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className={styles.label}>Start Date</label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className={styles.label}>End Date / Expiry</label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className={styles.label}>Contract Value</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.autoRenew}
                                    onChange={e => setFormData({ ...formData, autoRenew: e.target.checked })}
                                    id="autoRenew"
                                />
                                <label htmlFor="autoRenew" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Auto-Renews</label>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label className={styles.label}>Contract Document (Real Upload)</label>
                            <FileUploader
                                onUploadComplete={(url) => {
                                    setFormData({ ...formData, attachmentUrl: url });
                                    setLoading(false);
                                }}
                                onUploadStart={() => setLoading(true)}
                                pathPrefix="contracts"
                                currentFileName={formData.attachmentUrl ? "Current Document" : ""}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className={styles.label}>Notes / Terms</label>
                            <textarea
                                className={styles.textarea}
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Contract'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
