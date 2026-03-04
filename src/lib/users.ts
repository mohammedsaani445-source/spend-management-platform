import { db, DB_PREFIX } from "./firebase";
import { ref, get, update, child } from "firebase/database";
import { AppUser, UserRole } from "@/types";
import { logAction } from "./audit";

const getTenantUsersRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/users`);
const getUserRef = (tenantId: string, uid: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${uid}`);

/**
 * Fetches all users from the platform.
 * PRODUCTION REALIZATION: Ideally this should use an Admin SDK in a Cloud Function,
 * but for this enterprise architecture, we fetch from the authorized /users path.
 */
export const getAllUsers = async (tenantId: string): Promise<AppUser[]> => {
    try {
        const usersRef = getTenantUsersRef(tenantId);
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.entries(data).map(([uid, val]: [string, any]) => ({
                uid,
                ...val,
                createdAt: val.createdAt ? new Date(val.createdAt) : new Date()
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

/**
 * Updates a user's role and logs the audit event.
 */
export const updateUserRole = async (tenantId: string, uid: string, role: UserRole, adminId: string) => {
    try {
        const userRef = getUserRef(tenantId, uid);
        await update(userRef, { role });

        await logAction({
            tenantId,
            actorId: adminId,
            actorName: "Admin",
            action: 'UPDATE',
            entityId: uid,
            entityType: 'USER',
            description: `Changed user role to ${role}`
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
    }
};

/**
 * Updates a user's department and location assignment.
 */
export const updateUserHierarchy = async (tenantId: string, uid: string, data: { locationId?: string, departmentId?: string }, adminId: string) => {
    try {
        const userRef = getUserRef(tenantId, uid);
        await update(userRef, data);

        await logAction({
            tenantId,
            actorId: adminId,
            actorName: "Admin",
            action: 'UPDATE',
            entityId: uid,
            entityType: 'USER',
            description: `Updated hierarchy for user: ${JSON.stringify(data)}`
        });
    } catch (error) {
        console.error("Error updating user hierarchy:", error);
        throw error;
    }
};

/**
 * Updates a user's manager (Reporting Line).
 */
export const updateUserManager = async (tenantId: string, uid: string, managerId: string, adminId: string) => {
    try {
        const userRef = getUserRef(tenantId, uid);
        await update(userRef, { managerId });

        await logAction({
            tenantId,
            actorId: adminId,
            actorName: "Admin",
            action: 'UPDATE',
            entityId: uid,
            entityType: 'USER',
            description: `Changed user manager to ${managerId}`
        });
    } catch (error) {
        console.error("Error updating user manager:", error);
        throw error;
    }
};

/**
 * Toggles user active status.
 */
export const setUserStatus = async (tenantId: string, uid: string, isActive: boolean, adminId: string) => {
    try {
        const userRef = getUserRef(tenantId, uid);
        await update(userRef, { isActive });

        await logAction({
            tenantId,
            actorId: adminId,
            actorName: "Admin",
            action: 'UPDATE',
            entityId: uid,
            entityType: 'USER',
            description: `User status set to ${isActive ? 'Active' : 'Inactive'}`
        });
    } catch (error) {
        console.error("Error setting user status:", error);
        throw error;
    }
};
