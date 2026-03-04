import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, update, remove } from "firebase/database";
import { ItemReceipt, GoodsReceiptLine, PurchaseOrder, AppUser } from "@/types";

const getReceiptsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/receipts`);
const getReceiptRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/receipts/${id}`);
const getPORef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/purchase_orders/${id}`);

/** Fetch all receipts for the tenant. */
export const getReceipts = async (user: AppUser): Promise<ItemReceipt[]> => {
    try {
        const snap = await get(getReceiptsRef(user.tenantId));
        if (!snap.exists()) return [];
        return Object.values(snap.val()).map((r: any) => ({
            ...r,
            createdAt: r.createdAt || new Date().toISOString(),
        })) as ItemReceipt[];
    } catch (error: any) {
        if (error.code === 'PERMISSION_DENIED' || error.message?.includes('Permission denied')) {
            console.warn(`[Receipts] Permission denied fetching receipts. Ensure user has access.`);
        } else {
            console.error("Error fetching receipts:", error);
        }
        return [];
    }
};

/** Fetch receipts for a specific PO. */
export const getPoReceipts = async (tenantId: string, poId: string): Promise<ItemReceipt[]> => {
    try {
        const snap = await get(getReceiptsRef(tenantId));
        if (!snap.exists()) return [];
        const all = Object.values(snap.val()) as ItemReceipt[];
        return all.filter(r => r.poId === poId);
    } catch (error: any) {
        console.warn(`[Receipts] Failed fetching receipts for PO ${poId}:`, error.message);
        return [];
    }
};

/**
 * Record goods receipt. Links to PO, triggers 3-way match.
 */
export const createReceipt = async (
    tenantId: string,
    receipt: Omit<ItemReceipt, 'id' | 'createdAt'>
): Promise<string> => {
    const receiptsRef = getReceiptsRef(tenantId);
    const newRef = push(receiptsRef);
    const id = newRef.key!;

    // Compute overall quality
    const allPassed = receipt.lines.every(l => l.qualityStatus === 'PASSED');
    const anyFailed = receipt.lines.some(l => l.qualityStatus === 'FAILED');
    const overallQual = receipt.isAutoReceive ? 'PASSED'
        : allPassed ? 'PASSED' : anyFailed ? 'FAILED' : 'PARTIAL';

    const finalReceipt: ItemReceipt = {
        ...receipt,
        id,
        overallQualityStatus: overallQual,
        createdAt: new Date().toISOString(),
    };

    await set(newRef, finalReceipt);

    // Update PO status and receipt link
    const poRef = getPORef(tenantId, receipt.poId);
    const poSnap = await get(poRef);

    if (poSnap.exists()) {
        const po: PurchaseOrder = poSnap.val();
        const currentReceiptIds = po.receiptIds || [];

        // Determine if fully received
        const totalOrderedQty = po.items.reduce((s, i) => s + i.quantity, 0);
        const totalReceivedQty = receipt.lines.reduce((s, l) => s + l.receivedQty, 0);
        const isFullyReceived = totalReceivedQty >= totalOrderedQty;

        await update(poRef, {
            receiptIds: [...currentReceiptIds, id],
            status: isFullyReceived ? 'RECEIVED' : 'RECEIVED', // partial also shown as RECEIVED
        });
    }

    // Trigger 3-Way Matching
    try {
        const matching = await import("./matching");
        await matching.performThreeWayMatch(tenantId, receipt.poId);
    } catch {
        // Non-blocking; matching failure doesn't block receipt
    }

    return id;
};

/** Update quality status on a single receipt line. */
export const updateReceiptLineQuality = async (
    tenantId: string,
    receiptId: string,
    lineIndex: number,
    qualityStatus: 'PASSED' | 'FAILED',
    failureReason?: string
): Promise<void> => {
    const receiptRef = getReceiptRef(tenantId, receiptId);
    const snap = await get(receiptRef);
    if (!snap.exists()) return;

    const receipt: ItemReceipt = snap.val();
    const updatedLines = receipt.lines.map((l, i) =>
        i === lineIndex ? { ...l, qualityStatus, failureReason: failureReason || '' } : l
    );

    const allPassed = updatedLines.every(l => l.qualityStatus === 'PASSED');
    const anyFailed = updatedLines.some(l => l.qualityStatus === 'FAILED');
    const overall = allPassed ? 'PASSED' : anyFailed ? 'FAILED' : 'PARTIAL';

    await update(receiptRef, {
        lines: updatedLines,
        overallQualityStatus: overall,
    });
};

/** Mark an entire receipt as PASSED or FAILED at once (batch QC). */
export const updateReceiptQuality = async (
    tenantId: string,
    receiptId: string,
    status: 'PASSED' | 'FAILED'
): Promise<void> => {
    const receiptRef = getReceiptRef(tenantId, receiptId);
    const snap = await get(receiptRef);
    if (!snap.exists()) return;

    const receipt: ItemReceipt = snap.val();
    const updatedLines = receipt.lines.map(l => ({ ...l, qualityStatus: status }));

    await update(receiptRef, {
        lines: updatedLines,
        overallQualityStatus: status,
    });
};

/**
 * Remove a receipt and revert PO status if no receipts remain.
 * Only allowed within a 24-hour window (business rule).
 */
export const unreceiveItems = async (tenantId: string, receiptId: string): Promise<void> => {
    const receiptRef = getReceiptRef(tenantId, receiptId);
    const snap = await get(receiptRef);
    if (!snap.exists()) throw new Error("Receipt not found");

    const receipt: ItemReceipt = snap.val();

    // Business rule: only allow unreceive within 24h
    const createdAt = new Date(receipt.createdAt);
    const hoursElapsed = (Date.now() - createdAt.getTime()) / 3_600_000;
    if (hoursElapsed > 24) throw new Error("Unreceive window expired (>24h)");

    // Remove the receipt document
    await remove(receiptRef);

    // Update the PO receipt links
    const poRef = getPORef(tenantId, receipt.poId);
    const poSnap = await get(poRef);

    if (poSnap.exists()) {
        const po: PurchaseOrder = poSnap.val();
        const remaining = (po.receiptIds || []).filter((rid: string) => rid !== receiptId);
        await update(poRef, {
            receiptIds: remaining,
            status: remaining.length === 0 ? 'SENT' : 'RECEIVED',
        });
    }
};
