import { db, DB_PREFIX } from "./firebase";
import { ref, get, set, push, update, remove } from "firebase/database";
import { Department } from "@/types";

const getDepartmentsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/departments`);
const getDepartmentRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/departments/${id}`);

export const getDepartments = async (tenantId: string): Promise<Department[]> => {
    try {
        const snapshot = await get(getDepartmentsRef(tenantId));
        if (snapshot.exists()) return Object.values(snapshot.val());
    } catch (error: any) {
        console.error("[Departments] Error fetching departments:", error);
    }
    return [];
};

export const saveDepartment = async (tenantId: string, dept: Omit<Department, 'id'> & { id?: string }) => {
    try {
        const deptsRef = getDepartmentsRef(tenantId);
        const id = dept.id || push(deptsRef).key;
        const finalDept = {
            ...dept,
            id,
            tenantId,
            isActive: dept.isActive !== false,
            createdAt: dept.createdAt || new Date().toISOString()
        };
        await set(getDepartmentRef(tenantId, id!), finalDept);
        return id;
    } catch (error: any) {
        console.error("[Departments] Error saving department:", error);
        throw error;
    }
};

export const deleteDepartment = async (tenantId: string, id: string) => {
    try {
        await remove(getDepartmentRef(tenantId, id));
    } catch (error: any) {
        console.error(`[Departments] Error deleting department ${id}:`, error);
        throw error;
    }
};
