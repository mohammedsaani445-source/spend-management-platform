import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update, remove } from "firebase/database";
import { Contract, ContractStatus } from "@/types";
import { logAction } from "./audit";

const getContractsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/contracts`);
const getContractRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/contracts/${id}`);

export const createContract = async (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>, user: any) => {
    try {
        const contractsRef = getContractsRef(user.tenantId);
        const newContractRef = push(contractsRef);
        const now = new Date().toISOString();

        const fullContract: Contract = {
            ...contract,
            id: newContractRef.key!,
            createdAt: new Date(now),
            updatedAt: new Date(now)
        };

        await set(newContractRef, {
            ...fullContract,
            startDate: fullContract.startDate.toISOString(),
            endDate: fullContract.endDate.toISOString(),
            createdAt: now,
            updatedAt: now
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

        // 🔔 Notification Trigger (Phase 57)
        try {
            const { notifyRole } = await import("./notifications");
            await notifyRole(
                user.tenantId,
                'PLATFORM_SUPERUSER', // Or PROCUREMENT_MANAGER if role exists
                'SYSTEM',
                'New Contract Created',
                `A new ${contract.type} contract has been created for ${contract.vendorName}.`,
                `/dashboard/contracts`
            );
        } catch (err) {
            console.error("Notify error:", err);
        }

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
