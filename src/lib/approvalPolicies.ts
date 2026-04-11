import { db, DB_PREFIX } from "./firebase";
import { ref, get, set, push, update, remove } from "firebase/database";
import { ApprovalPolicy, ApprovalPolicyModule, UserRole } from "@/types";

const getPoliciesRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/approval_policies`);
const getPolicyRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/approval_policies/${id}`);

/**
 * Fetches all approval policies for a tenant, sorted by priority descending.
 */
export const getApprovalPolicies = async (tenantId: string): Promise<ApprovalPolicy[]> => {
    try {
        const snapshot = await get(getPoliciesRef(tenantId));
        if (snapshot.exists()) {
            const data = snapshot.val();
            const policies = Object.values(data) as ApprovalPolicy[];
            return policies.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        }
        return [];
    } catch (error) {
        console.error("Error fetching approval policies:", error);
        return [];
    }
};

/**
 * Evaluates which policy should apply to a transaction based on module, currency, and amount.
 * Returns the highest priority matching policy.
 */
export const evaluatePolicy = async (
    tenantId: string, 
    module: ApprovalPolicyModule, 
    currency: string, 
    amount: number
): Promise<ApprovalPolicy | null> => {
    try {
        const policies = await getApprovalPolicies(tenantId);
        
        // Filter by active, module, and currency
        const matchingPolicies = policies.filter(p => 
            p.isActive && 
            p.module === module && 
            p.currency === currency
        );

        if (matchingPolicies.length === 0) return null;

        // Since getApprovalPolicies already sorts by priority desc, 
        // the first one is our winner.
        return matchingPolicies[0];
    } catch (error) {
        console.error("Error evaluating policy:", error);
        return null;
    }
};

/**
 * Saves or updates an approval policy.
 */
export const upsertApprovalPolicy = async (tenantId: string, policy: Partial<ApprovalPolicy>) => {
    try {
        const id = policy.id || push(getPoliciesRef(tenantId)).key!;
        const now = new Date().toISOString();
        
        const finalPolicy: any = {
            id,
            tenantId,
            module: policy.module || 'requisitions',
            name: policy.name || 'New Policy',
            description: policy.description || '',
            isActive: policy.isActive !== undefined ? policy.isActive : true,
            autoApproveLimit: policy.autoApproveLimit || 0,
            currency: policy.currency || 'GHS',
            steps: policy.steps || [],
            usageCount: policy.usageCount || 0,
            priority: policy.priority || 0,
            createdAt: policy.createdAt || now,
            updatedAt: now,
        };

        if (policy.departmentId) {
            finalPolicy.departmentId = policy.departmentId;
        }

        await set(getPolicyRef(tenantId, id), finalPolicy);
        return id;
    } catch (error) {
        console.error("Error saving approval policy:", error);
        throw error;
    }
};

/**
 * Deletes an approval policy.
 */
export const deleteApprovalPolicy = async (tenantId: string, id: string) => {
    try {
        await remove(getPolicyRef(tenantId, id));
    } catch (error) {
        console.error("Error deleting approval policy:", error);
        throw error;
    }
};

/**
 * Toggles a policy's active status.
 */
export const togglePolicyStatus = async (tenantId: string, id: string, isActive: boolean) => {
    try {
        await update(getPolicyRef(tenantId, id), { isActive, updatedAt: new Date().toISOString() });
    } catch (error) {
        console.error("Error toggling policy status:", error);
        throw error;
    }
};

/**
 * Seeds default policies if they are missing.
 * Checks for specific IDs to ensure the 5 core policies are always present.
 */
export const seedDefaultPolicies = async (tenantId: string) => {
    try {
        const existing = await getApprovalPolicies(tenantId);
        const existingIds = new Set(existing.map(p => p.id));

        const defaults: Partial<ApprovalPolicy>[] = [
            {
                id: 'default-requisition-1',
                module: 'requisitions',
                name: 'Standard Requisition Approval',
                description: 'Default routing for standard purchase requests across all departments.',
                autoApproveLimit: 0,
                currency: 'GHS',
                isActive: true,
                priority: 10,
                steps: [
                    { id: 'sr1', name: 'Dept Head', role: 'dept_head', sla_hours: 48, isParallel: false, isRequired: true },
                    { id: 'sr2', name: 'Proc Officer', role: 'proc_officer', sla_hours: 24, isParallel: false, isRequired: true },
                ]
            },
            {
                id: 'default-po-1',
                module: 'purchase_orders',
                name: 'High-Value PO Approval',
                description: 'Approval chain for purchase orders exceeding standard thresholds.',
                autoApproveLimit: 0,
                currency: 'GHS',
                isActive: true,
                priority: 20,
                steps: [
                    { id: 'hp1', name: 'Proc Manager', role: 'proc_mgr', sla_hours: 48, isParallel: false, isRequired: true },
                    { id: 'hp2', name: 'Finance Manager', role: 'finance_mgr', sla_hours: 24, isParallel: false, isRequired: true },
                ]
            },
            {
                id: 'default-po-2',
                module: 'purchase_orders',
                name: 'Executive PO Sign-Off',
                description: 'Three-tier approval for high-value purchase orders above GHS 100,000.',
                autoApproveLimit: 0,
                currency: 'GHS',
                isActive: true,
                priority: 80,
                steps: [
                    { id: 'ep1', name: 'Proc Manager', role: 'proc_mgr', sla_hours: 48, isParallel: false, isRequired: true },
                    { id: 'ep2', name: 'Finance Manager', role: 'finance_mgr', sla_hours: 48, isParallel: false, isRequired: true },
                    { id: 'ep3', name: 'CFO', role: 'administrator', sla_hours: 72, isParallel: false, isRequired: true },
                ]
            },
            {
                id: 'default-invoice-1',
                module: 'invoices',
                name: 'Invoice Fast-Track',
                description: 'Streamlined invoice processing with auto-approve for amounts under GHS 1,000.',
                autoApproveLimit: 1000,
                currency: 'GHS',
                isActive: true,
                priority: 30,
                steps: [
                    { id: 'if1', name: 'AP Officer', role: 'ap_officer', sla_hours: 24, isParallel: false, isRequired: true },
                ]
            },
            {
                id: 'default-contract-1',
                module: 'contracts',
                name: 'Contract Review & Sign',
                description: 'Legal and executive oversight for vendor contracts — currently inactive.',
                autoApproveLimit: 0,
                currency: 'GHS',
                isActive: false,
                priority: 50,
                steps: [
                    { id: 'cr1', name: 'Proc Manager', role: 'proc_mgr', sla_hours: 72, isParallel: true, isRequired: true },
                    { id: 'cr2', name: 'Finance Manager', role: 'finance_mgr', sla_hours: 72, isParallel: true, isRequired: true },
                    { id: 'cr3', name: 'CFO', role: 'administrator', sla_hours: 120, isParallel: false, isRequired: true },
                ]
            }
        ];

        // Seed only if a default ID is missing
        for (const policyData of defaults) {
            if (!existingIds.has(policyData.id!)) {
                await upsertApprovalPolicy(tenantId, policyData);
            }
        }
    } catch (error) {
        console.error("Error seeding default policies:", error);
    }
};

