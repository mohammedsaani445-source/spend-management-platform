import { db, DB_PREFIX } from "./firebase";
import { ref, get, set, push, update, remove } from "firebase/database";
import { Location } from "@/types";

const getLocationsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/locations`);
const getLocationRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/locations/${id}`);

export const getLocations = async (tenantId: string): Promise<Location[]> => {
    try {
        const snapshot = await get(getLocationsRef(tenantId));
        if (snapshot.exists()) return Object.values(snapshot.val());
    } catch (error: any) {
        console.error("[Locations] Error fetching locations:", error);
    }
    return [];
};

export const saveLocation = async (tenantId: string, location: Omit<Location, 'id'> & { id?: string }) => {
    try {
        const locationsRef = getLocationsRef(tenantId);
        const id = location.id || push(locationsRef).key;
        const finalLocation = {
            ...location,
            id,
            tenantId,
            isActive: location.isActive !== false,
            createdAt: location.createdAt || new Date().toISOString()
        };
        await set(getLocationRef(tenantId, id!), finalLocation);
        return id;
    } catch (error: any) {
        console.error("[Locations] Error saving location:", error);
        throw error;
    }
};

export const deleteLocation = async (tenantId: string, id: string) => {
    try {
        await remove(getLocationRef(tenantId, id));
    } catch (error: any) {
        console.error(`[Locations] Error deleting location ${id}:`, error);
        throw error;
    }
};
