"use client";

import { useState } from "react";
import { SKU } from "@/types";
import { createSKU } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";

interface SKUFormModalProps {
    onClose: () => void;
    onSaved: () => void;
}

export default function SKUFormModal({ onClose, onSaved }: SKUFormModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    useScrollLock(true);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        category: "OFFICE_SUPPLIES",
        unit: "PCS",
        minStockLevel: 5,
        unitPrice: 0,
        currency: "USD"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            await createSKU(formData, user);
            onSaved();
        } catch (error) {
            alert("Failed to create SKU.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '500px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Define New SKU</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.label}>SKU / Barcode</label>
                        <input
                            className={styles.input}
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                            placeholder="e.g. IT-LPT-042"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.label}>Product Name</label>
                        <input
                            className={styles.input}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Dell Latitude 5420"
                            required
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className={styles.label}>Min Stock Level</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formData.minStockLevel}
                                onChange={e => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label className={styles.label}>Unit</label>
                            <select
                                className={styles.input}
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option value="PCS">Pieces (PCS)</option>
                                <option value="EA">Each (EA)</option>
                                <option value="BOX">Box</option>
                                <option value="KG">Kilogram (KG)</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button type="button" className="btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Add to Catalog'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
