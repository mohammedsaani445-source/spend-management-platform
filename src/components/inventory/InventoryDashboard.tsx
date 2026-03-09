"use client";

import { useState, useEffect } from "react";
import { SKU, Warehouse, StockLevel } from "@/types";
import { getSKUs, getWarehouses, getStockLevels } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import SKUFormModal from "@/components/inventory/SKUFormModal";
import StockAdjustmentModal from "@/components/inventory/StockAdjustmentModal";
import InventoryLookupModal from "@/components/inventory/InventoryLookupModal";
import styles from "@/components/layout/Layout.module.css";
import tableStyles from "@/components/assets/Assets.module.css";
import { Search, ArrowLeftRight, Plus } from "lucide-react";

export default function InventoryDashboard() {
    const { user } = useAuth();
    const [skus, setSkus] = useState<SKU[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [levels, setLevels] = useState<StockLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSKUModal, setShowSKUModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showLookupModal, setShowLookupModal] = useState(false);

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
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowLookupModal(true)}>
                        <Search size={18} /> Quick Lookup
                    </button>
                    <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowStockModal(true)}>
                        <ArrowLeftRight size={18} /> Stock Movement
                    </button>
                    <button className={styles.primaryButton} style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowSKUModal(true)}>
                        <Plus size={18} /> New SKU
                    </button>
                </div>
            </div>

            <div className={tableStyles.container}>
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
                            </tr>
                        </thead>
                        <tbody>
                            {skus.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={tableStyles.empty}>No items in inventory catalog.</td>
                                </tr>
                            ) : (
                                skus.map(sku => {
                                    const total = getStockForSKU(sku.id!);
                                    const isLow = total <= sku.minStockLevel;
                                    const itemLevels = levels.filter(l => l.skuId === sku.id);

                                    return (
                                        <tr key={sku.id} className={tableStyles.row}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{sku.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sku.code}</div>
                                            </td>
                                            <td>{sku.category}</td>
                                            <td style={{ fontWeight: 700, fontSize: '1.1rem' }}>{total} {sku.unit}</td>
                                            <td style={{ color: '#64748b' }}>{sku.minStockLevel}</td>
                                            <td>
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
                                            <td>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
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
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showSKUModal && <SKUFormModal onClose={() => setShowSKUModal(false)} onSaved={() => { setShowSKUModal(false); loadData(); }} />}
            {showLookupModal && (
                <InventoryLookupModal
                    skus={skus}
                    warehouses={warehouses}
                    levels={levels}
                    onClose={() => setShowLookupModal(false)}
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
        </div>
    );
}
