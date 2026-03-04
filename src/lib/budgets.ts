import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update, query, orderByChild, equalTo } from "firebase/database";
import { Budget, AppUser } from "@/types";
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
        if (user.role === 'ADMIN' || user.role === 'FINANCE' || user.role === 'SUPERUSER') {
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
    const remaining = deptBudget.amount - spent;

    return {
        budget: deptBudget.amount,
        spent,
        remaining,
        percent: (spent / deptBudget.amount) * 100,
        currency: deptBudget.currency || 'USD'
    };
};
