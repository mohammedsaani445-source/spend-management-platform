"use client";

import { useState, useEffect } from "react";
import { Contract, Vendor } from "@/types";
import { getContracts, deleteContract, getExpiringContracts } from "@/lib/contracts";
import { getVendors } from "@/lib/vendors";
import { useAuth } from "@/context/AuthContext";
import ContractRegistry from "@/components/contracts/ContractRegistry";
import ContractFormModal from "@/components/contracts/ContractFormModal";
import styles from "@/components/layout/Layout.module.css";
import tableStyles from "@/components/assets/Assets.module.css";

export default function ContractsPage() {
    const { user } = useAuth();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | undefined>(undefined);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [contractsData, coreVendors] = await Promise.all([
                getContracts(user.tenantId),
                getVendors(user.tenantId)
            ]);
            setContracts(contractsData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
            setVendors(coreVendors);
        } catch (error) {
            console.error("Error loading contracts page data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!user) return;
        try {
            await deleteContract(user.tenantId, id, user);
            loadData();
        } catch (error) {
            alert("Failed to delete contract.");
        }
    };

    const expiringSoon = getExpiringContracts(contracts, 60);

    if (loading) return <div style={{ padding: '2rem' }}>Loading contract repository...</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Contract Repository</h1>
                    <p className={styles.pageSubtitle}>Centralized management of MSAs, SOWs, and legal agreements.</p>
                </div>
                <button
                    className={styles.primaryButton}
                    onClick={() => {
                        setEditingContract(undefined);
                        setShowModal(true);
                    }}
                >
                    <span>📄</span> Register Contract
                </button>
            </div>

            {/* Expiring Alerts */}
            {expiringSoon.length > 0 && (
                <div style={{
                    background: 'var(--warning-bg)',
                    border: '1px solid var(--warning)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: 700, color: 'var(--warning)' }}>{expiringSoon.length} Contracts Expiring Soon</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
                            Ensure renegotiations are started for: {expiringSoon.map(c => c.title).slice(0, 3).join(', ')}
                            {expiringSoon.length > 3 && ` and ${expiringSoon.length - 3} others.`}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <ContractRegistry
                    contracts={contracts}
                    onEdit={(c) => {
                        setEditingContract(c);
                        setShowModal(true);
                    }}
                    onDelete={handleDelete}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>💡 Legal & Compliance</h3>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <p>All contract changes are automatically logged in the system's Audit Trail for SOX and SOC2 compliance.</p>
                            <p><strong>Pro Tip:</strong> Link SOWs to specific Purchase Orders in the PO notes for better spend visibility.</p>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--brand-soft)', border: '1px solid var(--border)', borderTop: '4px solid var(--brand)' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--brand)' }}>Contract Stats</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem' }}>Total Active</span>
                            <span style={{ fontWeight: 700 }}>{contracts.filter(c => c.status === 'ACTIVE').length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '0.8rem' }}>Expiring Soon</span>
                            <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{expiringSoon.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <ContractFormModal
                    contract={editingContract}
                    vendors={vendors}
                    onClose={() => setShowModal(false)}
                    onSaved={() => {
                        setShowModal(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}
