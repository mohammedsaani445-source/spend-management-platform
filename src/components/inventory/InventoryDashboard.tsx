"use client";

import { useState, useEffect, useMemo } from "react";
import { SKU, Warehouse, StockLevel } from "@/types";
import { getSKUs, getWarehouses, getStockLevels, deleteSKU } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import SKUFormModal from "@/components/inventory/SKUFormModal";
import StockAdjustmentModal from "@/components/inventory/StockAdjustmentModal";
import InventoryLookupModal from "@/components/inventory/InventoryLookupModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import WarehouseListModal from "@/components/inventory/WarehouseListModal";
import { 
    Search, ArrowLeftRight, Plus, Edit, Trash2, Home, 
    Database, Zap, Shield, Layers, Package, AlertTriangle 
} from "lucide-react";
import Loader from "@/components/common/Loader";
import { formatCurrency } from "@/lib/currencies";

export default function InventoryDashboard() {
    const { user } = useAuth();
    const [skus, setSkus] = useState<SKU[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [levels, setLevels] = useState<StockLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSKUModal, setShowSKUModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showLookupModal, setShowLookupModal] = useState(false);
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);
    const [editingSKU, setEditingSKU] = useState<SKU | null>(null);
    const [skuToDelete, setSkuToDelete] = useState<SKU | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadData();
    }, [user?.tenantId]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [skuData, whData, levelRecord] = await Promise.all([
                getSKUs(user.tenantId),
                getWarehouses(user.tenantId),
                getStockLevels(user.tenantId)
            ]);

            const flattened: StockLevel[] = [];
            Object.values(levelRecord).forEach(whLevels => {
                Object.values(whLevels).forEach(level => {
                    flattened.push(level);
                });
            });

            setSkus(skuData);
            setWarehouses(whData);
            setLevels(flattened);
        } catch (error) {
            console.error("Failed to load inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSKU = async (sku: SKU) => {
        setSkuToDelete(sku);
    };

    const confirmDelete = async () => {
        if (!user || !skuToDelete) return;
        try {
            await deleteSKU(user.tenantId, skuToDelete.id!);
            setSkuToDelete(null);
            loadData();
        } catch (error) {
            alert("Failed to delete SKU.");
        }
    };

    const getStockForSKU = (skuId: string) => {
        return levels.filter(l => l.skuId === skuId).reduce((sum, curr) => sum + curr.quantity, 0);
    };

    const stats = useMemo(() => {
        const totalStockValue = skus.reduce((sum, sku) => sum + (getStockForSKU(sku.id!) * (sku.unitPrice || 0)), 0);
        const lowStockCount = skus.filter(sku => getStockForSKU(sku.id!) <= sku.minStockLevel).length;
        const totalItems = levels.reduce((sum, l) => sum + l.quantity, 0);
        const warehouseCount = warehouses.length;
        return { totalStockValue, lowStockCount, totalItems, warehouseCount };
    }, [skus, levels, warehouses]);

    const filteredSkus = skus.filter(sku => 
        sku.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sku.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sku.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <Loader text="Synchronizing Inventory Pulse..." />;

    return (
        <div className="animate-in" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Inventory Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Global SKU management and real-time stock orchestration.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setShowLookupModal(true)} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8125rem' }}>
                        <Search size={18} /> Lookup
                    </button>
                    <button onClick={() => setShowWarehouseModal(true)} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8125rem' }}>
                        <Home size={18} /> Locations
                    </button>
                    <button onClick={() => setShowStockModal(true)} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'var(--brand-soft)', border: '1px solid var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8125rem' }}>
                        <ArrowLeftRight size={18} /> Movement
                    </button>
                    <button onClick={() => setShowSKUModal(true)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'var(--brand)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 900, fontSize: '0.8125rem', boxShadow: '0 8px 16px rgba(232, 87, 42, 0.2)' }}>
                        <Plus size={18} /> New SKU
                    </button>
                </div>
            </div>

            {/* KPI Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: "Inventory Value", value: formatCurrency(stats.totalStockValue, 'USD'), icon: Database, color: "var(--brand)" },
                    { label: "Low Stock Alert", value: stats.lowStockCount, sub: "Items below min", icon: AlertTriangle, color: stats.lowStockCount > 0 ? "var(--error)" : "var(--text-disabled)" },
                    { label: "Total Volume", value: stats.totalItems, sub: "Units in stock", icon: Layers, color: "var(--success)" },
                    { label: "Active Hubs", value: stats.warehouseCount, sub: "Warehouses", icon: Home, color: "var(--brand)" },
                ].map((s, i) => (
                    <div key={i} style={{ 
                        background: 'var(--surface)',
                        border: '1px solid var(--border)', borderRadius: '24px', padding: '1.5rem',
                        position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                            <s.icon size={80} color={s.color} />
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{s.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
                        <div style={{ fontSize: '0.75rem', color: s.color, fontWeight: 700 }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* List Control */}
            <div style={{ 
                background: 'var(--surface)', border: '1px solid var(--border)', 
                borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
                        <input 
                            placeholder="Filter Catalog..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '0.6rem 1rem 0.6rem 2.25rem', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.8125rem', width: '280px' }}
                        />
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-2)' }}>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>Item Specification</th>
                            <th style={{ textAlign: 'center', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>Category</th>
                            <th style={{ textAlign: 'center', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>Total Available</th>
                            <th style={{ textAlign: 'center', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>Safety Stock</th>
                            <th style={{ textAlign: 'right', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>Warehouse Breakdown</th>
                            <th style={{ textAlign: 'right', padding: '1rem 1.5rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSkus.map(sku => {
                            const total = getStockForSKU(sku.id!);
                            const isLow = total <= sku.minStockLevel;
                            const itemLevels = levels.filter(l => l.skuId === sku.id);

                            return (
                                <tr key={sku.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-brand-xsoft">
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{sku.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{sku.code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>{sku.category}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.125rem', fontWeight: 900, color: isLow ? 'var(--error)' : 'var(--text-primary)' }}>{total}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', fontWeight: 800 }}>{sku.unit}</div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 700 }}>MIN: {sku.minStockLevel}</div>
                                        {isLow && (
                                            <div style={{ color: 'var(--error)', fontSize: '0.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center', marginTop: '4px' }}>
                                                <AlertTriangle size={10} /> CRITICAL
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            {itemLevels.map(l => {
                                                const wh = warehouses.find(w => w.id === l.warehouseId);
                                                return (
                                                    <span key={l.warehouseId} style={{ fontSize: '0.65rem', background: 'var(--surface-2)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                                        {wh?.name}: <b>{l.quantity}</b>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => setEditingSKU(sku)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <Edit size={14} />
                                            </button>
                                            <button onClick={() => handleDeleteSKU(sku)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--error-bg)', background: 'var(--error-bg)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {showSKUModal && <SKUFormModal warehouses={warehouses} onClose={() => setShowSKUModal(false)} onSaved={() => { setShowSKUModal(false); loadData(); }} />}
            {editingSKU && (
                <SKUFormModal
                    initialData={editingSKU}
                    warehouses={warehouses}
                    onClose={() => setEditingSKU(null)}
                    onSaved={() => { setEditingSKU(null); loadData(); }}
                />
            )}
            {showLookupModal && (
                <InventoryLookupModal
                    skus={skus}
                    warehouses={warehouses}
                    levels={levels}
                    onClose={() => setShowLookupModal(false)}
                />
            )}
            {skuToDelete && (
                <ConfirmationModal
                    isOpen={!!skuToDelete}
                    title="Confirm SKU Deletion"
                    message={`Are you sure you want to delete "${skuToDelete.name}"? This action cannot be undone and will remove the item from the catalog.`}
                    confirmLabel="Delete Item"
                    cancelLabel="Keep SKU"
                    type="danger"
                    onConfirm={confirmDelete}
                    onCancel={() => setSkuToDelete(null)}
                />
            )}
            {showStockModal && (
                <StockAdjustmentModal
                    skus={skus}
                    warehouses={warehouses}
                    levels={levels}
                    onClose={() => setShowStockModal(false)}
                    onSaved={() => { setShowStockModal(false); loadData(); }}
                />
            )}
            {showWarehouseModal && (
                <WarehouseListModal
                    warehouses={warehouses}
                    onClose={() => setShowWarehouseModal(false)}
                    onRefresh={loadData}
                />
            )}
        </div>
    );
}
