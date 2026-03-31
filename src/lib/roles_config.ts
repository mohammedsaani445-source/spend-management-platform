import { UserRole, PermissionLevel, ModulePermission } from "@/types";

export interface RoleConfig {
    id: UserRole;
    label: string;
    icon: string;
    color: string;
    description: string;
    permissions: Record<string, PermissionLevel>;
}

export const MODULES = [
    "Dashboard", "Requisitions", "Purchase Orders", "Receiving", "Invoices",
    "Payments", "Vendors", "Contracts", "Budgets", "Inventory",
    "Assets", "Sourcing", "Reports", "Compliance", "Audit Trail",
    "Integrations", "User Mgmt"
];

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
    administrator: {
        id: "administrator",
        label: "Administrator",
        icon: "⚡",
        color: "#E8441A",
        description: "Full system access, integrations, and user management",
        permissions: Object.fromEntries(MODULES.map(m => [m, "FULL"])) as Record<string, PermissionLevel>
    },
    finance_mgr: {
        id: "finance_mgr",
        label: "Finance Manager",
        icon: "💼",
        color: "#2563EB",
        description: "Full access to Invoices, Payments, Budgets, and Reports",
        permissions: {
            "Dashboard": "FULL",
            "Invoices": "FULL",
            "Payments": "FULL",
            "Budgets": "FULL",
            "Reports": "FULL",
            "Vendors": "LIMITED",
            "Contracts": "LIMITED",
            "Compliance": "LIMITED"
        } as Record<string, PermissionLevel>
    },
    proc_mgr: {
        id: "proc_mgr",
        label: "Procurement Manager",
        icon: "🎯",
        color: "#7C3AED",
        description: "Strategic sourcing, vendors, contracts, and lifecycle management",
        permissions: {
            "Dashboard": "FULL",
            "Requisitions": "FULL",
            "Purchase Orders": "FULL",
            "Receiving": "FULL",
            "Vendors": "FULL",
            "Contracts": "FULL",
            "Sourcing": "FULL",
            "Budgets": "LIMITED",
            "Inventory": "LIMITED",
            "Assets": "LIMITED",
            "Compliance": "LIMITED",
            "Reports": "LIMITED"
        } as Record<string, PermissionLevel>
    },
    proc_officer: {
        id: "proc_officer",
        label: "Procurement Officer",
        icon: "📋",
        color: "#0891B2",
        description: "Day-to-day buying, receiving, and inventory control",
        permissions: {
            "Dashboard": "FULL",
            "Requisitions": "FULL",
            "Purchase Orders": "FULL",
            "Receiving": "FULL",
            "Inventory": "FULL",
            "Contracts": "LIMITED",
            "Budgets": "LIMITED",
            "Reports": "LIMITED",
            "Sourcing": "LIMITED" // Can create RFQ only
        } as Record<string, PermissionLevel>
    },
    dept_head: {
        id: "dept_head",
        label: "Department Head",
        icon: "🏢",
        color: "#059669",
        description: "Approve department requisitions and monitor unit budgets",
        permissions: {
            "Dashboard": "FULL",
            "Requisitions": "LIMITED", // Dept only
            "Budgets": "LIMITED" // Dept only
        } as Record<string, PermissionLevel>
    },
    requester: {
        id: "requester",
        label: "Requester / Staff",
        icon: "✏️",
        color: "#6B7280",
        description: "Create personal requisitions and track orders",
        permissions: {
            "Dashboard": "FULL",
            "Requisitions": "LIMITED" // Own only
        } as Record<string, PermissionLevel>
    },
    ap_officer: {
        id: "ap_officer",
        label: "AP Officer",
        icon: "🧾",
        color: "#D97706",
        description: "Accounts payable clerk: invoices and vendor view",
        permissions: {
            "Dashboard": "FULL",
            "Invoices": "FULL",
            "Payments": "LIMITED",
            "Vendors": "LIMITED"
        } as Record<string, PermissionLevel>
    },
    auditor: {
        id: "auditor",
        label: "Auditor (Read-Only)",
        icon: "🔍",
        color: "#374151",
        description: "Unrestricted view only access for compliance and reporting",
        permissions: Object.fromEntries(MODULES.map(m => [
            m, m === "Audit Trail" || m === "Compliance" || m === "Reports" ? "FULL" : "LIMITED"
        ])) as Record<string, PermissionLevel>
    },
    warehouse: {
        id: "warehouse",
        label: "Warehouse / Receiving",
        icon: "📦",
        color: "#92400E",
        description: "Store keeper: receiving console and inventory management",
        permissions: {
            "Dashboard": "FULL",
            "Receiving": "FULL",
            "Inventory": "FULL",
            "Purchase Orders": "LIMITED",
            "Assets": "LIMITED"
        } as Record<string, PermissionLevel>
    },
    asset_mgr: {
        id: "asset_mgr",
        label: "Asset Manager",
        icon: "🖥️",
        color: "#1D4ED8",
        description: "Fleet and hardware asset management",
        permissions: {
            "Dashboard": "FULL",
            "Assets": "FULL",
            "Inventory": "FULL"
        } as Record<string, PermissionLevel>
    },
    // Legacy mapping to satisfy TypeScript Record constraint
    STANDARD_REQUESTER: { id: "requester", label: "Legacy: Requester", icon: "👤", color: "#6B7280", description: "Legacy Requester Role", permissions: {} },
    AUTHORIZED_APPROVER: { id: "dept_head", label: "Legacy: Approver", icon: "🔍", color: "#059669", description: "Legacy Approver Role", permissions: {} },
    PROCUREMENT_OFFICER: { id: "proc_officer", label: "Legacy: Procurement", icon: "📦", color: "#0891B2", description: "Legacy Procurement Role", permissions: {} },
    OPERATIONS_RECEIVER: { id: "warehouse", label: "Legacy: Receiver", icon: "📥", color: "#92400E", description: "Legacy Receiver Role", permissions: {} },
    ACCOUNTS_PAYABLE: { id: "ap_officer", label: "Legacy: AP", icon: "🧾", color: "#D97706", description: "Legacy AP Role", permissions: {} },
    FINANCE_MANAGER: { id: "finance_mgr", label: "Legacy: Finance Mgr", icon: "💰", color: "#2563EB", description: "Legacy Finance Role", permissions: {} },
    FINANCE_SPECIALIST: { id: "finance_mgr", label: "Legacy: Finance Spec", icon: "💵", color: "#2563EB", description: "Legacy Finance Role", permissions: {} },
    STRATEGIC_SOURCER: { id: "proc_mgr", label: "Legacy: Sourcing", icon: "🎯", color: "#7C3AED", description: "Legacy Sourcing Role", permissions: {} },
    DATA_ANALYST: { id: "auditor", label: "Legacy: Analyst", icon: "📈", color: "#374151", description: "Legacy Analyst Role", permissions: {} },
    WORKSPACE_ADMIN: { id: "administrator", label: "Legacy: Workspace Admin", icon: "⚙️", color: "#E8441A", description: "Legacy Admin Role", permissions: {} },
    PLATFORM_SUPERUSER: { id: "administrator", label: "Legacy: Platform Admin", icon: "🛡️", color: "#E8441A", description: "Legacy Admin Role", permissions: {} },
    ADMIN: { id: "administrator", label: "Legacy: Admin", icon: "🔑", color: "#E8441A", description: "Legacy Admin Role", permissions: {} }
};

// Fallback for legacy roles
export const LEGACY_ROLE_MAP: Record<string, UserRole> = {
    'PLATFORM_SUPERUSER': 'administrator',
    'WORKSPACE_ADMIN': 'administrator',
    'ADMIN': 'administrator',
    'ADMINISTRATOR': 'administrator',
    'SUPERADMIN': 'administrator',
    'SUPERUSER': 'administrator',
    'FINANCE_MANAGER': 'finance_mgr',
    'FINANCE_SPECIALIST': 'finance_mgr',
    'STRATEGIC_SOURCER': 'proc_mgr',
    'PROCUREMENT_OFFICER': 'proc_officer',
    'AUTHORIZED_APPROVER': 'dept_head',
    'STANDARD_REQUESTER': 'requester',
    'ACCOUNTS_PAYABLE': 'ap_officer',
    'OPERATIONS_RECEIVER': 'warehouse',
    'DATA_ANALYST': 'auditor'
};

export const mapLegacyRole = (role: string): UserRole => {
    if (!role) return 'requester';
    // If it's already a valid new role, return it as is
    if (ROLE_CONFIGS[role as UserRole]) {
        return role as UserRole;
    }
    // Otherwise try to map from uppercase legacy role
    return LEGACY_ROLE_MAP[role.toUpperCase()] || 'requester';
};
