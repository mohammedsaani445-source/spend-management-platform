"use client";

import { useState, useMemo } from "react";
import { SKU, Warehouse, StockLevel } from "@/types";
import { Search, Camera, Package, MapPin, X, Info, RefreshCcw, AlertTriangle } from "lucide-react";
import BarcodeScanner from "./BarcodeScanner";
import styles from "@/components/layout/Layout.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";

interface InventoryLookupModalProps {
    skus: SKU[];
    warehouses: Warehouse[];
    levels: StockLevel[];
    onClose: () => void;
}

export default function InventoryLookupModal({ skus, warehouses, levels, onClose }: InventoryLookupModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);

    useScrollLock(true);

    const handleScan = async (code: string) => {
        setLookupLoading(true);
        setScanError(null);
        setSelectedSKU(null);

        // Simulate "database query" for realistic feedback
        await new Promise(resolve => setTimeout(resolve, 600));

        const found = skus.find(s => s.code.toLowerCase() === code.toLowerCase().trim());

        if (found) {
            setSelectedSKU(found);
            setIsScanning(false);
            setSearchQuery("");
        } else {
            setScanError(`No item found for barcode: ${code}`);
            setIsScanning(false);
        }
        setLookupLoading(false);
    };

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return skus.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.code.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5);
    }, [searchQuery, skus]);

    const skuInventory = useMemo(() => {
        if (!selectedSKU) return null;

        const itemLevels = levels.filter(l => l.skuId === selectedSKU.id);
        const total = itemLevels.reduce((sum, curr) => sum + curr.quantity, 0);

        return {
            total,
            breakdown: itemLevels.map(l => ({
                warehouse: warehouses.find(w => w.id === l.warehouseId)?.name || "Unknown Location",
                quantity: l.quantity
            }))
        };
    }, [selectedSKU, levels, warehouses]);

    return (
        <div className="modal-backdrop">
            <div className="modal" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="modal-header">
                    <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={20} color="var(--brand)" />
                        Inventory Lookup
                    </h2>
                    <button onClick={onClose} className="closeButton" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
                </div>

                <div className="modal-body" style={{ minHeight: '400px' }}>

                    {/* Search & Scan Section */}
                    {!isScanning && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Search by SKU or Name..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            if (selectedSKU) setSelectedSKU(null);
                                        }}
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                </div>
                                <button
                                    onClick={() => setIsScanning(true)}
                                    style={{
                                        width: '48px', height: '44px', borderRadius: '10px',
                                        background: 'var(--brand-soft)', color: 'var(--brand)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid var(--brand-light)'
                                    }}
                                    title="Scan Barcode"
                                >
                                    <Camera size={24} />
                                </button>
                            </div>

                            {/* Dropdown Results */}
                            {searchResults.length > 0 && !selectedSKU && (
                                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginTop: '-0.25rem', boxShadow: 'var(--shadow-md)' }}>
                                    {searchResults.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                setSelectedSKU(s);
                                                setSearchQuery("");
                                            }}
                                            style={{ width: '100%', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #f1f5f9', background: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                                        >
                                            <span style={{ fontWeight: 600 }}>{s.name}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.code}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Camera Scanner View */}
                    {isScanning && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Caling Camera Viewfinder...</span>
                                <button onClick={() => setIsScanning(false)} style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 700 }}>Cancel Scan</button>
                            </div>
                            <BarcodeScanner
                                onScan={handleScan}
                                onClose={() => setIsScanning(false)}
                            />
                        </div>
                    )}

                    {/* Inventory Display Section */}
                    {selectedSKU && skuInventory && (
                        <div className="animate-slide-up">
                            <div style={{
                                background: 'white', border: '1px solid var(--border)',
                                borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '12px', background: 'var(--brand-xsoft)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)'
                                    }}>
                                        <Package size={32} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{selectedSKU.name}</h3>
                                        <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                                            <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{selectedSKU.code}</span>
                                            <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{selectedSKU.category}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Units</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand)' }}>{skuInventory.total}</div>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>
                                        <MapPin size={16} color="#64748b" /> Availability per Warehouse
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {skuInventory.breakdown.length === 0 ? (
                                            <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.875rem' }}>
                                                Not stocked in any location.
                                            </div>
                                        ) : (
                                            skuInventory.breakdown.map((item, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '10px'
                                                }}>
                                                    <span style={{ fontWeight: 600, color: '#475569' }}>{item.warehouse}</span>
                                                    <span style={{
                                                        background: 'white', padding: '4px 12px', borderRadius: '6px',
                                                        fontWeight: 800, color: 'var(--brand)', border: '1px solid #e2e8f0'
                                                    }}>{item.quantity} {selectedSKU.unit}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {lookupLoading && (
                        <div style={{ height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <RefreshCcw size={40} className="animate-spin" color="var(--brand)" />
                            <p style={{ marginTop: '1rem', fontWeight: 600 }}>Querying Global Inventory...</p>
                        </div>
                    )}

                    {!selectedSKU && !isScanning && !lookupLoading && (
                        <div style={{
                            height: '250px', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
                            textAlign: 'center', padding: '2rem'
                        }}>
                            {scanError ? (
                                <>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--error)' }}>
                                        <AlertTriangle size={32} />
                                    </div>
                                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--error)' }}>{scanError}</p>
                                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>If this is a new SKU, please register it first.</p>
                                    <button onClick={() => setScanError(null)} style={{ marginTop: '1rem', color: 'var(--brand)', fontWeight: 700, background: 'none', border: 'none' }}>Try Again</button>
                                </>
                            ) : (
                                <>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <Info size={32} />
                                    </div>
                                    <p style={{ margin: 0, fontWeight: 500 }}>Scan a barcode or search for an item below to see detailed warehouse stock.</p>
                                </>
                            )}
                        </div>
                    )}

                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn" style={{ width: '100%', height: '44px' }}>Done</button>
                </div>
            </div>
        </div>
    );
}
