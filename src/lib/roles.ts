import { db, DB_PREFIX } from "./firebase";
import { ref, get, set, push, update, remove } from "firebase/database";
import { CustomRole, Permission } from "@/types";

const getRolesRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/roles`);
const getRoleRef = (tenantId: string, roleId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/roles/${roleId}`);

export const saveRole = async (tenantId: string, role: Omit<CustomRole, 'id'> & { id?: string }) => {
    const rolesRef = getRolesRef(tenantId);
    const id = role.id || push(rolesRef).key;
    const finalRole = {
        ...role,
        id,
        tenantId,
        isSystemRole: role.isSystemRole || false,
        createdAt: role.createdAt || new Date().toISOString()
    };

    await set(getRoleRef(tenantId, id!), finalRole);
    return id;
};

export const getRoles = async (tenantId: string): Promise<CustomRole[]> => {
    const snapshot = await get(getRolesRef(tenantId));
    if (snapshot.exists()) return Object.values(snapshot.val());
    return [];
};

export const hasPermission = (userRole: CustomRole | null, permission: Permission): boolean => {
    if (!userRole) return false;
    return userRole.permissions.some(p =>
        (p.scope === 'ALL' || p.scope === permission.scope) &&
        (p.action === 'ADMIN' || p.action === permission.action)
    );
};

export const initializeSystemRoles = async (tenantId: string) => {
    const systemRoles: Omit<CustomRole, 'id'>[] = [
        {
            tenantId,
            name: 'Administrator',
            description: 'Full system access',
            isSystemRole: true,
            createdAt: new Date().toISOString(),
            permissions: [{ action: 'ADMIN', scope: 'ALL' }]
        },
        {
            tenantId,
            name: 'Finance Manager',
            description: 'Financial oversight and AP management',
            isSystemRole: true,
            createdAt: new Date().toISOString(),
            permissions: [
                { action: 'READ', scope: 'ALL' },
                { action: 'APPROVE', scope: 'INVOICE' },
                { action: 'WRITE', scope: 'BUDGET' }
            ]
        }
    ];

    for (const role of systemRoles) {
        await saveRole(tenantId, role);
    }
};
