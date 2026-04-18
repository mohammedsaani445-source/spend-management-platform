import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update, remove } from "firebase/database";
import { Contract, ContractStatus } from "@/types";
import { logAction } from "./audit";
import { evaluatePolicy, getCurrentStepApprovers } from "./approvals";
import { WorkflowEngine } from "./workflow/engine";

const getContractsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/contracts`);
const getContractRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/contracts/${id}`);

export const createContract = async (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>, user: any) => {
    try {
        const contractsRef = getContractsRef(user.tenantId);
        const newContractRef = push(contractsRef);
        const now = new Date().toISOString();

        // 1. Save contract as DRAFT first
        const fullContract: Contract = {
            ...contract,
            id: newContractRef.key!,
            status: 'DRAFT' as any,
            createdAt: new Date(now),
            updatedAt: new Date(now),
        };

        await set(newContractRef, {
            ...fullContract,
            startDate: fullContract.startDate.toISOString(),
            endDate: fullContract.endDate.toISOString(),
            createdAt: now,
            updatedAt: now,
        });

        // 2. Submit to Centralised Workflow Engine
        const workflowResult = await WorkflowEngine.submit(
            {
                module:      "CONTRACT",
                entityId:    newContractRef.key!,
                entityRef:   newContractRef.key!,
                entityTitle: `${contract.type} contract for ${contract.vendorName}`,
                amount:      contract.value,
                currency:    contract.currency || "GHS",
                department:  user.department || "Legal",
                source:      "USER",
            },
            {
                userId:   user.uid,
                userName: user.displayName || user.email,
                orgId:    user.tenantId,
                role:     user.role || "legal",
            }
        );

        // 3. Update contract with workflow result
        await update(newContractRef, {
            status:           workflowResult.status === 'AUTO_APPROVED' ? (contract.status || 'ACTIVE') : 'PENDING',
            workflowId:       workflowResult.requestId || null,
            approverId:       workflowResult.nextApprover || null,
            approverName:     workflowResult.nextRole || null,
            currentStepIndex: 0,
            approvalHistory:  [],
        });

        await logAction({
            tenantId: user.tenantId,
            actorId: user.uid,
            actorName: user.displayName || user.email,
            action: 'CREATE',
            entityType: 'CONTRACT',
            entityId: newContractRef.key!,
            description: `Created ${contract.type} contract for ${contract.vendorName}`
        });

        return newContractRef.key;
    } catch (error) {
        console.error("Error creating contract:", error);
        throw error;
    }
};

export const getContracts = async (tenantId: string): Promise<Contract[]> => {
    try {
        const snapshot = await get(getContractsRef(tenantId));

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.values(data).map((v: any) => ({
                ...v,
                startDate: new Date(v.startDate),
                endDate: new Date(v.endDate),
                createdAt: new Date(v.createdAt),
                updatedAt: new Date(v.updatedAt)
            })) as Contract[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching contracts", error);
        return [];
    }
};

export const updateContract = async (tenantId: string, contractId: string, updates: Partial<Contract>, user: any) => {
    try {
        const contractRef = getContractRef(tenantId, contractId);
        const now = new Date().toISOString();

        const dbUpdates: any = { ...updates, updatedAt: now };
        if (updates.startDate) dbUpdates.startDate = updates.startDate.toISOString();
        if (updates.endDate) dbUpdates.endDate = updates.endDate.toISOString();

        await update(contractRef, dbUpdates);

        await logAction({
            tenantId,
            actorId: user.uid,
            actorName: user.displayName || user.email,
            action: 'UPDATE',
            entityType: 'CONTRACT',
            entityId: contractId,
            description: `Updated contract: ${Object.keys(updates).join(', ')}`
        });
    } catch (error) {
        console.error("Error updating contract:", error);
        throw error;
    }
};

export const deleteContract = async (tenantId: string, contractId: string, user: any) => {
    try {
        const contractRef = getContractRef(tenantId, contractId);
        await remove(contractRef);

        await logAction({
            tenantId,
            actorId: user.uid,
            actorName: user.displayName || user.email,
            action: 'DELETE',
            entityType: 'CONTRACT',
            entityId: contractId,
            description: `Deleted contract ${contractId}`
        });
    } catch (error) {
        console.error("Error deleting contract:", error);
        throw error;
    }
};

export const getExpiringContracts = (contracts: Contract[], days: number = 90): Contract[] => {
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + days);

    return contracts.filter(c => {
        const end = new Date(c.endDate);
        return end <= horizon && c.status !== 'EXPIRED' && c.status !== 'TERMINATED';
    });
};
