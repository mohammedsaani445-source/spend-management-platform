import { AppUser, UserRole, Permission, PermissionAction, PermissionScope } from "@/types";

/**
 * Checks if a user has a specific permission based on their role and custom permissions.
 */
export const checkPermission = (user: AppUser, action: PermissionAction, scope: PermissionScope): boolean => {
    // 1. Super Admin always has all permissions
    if (user.role === 'ADMIN') return true;

    // 2. Custom Permissions Check (In Phase 27: Custom Roles)
    // For now, we use a role-to-permission mapping for default internal roles
    const rolePermissions: Record<UserRole, { action: PermissionAction, scope: PermissionScope }[]> = {
        'APPROVER': [
            { action: 'READ', scope: 'ALL' },
            { action: 'APPROVE', scope: 'ALL' }
        ],
        'FINANCE': [
            { action: 'READ', scope: 'ALL' },
            { action: 'WRITE', scope: 'ALL' },
            { action: 'DELETE', scope: 'ALL' }
        ],
        'REQUESTER': [
            { action: 'CREATE', scope: 'REQUISITION' },
            { action: 'READ', scope: 'REQUISITION' }
        ],
        'AP_USER': [
            { action: 'READ', scope: 'ALL' },
            { action: 'WRITE', scope: 'ALL' }
        ],
        'FINANCE_MANAGER': [
            { action: 'READ', scope: 'ALL' },
            { action: 'APPROVE', scope: 'ALL' }
        ],
        'STRATEGIC_SOURCER': [
            { action: 'READ', scope: 'ALL' },
            { action: 'CREATE', scope: 'ALL' }
        ],
        'PURCHASER': [
            { action: 'READ', scope: 'ALL' },
            { action: 'WRITE', scope: 'PO' }
        ],
        'SUPERUSER': [
            { action: 'ADMIN', scope: 'ALL' }
        ],
        'RECEIVER': [
            { action: 'READ', scope: 'ALL' },
            { action: 'WRITE', scope: 'ALL' }
        ],
        'REPORTER': [
            { action: 'READ', scope: 'ALL' }
        ],
        'ADMIN': [] // Handled above
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.some(p => p.action === action && (p.scope === scope || p.scope === 'ALL'));
};

/**
 * Determines if a user can view a specific entity based on departmental isolation.
 */
export const canViewEntity = (user: AppUser, entity: { requesterId?: string, departmentId?: string, locationId?: string }): boolean => {
    if (user.role === 'ADMIN' || user.role === 'FINANCE') return true;

    // If it's their own record, they can always see it
    if (entity.requesterId === user.uid) return true;

    // Departmental Isolation
    if (user.departmentId && entity.departmentId === user.departmentId) return true;

    // Location Isolation
    if (user.locationId && entity.locationId === user.locationId) return true;

    return false;
};
