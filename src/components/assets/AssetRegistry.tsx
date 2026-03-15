"use client";

import { useState, useEffect, useMemo } from "react";
import { Asset, AssetStatus, AssetCategory } from "@/types";
import { getAssets, updateAsset } from "@/lib/assets";
import { useAuth } from "@/context/AuthContext";
import { 
    Search, Filter, Database, Shield, Zap, 
    Activity, Monitor, Sofa, Truck, MoreHorizontal,
    Box, Wrench, Archive, Trash2, CheckCircle2, Plus, X,
    Calendar, Tag, DollarSign, User as UserIcon, MapPin
} from "lucide-react";
import { formatCurrency } from "@/lib/currencies";
import Loader from "@/components/common/Loader";

const CATEGORY_ICONS: Record<AssetCategory, any> = {
    HARDWARE: Monitor,
    SOFTWARE: Box,
    FURNITURE: Sofa,
    VEHICLE: Truck,
    OTHER: Database
};

const STATUS_COLORS: Record<AssetStatus, { bg: string, text: string, icon: any }> = {
    IN_USE: { bg: 'rgba(0, 171, 85, 0.1)', text: '#00AB55', icon: CheckCircle2 },
    STORAGE: { bg: 'rgba(92, 106, 196, 0.1)', text: '#5C6AC4', icon: Archive },
    MAINTENANCE: { bg: 'rgba(255, 171, 0, 0.1)', text: '#FFAB00', icon: Wrench },
    DISPOSED: { bg: 'rgba(255, 72, 66, 0.1)', text: '#FF4842', icon: Trash2 },
    LOST: { bg: 'rgba(145, 158, 171, 0.1)', text: '#919EAB', icon: Activity }
};

export default function AssetRegistry() {
    const { user } = useAuth();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<AssetStatus | 'ALL'>('ALL');
    const [filterCategory, setFilterCategory] = useState<AssetCategory | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (user) {
            loadAssets();
        }
    }, [user?.tenantId]);

    const loadAssets = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getAssets(user.tenantId, user);
            setAssets(data);
        } catch (error) {
            console.error("Failed to load assets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (assetId: string, newStatus: AssetStatus) => {
        if (!user) return;
        try {
            await updateAsset(user.tenantId, assetId, { status: newStatus }, user);
            await loadAssets();
        } catch (error) {
            alert("Failed to update asset status.");
        }
    };

    const stats = useMemo(() => {
        const totalValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
        const inUseCount = assets.filter(a => a.status === 'IN_USE').length;
        const maintenanceCount = assets.filter(a => a.status === 'MAINTENANCE').length;
        const health = assets.length > 0 ? Math.round(((assets.length - maintenanceCount - assets.filter(a => a.status === 'LOST').length) / assets.length) * 100) : 100;
        return { totalValue, inUseCount, maintenanceCount, health };
    }, [assets]);

    const filteredAssets = assets.filter(asset => {
        const matchesStatus = filterStatus === 'ALL' || asset.status === filterStatus;
        const matchesCategory = filterCategory === 'ALL' || asset.category === filterCategory;
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesCategory && matchesSearch;
    });

    if (loading) return <Loader text="Synchronizing Asset Registry..." />;

    return (
        <div className="animate-in" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Asset Registry</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Full lifecycle tracking from procurement to disposal.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
                        <input 
                            placeholder="Search Serial or Name..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem', width: '240px' }}
                        />
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        style={{ 
                            padding: '0.75rem 1.5rem', borderRadius: '12px', 
                            background: 'var(--brand)', 
                            border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', 
                            gap: '8px', cursor: 'pointer', fontWeight: 900, fontSize: '0.8125rem',
                            boxShadow: '0 8px 16px rgba(232, 87, 42, 0.2)'
                        }}
                    >
                        <Plus size={18} /> Register New Asset
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: "Registry Value", value: formatCurrency(stats.totalValue, 'USD'), icon: Database, color: "var(--brand)" },
                    { label: "Active Pulse", value: stats.inUseCount, sub: "Items in use", icon: Zap, color: "var(--success)" },
                    { label: "Maintenance", value: stats.maintenanceCount, sub: "Needs attention", icon: Wrench, color: "var(--warning)" },
                    { label: "Fleet Health", value: `${stats.health}%`, sub: "Operational", icon: Shield, color: "var(--brand)" },
                ].map((kpi, idx) => (
                    <div key={idx} style={{ 
                        background: 'var(--surface)',
                        border: '1px solid var(--border)', borderRadius: '24px', padding: '1.5rem',
                        position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                            <kpi.icon size={80} color={kpi.color} />
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{kpi.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{kpi.value}</div>
                        <div style={{ fontSize: '0.75rem', color: kpi.color, fontWeight: 700 }}>{kpi.sub}</div>
                    </div>
                ))}
            </div>

            {/* Filters & Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="IN_USE">In Use</option>
                    <option value="STORAGE">Storage</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="DISPOSED">Disposed</option>
                </select>

                <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}
                >
                    <option value="ALL">All Categories</option>
                    <option value="HARDWARE">Hardware</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="FURNITURE">Furniture</option>
                    <option value="VEHICLE">Vehicles</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ 
                background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', 
                borderRadius: '24px', overflow: 'hidden' 
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>Asset Identification</th>
                            <th style={{ textAlign: 'center', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>Category</th>
                            <th style={{ textAlign: 'center', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>Current Status</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>Owner / Location</th>
                            <th style={{ textAlign: 'right', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>Acquisition</th>
                            <th style={{ textAlign: 'right', padding: '1rem 1.5rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map((asset) => {
                            const Icon = CATEGORY_ICONS[asset.category] || Box;
                            const status = STATUS_COLORS[asset.status] || STATUS_COLORS.IN_USE;
                            return (
                                <tr key={asset.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-brand-xsoft">
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                                                <Icon size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{asset.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{asset.serialNumber || 'SN: NO-SERIAL'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>{asset.category}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                            padding: '6px 12px', borderRadius: '10px', background: status.bg, color: status.text,
                                            fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase'
                                        }}>
                                            <status.icon size={12} />
                                            {asset.status.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>{asset.ownerName || 'Pool Asset'}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{asset.location || 'Central Warehouse'}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(asset.purchasePrice, asset.currency)}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(asset.purchaseDate).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <select 
                                            value={asset.status}
                                            onChange={(e) => handleStatusChange(asset.id!, e.target.value as AssetStatus)}
                                            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', outline: 'none', fontSize: '1rem' }}
                                        >
                                            <option value="IN_USE">Activate</option>
                                            <option value="STORAGE">Store</option>
                                            <option value="MAINTENANCE">Service</option>
                                            <option value="DISPOSED">Dispose</option>
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Registration Modal */}
            {showAddModal && (
                <NewAssetModal 
                    onClose={() => setShowAddModal(false)} 
                    onSuccess={() => {
                        setShowAddModal(false);
                        loadAssets();
                    }}
                />
            )}
        </div>
    );
}

function NewAssetModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<Asset>>({
        name: '',
        category: 'HARDWARE',
        status: 'STORAGE',
        purchaseDate: new Date(),
        purchasePrice: 0,
        currency: 'USD',
        serialNumber: '',
        ownerId: '',
        ownerName: '',
        location: '',
        department: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || submitting) return;
        
        if (!formData.name || !formData.category || !formData.purchasePrice) {
            alert("Please fill in all required fields (Name, Category, Price)");
            return;
        }

        setSubmitting(true);
        try {
            const { createAsset } = await import("@/lib/assets");
            await createAsset(formData as Asset, user);
            onSuccess();
        } catch (error) {
            console.error("Failed to register asset:", error);
            alert("Failed to register asset. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', inset: 0, zIndex: 100, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)'
        }}>
            <div className="animate-in" style={{ 
                width: '100%', maxWidth: '600px', borderRadius: '32px', 
                border: '1px solid var(--border)', overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)', background: 'var(--surface)'
            }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Register New Asset</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '4px 0 0' }}>Initialize enterprise infrastructure tracking.</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Name */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Asset Name *</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. MacBook Pro M3 - 2024"
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Category *</label>
                            <select 
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value as any})}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            >
                                <option value="HARDWARE">Hardware</option>
                                <option value="SOFTWARE">Software</option>
                                <option value="FURNITURE">Furniture</option>
                                <option value="VEHICLE">Vehicle</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        {/* Serial Number */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Serial Number</label>
                            <input 
                                value={formData.serialNumber}
                                onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                                placeholder="SN:X827..."
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Acquisition Price *</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
                                <input 
                                    type="number"
                                    required
                                    value={formData.purchasePrice}
                                    onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})}
                                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Department</label>
                            <input 
                                value={formData.department}
                                onChange={e => setFormData({...formData, department: e.target.value})}
                                placeholder="Engineering, Sales..."
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                        <button 
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={submitting}
                            style={{ 
                                flex: 2, padding: '1rem', borderRadius: '14px', 
                                background: 'var(--brand)', 
                                border: 'none', color: '#FFF', fontWeight: 900, cursor: submitting ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 16px rgba(232, 87, 42, 0.2)',
                                opacity: submitting ? 0.7 : 1
                            }}
                        >
                            {submitting ? 'Registering...' : 'Complete Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
