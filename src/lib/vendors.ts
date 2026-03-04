import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update } from "firebase/database";
import { Vendor } from "@/types";

const getVendorsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/vendors`);
const getVendorRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/vendors/${id}`);

export const addVendor = async (tenantId: string, vendor: Omit<Vendor, 'id' | 'createdAt'>) => {
    try {
        const vendorsRef = getVendorsRef(tenantId);
        const newVendorRef = push(vendorsRef);

        await set(newVendorRef, {
            ...vendor,
            id: newVendorRef.key,
            createdAt: new Date().toISOString(),
        });

        return newVendorRef.key;
    } catch (error) {
        console.error("Error adding vendor: ", error);
        throw error;
    }
};

export const getVendors = async (tenantId: string): Promise<Vendor[]> => {
    try {
        const vendorsRef = getVendorsRef(tenantId);
        const snapshot = await get(vendorsRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.values(data).map((v: any) => ({
                ...v,
                createdAt: new Date(v.createdAt),
            })) as Vendor[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching vendors", error);
        return [];
    }
};

export const updateVendorStatus = async (tenantId: string, vendorId: string, status: 'ACTIVE' | 'INACTIVE') => {
    try {
        const vendorRef = getVendorRef(tenantId, vendorId);
        await update(vendorRef, { status });
    } catch (error) {
        console.error(`[Vendors] Error updating vendor ${vendorId}:`, error);
        throw error;
    }
};

export const getVendor = async (tenantId: string, id: string): Promise<Vendor | null> => {
    try {
        const vendorRef = getVendorRef(tenantId, id);
        const snapshot = await get(vendorRef);
        if (snapshot.exists()) {
            return { ...snapshot.val(), id } as Vendor;
        }
    } catch (error: any) {
        if (error.code === 'PERMISSION_DENIED' || error.message?.includes('Permission denied')) {
            console.warn(`[Vendors] Permission denied for vendor ${id} in tenant ${tenantId}`);
        } else {
            console.error(`[Vendors] Error fetching vendor ${id}:`, error);
        }
    }
    return null;
};
