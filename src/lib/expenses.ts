import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, update } from "firebase/database";
import { AppUser } from "@/types";
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
    approverId?: string;
    approverName?: string;
    createdAt: string;
}

const getExpensesRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/expenses`);

/**
 * Creates a new expense claim.
 */
export const createExpense = async (tenantId: string, claim: Omit<ExpenseClaim, 'id' | 'createdAt' | 'status'>, user: AppUser) => {
    try {
        const expensesRef = getExpensesRef(tenantId);
        const newClaimRef = push(expensesRef);
        const claimId = newClaimRef.key!;

        const status: ExpenseClaim['status'] = 'APPROVED';
        const fullClaim: ExpenseClaim = {
            ...claim,
            id: claimId,
            status,
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
