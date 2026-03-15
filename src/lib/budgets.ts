import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update, query, orderByChild, equalTo } from "firebase/database";
import { Budget, AppUser, BudgetEnforcementLevel } from "@/types";
import { getSpendAnalytics } from "./analytics";

const getBudgetsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/budgets`);
const getBudgetRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/budgets/${id}`);

export const createBudget = async (tenantId: string, budget: Omit<Budget, 'id' | 'createdAt'>) => {
    try {
        const budgetsRef = getBudgetsRef(tenantId);
        const newBudgetRef = push(budgetsRef);

        await set(newBudgetRef, {
            ...budget,
            tenantId,
            committedAmount: 0, // (Phase 58) Start with zero commitments
            enforcementLevel: budget.enforcementLevel || 'SOFT', // Default to warning
            entityId: budget.entityId || 'DEFAULT',
            entityName: budget.entityName || 'Main Entity',
            glCodes: budget.glCodes || [],
            createdAt: new Date().toISOString()
        });

        return newBudgetRef.key;
    } catch (error) {
        console.error("Error creating budget: ", error);
        throw error;
    }
};

export const getBudgets = async (user: AppUser): Promise<Budget[]> => {
    try {
        const tenantId = user.tenantId;
        const budgetsRef = getBudgetsRef(tenantId);

        // Production Oversight: Admins, Finance, and Superusers can see all for the tenant
        if (['ADMIN', 'WORKSPACE_ADMIN', 'PLATFORM_SUPERUSER', 'FINANCE_MANAGER', 'FINANCE_SPECIALIST'].includes(user.role)) {
            const snapshot = await get(budgetsRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                return Object.entries(data).map(([key, v]: [string, any]) => ({
                    id: key,
                    ...v,
                    createdAt: new Date(v.createdAt),
                })) as Budget[];
            }
            return [];
        }

        // Department Isolation
        const dept = user.department || 'General';
        const isolationQuery = query(budgetsRef, orderByChild('department'), equalTo(dept));
        const snapshot = await get(isolationQuery);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.entries(data).map(([key, v]: [string, any]) => ({
                id: key,
                ...v,
                createdAt: new Date(v.createdAt),
            })) as Budget[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching budgets", error);
        return [];
    }
};

export const updateBudget = async (tenantId: string, id: string, budget: Partial<Budget>) => {
    try {
        const budgetRef = getBudgetRef(tenantId, id);
        await update(budgetRef, budget);
    } catch (error) {
        console.error("Error updating budget:", error);
        throw error;
    }
};

export const getDepartmentBudgetStatus = async (user: AppUser, department: string) => {
    const [budgets, analytics] = await Promise.all([
        getBudgets(user),
        getSpendAnalytics(user)
    ]);

    const deptBudget = budgets.find(b => b.department === department);
    if (!deptBudget) return null;

    const spent = analytics.spendByDepartment[department] || 0;
    const committed = deptBudget.committedAmount || 0;
    const totalUtilization = spent + committed;
    const remaining = deptBudget.amount - totalUtilization;

    return {
        budget: deptBudget.amount,
        spent,
        committed,
        totalUtilization,
        remaining,
        percent: deptBudget.amount > 0 ? (totalUtilization / deptBudget.amount) * 100 : 0,
        currency: deptBudget.currency || 'USD',
        enforcementLevel: deptBudget.enforcementLevel || 'SOFT'
    };
};

/**
 * Updates the global budget enforcement level for the tenant.
 */
export const setGlobalEnforcementLevel = async (tenantId: string, level: BudgetEnforcementLevel) => {
    try {
        const settingsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/settings`);
        await update(settingsRef, { budgetEnforcementLevel: level });
        const { logAction } = await import("./audit");
        await logAction({
            tenantId,
            actorId: 'system',
            actorName: 'Budget Service',
            action: 'UPDATE',
            entityType: 'BUDGET',
            entityId: 'SETTINGS',
            description: `Policy Update: Default Budget Enforcement set to ${level}`
        });
    } catch (error) {
        console.error("[Budget] Failed to update global enforcement level:", error);
        throw error;
    }
};

/**
 * Phase 58: Validate Budget for a new Requisition
 * Checks if the department has enough remaining budget.
 * Returns { allowed: boolean, remaining: number, currency: string, enforcementLevel: string }
 */
export const validateRequisitionBudget = async (tenantId: string, department: string, amount: number) => {
    try {
        const budgetsRef = getBudgetsRef(tenantId);
        const snapshot = await get(query(budgetsRef, orderByChild('department'), equalTo(department)));
        if (!snapshot.exists()) {
            return { allowed: true, remaining: 0, currency: 'USD', enforcementLevel: 'SOFT', noBudgetFound: true };
        }

        const data = snapshot.val();
        const budgetId = Object.keys(data)[0];
        const budget = data[budgetId] as Budget;

        // Use standard status logic to calculate remaining
        // Note: For high accuracy, this should ideally be done in a cloud function or with a summary document
        // but for this implementation, we calculate based on the current budget object.
        const committed = budget.committedAmount || 0;
        
        // We need 'Spent' from analytics, but for simple validation here, 
        // we can assume budget.amount is the TOTAL for the year, and we track 
        // spent separately. In a real production system, we'd have a 'spentAmount' 
        // field updated via settlement.
        
        // Let's get the status which includes spent
        const analytics = await getSpendAnalytics({ tenantId, department, role: 'ADMIN' } as AppUser);
        const spent = analytics.spendByDepartment[department] || 0;
        
        const totalUtilization = spent + committed;
        const remaining = budget.amount - totalUtilization;
        const isExceeded = amount > remaining;
        const enforcementLevel = budget.enforcementLevel || 'SOFT';

        return {
            allowed: enforcementLevel === 'HARD' ? !isExceeded : true,
            isOverBudget: isExceeded,
            remaining,
            currency: budget.currency || 'USD',
            enforcementLevel
        };
    } catch (error) {
        console.error("[Budget] Validation failed:", error);
        return { allowed: true, remaining: 0, currency: 'USD', enforcementLevel: 'SOFT', error: true };
    }
};

/**
 * Phase 58: Reserve Funds (Move to Committed)
 * Called when a Requisition is fully approved and becomes a commitment.
 */
export const reserveFunds = async (tenantId: string, department: string, amount: number) => {
    try {
        const budgetsRef = getBudgetsRef(tenantId);
        const snapshot = await get(query(budgetsRef, orderByChild('department'), equalTo(department)));
        if (!snapshot.exists()) return;

        const data = snapshot.val();
        const budgetId = Object.keys(data)[0];
        const budget = data[budgetId];

        const budgetRef = getBudgetRef(tenantId, budgetId);
        await update(budgetRef, {
            committedAmount: (budget.committedAmount || 0) + amount,
            updatedAt: new Date().toISOString()
        });

        // Audit Log
        const { logAction } = await import("./audit");
        await logAction({
            tenantId,
            actorId: 'system',
            actorName: 'Budget Service',
            action: 'UPDATE',
            entityType: 'BUDGET',
            entityId: budgetId,
            description: `Reserved ${amount} ${budget.currency || 'USD'} for ${department} (Commitment Created).`
        });
    } catch (error) {
        console.error("[Budget] Failed to reserve funds:", error);
    }
};

/**
 * Phase 58: Transition Commitment to Spent
 * Called when a Bill is paid, moving funds from "Committed" to effectively "Spent" 
 * (Analytics tracks spent, so we just release the commitment).
 */
export const transitionCommittedToSpent = async (tenantId: string, department: string, amount: number) => {
    try {
        const budgetsRef = getBudgetsRef(tenantId);
        const snapshot = await get(query(budgetsRef, orderByChild('department'), equalTo(department)));
        if (!snapshot.exists()) return;

        const data = snapshot.val();
        const budgetId = Object.keys(data)[0];
        const budget = data[budgetId];

        const budgetRef = getBudgetRef(tenantId, budgetId);
        const newCommitted = Math.max(0, (budget.committedAmount || 0) - amount);
        
        await update(budgetRef, {
            committedAmount: newCommitted,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("[Budget] Failed to transition funds:", error);
    }
};

/**
 * Phase 58: Release Commitment
 * Called when a Requisition or PO is voided/rejected.
 */
export const releaseFunds = async (tenantId: string, department: string, amount: number) => {
    try {
        const budgetsRef = getBudgetsRef(tenantId);
        const snapshot = await get(query(budgetsRef, orderByChild('department'), equalTo(department)));
        if (!snapshot.exists()) return;

        const data = snapshot.val();
        const budgetId = Object.keys(data)[0];
        const budget = data[budgetId];

        const budgetRef = getBudgetRef(tenantId, budgetId);
        const newCommitted = Math.max(0, (budget.committedAmount || 0) - amount);

        await update(budgetRef, {
            committedAmount: newCommitted,
            updatedAt: new Date().toISOString()
        });

        // Audit Log
        const { logAction } = await import("./audit");
        await logAction({
            tenantId,
            actorId: 'system',
            actorName: 'Budget Service',
            action: 'UPDATE',
            entityType: 'BUDGET',
            entityId: budgetId,
            description: `Released ${amount} ${budget.currency || 'USD'} for ${department} (Commitment Voided).`
        });
    } catch (error) {
        console.error("[Budget] Failed to release funds:", error);
    }
};
