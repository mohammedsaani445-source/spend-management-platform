import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, update, query, orderByChild, equalTo } from "firebase/database";
import { Tender, Bid, AppUser } from "@/types";
import { logAction } from "./audit";

const getTendersRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/tenders`);
const getTenderRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/tenders/${id}`);
const getBidsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/bids`);

/**
 * Creates a new invitation for bidding (Tender).
 */
export const createTender = async (tenantId: string, tender: Omit<Tender, 'id'>, actor: AppUser) => {
    try {
        const tendersRef = getTendersRef(tenantId);
        const newTenderRef = push(tendersRef);
        const id = newTenderRef.key as string;

        const newTender: Tender = {
            ...tender,
            id,
            status: 'OPEN',
            createdBy: actor.uid
        };

        await set(newTenderRef, newTender);

        await logAction({
            tenantId,
            actorId: actor.uid,
            actorName: actor.displayName || 'Procurement',
            action: 'TENDER_CREATED',
            entityType: 'TENDER',
            entityId: id,
            description: `Tender "${tender.title}" created with deadline ${tender.deadline}`
        });

        return id;
    } catch (error) {
        console.error("Create Tender Error:", error);
        throw error;
    }
};

/**
 * Submits a bid from a vendor. 
 * Note: amounts are stored raw but masked on frontend based on compliance rules.
 */
export const submitBid = async (tenantId: string, bid: Omit<Bid, 'id' | 'submittedAt' | 'status'>, actor: AppUser) => {
    try {
        const bidsRef = getBidsRef(tenantId);
        const newBidRef = push(bidsRef);
        const id = newBidRef.key as string;

        const newBid: Bid = {
            ...bid,
            id,
            submittedAt: new Date().toISOString(),
            status: 'PENDING',
            isBlind: true // Mandatory for Phase 45
        };

        await set(newBidRef, newBid);

        await logAction({
            tenantId,
            actorId: actor.uid,
            actorName: actor.displayName || 'Vendor',
            action: 'BID_SUBMITTED',
            entityType: 'BID',
            entityId: id,
            description: `Bid submitted for Tender ${bid.tenderId} by ${bid.vendorName}`
        });

        return id;
    } catch (error) {
        console.error("Submit Bid Error:", error);
        throw error;
    }
};

/**
 * Fetches all bids for a specific tender.
 * Compliance Check: If tender is OPEN and requesting user is Procurement, amounts may be hidden on UI.
 */
export const getTenderBids = async (tenantId: string, tenderId: string): Promise<Bid[]> => {
    try {
        const bidsRef = getBidsRef(tenantId);
        const q = query(bidsRef, orderByChild('tenderId'), equalTo(tenderId));
        const snap = await get(q);

        if (!snap.exists()) return [];
        return Object.values(snap.val()) as Bid[];
    } catch (error) {
        console.error("Get Bids Error:", error);
        return [];
    }
};

/**
 * Updates tender status (e.g., closing it for evaluation).
 */
export const updateTenderStatus = async (tenantId: string, tenderId: string, status: Tender['status'], actor: AppUser) => {
    try {
        const tenderRef = getTenderRef(tenantId, tenderId);
        await update(tenderRef, { status });

        await logAction({
            tenantId,
            actorId: actor.uid,
            actorName: actor.displayName || 'Procurement',
            action: 'UPDATE',
            entityType: 'TENDER',
            entityId: tenderId,
            description: `Tender status changed to ${status}`
        });
    } catch (error) {
        console.error("Update Tender Error:", error);
        throw error;
    }
};
/**
 * Updates bid status (e.g., accepting or rejecting).
 */
export const updateBidStatus = async (tenantId: string, bidId: string, status: Bid['status'], actor: AppUser) => {
    try {
        const bidRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/bids/${bidId}`);
        await update(bidRef, { status });

        await logAction({
            tenantId,
            actorId: actor.uid,
            actorName: actor.displayName || 'Procurement',
            action: 'UPDATE',
            entityType: 'BID',
            entityId: bidId,
            description: `Bid status updated to ${status}`
        });
    } catch (error) {
        console.error("Update Bid Error:", error);
        throw error;
    }
};

/**
 * Awards a tender to a specific vendor/bid and generates a Purchase Order.
 */
export const awardBid = async (tenantId: string, tenderId: string, bidId: string, actor: AppUser) => {
    try {
        // 1. Fetch Tender and Bid data
        const tenderRef = getTenderRef(tenantId, tenderId);
        const tenderSnap = await get(tenderRef);
        if (!tenderSnap.exists()) throw new Error("Tender not found");
        const tender = { id: tenderId, ...tenderSnap.val() } as Tender;

        const bidRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/bids/${bidId}`);
        const bidSnap = await get(bidRef);
        if (!bidSnap.exists()) throw new Error("Bid not found");
        const bid = { id: bidId, ...bidSnap.val() } as Bid;

        // 2. Generate Purchase Order (Execution Loop)
        const { createPOFromAwardedBid } = await import("./purchaseOrders");
        const { id: poId, poNumber } = await createPOFromAwardedBid(tenantId, tender, bid, actor);

        // 3. Update the tender status to AWARDED and save PO ref
        await update(tenderRef, { 
            status: 'AWARDED',
            awardedTo: bidId,
            poNumber: poNumber
        });

        // 4. Update the specific bid status to ACCEPTED and save PO ref
        await update(bidRef, { 
            status: 'ACCEPTED',
            poId: poId,
            poNumber: poNumber
        });

        // 5. Log the awarding event with PO reference
        await logAction({
            tenantId,
            actorId: actor.uid,
            actorName: actor.displayName || 'Procurement',
            action: 'UPDATE',
            entityType: 'TENDER',
            entityId: tenderId,
            description: `Tender awarded to bid ${bidId}. Generated PO: ${poNumber}`
        });

        return { poId, poNumber };
    } catch (error) {
        console.error("Award Bid Error:", error);
        throw error;
    }
};
