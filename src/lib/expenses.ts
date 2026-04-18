import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, update } from "firebase/database";
import { AppUser, ApprovalHistoryEntry, ApprovalPolicy } from "@/types";
import { evaluatePolicy, getCurrentStepApprovers } from "./approvals";
import { logAction } from "./audit";

/**
 * Interface representing an expense claim.
 */
export interface ExpenseClaim {
    id?: string;
    tenantId: string;
    description: string;
    category: 'TRAVEL' | 'MEALS' | 'SUPPLIES' | 'SOFTWARE' | 'OTHER';
    amount: number;
    currency: string;
    department: string;
    requesterId: string;
    requesterName: string;
    date: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
    receiptUrl?: string;
    merchant?: string;
    workflowId?: string;
    currentStepIndex?: number;
    approverId?: string;
    approverName?: string;
    approvalHistory?: ApprovalHistoryEntry[];
    createdAt: string;
}

const getExpensesRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/expenses`);

/**
 * Creates a new expense claim and initiates its approval workflow.
 */
export const createExpense = async (tenantId: string, claim: Omit<ExpenseClaim, 'id' | 'createdAt' | 'status'>, user: AppUser) => {
    try {
        const expensesRef = getExpensesRef(tenantId);
        const newClaimRef = push(expensesRef);
        const claimId = newClaimRef.key!;

        // 1. Evaluate Policy
        const policy = await evaluatePolicy(tenantId, 'expenses', claim.amount, claim.currency, claim.department);

        let status: ExpenseClaim['status'] = 'PENDING';
        let workflowUpdate: any = {};

        if (policy && policy.steps && policy.steps.length > 0) {
            const firstApprovers = await getCurrentStepApprovers(tenantId, policy as any, 0, user.uid);
            workflowUpdate = {
                workflowId: policy.id,
                currentStepIndex: 0,
                approverId: firstApprovers.length > 0 ? firstApprovers[0].uid : 'admin',
                approverName: firstApprovers.length > 0 ? firstApprovers[0].name : 'System Administrator'
            };
        } else {
            // Auto-approve if no policy found (or set to default admin)
            status = 'APPROVED';
            workflowUpdate = {
                approverId: 'admin',
                approverName: 'System Auto-Approval'
            };
        }

        const fullClaim: ExpenseClaim = {
            ...claim,
            id: claimId,
            status,
            ...workflowUpdate,
            approvalHistory: [],
            createdAt: new Date().toISOString()
        };

        await set(ref(db, `${DB_PREFIX}/tenants/${tenantId}/expenses/${claimId}`), fullClaim);

        // 2. Log Action
        await logAction({
            tenantId,
            actorId: user.uid,
            actorName: user.displayName,
            action: 'CREATE',
            entityType: 'REQUISITION', // Mapping to REQUISITION for general spend audit
            entityId: claimId,
            description: `Created expense claim for ${claim.currency} ${claim.amount}: ${claim.description}`
        });

        // 3. Notify Approvers
        if (status === 'PENDING' && workflowUpdate.approverId) {
            try {
                const { notifyUser } = await import("./notifications");
                await notifyUser(
                    tenantId,
                    workflowUpdate.approverId,
                    'APPROVAL_REQUEST',
                    'Expense Approval Required',
                    `${user.displayName} submitted an expense claim of ${claim.currency} ${claim.amount} for approval.`,
                    `/dashboard/approvals`
                );
            } catch (err) {
                console.error("Failed to notify approver:", err);
            }
        }

        return claimId;
    } catch (error) {
        console.error("[Expenses] Error creating expense:", error);
        throw error;
    }
};

/**
 * Fetches all expenses for a tenant.
 */
export const getExpenses = async (tenantId: string): Promise<ExpenseClaim[]> => {
    try {
        const snapshot = await get(getExpensesRef(tenantId));
        if (snapshot.exists()) {
            return Object.values(snapshot.val());
        }
        return [];
    } catch (error) {
        console.error("[Expenses] Error fetching expenses:", error);
        return [];
    }
};

/**
 * Fetches expenses for a specific user.
 */
export const getUserExpenses = async (tenantId: string, userId: string): Promise<ExpenseClaim[]> => {
    const all = await getExpenses(tenantId);
    return all.filter(e => e.requesterId === userId);
};

/**
 * Finalizes an expense once approved (e.g., marks for payment).
 */
export const markExpenseAsPaid = async (tenantId: string, expenseId: string) => {
    const expenseRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/expenses/${expenseId}`);
    await update(expenseRef, { status: 'PAID' });
};
