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

    if (action === 'REJECT') {
        updates.status = 'REJECTED';
    } else if (action === 'REVISION_REQUESTED') {
        updates.status = 'PENDING'; // Or a new status like 'REVISION_NEEDED'
    } else {
        // APPROVE: Advance to next step
        const nextStepIndex = (entity.currentStepIndex || 0) + 1;

        // Log action for the current step
        await logAction({
            tenantId,
            actorId: actor.uid,
            actorName: actor.name,
            actorEmail: actor.email,
            action: 'APPROVE',
            entityType: entityType,
            entityId: entityId,
            description: `Approved stage: ${currentStepName}`
        });

        if (!workflow || nextStepIndex >= workflow.steps.length) {
            updates.status = 'APPROVED';
            if (workflow) updates.currentStepIndex = nextStepIndex; // Marks completion
        } else {
            // Find next applicable step (handles thresholds)
            let finalNextIndex = nextStepIndex;
            while (finalNextIndex < workflow.steps.length) {
                const step = workflow.steps[finalNextIndex];
                const amount = entityType === 'REQUISITION' ? (entity as Requisition).totalAmount : (entity as PurchaseOrder).totalAmount;

                const min = step.thresholdMin ?? 0;
                const max = step.thresholdMax ?? Infinity;

                if (amount >= min && amount <= max) {
                    break;
                }
                finalNextIndex++;
            }

            if (finalNextIndex >= workflow.steps.length) {
                updates.status = 'APPROVED';
            } else {
                updates.currentStepIndex = finalNextIndex;
                const nextApprovers = await getCurrentStepApprovers(tenantId, workflow, finalNextIndex, entityType === 'REQUISITION' ? (entity as Requisition).requesterId : (entity as PurchaseOrder).issuedBy);
                if (nextApprovers.length > 0) {
                    updates.approverId = nextApprovers[0].uid;
                    updates.approverName = nextApprovers[0].name;
                }
            }
        }
    }

    await update(entityRef, updates);
    return updates;
};
