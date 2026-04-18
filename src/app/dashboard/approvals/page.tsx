"use client";

import { useEffect, useState } from "react";
import { Requisition, Budget, PurchaseOrder, Invoice, Contract, RFP } from "@/types";
import { subscribeToRequisitions, approveRequisition, updateRequisitionStatus, getRequisitions } from "@/lib/requisitions";
import { getPurchaseOrders } from "@/lib/purchaseOrders";
import { getInvoices } from "@/lib/invoices";
import { getContracts } from "@/lib/contracts";
import { getRFPs } from "@/lib/sourcing";
import { getBudgets } from "@/lib/budgets";
import { getSpendAnalytics } from "@/lib/analytics";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/currencies";
import { useModal } from "@/context/ModalContext";
import { createPOFromRequisition, getHistoricalPrices, HistoricalPrice } from "@/lib/purchaseOrders";
import { logAction } from "@/lib/audit";
import ApprovalFocusModal from "@/components/approvals/ApprovalFocusModal";
import ApprovalDetailModal from "@/components/approvals/ApprovalDetailModal";

export default function ApprovalsPage() {
    const { user } = useAuth();
    const { showConfirm, showError, showAlert } = useModal();
    const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedReq, setSelectedReq] = useState<any | null>(null);
    const [selectedType, setSelectedType] = useState<'REQUISITION' | 'PO' | 'INVOICE' | 'CONTRACT' | 'TENDER' | null>(null);
    const [deptBudget, setDeptBudget] = useState<Budget | undefined>(undefined);
    const [deptSpend, setDeptSpend] = useState(0);
    const [historicalData, setHistoricalData] = useState<Record<string, HistoricalPrice>>({});
    const [isFocusView, setIsFocusView] = useState(true);

    const loadApprovals = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [reqs, pos, invoices, contracts, tenders] = await Promise.all([
                getRequisitions(user),
                getPurchaseOrders(user),
                getInvoices(user),
                getContracts(user.tenantId),
                getRFPs(user.tenantId)
            ]);

            const allPending: any[] = [
                ...reqs.filter(r => r.status === 'PENDING').map(r => ({ ...r, entityType: 'REQUISITION' })),
                ...pos.filter(p => p.status === 'PENDING').map(p => ({ ...p, entityType: 'PURCHASE ORDER', requesterName: p.issuedByName || 'System', totalAmount: p.totalAmount, createdAt: new Date(p.createdAt || Date.now()) })),
                ...invoices.filter(i => i.status === 'PENDING').map(i => ({ ...i, entityType: 'INVOICE', requesterName: i.vendorName, totalAmount: i.amount, createdAt: new Date(i.createdAt || Date.now()) })),
                ...contracts.filter(c => c.status === 'PENDING').map(c => ({ ...c, entityType: 'CONTRACT', requesterName: c.vendorName, totalAmount: c.value, createdAt: new Date(c.createdAt || Date.now()) })),
                ...tenders.filter(t => t.status === 'DRAFT').map(t => ({ ...t, entityType: 'TENDER', requesterName: 'Purchasing', totalAmount: 0, createdAt: new Date(t.id ? Date.now() : Date.now()) }))
            ];

            // Filter for only those awaiting current user (if approverId is set)
            const myWorklist = allPending.filter(item => {
                if (!item.approverId) return true; // Show all to admins/general queue if not specific
                return item.approverId === user.uid;
            });

            setPendingApprovals(myWorklist.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        } catch (error) {
            console.error("Error loading global worklist:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApprovals();
    }, [user]);

    // Fetch Budget Data when opening a request
    const handleOpenRequest = async (item: any) => {
        setSelectedType(item.entityType);
        if (item.entityType === 'REQUISITION') {
            try {
                if (!user) return;
                const [budgets, analytics, history] = await Promise.all([
                    getBudgets(user),
                    getSpendAnalytics(user),
                    getHistoricalPrices(user.tenantId)
                ]);

                const budget = budgets.find(b => b.department === item.department);
                const spend = analytics.spendByDepartment[item.department] || 0;

                setDeptBudget(budget);
                setDeptSpend(spend);
                setHistoricalData(history);
                setSelectedReq(item);
            } catch (error) {
                console.error("Error fetching budget context", error);
                setSelectedReq(item);
            }
        } else {
            // For POs, Invoices, Contracts, Tenders, etc.
            setSelectedReq(item);
        }
    };

    const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED', comment?: string) => {
        const confirmed = await showConfirm(
            "Confirm Action",
            `Are you sure you want to ${action === 'APPROVED' ? 'approve' : 'reject'} this ${selectedType?.toLowerCase()}?`
        );

        if (!confirmed) return;

        try {
            if (!user) return;

            const { processApprovalAction } = await import("@/lib/approvals");

            const entityTypeMap: Record<string, any> = {
                'REQUISITION': 'REQUISITION',
                'PURCHASE ORDER': 'PO',
                'INVOICE': 'INVOICE',
                'CONTRACT': 'CONTRACT',
                'TENDER': 'TENDER'
            };

            await processApprovalAction({
                tenantId: user.tenantId,
                entityId: id,
                entityType: entityTypeMap[selectedType!] || 'REQUISITION',
                actor: { uid: user.uid, name: user.displayName, email: user.email },
                action: action === 'APPROVED' ? 'APPROVE' : 'REJECT',
                comment: comment
            });

            // Special handling for PO creation after final PR approval is handled inside processApprovalAction or we can do it here
            if (selectedType === 'REQUISITION' && action === 'APPROVED') {
                // If it was the final step, it would need a PO. 
                // However, processApprovalAction now handles most of this.
                // We'll trust the engine and just refresh.
            }

            setSelectedReq(null);
            showAlert("Success", "Approval action processed successfully.");
            loadApprovals();
        } catch (e: any) {
            console.error("Error in approval action:", e);
            await showError("Error", e.message || "Error processing approval. Please check your workflow configuration.");
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
                                <th>Type</th>
                                <th>Date</th>
                                <th>Requester / Vendor</th>
                                <th>Department</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingApprovals.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            textTransform: 'uppercase',
                                            background: item.entityType === 'REQUISITION' ? '#F2F2F7' : (item.entityType === 'INVOICE' ? '#E5F1FF' : '#FFF0E5'),
                                            color: item.entityType === 'REQUISITION' ? '#3A3A3C' : (item.entityType === 'INVOICE' ? '#007AFF' : '#FF9500'),
                                        }}>
                                            {item.entityType}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{item.createdAt.toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 600 }}>{item.requesterName || item.vendorName || '—'}</td>
                                    <td>
                                        <span style={{ fontSize: '0.8rem', background: 'var(--info-bg)', color: 'var(--info)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                                            {item.department || '—'}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{formatCurrency(item.totalAmount, item.currency || 'GHS')}</td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, background: 'var(--status-pending-bg)', color: 'var(--status-pending)' }}>
                                            ● Pending{item.approverName ? ` (${item.approverName})` : ''}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleOpenRequest(item)}>
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
                selectedType === 'REQUISITION' ? (
                    isFocusView ? (
                        <ApprovalFocusModal
                            requisition={selectedReq}
                            budget={deptBudget}
                            deptSpend={deptSpend}
                            historicalData={historicalData}
                            onClose={() => setSelectedReq(null)}
                            onToggleView={() => setIsFocusView(false)}
                            onApprove={(id, comment) => handleAction(id, 'APPROVED', comment)}
                            onReject={(id, comment) => handleAction(id, 'REJECTED', comment)}
                        />
                    ) : (
                        <ApprovalDetailModal
                            requisition={selectedReq}
                            budget={deptBudget}
                            deptSpend={deptSpend}
                            historicalData={historicalData}
                            onClose={() => setSelectedReq(null)}
                            onToggleView={() => setIsFocusView(true)}
                            onApprove={(id, comment) => handleAction(id, 'APPROVED', comment)}
                            onReject={(id, comment) => handleAction(id, 'REJECTED', comment)}
                        />
                    )
                ) : (
                    /* Fallback for other types - reuse focus modal if compatible or show generic summary */
                    <ApprovalFocusModal
                        requisition={selectedReq}
                        deptSpend={deptSpend}
                        historicalData={historicalData}
                        onClose={() => setSelectedReq(null)}
                        onToggleView={() => setIsFocusView(false)}
                        onApprove={(id, comment) => handleAction(id, 'APPROVED', comment)}
                        onReject={(id, comment) => handleAction(id, 'REJECTED', comment)}
                    />
                )
            )}
        </div>
    );
}

