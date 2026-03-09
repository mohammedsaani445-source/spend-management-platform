"use client";

import { useState } from "react";
import { SKU } from "@/types";
import { createSKU } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Camera } from "lucide-react";
import BarcodeScanner from "./BarcodeScanner";

interface SKUFormModalProps {
    onClose: () => void;
    onSaved: () => void;
}

export default function SKUFormModal({ onClose, onSaved }: SKUFormModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

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

    const handleScan = (code: string) => {
        setFormData({ ...formData, code });
        setIsScanning(false);
    };

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
        <div className="modal-backdrop">
            <div className="modal" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Define New SKU</h2>
                    <button onClick={onClose} className="closeButton" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <label className={styles.label} style={{ marginBottom: 0 }}>SKU / Barcode</label>
                            <button
                                type="button"
                                onClick={() => setIsScanning(!isScanning)}
                                style={{
                                    fontSize: '0.75rem', color: isScanning ? '#e11d48' : 'var(--brand)',
                                    background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                            >
                                <Camera size={14} /> {isScanning ? "Cancel Scan" : "Scan Barcode"}
                            </button>
                        </div>

                        {isScanning ? (
                            <div style={{ marginBottom: '1rem' }}>
                                <BarcodeScanner
                                    onScan={handleScan}
                                    onClose={() => setIsScanning(false)}
                                />
                            </div>
                        ) : (
                            <input
                                className={styles.input}
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g. IT-LPT-042"
                                required
                            />
                        )}
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
                    <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', background: 'var(--surface-2)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
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
