"use client";

import { useState } from "react";
import { SKU, Warehouse } from "@/types";
import { createSKU, logInventoryAction } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Camera, RefreshCw } from "lucide-react";
import BarcodeScanner from "./BarcodeScanner";
import { updateSKU } from "@/lib/inventory";

interface SKUFormModalProps {
    initialData?: SKU;
    warehouses: Warehouse[];
    onClose: () => void;
    onSaved: () => void;
}

export default function SKUFormModal({ initialData, warehouses, onClose, onSaved }: SKUFormModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [justScanned, setJustScanned] = useState(false);

    useScrollLock(true);
    const [formData, setFormData] = useState({
        code: initialData?.code || "",
        name: initialData?.name || "",
        description: initialData?.description || "",
        category: initialData?.category || "OFFICE_SUPPLIES",
        unit: initialData?.unit || "PCS",
        minStockLevel: initialData?.minStockLevel || 5,
        unitPrice: initialData?.unitPrice || 0,
        currency: initialData?.currency || "USD",
        initialStock: 0,
        warehouseId: warehouses[0]?.id || ""
    });

    const handleScan = async (code: string) => {
        setLookupLoading(true);
        // Realistic "picking" delay
        await new Promise(resolve => setTimeout(resolve, 400));

        setFormData({ ...formData, code });
        setLookupLoading(false);
        setIsScanning(false);
        setJustScanned(true);
        setTimeout(() => setJustScanned(false), 2000); // Clear success state after 2s
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            if (initialData?.id) {
                await updateSKU(user.tenantId, initialData.id, formData);
            } else {
                const skuId = await createSKU(formData, user);

                // Initialize stock if provided
                if (skuId && formData.initialStock > 0 && formData.warehouseId) {
                    const wh = warehouses.find(w => w.id === formData.warehouseId);
                    await logInventoryAction(user.tenantId, {
                        skuId,
                        skuName: formData.name,
                        warehouseId: formData.warehouseId,
                        warehouseName: wh?.name || "Initial Warehouse",
                        action: 'ADJUSTMENT',
                        quantity: formData.initialStock,
                        performedBy: user.email || "System",
                        notes: "Initial stock allocation during SKU creation."
                    });
                }
            }
            onSaved();
        } catch (error) {
            alert(initialData?.id ? "Failed to update SKU." : "Failed to create SKU.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{initialData?.id ? 'Edit SKU Details' : 'Define New SKU'}</h2>
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
                        ) : lookupLoading ? (
                            <div style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <div style={{ width: '24px', height: '24px', border: '3px solid var(--brand-soft)', borderTop: '3px solid var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>Decoding Barcode...</p>
                            </div>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <input
                                    className={styles.input}
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g. IT-LPT-042"
                                    style={{
                                        paddingRight: '2.5rem',
                                        borderColor: justScanned ? 'var(--success)' : 'var(--border)',
                                        transition: 'all 0.3s'
                                    }}
                                    required
                                />
                                {justScanned && (
                                    <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--success)' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            ✓
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <style jsx>{`
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: '1 1 180px' }}>
                            <label className={styles.label}>Min Stock Level</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formData.minStockLevel}
                                onChange={e => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div style={{ flex: '1 1 180px' }}>
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

                    {!initialData && (
                        <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Initial Stock Allocation</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ flex: '1 1 100px' }}>
                                    <label className={styles.label}>Opening Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className={styles.input}
                                        value={formData.initialStock}
                                        onChange={e => setFormData({ ...formData, initialStock: Number(e.target.value) })}
                                    />
                                </div>
                                <div style={{ flex: '1 1 200px' }}>
                                    <label className={styles.label}>Storage Warehouse</label>
                                    <select
                                        className={styles.input}
                                        value={formData.warehouseId}
                                        onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                                        required={formData.initialStock > 0}
                                    >
                                        <option value="">Select Location...</option>
                                        {warehouses.map(wh => (
                                            <option key={wh.id} value={wh.id}>{wh.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', background: 'var(--surface-2)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <><RefreshCw size={18} className="animate-spin" style={{ marginRight: '8px' }} /> Saving...</>
                            ) : (
                                initialData?.id ? 'Save Changes' : 'Add to Catalog'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
