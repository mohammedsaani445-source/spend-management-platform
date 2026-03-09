"use client";

import { useState } from "react";
import { Warehouse } from "@/types";
import { deleteWarehouse } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/layout/Layout.module.css";
import tableStyles from "@/components/assets/Assets.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Plus, Edit, Trash2, MapPin, X } from "lucide-react";
import WarehouseFormModal from "./WarehouseFormModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface WarehouseListModalProps {
    warehouses: Warehouse[];
    onClose: () => void;
    onRefresh: () => void;
}

export default function WarehouseListModal({ warehouses, onClose, onRefresh }: WarehouseListModalProps) {
    const { user } = useAuth();
    const [editingWH, setEditingWH] = useState<Warehouse | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [whToDelete, setWhToDelete] = useState<Warehouse | null>(null);

    useScrollLock(true);

    const handleDelete = async () => {
        if (!user || !whToDelete) return;
        try {
            await deleteWarehouse(user.tenantId, whToDelete.id!);
            setWhToDelete(null);
            onRefresh();
        } catch (error) {
            alert("Failed to delete warehouse.");
        }
    };

    return (
        <>
            <div className="modal-backdrop" style={{ zIndex: 1050 }}>
                <div className="modal" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'var(--brand-soft)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <MapPin size={18} style={{ color: 'var(--brand)' }} />
                            </div>
                            <h2 className="modal-title">Storage Locations (Warehouses)</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }} onClick={() => setShowCreateModal(true)}>
                                <Plus size={14} style={{ marginRight: '4px' }} /> Add New
                            </button>
                            <button onClick={onClose} className="closeButton" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                        <div className={tableStyles.container} style={{ border: 'none', boxShadow: 'none' }}>
                            <div className={tableStyles.tableWrapper}>
                                <table className={tableStyles.table}>
                                    <thead>
                                        <tr>
                                            <th>Warehouse / Address</th>
                                            <th>Manager</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {warehouses.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className={tableStyles.empty}>No warehouses defined.</td>
                                            </tr>
                                        ) : (
                                            warehouses.map(wh => (
                                                <tr key={wh.id} className={tableStyles.row}>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>{wh.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{wh.address}</div>
                                                    </td>
                                                    <td>{wh.managerName || '-'}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                                                            background: wh.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                                                            color: wh.status === 'ACTIVE' ? '#166534' : '#64748b'
                                                        }}>
                                                            {wh.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => setEditingWH(wh)}
                                                                title="Edit"
                                                                style={{ width: '28px', height: '28px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', cursor: 'pointer', color: '#2563eb' }}
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => setWhToDelete(wh)}
                                                                title="Delete"
                                                                style={{ width: '28px', height: '28px', border: '1px solid #fee2e2', background: '#fff', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {(showCreateModal || editingWH) && (
                <WarehouseFormModal
                    initialData={editingWH || undefined}
                    onClose={() => { setShowCreateModal(false); setEditingWH(null); }}
                    onSaved={() => { setShowCreateModal(false); setEditingWH(null); onRefresh(); }}
                />
            )}

            {whToDelete && (
                <ConfirmationModal
                    isOpen={!!whToDelete}
                    title="Delete Warehouse"
                    message={`Are you sure you want to delete "${whToDelete.name}"? This action cannot be undone.`}
                    type="danger"
                    onConfirm={handleDelete}
                    onCancel={() => setWhToDelete(null)}
                />
            )}
        </>
    );
}
