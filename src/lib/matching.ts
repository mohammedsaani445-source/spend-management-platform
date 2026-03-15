import { db, DB_PREFIX } from "./firebase";
import { ref, get, update } from "firebase/database";
import { PurchaseOrder, ItemReceipt, Invoice, POStatus, AppUser } from "@/types";
import { logAction } from "./audit";

/**
 * Performs a 3-way match:
 * 1. PO: What was ordered?
 * 2. Receipt: What was delivered?
 * 3. Invoice: What was billed?
 */
export const performThreeWayMatch = async (tenantId: string, poId: string, actor?: AppUser) => {
    try {
        const poRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/purchase_orders/${poId}`);
        const poSnap = await get(poRef);
        
        if (!poSnap.exists()) throw new Error("PO not found");
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

        // 3. Automated Check (Line-Item Precision)
        let isMatched = true;
        let discrepancyNote = "";

        // Aggregated Item Stats for Comparison
        const poItems = po.items;
        const itemMatches: Record<number, { ordered: number, received: number, invoiced: number, orderedPrice: number, invoicedPrice: number }> = {};

        poItems.forEach((item, index) => {
            itemMatches[index] = {
                ordered: item.quantity,
                received: 0,
                invoiced: 0,
                orderedPrice: item.unitPrice,
                invoicedPrice: item.unitPrice // default to ordered price
            };
        });

        // Sum up Receipts per line item
        poReceipts.forEach(receipt => {
            if (receipt.lines) {
                receipt.lines.forEach(line => {
                    if (itemMatches[line.itemIndex]) {
                        itemMatches[line.itemIndex].received += line.receivedQty;
                    }
                });
            }
        });

        // Sum up Invoices per line item & check price variance
        poInvoices.forEach(invoice => {
            if (invoice.lines) {
                invoice.lines.forEach(line => {
                    if (itemMatches[line.itemIndex]) {
                        itemMatches[line.itemIndex].invoiced += line.receivedQty; // Quantity Billed
                        // Track price variance (highest billed price for this line)
                        if (line.unitPrice > itemMatches[line.itemIndex].invoicedPrice) {
                            itemMatches[line.itemIndex].invoicedPrice = line.unitPrice;
                        }
                    }
                });
            } else {
                // Fallback for invoices without lines (total level check)
                const currentInvoiceTotal = invoice.amount;
                if (currentInvoiceTotal > po.totalAmount * 1.05) {
                    isMatched = false;
                    discrepancyNote += `Invoice ${invoice.invoiceNumber}: Total (${currentInvoiceTotal}) exceeds PO total (${po.totalAmount}) by >5%. `;
                }
            }
        });

        // 4. Line-by-Line Validation (The "Golden Triangle")
        Object.entries(itemMatches).forEach(([idx, stats]) => {
            const index = parseInt(idx);
            
            // Quantity Check: Billed vs Received
            if (stats.invoiced > stats.received) {
                isMatched = false;
                discrepancyNote += `Item ${index}: Billed qty (${stats.invoiced}) exceeds Received qty (${stats.received}). `;
            }

            // Quantity Check: Billed vs Ordered
            if (stats.invoiced > stats.ordered) {
                isMatched = false;
                discrepancyNote += `Item ${index}: Billed qty (${stats.invoiced}) exceeds PO Ordered qty (${stats.ordered}). `;
            }

            // Price Check: Unit Price Variance
            if (stats.invoicedPrice > stats.orderedPrice) {
                isMatched = false;
                discrepancyNote += `Item ${index}: Unit Price Variance! Billed ${stats.invoicedPrice} vs PO ${stats.orderedPrice}. `;
            }
        });

        // 5. Update PO State
        let finalStatus: POStatus = po.status;
        
        if (!isMatched) {
            finalStatus = 'DISCREPANCY_FLAGGED';
        } else if (poInvoices.length > 0) {
            // Check if fully billed
            const fullyBilled = Object.values(itemMatches).every(s => s.invoiced >= s.ordered);
            finalStatus = fullyBilled ? 'BILLED' : 'RECEIVED';
        }

        await update(poRef, {
            isMatched,
            matchDiscrepancyNote: discrepancyNote || null,
            status: finalStatus,
            lastBatchMatchDate: new Date().toISOString()
        });

        // 6. Forensic Audit Log (Phase 45 Compliance)
        await logAction({
            tenantId,
            actorId: actor?.uid || 'SYSTEM_BOT',
            actorEmail: actor?.email || 'system@apexprocure.ai',
            actorName: actor?.displayName || 'Match Engine',
            action: isMatched ? 'MATCH_VERIFIED' : 'MATCH_DISCREPANCY',
            entityType: 'PURCHASE_ORDER',
            entityId: poId,
            description: isMatched 
                ? `3-way match verified for PO ${po.poNumber}. Status: ${finalStatus}` 
                : `3-way match discrepancy flagged for PO ${po.poNumber}: ${discrepancyNote}`
        });

        return { isMatched, discrepancyNote };
    } catch (error) {
        console.error("Match Error:", error);
        throw error;
    }
};
