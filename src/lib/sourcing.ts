import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update, query, equalTo, orderByChild } from "firebase/database";
import { RFP, Quotation, AppUser, PurchaseOrder } from "@/types";
import { logAction } from "./audit";

const getRFPsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/rfps`);
const getRFPRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/rfps/${id}`);
const getQuotesRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/quotations`);
const getQuoteRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/quotations/${id}`);

/**
 * Creates a new RFP and logs it.
 */
export const createRFP = async (tenantId: string, rfp: RFP, user: AppUser) => {
    try {
        const rfpRef = getRFPsRef(tenantId);
        const newRFPRef = push(rfpRef);
        const rfpId = newRFPRef.key;

        const rfpWithMeta = {
            ...rfp,
            id: rfpId,
            tenantId,
            createdAt: new Date().toISOString(),
            deadline: rfp.deadline.toISOString()
        };

        await set(getRFPRef(tenantId, rfpId!), rfpWithMeta);

        // 1. Log System Action
        await logAction({
            tenantId,
            actorId: user.uid,
            actorEmail: user.email || 'system@antigravity.com',
            actorName: user.displayName || 'System',
            action: 'CREATE',
            entityType: 'REQUISITION',
            entityId: rfp.requisitionId,
            description: `Initiated RFP for requisition ${rfp.requisitionId}`
        });

        // 2. Log Vendor Invitations (Phase 21 Bridge)
        for (const vendorId of rfp.invitedVendors) {
            await logAction({
                tenantId,
                actorId: user.uid,
                actorEmail: user.email || 'system@antigravity.com',
                actorName: user.displayName || 'System',
                action: 'UPDATE', // Using UPDATE to indicate invitation sent
                entityType: 'VENDOR',
                entityId: vendorId,
                description: `Invited to bid on RFP #${rfpId?.slice(-6).toUpperCase()}`
            });
        }

        return rfpId;
    } catch (error) {
        console.error("Error creating RFP:", error);
        throw error;
    }
};

/**
 * Returns a secure (signed-style) link for vendor quote submission.
 * In a real app, this would use a signed JWT or similar.
 */
export const getRFPSubmissionLink = (tenantId: string, rfpId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/public/rfp/${rfpId}?tenant=${tenantId}&p=${DB_PREFIX}`;
};

/**
 * Submits a vendor quotation for an RFP.
 */
export const submitQuotation = async (tenantId: string, quote: Quotation) => {
    try {
        const quotesRef = getQuotesRef(tenantId);
        const newQuoteRef = push(quotesRef);
        const quoteId = newQuoteRef.key;

        const quoteWithMeta = {
            ...quote,
            id: quoteId,
            tenantId,
            submittedAt: new Date().toISOString(),
            deliveryDate: quote.deliveryDate.toISOString(),
            validUntil: quote.validUntil.toISOString()
        };

        await set(getQuoteRef(tenantId, quoteId!), quoteWithMeta);
        return quoteId;
    } catch (error) {
        console.error("Error submitting quotation:", error);
        throw error;
    }
};

/**
 * Fetches all RFPs.
 */
export const getRFPs = async (tenantId: string): Promise<RFP[]> => {
    try {
        const rfpsRef = getRFPsRef(tenantId);
        const snapshot = await get(rfpsRef);
        if (snapshot.exists()) {
            return Object.values(snapshot.val());
        }
        return [];
    } catch (error) {
        return [];
    }
};

/**
 * Fetches all quotations for a specific RFP.
 * PRODUCTION REALIZATION: Implements Blind Bidding protocols. 
 * Pricing remains sealed until the deadline has passed.
 */
export const getRFPQuotes = async (tenantId: string, rfpId: string): Promise<Quotation[]> => {
    try {
        // 1. Fetch RFP to check deadline
        const rfpSnap = await get(getRFPRef(tenantId, rfpId));
        if (!rfpSnap.exists()) return [];

        const rfp = rfpSnap.val() as RFP;
        const now = new Date();
        const deadlineStr = rfp.deadline.toString(); // Handle both Date objects and strings
        const deadline = new Date(deadlineStr);
        const deadlinePassed = now > deadline;

        // 2. Fetch Quotes
        const quotesRef = query(getQuotesRef(tenantId), orderByChild('rfpId'), equalTo(rfpId));
        const snapshot = await get(quotesRef);

        if (snapshot.exists()) {
            const allQuotes = Object.values(snapshot.val()) as Quotation[];

            // 3. Apply Sealing Logic
            if (!deadlinePassed) {
                console.log(`[Production Realization] RFP ${rfpId} is still open. Sealing ${allQuotes.length} bids.`);
                return allQuotes.map(q => ({
                    ...q,
                    totalAmount: 0,         // REDACTED
                    items: [],              // REDACTED
                    notes: "🛡️ BID SEALED UNTIL DEADLINE"
                }));
            }

            console.log(`[Production Realization] RFP ${rfpId} deadline passed. Bids unsealed.`);
            return allQuotes;
        }
        return [];
    } catch (error) {
        console.error("Error fetching quotes:", error);
        return [];
    }
};

/**
 * Awards an RFP to a specific bidder and creates a Purchase Order.
 */
export const awardBid = async (tenantId: string, rfpId: string, quoteId: string, user: AppUser) => {
    try {
        const rfpRef = getRFPRef(tenantId, rfpId);
        const quoteRef = getQuoteRef(tenantId, quoteId);

        const [rfpSnap, quoteSnap] = await Promise.all([get(rfpRef), get(quoteRef)]);

        if (!rfpSnap.exists() || !quoteSnap.exists()) {
            throw new Error("RFP or Quotation not found");
        }

        const rfp = rfpSnap.val() as RFP;
        const quote = quoteSnap.val() as Quotation;

        // 1. Update RFP and Quote statuses
        await Promise.all([
            update(rfpRef, { status: 'AWARDED' }),
            update(quoteRef, { status: 'ACCEPTED' })
        ]);

        // 2. Create Purchase Order from Quote
        const posRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/purchase_orders`);
        const newPORef = push(posRef);
        const poId = newPORef.key;

        const poData = {
            id: poId,
            poNumber: `PO-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000).toString(36).toUpperCase()}`,
            requisitionId: rfp.requisitionId,
            vendorId: quote.vendorId,
            vendorName: quote.vendorName,
            tenantId,
            items: quote.items.map((item, index) => ({
                id: `item-${index}`,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.totalPrice
            })),
            totalAmount: quote.totalAmount,
            currency: quote.currency,
            status: 'DRAFT',
            createdBy: user.uid,
            createdAt: new Date().toISOString()
        };

        await set(ref(db, `${DB_PREFIX}/tenants/${tenantId}/purchase_orders/${poId}`), poData);

        // 3. Audit Log
        await logAction({
            tenantId,
            actorId: user.uid,
            actorEmail: user.email || 'system@antigravity.com',
            actorName: user.displayName || 'System',
            action: 'APPROVE',
            entityType: 'PO',
            entityId: poId!,
            description: `Awarded RFP ${rfpId} to ${quote.vendorName} and generated PO ${poData.poNumber}`
        });

        return poId;
    } catch (error) {
        console.error("Error awarding bid:", error);
        throw error;
    }
};
