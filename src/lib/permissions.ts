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
        'STANDARD_REQUESTER': [
            { action: 'CREATE', scope: 'REQUISITION' },
            { action: 'READ', scope: 'REQUISITION' },
            { action: 'READ', scope: 'PO' }
        ],
        'AUTHORIZED_APPROVER': [
            { action: 'READ', scope: 'ALL' },
            { action: 'APPROVE', scope: 'REQUISITION' }
        ],
        'PROCUREMENT_OFFICER': [
            { action: 'READ', scope: 'ALL' },
            { action: 'WRITE', scope: 'ALL' },
            { action: 'DELETE', scope: 'ALL' }
        ],
        'OPERATIONS_RECEIVER': [
            { action: 'READ', scope: 'ALL' },
            { action: 'WRITE', scope: 'ALL' }
        ],
        'ACCOUNTS_PAYABLE': [
            { action: 'READ', scope: 'ALL' },
            { action: 'WRITE', scope: 'ALL' }
        ],
        'FINANCE_MANAGER': [
            { action: 'READ', scope: 'ALL' },
            { action: 'APPROVE', scope: 'ALL' },
            { action: 'WRITE', scope: 'ALL' }
        ],
        'FINANCE_SPECIALIST': [
            { action: 'READ', scope: 'ALL' },
            { action: 'WRITE', scope: 'BUDGET' }
        ],
        'STRATEGIC_SOURCER': [
            { action: 'READ', scope: 'ALL' },
            { action: 'WRITE', scope: 'VENDOR' },
            { action: 'WRITE', scope: 'CONTRACT' },
            { action: 'READ', scope: 'BUDGET' }
        ],
        'DATA_ANALYST': [
            { action: 'READ', scope: 'ALL' }
        ],
        'WORKSPACE_ADMIN': [
            { action: 'ADMIN', scope: 'ALL' }
        ],
        'PLATFORM_SUPERUSER': [
            { action: 'ADMIN', scope: 'ALL' }
        ],
        'ADMIN': [
            { action: 'ADMIN', scope: 'ALL' }
        ]
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.some(p => p.action === action && (p.scope === scope || p.scope === 'ALL'));
};

/**
 * Determines if a user can view a specific entity based on departmental isolation.
 */
export const canViewEntity = (user: AppUser, entity: { requesterId?: string, departmentId?: string, locationId?: string }): boolean => {
    if (['ADMIN', 'WORKSPACE_ADMIN', 'PLATFORM_SUPERUSER', 'FINANCE_MANAGER', 'FINANCE_SPECIALIST', 'PROCUREMENT_OFFICER', 'ACCOUNTS_PAYABLE'].includes(user.role)) return true;

    // If it's their own record, they can always see it
    if (entity.requesterId === user.uid) return true;

    // Departmental Isolation
    if (user.departmentId && entity.departmentId === user.departmentId) return true;

    // Location Isolation
    if (user.locationId && entity.locationId === user.locationId) return true;

    return false;
};
