"use client";

import { useEffect, useState } from "react";
import { Requisition, Budget } from "@/types";
import { subscribeToRequisitions, approveRequisition, updateRequisitionStatus } from "@/lib/requisitions";
import { getBudgets } from "@/lib/budgets";
import { getSpendAnalytics } from "@/lib/analytics";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/currencies";
import { useModal } from "@/context/ModalContext";
import { createPOFromRequisition } from "@/lib/purchaseOrders";
import { logAction } from "@/lib/audit";
import ApprovalFocusModal from "@/components/approvals/ApprovalFocusModal";

export default function ApprovalsPage() {
    const { user } = useAuth();
    const { showConfirm, showError } = useModal();
    const [pendingApprovals, setPendingApprovals] = useState<Requisition[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);
    const [deptBudget, setDeptBudget] = useState<Budget | undefined>(undefined);
    const [deptSpend, setDeptSpend] = useState(0);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = subscribeToRequisitions(user, (data) => {
            if (data) {
                const myPending = data.filter(r => r.status === 'PENDING');
                setPendingApprovals(myPending);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch Budget Data when opening a request
    const handleOpenRequest = async (req: Requisition) => {
        try {
            if (!user) return;
            const [budgets, analytics] = await Promise.all([
                getBudgets(user),
                getSpendAnalytics(user)
            ]);

            const budget = budgets.find(b => b.department === req.department);
            const spend = analytics.spendByDepartment[req.department] || 0;

            setDeptBudget(budget);
            setDeptSpend(spend);
            setSelectedReq(req);
        } catch (error) {
            console.error("Error fetching budget context", error);
            // Open modal anyway, just without budget context
            setSelectedReq(req);
        }
    };

    const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED', comment?: string) => {
        const confirmed = await showConfirm(
            "Confirm Action",
            `Are you sure you want to ${action === 'APPROVED' ? 'approve' : 'reject'} this request?`
        );

        if (!confirmed) return;

        try {
            if (!user) return;

            if (action === 'APPROVED') {
                // Now uses the multistage engine
                const result = await approveRequisition(user.tenantId, id);
                if (result.final) {
                    await createPOFromRequisition(user.tenantId, selectedReq!, user.uid);
                }
            } else {
                await updateRequisitionStatus(user.tenantId, id, action);
            }

            setSelectedReq(null); // Close modal

            // Audit Log
            if (selectedReq && user) {
                await logAction({
                    tenantId: user.tenantId,
                    actorId: user.uid,
                    actorName: user.displayName || 'System',
                    action: action === 'APPROVED' ? 'APPROVE' : 'REJECT',
                    entityType: 'REQUISITION',
                    entityId: id,
                    description: `${action === 'APPROVED' ? 'Processed approval stage' : 'Rejected'} for requisition ${id}. Comment: ${comment || 'No comment'}`
                });
            }
        } catch (e) {
            console.error("Error in approval action:", e);
            await showError("Error", "Error processing approval. Please check your workflow configuration.");
        }
    };

    if (loading) return (
        <div className="page-container animate-fade-in">
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading approvals...</div>
        </div>
    );

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Approvals</h1>
                    <p className="page-subtitle">Review and action purchase requests awaiting your authorization</p>
                </div>
                {pendingApprovals.length > 0 && (
                    <span style={{ background: 'var(--warning-bg)', color: 'var(--warning)', fontWeight: 700, fontSize: '0.8125rem', padding: '4px 12px', borderRadius: 9999 }}>
                        {pendingApprovals.length} awaiting review
                    </span>
                )}
            </div>

            {pendingApprovals.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">✅</div>
                        <h3>All caught up!</h3>
                        <p>No pending approvals at this time. Check back later.</p>
                    </div>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Requester</th>
                                <th>Department</th>
                                <th>Vendor</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingApprovals.map(req => (
                                <tr key={req.id}>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{req.createdAt.toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 600 }}>{req.requesterName}</td>
                                    <td>
                                        <span style={{ fontSize: '0.8rem', background: 'var(--info-bg)', color: 'var(--info)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                                            {req.department || '—'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{req.vendorName || '—'}</td>
                                    <td style={{ fontWeight: 700 }}>{formatCurrency(req.totalAmount, req.currency)}</td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, background: 'var(--status-pending-bg)', color: 'var(--status-pending)' }}>
                                            ● Pending{req.approverName ? ` (${req.approverName})` : ''}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleOpenRequest(req)}>
                                            Review →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedReq && (
                <ApprovalFocusModal
                    requisition={selectedReq}
                    budget={deptBudget}
                    deptSpend={deptSpend}
                    onClose={() => setSelectedReq(null)}
                    onApprove={(id, comment) => handleAction(id, 'APPROVED', comment)}
                    onReject={(id, comment) => handleAction(id, 'REJECTED', comment)}
                />
            )}
        </div>
    );
}

