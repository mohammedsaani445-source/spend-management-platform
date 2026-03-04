import { db, DB_PREFIX } from "./firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { Vendor } from "@/types";

/**
 * Enterprise Marketplace Service.
 */
export const searchMarketplace = async (tenantId: string, category: string, queryText?: string) => {
    const vendorsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/vendors`);
    const q = query(vendorsRef, orderByChild('category'), equalTo(category));

    const snapshot = await get(q);
    if (snapshot.exists()) {
        const results = Object.values(snapshot.val()) as Vendor[];
        if (queryText) {
            return results.filter(v => v.name.toLowerCase().includes(queryText.toLowerCase()));
        }
        return results;
    }
    return [];
};

/**
 * PunchOut Session Handshake (cXML/OCI Protocol).
 */
export const initiatePunchOutSession = async (tenantId: string, vendorId: string, returnUrl: string) => {
    console.log(`[PunchOut] Initiating OCI/cXML handshake with vendor ${vendorId}`);

    const sessionId = `sid-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000).toString(36)}`;

    const vendorRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/vendors/${vendorId}`);
    const snap = await get(vendorRef);
    const vendorData = snap.val();

    const punchOutUrl = vendorData?.punchOutUrl || "https://gateway.antigravity-procurement.com/oci";

    return {
        url: `${punchOutUrl}?sid=${sessionId}&hook_url=${encodeURIComponent(returnUrl)}`,
        sessionId
    };
};
