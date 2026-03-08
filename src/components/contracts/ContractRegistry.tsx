"use client";

import { RefreshCcw, FileText, MoreVertical } from "lucide-react";
import { Contract, ContractStatus } from "@/types";
import tableStyles from "@/components/assets/Assets.module.css";
import styles from "@/components/layout/Layout.module.css";

interface ContractRegistryProps {
    contracts: Contract[];
    onEdit: (contract: Contract) => void;
    onDelete: (id: string) => void;
}

export default function ContractRegistry({ contracts, onEdit, onDelete }: ContractRegistryProps) {
    const getStatusColor = (status: ContractStatus) => {
        switch (status) {
            case 'ACTIVE': return 'var(--success-bg)';
            case 'EXPIRING': return 'var(--warning-bg)';
            case 'RENEGOTIATION': return 'var(--info-bg, var(--brand-soft))';
            case 'EXPIRED': return 'var(--error-bg)';
            case 'TERMINATED': return 'var(--surface-hover)';
            default: return 'var(--surface-hover)';
        }
    };

    const getStatusTextColor = (status: ContractStatus) => {
        switch (status) {
            case 'ACTIVE': return 'var(--success)';
            case 'EXPIRING': return 'var(--warning)';
            case 'RENEGOTIATION': return 'var(--info, var(--brand))';
            case 'EXPIRED': return 'var(--error)';
            case 'TERMINATED': return 'var(--text-secondary)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div className={tableStyles.container}>
            <div className={tableStyles.tableWrapper}>
                <table className={tableStyles.table}>
                    <thead>
                        <tr>
                            <th>Contract Name</th>
                            <th>Vendor</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Expiration</th>
                            <th>Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={tableStyles.empty}>No contracts registered in the repository.</td>
                            </tr>
                        ) : (
                            contracts.map((contract) => (
                                <tr key={contract.id} className={tableStyles.row}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{contract.title}</div>
                                        {contract.autoRenew && (
                                            <span style={{ fontSize: '0.65rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                <RefreshCcw size={10} /> Auto-renews
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{contract.vendorName}</div>
                                    </td>
                                    <td className={styles.mono}>{contract.type}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: getStatusColor(contract.status),
                                            color: getStatusTextColor(contract.status)
                                        }}>
                                            {contract.status}
                                        </span>
                                    </td>
                                    <td style={{ color: contract.status === 'EXPIRING' ? 'var(--warning)' : 'inherit' }}>
                                        {new Date(contract.endDate).toLocaleDateString()}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>
                                        {contract.value.toLocaleString()} {contract.currency}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn"
                                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                onClick={() => onEdit(contract)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn"
                                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--error)' }}
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to remove this contract from the database?")) {
                                                        onDelete(contract.id!);
                                                    }
                                                }}
                                            >
                                                Del
                                            </button>
                                            {contract.attachmentUrl && (
                                                <a
                                                    href={contract.attachmentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn"
                                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <FileText size={14} />
                                                </a>
                                            )}
                                        </div>
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
