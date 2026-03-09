"use client";

import { useState, useEffect } from "react";
import { SKU, Warehouse, StockLevel } from "@/types";
import { getSKUs, getWarehouses, getStockLevels, deleteSKU } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import SKUFormModal from "@/components/inventory/SKUFormModal";
import StockAdjustmentModal from "@/components/inventory/StockAdjustmentModal";
import InventoryLookupModal from "@/components/inventory/InventoryLookupModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import WarehouseListModal from "@/components/inventory/WarehouseListModal";
import styles from "@/components/layout/Layout.module.css";
import tableStyles from "@/components/assets/Assets.module.css";
import { Search, ArrowLeftRight, Plus, Edit, Trash2, Home } from "lucide-react";

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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [skuData, whData, levelRecord] = await Promise.all([
                getSKUs(user.tenantId),
                getWarehouses(user.tenantId),
                getStockLevels(user.tenantId)
            ]);

            // Flatten Records: {warehouseId: {skuId: StockLevel}} -> StockLevel[]
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

    if (loading) return <div style={{ padding: '2rem' }}>Loading inventory...</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Inventory Management</h1>
                    <p className={styles.pageSubtitle}>Real-time tracking of SKUs and stock levels across all locations.</p>
                </div>
                <div className="mobile-action-grid">
                    <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowLookupModal(true)}>
                        <Search size={18} /> Quick Lookup
                    </button>
                    <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowWarehouseModal(true)}>
                        <Home size={18} /> Warehouses
                    </button>
                    <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowStockModal(true)}>
                        <ArrowLeftRight size={18} /> Movement
                    </button>
                    <button className={styles.primaryButton} style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowSKUModal(true)}>
                        <Plus size={18} /> New SKU
                    </button>
                </div>
            </div>

            <div className={`${tableStyles.container} responsive-table`}>
                <div className={tableStyles.tableWrapper}>
                    <table className={tableStyles.table}>
                        <thead>
                            <tr>
                                <th>Item / SKU</th>
                                <th>Category</th>
                                <th>Total Stock</th>
                                <th>Min. Level</th>
                                <th>Status</th>
                                <th>Locations</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {skus.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={tableStyles.empty}>No items in inventory catalog.</td>
                                </tr>
                            ) : (
                                skus.map(sku => {
                                    const total = getStockForSKU(sku.id!);
                                    const isLow = total <= sku.minStockLevel;
                                    const itemLevels = levels.filter(l => l.skuId === sku.id);

                                    return (
                                        <tr key={sku.id} className={tableStyles.row}>
                                            <td data-label="Item / SKU">
                                                <div style={{ fontWeight: 600 }}>{sku.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sku.code}</div>
                                            </td>
                                            <td data-label="Category">{sku.category}</td>
                                            <td data-label="Total Stock" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{total} {sku.unit}</td>
                                            <td data-label="Min. Level" style={{ color: '#64748b' }}>{sku.minStockLevel}</td>
                                            <td data-label="Status">
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '99px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    background: isLow ? '#fee2e2' : '#dcfce7',
                                                    color: isLow ? '#991b1b' : '#166534'
                                                }}>
                                                    {isLow ? 'LOW STOCK' : 'IN STOCK'}
                                                </span>
                                            </td>
                                            <td data-label="Locations">
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                    {itemLevels.map(l => {
                                                        const wh = warehouses.find(w => w.id === l.warehouseId);
                                                        return (
                                                            <span key={l.warehouseId} style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                                                {wh?.name}: {l.quantity}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td data-label="Actions">
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => setEditingSKU(sku)}
                                                        title="Edit SKU"
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '8px',
                                                            border: '1px solid #e2e8f0', background: '#fff',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#2563eb', cursor: 'pointer', transition: 'all 0.2s',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSKU(sku)}
                                                        title="Delete SKU"
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '8px',
                                                            border: '1px solid #fee2e2', background: '#fff',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#dc2626', cursor: 'pointer', transition: 'all 0.2s',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                        }}
                                                        onMouseOver={e => {
                                                            e.currentTarget.style.background = '#fef2f2';
                                                            e.currentTarget.style.borderColor = '#fecaca';
                                                        }}
                                                        onMouseOut={e => {
                                                            e.currentTarget.style.background = '#fff';
                                                            e.currentTarget.style.borderColor = '#fee2e2';
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
