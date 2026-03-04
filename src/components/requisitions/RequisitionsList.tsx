"use client";

import { useEffect, useState } from "react";
import { Requisition } from "@/types";
import { subscribeToRequisitions } from "@/lib/requisitions";
import Link from "next/link";
import { formatCurrency } from "@/lib/currencies";
import RequisitionDetailModal from "@/components/requisitions/RequisitionDetailModal";
import { useRouter } from "next/navigation";
import { getVendors } from "@/lib/vendors";
import CreateRFPModal from "@/components/sourcing/CreateRFPModal";
import { Vendor } from "@/types";
import { useAuth } from "@/context/AuthContext";

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { bg: string; color: string }> = {
        PENDING: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
        APPROVED: { bg: 'var(--success-soft)', color: 'var(--success)' },
        REJECTED: { bg: 'var(--error-bg)', color: 'var(--error)' },
        ORDERED: { bg: 'var(--info-bg)', color: 'var(--info)' },
        DRAFT: { bg: 'var(--background)', color: 'var(--text-secondary)' },
    };
    const s = map[status] || { bg: 'var(--background)', color: 'var(--text-secondary)' };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
            borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
            background: s.bg, color: s.color, letterSpacing: '0.02em'
        }}>
            {status}
        </span>
    );
}

export default function RequisitionsList() {
    const router = useRouter();
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);
    const [showRFPModal, setShowRFPModal] = useState(false);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        getVendors(user.tenantId).then(setVendors);
    }, [user?.tenantId]);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToRequisitions(user, (data) => {
            if (data) setRequisitions(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filtered = filterStatus === 'ALL' ? requisitions : requisitions.filter(r => r.status === filterStatus);

    if (loading) return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                Loading requisitions...
            </div>
        </div>
    );

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Purchase Requisitions</h1>
                    <p className="page-subtitle">Manage and track all purchase requests across your organization</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link href="/dashboard/requisitions/new" className="btn btn-primary">
                        + New Request
                    </Link>
                </div>
            </div>

            {/* Stat strip */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total', value: requisitions.length, color: 'var(--brand)', bg: 'var(--brand-soft)' },
                    { label: 'Pending', value: requisitions.filter(r => r.status === 'PENDING').length, color: 'var(--warning)', bg: 'var(--warning-bg)' },
                    { label: 'Approved', value: requisitions.filter(r => r.status === 'APPROVED').length, color: 'var(--success)', bg: 'var(--success-soft)' },
                    { label: 'Rejected', value: requisitions.filter(r => r.status === 'REJECTED').length, color: 'var(--error)', bg: 'var(--error-bg)' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'white', border: '1px solid var(--border)', borderRadius: '10px',
                        padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: '120px'
                    }}>
                        <div style={{ width: '36px', height: '36px', background: s.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontWeight: 700, fontSize: '1rem' }}>
                            {s.value}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter row */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'ORDERED'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={filterStatus === s ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
                        {s === 'ALL' ? 'All' : s[0] + s.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <h3>No requisitions found</h3>
                        <p>Create your first purchase request to get started.</p>
                        <Link href="/dashboard/requisitions/new" className="btn btn-primary">Create Request</Link>
                    </div>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>REQ #</th>
                                <th>Requester</th>
                                <th>Description</th>
                                <th>Vendor</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(req => (
                                <tr key={req.id} onClick={() => setSelectedReq(req)} style={{ cursor: 'pointer' }}>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{req.createdAt.toLocaleDateString()}</td>
                                    <td>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand)', fontSize: '0.875rem' }}>
                                            #{req.id?.slice(-6).toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{req.requesterName}</td>
                                    <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {(req as any).description || '—'}
                                    </td>
                                    <td>{req.vendorName || '—'}</td>
                                    <td>
                                        <span style={{ fontWeight: 700 }}>{formatCurrency(req.totalAmount, req.currency)}</span>
                                        {req.complianceScore && req.complianceScore > 20 && (
                                            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--error)', fontWeight: 700 }} title="Risk detected">🚩</span>
                                        )}
                                    </td>
                                    <td><StatusBadge status={req.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedReq && (
                <RequisitionDetailModal
                    requisition={selectedReq}
                    onClose={() => setSelectedReq(null)}
                    onDuplicate={() => router.push('/dashboard/requisitions/new')}
                    onSource={() => setShowRFPModal(true)}
                />
            )}

            {showRFPModal && selectedReq && (
                <CreateRFPModal
                    requisition={selectedReq}
                    vendors={vendors}
                    onClose={() => setShowRFPModal(false)}
                    onCreated={() => { setShowRFPModal(false); setSelectedReq(null); router.push('/dashboard/sourcing'); }}
                />
            )}
        </div>
    );
}
