import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, serverTimestamp, get, query, limitToLast, orderByChild } from "firebase/database";
import { AuditAction, AuditEntityType } from "@/types";

export interface LogActionParams {
    tenantId?: string;
    actorId: string;
    actorEmail?: string;
    actorName: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    description: string;
    changes?: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    ipAddress?: string;
    userAgent?: string;
}

const getClientIp = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return "Unknown";
    }
};

/**
 * Logs a system action for compliance and audit trailing.
 */
export const logAction = async (params: LogActionParams) => {
    try {
        const auditRef = ref(db, `${DB_PREFIX}/tenants/${params.tenantId}/auditLogs`);
        const newLogRef = push(auditRef);

        const ip = params.ipAddress || await getClientIp();
        const ua = params.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Unknown');

        await set(newLogRef, {
            ...params,
            timestamp: serverTimestamp(),
            ipAddress: ip,
            userAgent: ua,
            id: newLogRef.key
        });

        console.log(`[Audit] ${params.action} on ${params.entityType}:${params.entityId} by ${params.actorName} (IP: ${ip})`);
    } catch (error) {
        console.error("Error creating audit log:", error);
    }
};

export const getAuditLogs = async (tenantId: string, limitCount: number = 50) => {
    try {
        if (!tenantId) {
            console.warn("[Audit] getAuditLogs called with empty tenantId.");
            return [];
        }

        const auditRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/auditLogs`);
        const auditQuery = query(auditRef, orderByChild('timestamp'), limitToLast(limitCount));
        const snapshot = await get(auditQuery);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp);
        }
        return [];
    } catch (error) {
        console.error(`[Audit] Error fetching audit logs for tenant ${tenantId}:`, error);
        return [];
    }
};

export interface AuditLogFilters {
    search?: string;
    actionType?: AuditAction | 'ALL';
    entityType?: AuditEntityType | 'ALL';
    startDate?: string;
    endDate?: string;
    limit?: number;
}

/**
 * Fetches audit logs with optional filters for search, action type, entity type, and date range.
 */
export const getAuditLogsFiltered = async (tenantId: string, filters: AuditLogFilters = {}): Promise<any[]> => {
    try {
        if (!tenantId) return [];

        const limit = filters.limit || 200;
        const auditRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/auditLogs`);
        const auditQuery = query(auditRef, orderByChild('timestamp'), limitToLast(limit));
        const snapshot = await get(auditQuery);

        if (!snapshot.exists()) return [];

        let logs: any[] = Object.values(snapshot.val());

        // Apply filters
        if (filters.actionType && filters.actionType !== 'ALL') {
            logs = logs.filter(l => l.action === filters.actionType);
        }

        if (filters.entityType && filters.entityType !== 'ALL') {
            logs = logs.filter(l => l.entityType === filters.entityType);
        }

        if (filters.search) {
            const q = filters.search.toLowerCase();
            logs = logs.filter(l =>
                (l.actorName || '').toLowerCase().includes(q) ||
                (l.description || '').toLowerCase().includes(q) ||
                (l.entityId || '').toLowerCase().includes(q) ||
                (l.action || '').toLowerCase().includes(q)
            );
        }

        if (filters.startDate) {
            const start = new Date(filters.startDate).getTime();
            logs = logs.filter(l => {
                const ts = typeof l.timestamp === 'number' ? l.timestamp : new Date(l.timestamp).getTime();
                return ts >= start;
            });
        }

        if (filters.endDate) {
            const end = new Date(filters.endDate + 'T23:59:59').getTime();
            logs = logs.filter(l => {
                const ts = typeof l.timestamp === 'number' ? l.timestamp : new Date(l.timestamp).getTime();
                return ts <= end;
            });
        }

        return logs.sort((a: any, b: any) => {
            const tsA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
            const tsB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
            return tsB - tsA;
        });
    } catch (error) {
        console.error(`[Audit] Error fetching filtered audit logs:`, error);
        return [];
    }
};

/**
 * Exports audit logs as a CSV file for compliance.
 */
export const exportAuditLogsCsv = (logs: any[]) => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Description', 'IP Address'];
    const rows = logs.map(l => {
        const ts = typeof l.timestamp === 'number'
            ? new Date(l.timestamp).toISOString()
            : l.timestamp || '';
        return [
            ts,
            l.actorName || '',
            l.action || '',
            l.entityType || '',
            l.entityId || '',
            (l.description || '').replace(/"/g, '""'),
            l.ipAddress || '',
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

