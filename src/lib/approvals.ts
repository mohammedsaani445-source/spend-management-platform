import { Requisition, PurchaseOrder, AppUser, ApprovalHistoryEntry, ApprovalPolicy, ApprovalPolicyModule, ApprovalPolicyStep } from "@/types";
import { logAction } from "./audit";
import { getApprovalPolicies } from "./approvalPolicies";
import { db, DB_PREFIX } from "@/lib/firebase";
import { ref, get, query, orderByChild, equalTo, update } from "firebase/database";
import { getExchangeRates, convertCurrency } from "./exchangeRates";

/**
 * Maps policy step roles (as saved by the UI StepBuilder) to actual
 * Firebase user roles. The lookup tries each candidate in order and
 * stops at the first match.
 */
const ROLE_MAP: Record<string, string[]> = {
    'dept_head':      ['WORKSPACE_ADMIN', 'ADMIN', 'DEPARTMENT_HEAD'],
    'proc_officer':   ['PROCUREMENT_OFFICER', 'PROCUREMENT_MANAGER', 'WORKSPACE_ADMIN'],
    'proc_mgr':       ['PROCUREMENT_MANAGER', 'WORKSPACE_ADMIN', 'ADMIN'],
    'finance_mgr':    ['FINANCE_MANAGER', 'WORKSPACE_ADMIN', 'ADMIN'],
    'ap_officer':     ['FINANCE_SPECIALIST', 'FINANCE_MANAGER', 'WORKSPACE_ADMIN'],
    'administrator':  ['WORKSPACE_ADMIN', 'ADMIN', 'PLATFORM_SUPERUSER'],
    'superuser':      ['PLATFORM_SUPERUSER', 'WORKSPACE_ADMIN'],
    'finance':        ['FINANCE_MANAGER', 'FINANCE_SPECIALIST', 'WORKSPACE_ADMIN'],
    'legal':          ['LEGAL', 'WORKSPACE_ADMIN', 'ADMIN'],
};

/**
 * Finds the most appropriate active approval policy for an entity.
 */
export const evaluatePolicy = async (
    tenantId: string,
    module: ApprovalPolicyModule,
    amount: number,
    currency: string,
    departmentId?: string
): Promise<ApprovalPolicy | null> => {
    try {
        const policies = await getApprovalPolicies(tenantId);
        const rates = await getExchangeRates();

        // Logic: 
        // 1. Filter by module and active status
        // 2. Filter by department if scoped
        // 3. Convert entity amount to policy currency and check threshold logic
        // 4. Sort by specificity (department-specific first)
        const matchingPolicies = policies
            .filter(p => p.isActive)
            .filter(p => p.module === module)
            .filter(p => {
                // Support both field names: departmentScope (UI) and departmentId (legacy)
                const scope = (p as any).departmentScope || p.departmentId;
                if (!scope || scope === 'All Departments' || scope === 'ALL') return true;
                return scope === departmentId;
            })
            .filter(p => {
                // Convert document amount to the policy's currency
                const convertedAmount = convertCurrency(amount, currency, p.currency || 'GHS', rates);

                // Check if amount sits within policy min/max thresholds
                if (p.minAmount !== undefined && p.minAmount > 0 && convertedAmount < p.minAmount) return false;
                if (p.maxAmount !== undefined && p.maxAmount < 999999999 && convertedAmount > p.maxAmount) return false;

                return true;
            })
            .sort((a, b) => {
                // Department-specific policies take priority over global ones
                const aScope = (a as any).departmentScope || a.departmentId;
                const bScope = (b as any).departmentScope || b.departmentId;
                const aIsGlobal = !aScope || aScope === 'All Departments' || aScope === 'ALL';
                const bIsGlobal = !bScope || bScope === 'All Departments' || bScope === 'ALL';
                if (!aIsGlobal && bIsGlobal) return -1;
                if (aIsGlobal && !bIsGlobal) return 1;
                if (b.priority !== a.priority) return b.priority - a.priority;
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });

        return matchingPolicies[0] || null;
    } catch (error) {
        console.error("Error evaluating policy:", error);
        return null;
    }
};
export type Workflow = ApprovalPolicy;

/**
 * Determines the approver(s) for the current step of an entity.
 */
export const getCurrentStepApprovers = async (tenantId: string, workflow: Workflow, stepIndex: number, requesterId: string): Promise<{ uid: string, name: string, email: string }[]> => {
    try {
        if (!workflow.steps) return [];
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
        // Normalize: UI saves step.role, legacy code uses step.approverRole
        const stepRole = step.approverRole || step.role;

        if (stepRole && approvers.length === 0) {
            if (stepRole === 'REPORT_TO_MANAGER') {
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
            } else if (stepRole === 'DEPARTMENT_HEAD' || stepRole === 'dept_head') {
                const requesterSnap = await get(ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${requesterId}`));
                if (requesterSnap.exists()) {
                    const reqUser = requesterSnap.val() as AppUser;
                    if (reqUser.departmentId) {
                        const deptSnap = await get(ref(db, `${DB_PREFIX}/tenants/${tenantId}/departments/${reqUser.departmentId}`));
                        if (deptSnap.exists()) {
                            const dept = deptSnap.val();
                            if (dept.managerId) {
                                const managerSnap = await get(ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${dept.managerId}`));
                                if (managerSnap.exists()) {
                                    const m = managerSnap.val();
                                    approvers.push({ uid: m.uid, name: m.displayName, email: m.email });
                                }
                            }
                        }
                    }
                }

                // Fallback: If no department manager found, look for Workspace Admin
                if (approvers.length === 0) {
                    const usersRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/users`);
                    const q = query(usersRef, orderByChild('role'), equalTo('WORKSPACE_ADMIN'));
                    const snapshot = await get(q);
                    if (snapshot.exists()) {
                        const users = Object.values(snapshot.val()) as AppUser[];
                        if (users.length > 0) {
                            approvers.push({ uid: users[0].uid, name: users[0].displayName, email: users[0].email });
                        }
                    }
                }
            } else {
                // Use ROLE_MAP to translate policy step roles to actual Firebase user roles
                const usersRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/users`);
                const rolesToTry = ROLE_MAP[stepRole] || [stepRole];

                for (const candidateRole of rolesToTry) {
                    const q = query(usersRef, orderByChild('role'), equalTo(candidateRole));
                    const snapshot = await get(q);
                    if (snapshot.exists()) {
                        const users = Object.values(snapshot.val()) as AppUser[];
                        users.forEach(u => approvers.push({ uid: u.uid, name: u.displayName, email: u.email }));
                        break; // Found users for this role, stop looking
                    }
                }

                // Ultimate fallback: if no users found for any mapped role, try WORKSPACE_ADMIN
                if (approvers.length === 0) {
                    const q = query(usersRef, orderByChild('role'), equalTo('WORKSPACE_ADMIN'));
                    const snapshot = await get(q);
                    if (snapshot.exists()) {
                        const users = Object.values(snapshot.val()) as AppUser[];
                        if (users.length > 0) {
                            approvers.push({ uid: users[0].uid, name: users[0].displayName, email: users[0].email });
                        }
                    }
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
        entityType: 'REQUISITION' | 'PO' | 'INVOICE' | 'CONTRACT' | 'TENDER' | 'BUDGET' | 'VENDOR' | 'PAYMENT',
        actor: { uid: string, name: string, email: string },
        action: 'APPROVE' | 'REJECT' | 'REVISION_REQUESTED',
        comment?: string
    }
) => {
    const { tenantId, entityId, entityType, actor, action, comment } = params;
    const pathMap: Record<string, string> = {
        'REQUISITION': 'requisitions',
        'PO': 'purchaseOrders',
        'INVOICE': 'invoices',
        'CONTRACT': 'contracts',
        'TENDER': 'rfps',
        'BUDGET': 'budgetAdjustments',
        'VENDOR': 'vendors',
        'PAYMENT': 'payments'
    };
    const path = pathMap[entityType] || 'requisitions';
    const entityRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/${path}/${entityId}`);

    const snapshot = await get(entityRef);
    if (!snapshot.exists()) throw new Error("Entity not found");

    const entity = snapshot.val();

    let currentStepId = 'direct-approval';
    let currentStepName = 'Direct Approval';
    let workflow: ApprovalPolicy | null = null;

    if (entity.workflowId) {
        // Fetch the active policy
        const policiesRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/approval_policies/${entity.workflowId}`);
        const policySnap = await get(policiesRef);

        if (policySnap.exists()) {
            workflow = policySnap.val() as ApprovalPolicy;
            if (workflow.steps) {
                const step = workflow.steps[entity.currentStepIndex || 0];
                if (step) {
                    currentStepId = step.id;
                    currentStepName = step.name;
                }
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
        comment: comment || "",
        timestamp: new Date().toISOString()
    };

    const updatedHistory = [...(entity.approvalHistory || []), historyEntry];
    const updates: any = {
        approvalHistory: updatedHistory
    };

    // --- CONFLICT OF INTEREST GATE (Logic Gate 3.3) ---
    if (action === 'APPROVE') {
        let requesterId = entity.requesterId || entity.issuedBy || entity.createdBy;

        if (actor.uid === requesterId) {
            // Log the blocked attempt
            await logAction({
                tenantId,
                actorId: actor.uid,
                actorName: actor.name,
                action: 'APPROVE',
                entityType: entityType,
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

    const getAmount = () => {
        return entity.totalAmount || entity.amount || entity.value || entity.budget || 0;
    };

    const requesterIdForNotif = entity.requesterId || entity.issuedBy || entity.createdBy || null;

    if (action === 'REJECT') {
        updates.status = 'REJECTED';
        await logAction({
            tenantId,
            actorId: actor.uid,
            actorName: actor.name,
            action: auditActionMap['REJECT'],
            entityType: entityType,
            entityId,
            description: `Rejected ${entityType}: ${comment || 'No comment'}`
        });

        // 🛡️ Phase 58: Release funds if previously reserved
        if (entity.status === 'APPROVED' || entity.status === 'PENDING') {
            try {
                const { releaseFunds } = await import("./budgets");
                await releaseFunds(tenantId, entity.department, getAmount());
            } catch (err) {
                console.error("[Budget] Release failed during rejection:", err);
            }
        }

        // 🔔 Notification Trigger
        try {
            if (requesterIdForNotif) {
                const { notifyUser } = await import("./notifications");
                await notifyUser(
                    tenantId,
                    requesterIdForNotif,
                    'APPROVAL_REJECTED',
                    `${entityType} Rejected`,
                    `Your ${entityType} ${entityId} has been rejected by ${actor.name}.`,
                    `/dashboard/${path}`
                );
            }
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
            entityType: entityType,
            entityId,
            description: `Revision requested for ${entityType}: ${comment || 'No comment'}`
        });

        // 🔔 Notification Trigger
        try {
            if (requesterIdForNotif) {
                const { notifyUser } = await import("./notifications");
                await notifyUser(
                    tenantId,
                    requesterIdForNotif,
                    'SYSTEM',
                    'Revision Requested',
                    `Revision has been requested for your ${entityType} ${entityId} by ${actor.name}.`,
                    `/dashboard/${path}`
                );
            }
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
            entityType: entityType,
            entityId,
            description: `Approved stage "${currentStepName}" for ${entityType}.`
        });

        if (!workflow || !workflow.steps || nextStepIndex >= workflow.steps.length) {
            if (entityType === 'TENDER') {
                updates.status = 'AWARDED';
                // Trigger PO Generation automatically on final award approval
                const { awardBid } = await import("./sourcing");
                // Note: We need the quoteId. Assuming it's stored in entity.pendingAwardQuoteId
                if (entity.pendingAwardQuoteId) {
                    await awardBid(tenantId, entityId, entity.pendingAwardQuoteId, actor as any);
                }
            } else if (entityType === 'VENDOR' || entityType === 'CONTRACT' || entityType === 'BUDGET') {
                updates.status = 'ACTIVE';
            } else if (entityType === 'PAYMENT') {
                // Determine final state based on date
                const isScheduled = !!(entity as any).paymentDate && new Date((entity as any).paymentDate) > new Date();
                updates.status = isScheduled ? 'PENDING' : 'COMPLETED';

                // Side Effect: Trigger Disbursement finalization
                if (updates.status === 'COMPLETED') {
                    const { finalizePaymentDisbursement } = await import("./payments");
                    await finalizePaymentDisbursement(tenantId, entityId);
                }
            } else if (entityType === 'PO') {
                updates.status = 'ISSUED';
            } else {
                updates.status = 'APPROVED';
            }
            if (workflow) updates.currentStepIndex = nextStepIndex; // Marks completion

            // 🔔 Notification Trigger (Final Approval)
            try {
                if (requesterIdForNotif) {
                    const { notifyUser } = await import("./notifications");
                    await notifyUser(
                        tenantId,
                        requesterIdForNotif,
                        'APPROVAL_GRANTED',
                        `${entityType} Approved`,
                        `Your ${entityType} ${entityId} has been fully approved.`,
                        `/dashboard/${path}`
                    );
                }
            } catch (err) {
                console.error("Notify error:", err);
            }

            // 🛡️ Phase 58: Reserve Funds (Final Approval)
            try {
                if (entityType === 'REQUISITION' || entityType === 'PO') {
                    const { reserveFunds } = await import("./budgets");
                    await reserveFunds(tenantId, entity.department, getAmount());
                }
            } catch (err) {
                console.error("[Budget] Fund reservation failed:", err);
            }

            // 🪙 Budget Adjustment Finalization
            try {
                if (entityType === 'BUDGET') {
                    const { processBudgetAdjustment } = await import("./budgetAdjustments");
                    await processBudgetAdjustment(tenantId, entityId, 'APPROVED', actor as any);
                }
            } catch (err) {
                console.error("[Budget] Adjustment finalization failed:", err);
            }
        } else {
            const rates = await getExchangeRates();
            const workflowCurrency = (workflow as any).currency || 'GHS';
            const documentCurrency = (entity as any).currency || 'GHS';

            // Find next applicable step (handles thresholds)
            let finalNextIndex = nextStepIndex;
            const steps = workflow.steps || [];
            while (finalNextIndex < steps.length) {
                const step = steps[finalNextIndex];
                const amount = getAmount();

                const convertedAmount = convertCurrency(amount, documentCurrency, workflowCurrency, rates);

                const min = step.thresholdMin ?? 0;
                const max = step.thresholdMax ?? Infinity;

                if (convertedAmount >= min && convertedAmount <= max) {
                    break;
                }
                finalNextIndex++;
            }

            if (finalNextIndex >= (workflow.steps || []).length) {
                if (entityType === 'TENDER') {
                    updates.status = 'AWARDED';
                    const { awardBid } = await import("./sourcing");
                    if (entity.pendingAwardQuoteId) {
                        await awardBid(tenantId, entityId, entity.pendingAwardQuoteId, actor as any);
                    }
                } else if (entityType === 'VENDOR' || entityType === 'CONTRACT' || entityType === 'BUDGET') {
                    updates.status = 'ACTIVE';
                } else if (entityType === 'PAYMENT') {
                    const isScheduled = !!(entity as any).paymentDate && new Date((entity as any).paymentDate) > new Date();
                    updates.status = isScheduled ? 'PENDING' : 'COMPLETED';

                    if (updates.status === 'COMPLETED') {
                        const { finalizePaymentDisbursement } = await import("./payments");
                        await finalizePaymentDisbursement(tenantId, entityId);
                    }
                } else {
                    updates.status = 'APPROVED';
                }

                // 🔔 Notification Trigger (Final Approval - skipped steps)
                try {
                    if (requesterIdForNotif) {
                        const { notifyUser } = await import("./notifications");
                        await notifyUser(
                            tenantId,
                            requesterIdForNotif,
                            'APPROVAL_GRANTED',
                            `${entityType} Approved`,
                            `Your ${entityType} ${entityId} has been fully approved.`,
                            `/dashboard/${path}`
                        );
                    }
                } catch (err) {
                    console.error("Notify error:", err);
                }

                // 🛡️ Phase 58: Reserve Funds (Final Approval via skipped steps)
                try {
                    if (entityType === 'REQUISITION' || entityType === 'PO') {
                        const { reserveFunds } = await import("./budgets");
                        await reserveFunds(tenantId, entity.department, getAmount());
                    }
                } catch (err) {
                    console.error("[Budget] Fund reservation failed (skipped steps):", err);
                }
            } else {
                updates.currentStepIndex = finalNextIndex;
                const nextApprovers = await getCurrentStepApprovers(tenantId, workflow, finalNextIndex, requesterIdForNotif || undefined);
                if (nextApprovers && nextApprovers.length > 0) {
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
