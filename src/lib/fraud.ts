import { db, DB_PREFIX } from "./firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { Invoice, Vendor } from "@/types";

/**
 * Enterprise Fraud Protection Engine.
 * Detects duplicates, validates vendors, and flags historical anomalies.
 */

export interface FraudCheckResult {
    isFlagged: boolean;
    reason: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Check for duplicate invoices based on vendor and invoice number.
 */
export const checkDuplicateInvoice = async (tenantId: string, vendorId: string, invoiceNumber: string): Promise<boolean> => {
    if (!invoiceNumber) return false;

    try {
        const invoicesRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/invoices`);
        const q = query(invoicesRef, orderByChild('invoiceNumber'), equalTo(invoiceNumber));
        const snap = await get(q);

        if (snap.exists()) {
            const invoices = Object.values(snap.val()) as Invoice[];
            // Double check vendorId to avoid false positives across different vendors with same invoice# patterns
            return invoices.some(i => i.vendorId === vendorId);
        }
        return false;
    } catch (error) {
        console.error("[Fraud] Duplicate check failed:", error);
        return false;
    }
};

/**
 * Validates vendor details extracted from OCR against existing records.
 */
export const validateVendor = async (tenantId: string, extractedName: string): Promise<{ vendorId: string | null; confidence: number }> => {
    try {
        const vendorsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/vendors`);
        const snap = await get(vendorsRef);

        if (!snap.exists()) return { vendorId: null, confidence: 0 };

        const vendors = Object.values(snap.val()) as Vendor[];
        const nameClean = extractedName.toLowerCase().trim();

        // Exact match
        const exact = vendors.find(v => v.name.toLowerCase().trim() === nameClean);
        if (exact) return { vendorId: exact.id || null, confidence: 100 };

        // Fuzzy match (simplified)
        const fuzzy = vendors.find(v => v.name.toLowerCase().includes(nameClean) || nameClean.includes(v.name.toLowerCase()));
        if (fuzzy) return { vendorId: fuzzy.id || null, confidence: 75 };

        return { vendorId: null, confidence: 0 };
    } catch (error) {
        console.error("[Fraud] Vendor validation failed:", error);
        return { vendorId: null, confidence: 0 };
    }
};

/**
 * Checks for spend anomalies based on vendor history.
 * Flags if the total amount is > 150% of the average spend for this vendor.
 */
export const detectSpendAnomaly = async (tenantId: string, vendorId: string, currentAmount: number): Promise<FraudCheckResult> => {
    try {
        const invoicesRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/invoices`);
        const snap = await get(invoicesRef);

        if (!snap.exists()) return { isFlagged: false, reason: "", severity: 'LOW' };

        const allInvoices = Object.values(snap.val()) as Invoice[];
        const vendorHistory = allInvoices.filter(i => i.vendorId === vendorId);

        if (vendorHistory.length < 3) return { isFlagged: false, reason: "", severity: 'LOW' };

        const avg = vendorHistory.reduce((sum, i) => sum + i.amount, 0) / vendorHistory.length;

        if (currentAmount > avg * 1.5) {
            return {
                isFlagged: true,
                reason: `Unusual amount: ${currentAmount} is significantly higher than the average ${avg.toFixed(2)} for this vendor.`,
                severity: 'MEDIUM'
            };
        }

        return { isFlagged: false, reason: "", severity: 'LOW' };
    } catch (error) {
        console.error("[Fraud] Anomaly detection failed:", error);
        return { isFlagged: false, reason: "", severity: 'LOW' };
    }
};
