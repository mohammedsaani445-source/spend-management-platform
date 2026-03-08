import { db, DB_PREFIX } from "./firebase";
import { ref, get } from "firebase/database";
import { Invoice, RequisitionItem } from "@/types";

/**
 * AI-Driven Categorization & GL Mapping.
 * Learns from company history to automatically assign categories and GL codes.
 */

export interface GLCodeMapping {
    category: string;
    glCode: string;
    confidence: number;
}

const CATEGORY_MAP: Record<string, string> = {
    'Food': '6010-MEALS',
    'Travel': '6020-TRAVEL',
    'Office': '6030-OFFICE',
    'Utilities': '6040-UTIL',
    'Marketing': '6050-MKTG',
    'Software': '6060-SOFT',
    'Hardware': '1500-ASSETS',
    'Miscellaneous': '6999-MISC'
};

/**
 * Maps a vendor or item description to a GL code based on history.
 */
export const suggestGLCode = async (tenantId: string, vendorName: string, description: string): Promise<GLCodeMapping> => {
    try {
        // 1. Check historical matches for this vendor
        const invoicesRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/invoices`);
        const snap = await get(invoicesRef);

        if (snap.exists()) {
            const history = Object.values(snap.val()) as Invoice[];
            const vendorInvoices = history.filter(i => i.vendorName.toLowerCase() === vendorName.toLowerCase());

            if (vendorInvoices.length > 0) {
                // Return the most common category for this vendor
                const categories = vendorInvoices.map(i => i.department); // Using department as proxy for now
                const mostCommon = categories.sort((a, b) =>
                    categories.filter(v => v === a).length - categories.filter(v => v === b).length
                ).pop();

                if (mostCommon && CATEGORY_MAP[mostCommon]) {
                    return { category: mostCommon, glCode: CATEGORY_MAP[mostCommon], confidence: 90 };
                }
            }
        }

        // 2. Keyword matching fallback
        const desc = description.toLowerCase();
        if (desc.includes("uber") || desc.includes("flight") || desc.includes("hotel"))
            return { category: "Travel", glCode: CATEGORY_MAP["Travel"], confidence: 80 };
        if (desc.includes("lunch") || desc.includes("dinner") || desc.includes("starbucks"))
            return { category: "Food", glCode: CATEGORY_MAP["Food"], confidence: 85 };
        if (desc.includes("aws") || desc.includes("azure") || desc.includes("software"))
            return { category: "Software", glCode: CATEGORY_MAP["Software"], confidence: 85 };

        return { category: "Miscellaneous", glCode: "6999-MISC", confidence: 50 };
    } catch (error) {
        console.error("[Categorization] Suggestion failed:", error);
        return { category: "Miscellaneous", glCode: "6999-MISC", confidence: 10 };
    }
};
