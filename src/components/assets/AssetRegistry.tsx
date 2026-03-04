"use client";

import { useState, useEffect } from "react";
import { Asset, AssetStatus, AssetCategory } from "@/types";
import { getAssets, updateAsset } from "@/lib/assets";
import { useAuth } from "@/context/AuthContext";
import styles from "./Assets.module.css";

export default function AssetRegistry() {
    const { user } = useAuth();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<AssetStatus | 'ALL'>('ALL');
    const [filterCategory, setFilterCategory] = useState<AssetCategory | 'ALL'>('ALL');

    useEffect(() => {
        if (user) {
            loadAssets();
        }
    }, [user?.uid]);

    const loadAssets = async () => {
        if (!user) return;
        setLoading(true);
        const data = await getAssets(user.tenantId, user);
        setAssets(data);
        setLoading(false);
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

    const filteredAssets = assets.filter(asset => {
        const matchesStatus = filterStatus === 'ALL' || asset.status === filterStatus;
        const matchesCategory = filterCategory === 'ALL' || asset.category === filterCategory;
        return matchesStatus && matchesCategory;
    });

    if (loading) return <div className={styles.loading}>Loading assets...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Asset Registry</h2>
                <div className={styles.filters}>
                    <select
                        className={styles.select}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="IN_USE">In Use</option>
                        <option value="STORAGE">Storage</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="DISPOSED">Disposed</option>
                    </select>

                    <select
                        className={styles.select}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value as any)}
                    >
                        <option value="ALL">All Categories</option>
                        <option value="HARDWARE">Hardware</option>
                        <option value="SOFTWARE">Software</option>
                        <option value="FURNITURE">Furniture</option>
                        <option value="VEHICLE">Vehicle</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Asset Name</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Serial Number</th>
                            <th>Owner</th>
                            <th>Purchased</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={styles.empty}>No assets found.</td>
                            </tr>
                        ) : (
                            filteredAssets.map(asset => (
                                <tr key={asset.id} className={styles.row}>
                                    <td className={styles.nameCell}>
                                        <div className={styles.assetName}>{asset.name}</div>
                                        <div className={styles.assetSubtext}>PO: {asset.purchaseOrderId || 'Manual'}</div>
                                    </td>
                                    <td>
                                        <span className={styles.categoryBadge}>{asset.category}</span>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[asset.status]}`}>
                                            {asset.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className={styles.mono}>{asset.serialNumber || 'N/A'}</td>
                                    <td>{asset.ownerName || 'Unassigned'}</td>
                                    <td>{new Date(asset.purchaseDate).toLocaleDateString()}</td>
                                    <td>
                                        <select
                                            className={styles.actionSelect}
                                            value={asset.status}
                                            onChange={(e) => handleStatusChange(asset.id!, e.target.value as AssetStatus)}
                                        >
                                            <option value="IN_USE">Mark In Use</option>
                                            <option value="STORAGE">Move to Storage</option>
                                            <option value="MAINTENANCE">Maintenance</option>
                                            <option value="DISPOSED">Dispose</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
