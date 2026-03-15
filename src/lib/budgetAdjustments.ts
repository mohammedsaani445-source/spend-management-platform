import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, update } from "firebase/database";
import { BudgetAdjustment, AppUser } from "@/types";
import { logAction } from "./audit";
import { notifyUser } from "./notifications";

const getAdjustmentsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/budgetAdjustments`);

export const createBudgetAdjustmentRequest = async (params: Omit<BudgetAdjustment, 'id' | 'createdAt' | 'status'>) => {
    try {
        const adjustmentsRef = getAdjustmentsRef(params.tenantId);
        const newAdjustmentRef = push(adjustmentsRef);
        
        const adjustment: BudgetAdjustment = {
            ...params,
            id: newAdjustmentRef.key || undefined,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };

        await set(newAdjustmentRef, adjustment);

        await logAction({
            tenantId: params.tenantId,
            actorId: params.requesterId,
            actorName: params.requesterName,
            action: 'CREATE',
            entityType: 'BUDGET',
            entityId: newAdjustmentRef.key || 'unknown',
            description: `Requested budget ${params.type.toLowerCase()} of ${params.amount} ${params.currency} for ${params.department}`
        });

        // Notify Finance Managers
        // (Simplified: in a real app, we'd query users with FINANCE_MANAGER role)
        // For now, we'll assume there's a system notification or specific approver

        return adjustment;
    } catch (error) {
        console.error("Error creating budget adjustment request:", error);
        throw error;
    }
};

export const processBudgetAdjustment = async (
    tenantId: string, 
    adjustmentId: string, 
    status: 'APPROVED' | 'REJECTED', 
    approver: { uid: string, name: string }
) => {
    try {
        const adjustmentRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/budgetAdjustments/${adjustmentId}`);
        const snapshot = await get(adjustmentRef);
        
        if (!snapshot.exists()) throw new Error("Adjustment request not found");
        
        const adjustment = snapshot.val() as BudgetAdjustment;

        const updates: any = {
            status,
            approverId: approver.uid,
            approverName: approver.name,
            processedAt: new Date().toISOString()
        };

        if (status === 'APPROVED') {
            // Apply the actual budget change
            const budgetsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/budgets`);
            const budgetsSnap = await get(budgetsRef);
            
            if (budgetsSnap.exists()) {
                const budgets = budgetsSnap.val();
                const budgetId = Object.keys(budgets).find(key => budgets[key].department === adjustment.department);
                
                if (budgetId) {
                    const currentAmount = budgets[budgetId].amount || 0;
                    const newAmount = currentAmount + adjustment.amount;
                    
                    await update(ref(db, `${DB_PREFIX}/tenants/${tenantId}/budgets/${budgetId}`), {
                        amount: newAmount,
                        updatedAt: new Date().toISOString()
                    });

                    await logAction({
                        tenantId,
                        actorId: approver.uid,
                        actorName: approver.name,
                        action: 'UPDATE',
                        entityType: 'BUDGET',
                        entityId: budgetId,
                        description: `Approved budget increase of ${adjustment.amount} ${adjustment.currency}. New total: ${newAmount}`
                    });
                }
            }
        }

        await update(adjustmentRef, updates);

        // Notify Requester
        await notifyUser(
            tenantId,
            adjustment.requesterId,
            status === 'APPROVED' ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED',
            `Budget Request ${status}`,
            `Your request for a budget ${adjustment.type.toLowerCase()} has been ${status.toLowerCase()} by ${approver.name}.`,
            '/dashboard/budgets'
        );

        return true;
    } catch (error) {
        console.error("Error processing budget adjustment:", error);
        throw error;
    }
};
