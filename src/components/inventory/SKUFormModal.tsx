"use client";

import { useState } from "react";
import { SKU, Warehouse } from "@/types";
import { createSKU, logInventoryAction, updateSKU } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import Portal from "@/components/common/Portal";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Camera, RefreshCw } from "lucide-react";
import BarcodeScanner from "./BarcodeScanner";

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
        await new Promise(resolve => setTimeout(resolve, 400));
        setFormData({ ...formData, code });
        setLookupLoading(false);
        setIsScanning(false);
        setJustScanned(true);
        setTimeout(() => setJustScanned(false), 2000);
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
        <Portal>
            <div className="modal-backdrop" style={{ animation: "fadeIn 0.2s ease-out" }}>
                <div className="modal" style={{ maxWidth: '500px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: "slideUp 0.3s ease-out", padding: 0, overflow: 'hidden' }}>
                    <div className="modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0 }}>
                        <h2 className="modal-title" style={{ margin: 0, fontSize: "1.25rem" }}>{initialData?.id ? 'Edit SKU Details' : 'Define New SKU'}</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>&times;</button>
                    </div>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                            
                            <div style={{ marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <label className={styles.label} style={{ marginBottom: 0 }}>SKU / Barcode</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsScanning(!isScanning)}
                                        style={{ fontSize: '0.7rem', color: isScanning ? 'var(--error)' : 'var(--brand)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        {isScanning ? "Cancel Scan" : "Toggle Camera"}
                                    </button>
                                </div>
                                {isScanning ? (
                                    <BarcodeScanner onScan={handleScan} onClose={() => setIsScanning(false)} />
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className={styles.input}
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                                            placeholder="Scan or type barcode..."
                                            required
                                            style={{ transition: 'all 0.3s', borderColor: justScanned ? 'var(--success)' : (scanError ? 'var(--error)' : 'inherit') }}
                                        />
                                        {lookupLoading && (
                                            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                                                <RefreshCw size={16} className="animate-spin" color="var(--brand)" />
                                            </div>
                                        )}
                                        {justScanned && (
                                            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>
                                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    ✓
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!initialData?.id && (
                                <div style={{ background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Initial Stock Placement</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ flex: '1 1 120px' }}>
                                            <label className={styles.label}>Quantity</label>
                                            <input
                                                type="number"
                                                className={styles.input}
                                                value={formData.initialStock}
                                                onChange={e => setFormData({ ...formData, initialStock: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div style={{ flex: '1 2 180px' }}>
                                            <label className={styles.label}>Receiving Warehouse</label>
                                            <select
                                                className={styles.input}
                                                value={formData.warehouseId}
                                                onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                                            >
                                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className={styles.label}>Product Name</label>
                                <input
                                    className={styles.input}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Dell Latitude 5420"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
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

                            <div>
                                <label className={styles.label}>Description</label>
                                <textarea
                                    className={styles.input}
                                    style={{ minHeight: '80px', resize: 'vertical' }}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Technical specs, model numbers, etc."
                                />
                            </div>

                        </div>

                        <div className="modal-footer" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '130px' }}>
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
        </Portal>
    );
}

const scanError = false; // Internal flag for style logic
