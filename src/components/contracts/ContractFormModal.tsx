"use client";

import { useState } from "react";
import { Contract, ContractType, ContractStatus, Vendor } from "@/types";
import { createContract, updateContract } from "@/lib/contracts";
import { useAuth } from "@/context/AuthContext";
import FileUploader from "@/components/common/FileUploader";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import Portal from "@/components/common/Portal";
import { FileText, X, Calendar, DollarSign, ShieldCheck, Briefcase } from "lucide-react";

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
        <Portal>
            <div className="modal-backdrop" style={{ animation: "fadeIn 0.2s ease-out" }}>
                <div className="modal" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: "slideUp 0.3s ease-out", padding: 0, overflow: 'hidden' }}>
                    <div className="modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0 }}>
                        <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 10, margin: 0, fontSize: "1.25rem" }}>
                            <ShieldCheck size={24} color="var(--brand)" /> 
                            {contract ? 'Edit Contract' : 'Register New Contract'}
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}><X size={24} /></button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                        <div className="modal-body" style={{ display: 'grid', gap: '1.25rem', padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FileText size={14} /> Contract Title
                                    </label>
                                    <input
                                        className="form-input"
                                        style={{ borderRadius: '10px' }}
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. FY26 Cloud Services MSA"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Briefcase size={14} /> Vendor
                                    </label>
                                    <select
                                        className="form-select"
                                        style={{ borderRadius: '10px' }}
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Contract Type</label>
                                    <select
                                        className="form-select"
                                        style={{ borderRadius: '10px' }}
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
                                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Current Status</label>
                                    <select
                                        className="form-select"
                                        style={{ borderRadius: '10px' }}
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Calendar size={14} /> Start Date
                                    </label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        style={{ borderRadius: '10px' }}
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Calendar size={14} /> End Date / Expiry
                                    </label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        style={{ borderRadius: '10px' }}
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <DollarSign size={14} /> Contract Value
                                    </label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        style={{ borderRadius: '10px' }}
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.autoRenew}
                                        onChange={e => setFormData({ ...formData, autoRenew: e.target.checked })}
                                        id="autoRenew"
                                        style={{ width: 18, height: 18, accentColor: 'var(--brand)' }}
                                    />
                                    <label htmlFor="autoRenew" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Auto-Renews</label>
                                </div>
                            </div>

                            <div>
                                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Contract Document</label>
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

                            <div>
                                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Notes / Terms</label>
                                <textarea
                                    className="form-input"
                                    style={{ borderRadius: '12px', minHeight: '80px', paddingTop: '10px' }}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="modal-footer" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0 }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '140px' }}>
                                {loading ? 'Saving...' : 'Save Contract'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}
