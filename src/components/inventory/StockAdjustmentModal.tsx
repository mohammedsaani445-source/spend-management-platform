"use client";

import { useState } from "react";
import { SKU, Warehouse } from "@/types";
import { adjustStock } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/layout/Layout.module.css";

interface StockAdjustmentModalProps {
    skus: SKU[];
    warehouses: Warehouse[];
    onClose: () => void;
    onSaved: () => void;
}

export default function StockAdjustmentModal({ skus, warehouses, onClose, onSaved }: StockAdjustmentModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        skuId: "",
        warehouseId: "",
        quantity: 0,
        reason: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const sku = skus.find(s => s.id === formData.skuId);
        const wh = warehouses.find(w => w.id === formData.warehouseId);

        if (!sku || !wh) return;

        setLoading(true);
        try {
            await adjustStock(
                user.tenantId,
                formData.skuId,
                sku.name,
                formData.warehouseId,
                wh.name,
                formData.quantity,
                user.displayName || user.email || 'System',
                formData.reason
            );
            onSaved();
        } catch (error: any) {
            alert(error.message || "Failed to adjust stock.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '450px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Stock Adjustment</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        <label className={styles.label} style={{ color: '#0369a1', fontWeight: 700 }}>🔍 Quick Scan (SKU / Barcode)</label>
                        <input
                            className={styles.input}
                            placeholder="Scan or type barcode..."
                            autoFocus
                            onChange={(e) => {
                                const code = e.target.value.trim();
                                if (!code) return;
                                const match = skus.find(s => s.code === code);
                                if (match) {
                                    setFormData({ ...formData, skuId: match.id! });
                                    // Visual feedback
                                    e.target.style.borderColor = '#22c55e';
                                } else {
                                    e.target.style.borderColor = '#cbd5e1';
                                }
                            }}
                        />
                        <div style={{ fontSize: '0.7rem', color: '#0c4a6e', marginTop: '0.25rem' }}>
                            Physical scanners will automatically focus and match items here.
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.label}>Selected Item</label>
                        <select
                            className={styles.input}
                            value={formData.skuId}
                            onChange={e => setFormData({ ...formData, skuId: e.target.value })}
                            required
                        >
                            <option value="">Choose item...</option>
                            {skus.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.label}>Warehouse Location</label>
                        <select
                            className={styles.input}
                            value={formData.warehouseId}
                            onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                            required
                        >
                            <option value="">Choose location...</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.label}>Quantity Change (Positive for receipt, Negative for removal)</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={formData.quantity}
                            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.label}>Adjustment Reason</label>
                        <input
                            className={styles.input}
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="e.g. Received from shipment, Cycle count"
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button type="button" className="btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Record Adjustment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
