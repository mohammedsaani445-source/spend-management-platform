import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update, query, orderByChild, equalTo, onValue } from "firebase/database";
import { Requisition, RequisitionStatus, AppUser } from "@/types";
import { evaluateWorkflow, getCurrentStepApprovers, processApprovalAction } from "./approvals";
import { runComplianceCheck } from "./compliance_checker";
import { PaymentService } from "./payments";
import { extractInvoiceDataServer as extractQuoteData } from "./ocr";
import { canViewEntity } from "./permissions";
import { getBudgets } from "./budgets";
import { getSpendAnalytics } from "./analytics";

const getRequisitionsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/requisitions`);
const getRequisitionRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/requisitions/${id}`);

export const createRequisition = async (requisition: Omit<Requisition, 'id' | 'createdAt'>) => {
    try {
        const tenantId = requisition.tenantId;

        // --- ENTERPRISE WORKFLOW ENGINE ---
        const workflow = await evaluateWorkflow(tenantId, 'REQUISITION', requisition.totalAmount);
        let approver = { uid: 'system-admin', name: 'System Administrator', email: 'admin@apexprocure.com' };

        if (workflow && workflow.steps.length > 0) {
            const nextApprovers = await getCurrentStepApprovers(tenantId, workflow, 0, requisition.requesterId);
            if (nextApprovers.length > 0) {
                approver = {
                    uid: nextApprovers[0].uid,
                    name: nextApprovers[0].name,
                    email: nextApprovers[0].email
                };
            }
        }

        const reqsRef = getRequisitionsRef(tenantId);
        const newReqRef = push(reqsRef);

        // --- BUDGET CHECK GATE (Phase 58: Strategic Enforcement) ---
        let status: RequisitionStatus = 'PENDING';
        
        try {
            const { validateRequisitionBudget } = await import("./budgets");
            const validation = await validateRequisitionBudget(tenantId, requisition.department, requisition.totalAmount);
            
            if (validation.isOverBudget) {
                if (validation.enforcementLevel === 'HARD') {
                    // ❌ CRITICAL GATE: Block submission
                    const { logAction } = await import("./audit");
                    await logAction({
                        tenantId,
                        actorId: requisition.requesterId,
                        actorName: requisition.requesterName,
                        action: 'CREATE',
                        entityType: 'REQUISITION',
                        entityId: 'BLOCKED',
                        description: `Requisition BLOCKED (HARD Enforcement). Amount: ${requisition.totalAmount} exceeds available budget of ${validation.remaining} for ${requisition.department}.`
                    });

                    throw new Error(`Budget Exceeded: Your department has ${validation.remaining} ${validation.currency} remaining, which is insufficient for this request (${requisition.totalAmount}).`);
                } else {
                    // ⚠️ SOFT GATE: Proceed with flag
                    status = 'OVER_BUDGET';
                    console.warn(`[Budget Gate] Requisition is OVER_BUDGET. Amount: ${requisition.totalAmount}, Remaining: ${validation.remaining}`);
                }
            }
        } catch (budgetError: any) {
            if (budgetError.message.includes("Budget Exceeded")) throw budgetError;
            console.error("Budget check failed, defaulting to PENDING", budgetError);
        }

        const cleanReq = {
            ...requisition,
            vendorId: requisition.vendorId || null,
            vendorName: requisition.vendorName || null,
            currency: requisition.currency || 'USD',
            id: newReqRef.key,
            createdAt: new Date().toISOString(),
            status,
            approverId: approver.uid,
            approverName: approver.name || 'Auto-Approver',
            workflowId: workflow?.id || null,
            currentStepIndex: workflow ? 0 : -1,
            // Attach hierarchy context for isolation
            locationId: requisition.locationId || null,
            departmentId: requisition.departmentId || null
        };

        await set(newReqRef, cleanReq);

        // Trigger Notification for Approver
        const { createNotification } = await import("./notifications");
        await createNotification({
            tenantId,
            userId: approver.uid,
            type: 'APPROVAL_REQUEST',
            title: 'New Approval Required',
            message: `${requisition.requesterName} has submitted a new requisition for ${requisition.department}. amount: ${requisition.totalAmount} ${requisition.currency || 'USD'}`,
            link: '/dashboard/approvals'
        });

        return newReqRef.key;
    } catch (error) {
        console.error("Error creating requisition: ", error);
        throw error;
    }
};

export const subscribeToRequisitions = (user: AppUser, callback: (reqs: Requisition[]) => void) => {
    if (!user || !user.tenantId) {
        callback([]);
        return () => { }; // Return no-op unsubscribe
    }

    const tenantId = user.tenantId;
    const reqsRef = getRequisitionsRef(tenantId);

    // For Admins/Finance/Superusers, listen to all requisitions
    if (['ADMIN', 'WORKSPACE_ADMIN', 'PLATFORM_SUPERUSER', 'FINANCE_MANAGER', 'FINANCE_SPECIALIST'].includes(user.role)) {
        const unsubscribe = onValue(reqsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const reqArray = Object.values(data).map((v: any) => ({
                    ...v,
                    createdAt: new Date(v.createdAt),
                })) as Requisition[];
                callback(reqArray.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
            } else {
                callback([]);
            }
        });
        return unsubscribe;
    }

    // For standard users (REQUESTER/APPROVER), we need to carefully aggregate listeners
    // Alternatively, for simplicity in Firebase RTDB, we can fetch all and filter client-side, 
    // but the most efficient is querying. However, combining multiple onValue queries requires distinct states.
    // For a SaaS platform MVP, listening to the full tenant list and filtering memory is simpler and robust for <10,000 reqs.

    const unsubscribe = onValue(reqsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const allReqs = Object.values(data).map((v: any) => ({
                ...v,
                createdAt: new Date(v.createdAt),
            })) as Requisition[];

            // Filter locally based on user permissions
            const filtered = allReqs.filter(req => {
                return req.requesterId === user.uid ||
                    req.approverId === user.uid ||
                    (user.departmentId && req.departmentId === user.departmentId);
            });

            callback(filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        } else {
            callback([]);
        }
    });

    return unsubscribe;
};

export const getRequisitions = async (user: AppUser): Promise<Requisition[]> => {
    return new Promise((resolve) => {
        let unsubscribe: (() => void) | undefined;
        unsubscribe = subscribeToRequisitions(user, (data) => {
            if (unsubscribe) {
                unsubscribe();
            } else {
                // In case the callback fires synchronously before unsubscribe is returned
                setTimeout(() => unsubscribe && unsubscribe(), 0);
            }
            resolve(data);
        });
    });
};

export const updateRequisitionStatus = async (tenantId: string, reqId: string, status: RequisitionStatus, approverId?: string) => {
    const reqRef = getRequisitionRef(tenantId, reqId);
    const updates: any = { status };
    if (approverId) updates.approverId = approverId;

    await update(reqRef, updates);
};

export const approveRequisition = async (tenantId: string, reqId: string) => {
    try {
        const reqRef = getRequisitionRef(tenantId, reqId);
        const snapshot = await get(reqRef);
        if (!snapshot.exists()) throw new Error("Requisition not found");
        const req = snapshot.val() as Requisition;

        // 1. Process via Enterprise Engine
        const updates = await processApprovalAction({
            tenantId,
            entityId: reqId,
            entityType: 'REQUISITION',
            actor: { uid: 'system', name: 'Auto System', email: 'system@apexprocure.com' }, // In real app, this would be current user
            action: 'APPROVE'
        });

        // 2. Compliance and Post-Approval Logic if finalized
        if (updates.status === 'APPROVED') {
            const compliance = await runComplianceCheck(tenantId, req);
            await update(reqRef, {
                complianceScore: compliance.riskScore,
                complianceFindings: compliance.findings
            });

            // 🛡️ Phase 58: Reserve Funds (Move to Committed)
            try {
                const { reserveFunds } = await import("./budgets");
                await reserveFunds(tenantId, req.department, Number(req.totalAmount));
            } catch (err) {
                console.error("[Budget] Fund reservation failed:", err);
            }

            // Direct Pay on final approval
            await PaymentService.initiateDirectTransfer(tenantId, req as any);
            return { final: true, compliance };
        }

        // 3. Notification for next approver if still pending
        if (updates.approverId) {
            const { createNotification } = await import("./notifications");
            await createNotification({
                tenantId,
                userId: updates.approverId,
                type: 'APPROVAL_REQUEST',
                title: 'Tiered Approval Required',
                message: `Next approval tier for ${req.requesterName}'s request.`,
                link: '/dashboard/approvals'
            });
        }

        return { final: false };
    } catch (error) {
        console.error("Error approving requisition", error);
        throw error;
    }
};
