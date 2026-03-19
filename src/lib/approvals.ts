import { db, DB_PREFIX } from "./firebase";
import { ref, get, query, orderByChild, equalTo, update } from "firebase/database";
import { Requisition, PurchaseOrder, Workflow, WorkflowStep, AppUser, ApprovalHistoryEntry } from "@/types";
import { logAction } from "./audit";

/**
 * Finds the most appropriate active workflow for an entity (Requisition or PO).
 */
export const evaluateWorkflow = async (tenantId: string, entityType: 'REQUISITION' | 'PO', amount: number): Promise<Workflow | null> => {
    try {
        const workflowsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/workflows`);
        const q = query(workflowsRef, orderByChild('isActive'), equalTo(true));
        const snapshot = await get(q);

        if (!snapshot.exists()) return null;

        const workflows = Object.values(snapshot.val()) as Workflow[];

        // Logic: 
        // 1. Filter by entity type
        // 2. Filter by threshold if applicable (any step in workflow has a threshold matching the amount)
        // 3. Sort by priority
        const matchingWorkflows = workflows
            .filter(w => w.entityType === entityType)
            .sort((a, b) => (b.priority || 0) - (a.priority || 0));

        return matchingWorkflows[0] || null;
    } catch (error) {
        console.error("Error evaluating workflow:", error);
        return null;
    }
};

/**
 * Determines the approver(s) for the current step of an entity.
 */
export const getCurrentStepApprovers = async (tenantId: string, workflow: Workflow, stepIndex: number, requesterId: string): Promise<{ uid: string, name: string, email: string }[]> => {
    try {
        const step = workflow.steps[stepIndex];
        if (!step) return [];

        const approvers: { uid: string, name: string, email: string }[] = [];

        // 1. Specific User(s)
        if (step.approverId) {
            const userSnap = await get(ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${step.approverId}`));
            if (userSnap.exists()) {
                const u = userSnap.val();
                approvers.push({ uid: u.uid, name: u.displayName, email: u.email });
            }
        }

        if (step.approverIds && step.approverIds.length > 0) {
            for (const uid of step.approverIds) {
                const userSnap = await get(ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${uid}`));
                if (userSnap.exists()) {
                    const u = userSnap.val();
                    approvers.push({ uid: u.uid, name: u.displayName, email: u.email });
                }
            }
        }

        // 2. Role-based (Internal)
        if (step.approverRole && approvers.length === 0) {
            if (step.approverRole === 'REPORT_TO_MANAGER') {
                const requesterSnap = await get(ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${requesterId}`));
                if (requesterSnap.exists()) {
                    const reqUser = requesterSnap.val() as AppUser;
                    if (reqUser.managerId) {
                        const managerSnap = await get(ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${reqUser.managerId}`));
                        if (managerSnap.exists()) {
                            const m = managerSnap.val();
                            approvers.push({ uid: m.uid, name: m.displayName, email: m.email });
                        }
                    }
                }
            } else {
                const usersRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/users`);
                const q = query(usersRef, orderByChild('role'), equalTo(step.approverRole));
                const snapshot = await get(q);
                if (snapshot.exists()) {
                    const users = Object.values(snapshot.val()) as AppUser[];
                    users.forEach(u => approvers.push({ uid: u.uid, name: u.displayName, email: u.email }));
                }
            }
        }

        return approvers;
    } catch (error: any) {
        if (error.code === 'PERMISSION_DENIED' || error.message?.includes('Permission denied')) {
            console.warn(`[Approvals] Permission denied fetching approvers for tenant ${tenantId}`);
        } else {
            console.error(`[Approvals] Error fetching approvers:`, error);
        }
        return [];
    }
};

/**
 * Process an approval action and move the entity to the next stage or final state.
 */
export const processApprovalAction = async (
    params: {
        tenantId: string,
        entityId: string,
        entityType: 'REQUISITION' | 'PO',
        actor: { uid: string, name: string, email: string },
        action: 'APPROVE' | 'REJECT' | 'REVISION_REQUESTED',
        comment?: string
    }
) => {
    const { tenantId, entityId, entityType, actor, action, comment } = params;
    const path = entityType === 'REQUISITION' ? 'requisitions' : 'purchaseOrders';
    const entityRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/${path}/${entityId}`);

    const snapshot = await get(entityRef);
    if (!snapshot.exists()) throw new Error("Entity not found");

    const entity = snapshot.val() as (Requisition | PurchaseOrder);

    let currentStepId = 'legacy-step';
    let currentStepName = 'Direct Approval';
    let workflow: Workflow | null = null;

    if (entity.workflowId) {
        const workflowsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/workflows/${entity.workflowId}`);
        const workflowSnap = await get(workflowsRef);
        if (workflowSnap.exists()) {
            workflow = workflowSnap.val() as Workflow;
            const step = workflow.steps[entity.currentStepIndex || 0];
            if (step) {
                currentStepId = step.id;
                currentStepName = step.name;
            }
        }
    }

    const historyEntry: ApprovalHistoryEntry = {
        stepId: currentStepId,
        stepName: currentStepName,
        actorId: actor.uid,
        actorName: actor.name,
        actorEmail: actor.email,
        action,
        comment,
        timestamp: new Date().toISOString()
    };

    const updatedHistory = [...(entity.approvalHistory || []), historyEntry];
    const updates: any = {
        approvalHistory: updatedHistory
    };

    // --- CONFLICT OF INTEREST GATE (Logic Gate 3.3) ---
    if (action === 'APPROVE') {
        const requesterId = entityType === 'REQUISITION' 
            ? (entity as Requisition).requesterId 
            : (entity as PurchaseOrder).issuedBy;
            
        if (actor.uid === requesterId) {
            // Log the blocked attempt
            await logAction({
                tenantId,
                actorId: actor.uid,
                actorName: actor.name,
                action: 'APPROVE',
                entityType: entityType === 'REQUISITION' ? 'REQUISITION' : 'PURCHASE_ORDER',
                entityId,
                description: `Blocked self-approval attempt by ${actor.name} for ${entityType} ${entityId}`
            });
            throw new Error("Conflict of Interest: You cannot approve your own record.");
        }
    }

    const auditActionMap: Record<string, any> = {
        'APPROVE': entityType === 'REQUISITION' ? 'PR_APPROVED' : 'PO_SENT', // PO_SENT is the closest for PO approval step
        'REJECT': entityType === 'REQUISITION' ? 'PR_REJECTED' : 'UPDATE',
        'REVISION_REQUESTED': 'UPDATE'
    };

    if (action === 'REJECT') {
        updates.status = 'REJECTED';
        await logAction({
            tenantId,
            actorId: actor.uid,
            actorName: actor.name,
            action: auditActionMap['REJECT'],
            entityType: entityType === 'REQUISITION' ? 'REQUISITION' : 'PURCHASE_ORDER',
            entityId,
            description: `Rejected ${entityType}: ${comment || 'No comment'}`
        });

        // 🛡️ Phase 58: Release funds if previously reserved
        if (entity.status === 'APPROVED' || entity.status === 'PENDING') {
            try {
                const { releaseFunds } = await import("./budgets");
                const amount = (entity as any).totalAmount;
                await releaseFunds(tenantId, entity.department, amount);
            } catch (err) {
                console.error("[Budget] Release failed during rejection:", err);
            }
        }

        // 🔔 Notification Trigger
        try {
            const { notifyUser } = await import("./notifications");
            const requesterId = entityType === 'REQUISITION' ? (entity as Requisition).requesterId : (entity as PurchaseOrder).issuedBy;
            await notifyUser(
                tenantId,
                requesterId,
                'APPROVAL_REJECTED',
                `${entityType} Rejected`,
                `Your ${entityType === 'REQUISITION' ? 'requisition' : 'purchase order'} ${entityId} has been rejected by ${actor.name}.`,
                `/dashboard/${entityType === 'REQUISITION' ? 'requisitions' : 'purchase-orders'}`
            );
        } catch (err) {
            console.error("Notify error:", err);
        }
    } else if (action === 'REVISION_REQUESTED') {
        updates.status = 'PENDING';
        await logAction({
            tenantId,
            actorId: actor.uid,
            actorName: actor.name,
            action: 'UPDATE',
            entityType: entityType === 'REQUISITION' ? 'REQUISITION' : 'PURCHASE_ORDER',
            entityId,
            description: `Revision requested for ${entityType}: ${comment || 'No comment'}`
        });

        // 🔔 Notification Trigger
        try {
            const { notifyUser } = await import("./notifications");
            const requesterId = entityType === 'REQUISITION' ? (entity as Requisition).requesterId : (entity as PurchaseOrder).issuedBy;
            await notifyUser(
                tenantId,
                requesterId,
                'SYSTEM',
                'Revision Requested',
                `Revision has been requested for your ${entityType === 'REQUISITION' ? 'requisition' : 'purchase order'} ${entityId} by ${actor.name}.`,
                `/dashboard/${entityType === 'REQUISITION' ? 'requisitions' : 'purchase-orders'}`
            );
        } catch (err) {
            console.error("Notify error:", err);
        }
    } else {
        // APPROVE: Advance to next step
        const nextStepIndex = (entity.currentStepIndex || 0) + 1;

        await logAction({
            tenantId,
            actorId: actor.uid,
            actorName: actor.name,
            action: auditActionMap['APPROVE'],
            entityType: entityType === 'REQUISITION' ? 'REQUISITION' : 'PURCHASE_ORDER',
            entityId,
            description: `Approved stage "${currentStepName}" for ${entityType}.`
        });

        if (!workflow || nextStepIndex >= workflow.steps.length) {
            updates.status = 'APPROVED';
            if (workflow) updates.currentStepIndex = nextStepIndex; // Marks completion

            // 🔔 Notification Trigger (Final Approval)
            try {
                const { notifyUser } = await import("./notifications");
                const requesterId = entityType === 'REQUISITION' ? (entity as Requisition).requesterId : (entity as PurchaseOrder).issuedBy;
                await notifyUser(
                    tenantId,
                    requesterId,
                    'APPROVAL_GRANTED',
                    `${entityType} Approved`,
                    `Your ${entityType === 'REQUISITION' ? 'requisition' : 'purchase order'} ${entityId} has been fully approved.`,
                    `/dashboard/${entityType === 'REQUISITION' ? 'requisitions' : 'purchase-orders'}`
                );
            } catch (err) {
                console.error("Notify error:", err);
            }

            // 🛡️ Phase 58: Reserve Funds (Final Approval)
            try {
                const { reserveFunds } = await import("./budgets");
                const amount = (entity as any).totalAmount;
                await reserveFunds(tenantId, entity.department, amount);
            } catch (err) {
                console.error("[Budget] Fund reservation failed:", err);
            }
        } else {
            // Find next applicable step (handles thresholds)
            let finalNextIndex = nextStepIndex;
            while (finalNextIndex < workflow.steps.length) {
                const step = workflow.steps[finalNextIndex];
                const amount = (entity as any).totalAmount;

                const min = step.thresholdMin ?? 0;
                const max = step.thresholdMax ?? Infinity;

                if (amount >= min && amount <= max) {
                    break;
                }
                finalNextIndex++;
            }

            if (finalNextIndex >= workflow.steps.length) {
                updates.status = 'APPROVED';
                
                // 🔔 Notification Trigger (Final Approval - skipped steps)
                try {
                    const { notifyUser } = await import("./notifications");
                    const requesterId = entityType === 'REQUISITION' ? (entity as Requisition).requesterId : (entity as PurchaseOrder).issuedBy;
                    await notifyUser(
                        tenantId,
                        requesterId,
                        'APPROVAL_GRANTED',
                        `${entityType} Approved`,
                        `Your ${entityType === 'REQUISITION' ? 'requisition' : 'purchase order'} ${entityId} has been fully approved.`,
                        `/dashboard/${entityType === 'REQUISITION' ? 'requisitions' : 'purchase-orders'}`
                    );
                } catch (err) {
                    console.error("Notify error:", err);
                }

                // 🛡️ Phase 58: Reserve Funds (Final Approval via skipped steps)
                try {
                    const { reserveFunds } = await import("./budgets");
                    const amount = (entity as any).totalAmount;
                    await reserveFunds(tenantId, entity.department, amount);
                } catch (err) {
                    console.error("[Budget] Fund reservation failed (skipped steps):", err);
                }
            } else {
                updates.currentStepIndex = finalNextIndex;
                const nextApprovers = await getCurrentStepApprovers(tenantId, workflow, finalNextIndex, entityType === 'REQUISITION' ? (entity as Requisition).requesterId : (entity as PurchaseOrder).issuedBy);
                if (nextApprovers.length > 0) {
                    updates.approverId = nextApprovers[0].uid;
                    updates.approverName = nextApprovers[0].name;

                    // 🔔 Notification Trigger (Next Approver)
                    try {
                        const { notifyUser } = await import("./notifications");
                        for (const app of nextApprovers) {
                            await notifyUser(
                                tenantId,
                                app.uid,
                                'APPROVAL_REQUEST',
                                'Approval Required',
                                `A ${entityType} (${entityId}) requires your approval.`,
                                `/dashboard/approvals`
                            );
                        }
                    } catch (err) {
                        console.error("Notify error:", err);
                    }
                }
            }
        }
    }

    await update(entityRef, updates);
    return updates;
};
