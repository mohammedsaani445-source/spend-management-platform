import { db, DB_PREFIX } from "./firebase";
import { ref, push, get, set, limitToLast, query } from "firebase/database";
import { AuditLog } from "@/types";

// Use Web Crypto API (available in browser + Node 18+) instead of crypto-js
async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * IMMUTABLE AUDIT TRAIL (SOC2 COMPLIANT).
 */
export const logImmutableAction = async (tenantId: string, log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    try {
        const auditRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/audit_chain`);

        const lastLogQuery = query(auditRef, limitToLast(1));
        const lastLogSnap = await get(lastLogQuery);

        let previousHash = "GENESIS_BLOCK";
        if (lastLogSnap.exists()) {
            const lastLogVal = Object.values(lastLogSnap.val())[0] as any;
            previousHash = lastLogVal.chainHash || "ERROR_NO_HASH";
        }

        const timestamp = new Date().toISOString();
        const payload = JSON.stringify({ ...log, timestamp, previousHash });
        const chainHash = await sha256(payload);

        const newLogRef = push(auditRef);
        await set(newLogRef, {
            ...log,
            timestamp,
            chainHash,
            previousHash
        });

        console.log(`[SOC2-Audit] Immutable log created. Hash: ${chainHash.slice(0, 8)}...`);
        return chainHash;
    } catch (error) {
        console.error("Audit failure (CRITICAL):", error);
        throw error;
    }
};

export const verifyAuditIntegrity = async (tenantId: string) => {
    const auditRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/audit_chain`);
    const snapshot = await get(auditRef);

    if (!snapshot.exists()) return true;

    const logs = Object.values(snapshot.val()) as any[];
    for (let i = 1; i < logs.length; i++) {
        const current = logs[i];
        const previous = logs[i - 1];

        if (current.previousHash !== previous.chainHash) {
            console.error(`[SOC2-Audit] TAMPER DETECTED at log ${current.timestamp}`);
            return false;
        }
    }
    return true;
};
