import { db, DB_PREFIX } from "./firebase";
import { ref, get, update } from "firebase/database";
import { PurchaseOrder, ItemReceipt, Invoice } from "@/types";

/**
 * Performs a 3-way match:
 * 1. PO: What was ordered?
 * 2. Receipt: What was delivered?
 * 3. Invoice: What was billed?
 */
export const performThreeWayMatch = async (tenantId: string, poId: string) => {
    try {
        const poRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/purchase_orders/${poId}`);
        const poSnap = await get(poRef);

        if (!poSnap.exists()) return;
        const po = poSnap.val() as PurchaseOrder;

        // 1. Fetch Receipts
        const receiptsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/receipts`);
        const receiptsSnap = await get(receiptsRef);
        const allReceipts = receiptsSnap.exists() ? Object.values(receiptsSnap.val()) as ItemReceipt[] : [];
        const poReceipts = allReceipts.filter(r => r.poId === poId);

        // 2. Fetch Invoices
        const invoicesRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/invoices`);
        const invoicesSnap = await get(invoicesRef);
        const allInvoices = invoicesSnap.exists() ? Object.values(invoicesSnap.val()) as Invoice[] : [];
        const poInvoices = allInvoices.filter(i => i.poId === poId);

        // 3. Automated Check
        let isMatched = true;
        let discrepancyNote = "";

        // Aggregated Totals
        const totalOrdered = po.items.reduce((sum, i) => sum + i.quantity, 0);
        const totalReceived = poReceipts.reduce((sum, r) =>
            sum + (r.lines ? r.lines.reduce((isum, l) => isum + l.receivedQty, 0) : (r.items ? r.items.reduce((isum, ii) => isum + ii.quantityReceived, 0) : 0)), 0);
        const totalBilled = poInvoices.reduce((sum, i) => sum + i.amount, 0);

        // Rule A: Quantity Match (PO vs Receipt)
        if (totalReceived < totalOrdered) {
            isMatched = false;
            discrepancyNote += `Short delivery: Ordered ${totalOrdered}, Received ${totalReceived}. `;
        }

        // Rule B: Price Match (PO vs Invoice)
        // Note: Simple total sum check for now, in a pro system we'd check line items
        if (totalBilled > po.totalAmount) {
            isMatched = false;
            discrepancyNote += `Overbilling: PO amount ${po.totalAmount}, Invoiced ${totalBilled}. `;
        }

        // 4. Update PO Status
        await update(poRef, {
            isMatched,
            discrepancyNote: isMatched ? "All records reconciled matching PO, Receipt and Invoice." : discrepancyNote,
            status: isMatched ? 'FULFILLED' : po.status
        });

        // 5. Audit Log for Matching
        const { logAction } = await import("./audit");
        await logAction({
            tenantId,
            actorId: 'SYSTEM_BOT',
            actorName: 'Three-Way Match Engine',
            action: 'UPDATE',
            entityType: 'PO',
            entityId: poId,
            description: isMatched ? "3-Way Match Verified successfully." : `3-Way Match Flagged: ${discrepancyNote}`
        });

        return { isMatched, discrepancyNote };
    } catch (error) {
        console.error("Error in 3-way matching:", error);
    }
};
