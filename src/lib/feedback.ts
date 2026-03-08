import { db, DB_PREFIX } from "./firebase";
import { ref, get, set } from "firebase/database";

/**
 * AI Learning Loop System.
 * Captures manual corrections to improve future OCR accuracy for specific vendors.
 */

export interface VendorCorrection {
    vendorId: string;
    field: string;
    extractedValue: string;
    correctedValue: string;
    timestamp: string;
}

/**
 * Record a correction made by a user to an AI-extracted field.
 */
export const recordCorrection = async (tenantId: string, vendorId: string, field: string, extractedValue: string, correctedValue: string) => {
    try {
        const correctionRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/ai_intelligence/corrections/${vendorId}/${field}`);

        // We track the most recent successful correction as the "learned" truth
        await set(correctionRef, {
            extractedValue,
            correctedValue,
            lastCorrectedAt: new Date().toISOString(),
            count: 1 // In a real system we'd increment this to find patterns
        });

        console.log(`[AI-LEARN] Recorded correction for ${vendorId}.${field}`);
    } catch (error) {
        console.error("[AI-LEARN] Failed to record correction:", error);
    }
};

/**
 * Retrieves learned patterns for a vendor to inject into the OCR prompt.
 */
export const getLearnedContext = async (tenantId: string, vendorId: string): Promise<string> => {
    try {
        const refPath = `${DB_PREFIX}/tenants/${tenantId}/ai_intelligence/corrections/${vendorId}`;
        const snap = await get(ref(db, refPath));

        if (!snap.exists()) return "";

        const corrections = snap.val();
        let context = "\nNote the following formatting patterns for this vendor from previous corrections:\n";

        Object.keys(corrections).forEach(field => {
            context += `- For the field '${field}', previous extracted value '${corrections[field].extractedValue}' was corrected to '${corrections[field].correctedValue}'. Please favor the corrected format.\n`;
        });

        return context;
    } catch (error) {
        return "";
    }
};
