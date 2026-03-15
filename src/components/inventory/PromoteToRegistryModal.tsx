"use client";

import { useState, useEffect } from "react";
import { 
    ItemReceipt, GoodsReceiptLine, Asset, SKU, 
    Warehouse, AppUser, AssetCategory, AssetStatus 
} from "@/types";
import { getWarehouses, getSKUs, promoteReceiptToAsset, promoteReceiptToStock } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import { 
    X, ShieldCheck, Zap, Database, 
    Package, Warehouse as WarehouseIcon, Info, Check 
} from "lucide-react";

interface PromoteToRegistryModalProps {
    receipt: ItemReceipt;
    lineIndex: number;
    onClose: () => void;
    onPromoted: () => void;
}

export const PromoteToRegistryModal: React.FC<PromoteToRegistryModalProps> = ({ 
    receipt, lineIndex, onClose, onPromoted 
}) => {
    const { user } = useAuth();
    const line = receipt.lines[lineIndex];
    const [mode, setMode] = useState<'ASSET' | 'STOCK'>('ASSET');
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [skus, setSkus] = useState<SKU[]>([]);

    // Asset Fields
    const [assetCategory, setAssetCategory] = useState<AssetCategory>('HARDWARE');
    const [serialNumber, setSerialNumber] = useState("");
    const [ownerName, setOwnerName] = useState("");

    // Stock Fields
    const [selectedSKU, setSelectedSKU] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState("");

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user?.tenantId]);

    const loadData = async () => {
        if (!user) return;
        try {
            const [whData, skuData] = await Promise.all([
                getWarehouses(user.tenantId),
                getSKUs(user.tenantId)
            ]);
            setWarehouses(whData);
            setSkus(skuData);
            
            // Auto-select first warehouse
            if (whData.length > 0) setSelectedWarehouse(whData[0].id!);
            
            // Try to match SKU by name/code if possible
            const matchingSku = skuData.find(s => 
                s.name.toLowerCase() === line.description.toLowerCase() || 
                line.description.toLowerCase().includes(s.code.toLowerCase())
            );
            if (matchingSku) setSelectedSKU(matchingSku.id!);
        } catch (error) {
            console.error("Failed to load registry data:", error);
        }
    };

    const handlePromote = async () => {
        if (!user) return;
        setLoading(true);
        try {
            if (mode === 'ASSET') {
                const assetData: Omit<Asset, 'id' | 'createdAt'> = {
                    name: line.description,
                    category: assetCategory,
                    status: 'IN_USE' as AssetStatus,
                    purchaseOrderId: receipt.poId,
                    purchaseDate: new Date(receipt.createdAt),
                    purchasePrice: line.unitPrice,
                    currency: receipt.poCurrency || 'USD',
                    serialNumber,
                    ownerName,
                    department: user.department || "General",
                    location: selectedWarehouse ? warehouses.find(w => w.id === selectedWarehouse)?.name : "HQ",
                };
                await promoteReceiptToAsset(user.tenantId, receipt.id, lineIndex, assetData, user);
            } else {
                const sku = skus.find(s => s.id === selectedSKU);
                const wh = warehouses.find(w => w.id === selectedWarehouse);
                if (!sku || !wh) throw new Error("Please select SKU and Warehouse");

                await promoteReceiptToStock(
                    user.tenantId, receipt.id, lineIndex, 
                    sku.id!, sku.name, wh.id!, wh.name, 
                    line.receivedQty, user
                );
            }
            onPromoted();
        } catch (error: any) {
            alert(error.message || "Failed to promote item.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, 
            background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div style={{
                width: '100%', maxWidth: '540px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '28px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                padding: '2rem',
                color: '#FFF',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '1.5rem', right: '1.5rem',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer'
                }}>
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        padding: '0.75rem', borderRadius: '16px', background: 'rgba(92, 106, 196, 0.2)', color: '#5C6AC4'
                    }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Lifecycle Promotion</h2>
                        <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>
                            Registering: {line.description} ({line.receivedQty} units)
                        </p>
                    </div>
                </div>

                {/* Mode Selector */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button 
                        onClick={() => setMode('ASSET')}
                        style={{
                            flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid',
                            borderColor: mode === 'ASSET' ? '#5C6AC4' : 'rgba(255,255,255,0.1)',
                            background: mode === 'ASSET' ? 'rgba(92, 106, 196, 0.1)' : 'transparent',
                            color: mode === 'ASSET' ? '#FFF' : 'rgba(255,255,255,0.5)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        <Database size={20} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Fixed Asset</span>
                        <span style={{ fontSize: '0.625rem', opacity: 0.6 }}>Laptops, Furniture, Equipment</span>
                    </button>

                    <button 
                        onClick={() => setMode('STOCK')}
                        style={{
                            flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid',
                            borderColor: mode === 'STOCK' ? '#00AB55' : 'rgba(255,255,255,0.1)',
                            background: mode === 'STOCK' ? 'rgba(0, 171, 85, 0.1)' : 'transparent',
                            color: mode === 'STOCK' ? '#FFF' : 'rgba(255,255,255,0.5)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        <Package size={20} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Inventory Stock</span>
                        <span style={{ fontSize: '0.625rem', opacity: 0.6 }}>Stationery, Consumables, Raw Mats</span>
                    </button>
                </div>

                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                    {mode === 'ASSET' ? (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Asset Category</label>
                                <select 
                                    value={assetCategory}
                                    onChange={(e) => setAssetCategory(e.target.value as AssetCategory)}
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', outline: 'none' }}
                                >
                                    <option value="HARDWARE">Hardware (IT, Devices)</option>
                                    <option value="FURNITURE">Furniture & Fixtures</option>
                                    <option value="VEHICLE">Vehicles</option>
                                    <option value="SOFTWARE">Software / Licenses</option>
                                    <option value="OTHER">Other Misc Assets</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Serial Number</label>
                                    <input 
                                        value={serialNumber}
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                        placeholder="e.g. SN-98234-X"
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Assigned Owner</label>
                                    <input 
                                        value={ownerName}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        placeholder="User Name"
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', outline: 'none' }}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Target SKU</label>
                                <select 
                                    value={selectedSKU}
                                    onChange={(e) => setSelectedSKU(e.target.value)}
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', outline: 'none' }}
                                >
                                    <option value="">Select SKU from Catalog...</option>
                                    {skus.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Target Warehouse</label>
                                <select 
                                    value={selectedWarehouse}
                                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', outline: 'none' }}
                                >
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={onClose}
                        style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handlePromote}
                        disabled={loading}
                        style={{ 
                            flex: 1.5, padding: '1rem', borderRadius: '16px', 
                            background: 'linear-gradient(135deg, #5C6AC4 0%, #3f4ead 100%)', 
                            border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            boxShadow: '0 10px 20px rgba(92, 106, 196, 0.3)'
                        }}
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Check size={18} />
                                Confirm Promotion
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};
