"use client";

import { useState, useEffect } from "react";
import { Warehouse } from "@/types";
import { createWarehouse, updateWarehouse } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { RefreshCw, MapPin } from "lucide-react";
import Portal from "@/components/common/Portal";

interface WarehouseFormModalProps {
    initialData?: Warehouse;
    onClose: () => void;
    onSaved: () => void;
}

export default function WarehouseFormModal({ initialData, onClose, onSaved }: WarehouseFormModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    useScrollLock(true);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        address: initialData?.address || "",
        status: initialData?.status || "ACTIVE" as 'ACTIVE' | 'INACTIVE',
        managerName: initialData?.managerName || ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            if (initialData?.id) {
                await updateWarehouse(user.tenantId, initialData.id, formData);
            } else {
                await createWarehouse(formData as any, user.tenantId);
            }
            onSaved();
        } catch (error) {
            alert("Failed to save warehouse.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <div className="modal-backdrop" style={{ animation: "fadeIn 0.2s ease-out", zIndex: 1100 }}>
                <div className="modal" style={{ maxWidth: '500px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: "slideUp 0.3s ease-out", padding: 0, overflow: 'hidden' }}>
                    <div className="modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'var(--brand-soft)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <MapPin size={18} style={{ color: 'var(--brand)' }} />
                            </div>
                            <h2 className="modal-title" style={{ margin: 0, fontSize: "1.25rem" }}>{initialData?.id ? 'Edit Warehouse' : 'Create New Warehouse'}</h2>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>&times;</button>
                    </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className={styles.label}>Warehouse Name</label>
                            <input
                                className={styles.input}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Central Distribution Center"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className={styles.label}>Physical Address</label>
                            <textarea
                                className={styles.input}
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Full address of the facility"
                                rows={3}
                                style={{ resize: 'none' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label className={styles.label}>Manager Name</label>
                                <input
                                    className={styles.input}
                                    value={formData.managerName}
                                    onChange={e => setFormData({ ...formData, managerName: e.target.value })}
                                    placeholder="Warehouse Supervisor"
                                />
                            </div>
                            <div>
                                <label className={styles.label}>Operational Status</label>
                                <select
                                    className={styles.input}
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '130px' }}>
                            {loading ? (
                                <><RefreshCw size={18} className="animate-spin" style={{ marginRight: '8px' }} /> Saving...</>
                            ) : (
                                initialData?.id ? 'Save Changes' : 'Initialize Warehouse'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Portal>
    );
}
