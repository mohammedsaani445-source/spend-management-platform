"use client";

import { useState, useMemo } from "react";
import { SKU, Warehouse, StockLevel } from "@/types";
import { adjustStock } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Plus, Minus, ArrowRight, Package, AlertCircle, CheckCircle2, RefreshCw, Camera } from "lucide-react";
import BarcodeScanner from "./BarcodeScanner";

interface StockAdjustmentModalProps {
    skus: SKU[];
    warehouses: Warehouse[];
    levels: StockLevel[];
    onClose: () => void;
    onSaved: () => void;
}

const PRESET_REASONS = [
    "New Shipment Received",
    "Customer Return",
    "Cycle Count Adjustment",
    "Damaged / Scrapped",
    "Promotional Issue",
    "Internal Project Use",
    "Warehouse Transfer"
];

export default function StockAdjustmentModal({ skus, warehouses, levels, onClose, onSaved }: StockAdjustmentModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"INBOUND" | "OUTBOUND">("INBOUND");
    const [isScanning, setIsScanning] = useState(false);

    useScrollLock(true);
    const [formData, setFormData] = useState({
        skuId: "",
        warehouseId: "",
        quantity: 1,
        reason: ""
    });
    const [scanError, setScanError] = useState<string | null>(null);
    const [lookupLoading, setLookupLoading] = useState(false);

    const currentStock = useMemo(() => {
        if (!formData.skuId || !formData.warehouseId) return 0;
        const level = levels.find(l => l.skuId === formData.skuId && l.warehouseId === formData.warehouseId);
        return level ? level.quantity : 0;
    }, [formData.skuId, formData.warehouseId, levels]);

    const projectedStock = useMemo(() => {
        const delta = mode === "INBOUND" ? formData.quantity : -formData.quantity;
        return Math.max(0, currentStock + delta);
    }, [currentStock, formData.quantity, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !formData.skuId || !formData.warehouseId) return;

        const sku = skus.find(s => s.id === formData.skuId);
        const wh = warehouses.find(w => w.id === formData.warehouseId);

        if (!sku || !wh) return;

        setLoading(true);
        try {
            const finalQty = mode === "INBOUND" ? formData.quantity : -formData.quantity;
            await adjustStock(
                user.tenantId,
                formData.skuId,
                sku.name,
                formData.warehouseId,
                wh.name,
                finalQty,
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

    const handleQuickScan = async (code: string) => {
        setLookupLoading(true);
        setScanError(null);

        // Simulate "database query" for realistic feedback
        await new Promise(resolve => setTimeout(resolve, 500));

        const match = skus.find(s => s.code.toLowerCase() === code.toLowerCase().trim());
        if (match) {
            setFormData({ ...formData, skuId: match.id! });
            setIsScanning(false);
            setLookupLoading(false);
            return true;
        }

        setScanError(`Barcode not found: ${code}`);
        setLookupLoading(false);
        return false;
    };

    return (
        <div className="modal-backdrop">
            <div className="modal" style={{ maxWidth: '520px' }}>
                <div className="modal-header">
                    <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Inventory Quick Scan
                    </h2>
                    <button onClick={onClose} className="closeButton" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
                </div>

                <div className="modal-body" style={{ padding: 0 }}>
                    {/* Header Mode Toggle */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
                        <button
                            type="button"
                            onClick={() => setMode("INBOUND")}
                            style={{
                                flex: 1, padding: '1.25rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                background: mode === "INBOUND" ? '#dcfce7' : '#fff',
                                color: mode === "INBOUND" ? '#166534' : '#64748b',
                                fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Plus size={18} /> INBOUND / RECEIVE
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("OUTBOUND")}
                            style={{
                                flex: 1, padding: '1.25rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                background: mode === "OUTBOUND" ? '#fee2e2' : '#fff',
                                color: mode === "OUTBOUND" ? '#991b1b' : '#64748b',
                                fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Minus size={18} /> OUTBOUND / ISSUE
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>

                        {/* Quick Scan Barcode Area */}
                        <div style={{
                            marginBottom: '1.5rem', padding: '1rem',
                            background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    🚀 Barcode / Quick Scan
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsScanning(!isScanning)}
                                    style={{
                                        fontSize: '0.65rem', color: isScanning ? '#e11d48' : 'var(--brand)',
                                        background: '#fff', padding: '2px 8px', borderRadius: '6px',
                                        border: '1px solid #e2e8f0', fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}
                                >
                                    <Camera size={14} /> {isScanning ? "Cancel Scan" : "Use Camera"}
                                </button>
                            </div>

                            {isScanning ? (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <BarcodeScanner
                                        onScan={handleQuickScan}
                                        onClose={() => setIsScanning(false)}
                                    />
                                </div>
                            ) : lookupLoading ? (
                                <div style={{ padding: '1rem', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <RefreshCw size={24} className="animate-spin" color="var(--brand)" />
                                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>Locating SKU...</p>
                                </div>
                            ) : (
                                <>
                                    <input
                                        className={styles.input}
                                        placeholder="Scan SKU barcode..."
                                        autoFocus
                                        style={{ background: '#fff', borderColor: scanError ? 'var(--error)' : '#e2e8f0' }}
                                        onChange={async (e) => {
                                            const val = e.target.value;
                                            if (val.length > 5) { // Assuming barcodes are usually longer
                                                await handleQuickScan(val);
                                            }
                                        }}
                                    />
                                    {scanError && (
                                        <p style={{ color: 'var(--error)', fontSize: '0.7rem', marginTop: '0.4rem', fontWeight: 700 }}>
                                            ⚠️ {scanError}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className={styles.label}>Inventory Item</label>
                                <select
                                    className={styles.input}
                                    value={formData.skuId}
                                    onChange={e => setFormData({ ...formData, skuId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Item...</option>
                                    {skus.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={styles.label}>Location</label>
                                <select
                                    className={styles.input}
                                    value={formData.warehouseId}
                                    onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Site...</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Industrial Quantity Control */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className={styles.label}>Adjustment Quantity</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setFormData(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                                    style={{ width: '48px', height: '48px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                                >
                                    <Minus size={20} />
                                </button>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, height: '48px' }}
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: Math.max(1, Number(e.target.value)) })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData(f => ({ ...f, quantity: f.quantity + 1 }))}
                                    style={{ width: '48px', height: '48px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Stock Impact Preview Card */}
                        {formData.skuId && formData.warehouseId && (
                            <div style={{
                                background: mode === "INBOUND" ? '#f0fdf4' : '#fff1f2',
                                padding: '1rem', borderRadius: '12px', border: '1px solid',
                                borderColor: mode === "INBOUND" ? '#bbf7d0' : '#fecaca',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: mode === "INBOUND" ? '#166534' : '#991b1b', textTransform: 'uppercase' }}>Current</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{currentStock}</div>
                                </div>
                                <ArrowRight size={20} style={{ color: '#94a3b8' }} />
                                <div style={{ textAlign: 'center', padding: '0 1rem', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: mode === "INBOUND" ? '#166534' : '#991b1b', textTransform: 'uppercase' }}>Adjustment</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: mode === "INBOUND" ? '#059669' : '#e11d48' }}>
                                        {mode === "INBOUND" ? "+" : "-"}{formData.quantity}
                                    </div>
                                </div>
                                <ArrowRight size={20} style={{ color: '#94a3b8' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: mode === "INBOUND" ? '#166534' : '#991b1b', textTransform: 'uppercase' }}>New Balance</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{projectedStock}</div>
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className={styles.label}>Movement Reason</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                                {PRESET_REASONS.map(r => (
                                    <button
                                        key={r} type="button"
                                        onClick={() => setFormData({ ...formData, reason: r })}
                                        style={{
                                            fontSize: '0.65rem', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0',
                                            background: formData.reason === r ? '#475569' : '#fff',
                                            color: formData.reason === r ? '#fff' : '#475569',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <input
                                className={styles.input}
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Specify reason..."
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" className="btn" style={{ flex: 1 }} onClick={onClose}>Discard</button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ flex: 2, background: mode === "INBOUND" ? '#059669' : '#e11d48', border: 'none' }}
                                disabled={loading}
                            >
                                {loading ? <RefreshCw size={18} className="animate-spin" /> : (
                                    <><CheckCircle2 size={18} style={{ marginRight: '8px' }} /> Commit Movement</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
