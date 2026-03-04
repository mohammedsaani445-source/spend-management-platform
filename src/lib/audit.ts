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
        const auditRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/auditLogs`);
        const auditQuery = query(auditRef, limitToLast(limitCount));
        const snapshot = await get(auditQuery);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp);
        }
        return [];
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return [];
    }
};
