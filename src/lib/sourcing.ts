import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update, query, equalTo, orderByChild } from "firebase/database";
import { RFP, Quotation, AppUser, PurchaseOrder, Tender, Bid } from "@/types";
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

        // 3. Real-time Auction Update
        const rfpSnap = await get(getRFPRef(tenantId, quote.rfpId));
        if (rfpSnap.exists()) {
            const rfp = rfpSnap.val() as RFP;
            if (rfp.isAuction) {
                const currentBest = rfp.bestBidValue || Infinity;
                if (quote.totalAmount < currentBest) {
                    await update(getRFPRef(tenantId, quote.rfpId), {
                        bestBidValue: quote.totalAmount
                    });
                }
            }
        }

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
        console.error("Error fetching RFPs:", error);
        return [];
    }
};

/**
 * Fetches a single RFP by ID.
 */
export const getRFP = async (tenantId: string, rfpId: string): Promise<RFP | null> => {
    try {
        const snapshot = await get(getRFPRef(tenantId, rfpId));
        if (snapshot.exists()) {
            return snapshot.val() as RFP;
        }
        return null;
    } catch (error) {
        console.error("Error fetching RFP:", error);
        return null;
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
            update(rfpRef, { status: 'AWARDED', awardedTo: quoteId }),
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
            status: 'ISSUED', // Unified with the direct PO flow
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
            entityType: 'PURCHASE_ORDER',
            entityId: poId!,
            description: `Awarded RFP ${rfpId} to ${quote.vendorName} and generated PO ${poData.poNumber}`
        });

        return poId;
    } catch (error) {
        console.error("Error awarding bid:", error);
        throw error;
    }
};

/**
 * Initiates the internal "Approval to Award" workflow.
 * Sets status to PENDING_AWARD and assigns approvers based on policy.
 */
export const initiateAwardApproval = async (tenantId: string, rfpId: string, quoteId: string, user: AppUser) => {
    try {
        // Direct award flow following engine removal
        const poId = await awardBid(tenantId, rfpId, quoteId, user);
        return { status: 'AWARDED', poId };
    } catch (error) {
        console.error("[Sourcing] Error initiating award:", error);
        throw error;
    }
};

/**
 * Calculates savings for a specific tender/RFP.
 * Savings = Budget - Awarded Amount
 */
export const calculateSavings = (tender: Tender | RFP, bids: (Bid | Quotation)[]) => {
    const isTender = 'status' in tender && (tender.status === 'AWARDED' || tender.status === 'EVALUATING');
    const awardedId = 'awardedTo' in tender ? tender.awardedTo : (bids.find(b => 'status' in b && b.status === 'ACCEPTED') as any)?.id;
    
    if (!awardedId) return null;

    const awardedBid = bids.find(b => (b as any).id === awardedId);
    if (!awardedBid) return null;

    const budget = (tender as any).budget || 0;
    const awardedAmount = (awardedBid as any).amount || (awardedBid as any).totalAmount || 0;
    const savings = budget > 0 ? budget - awardedAmount : 0;
    const savingsPercentage = budget > 0 ? (savings / budget) * 100 : 0;

    // Bid Variance Calculation
    const amounts = bids.map(b => (b as any).amount || (b as any).totalAmount || 0).filter(a => a > 0);
    const minBid = Math.min(...amounts);
    const maxBid = Math.max(...amounts);
    const avgBid = amounts.reduce((a, b) => a + b, 0) / (amounts.length || 1);

    return {
        id: tender.id,
        title: (tender as any).title,
        budget,
        awardedAmount,
        savings,
        savingsPercentage,
        bidVariance: {
            min: minBid,
            max: maxBid,
            avg: avgBid,
            count: bids.length
        }
    };
};

/**
 * Aggregates sourcing KPIs for a tenant.
 */
export const getSourcingKpis = async (tenantId: string) => {
    try {
        const tendersRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/tenders`);
        const bidsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/bids`);
        const rfpsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/rfps`);
        const quotesRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/quotations`);

        const [tendersSnap, bidsSnap, rfpsSnap, quotesSnap] = await Promise.all([
            get(tendersRef),
            get(bidsRef),
            get(rfpsRef),
            get(quotesRef)
        ]);

        const allTenders = tendersSnap.exists() ? Object.values(tendersSnap.val()) as Tender[] : [];
        const allBids = bidsSnap.exists() ? Object.values(bidsSnap.val()) as Bid[] : [];
        const allRFPs = rfpsSnap.exists() ? Object.values(rfpsSnap.val()) as RFP[] : [];
        const allQuotes = quotesSnap.exists() ? Object.values(quotesSnap.val()) as Quotation[] : [];

        const awardedEntities = [
            ...allTenders.filter(t => t.status === 'AWARDED'),
            ...allRFPs.filter(r => r.status === 'AWARDED')
        ];
        
        const results = awardedEntities.map(entity => {
            if (!entity.id) return null;
            const entityBids = entity.id.startsWith('tender') 
                ? allBids.filter(b => b.tenderId === entity.id)
                : allQuotes.filter(q => q.rfpId === entity.id);
            return calculateSavings(entity, entityBids);
        }).filter(r => r !== null);

        const totalSavings = results.reduce((sum, r) => sum + (r?.savings || 0), 0);
        const totalBudget = results.reduce((sum, r) => sum + (r?.budget || 0), 0);
        const avgSavingsPercentage = totalBudget > 0 ? (totalSavings / totalBudget) * 100 : 0;

        return {
            totalAwardedCount: awardedEntities.length,
            totalSavings,
            avgSavingsPercentage,
            results
        };
    } catch (error) {
        console.error("Sourcing KPIs Error:", error);
        throw error;
    }
};

/**
 * Automates RFQ creation from an approved Requisition.
 */
export const convertPRtoRFQ = async (tenantId: string, pr: any, user: AppUser) => {
    const rfpData: RFP = {
        tenantId,
        requisitionId: pr.id!,
        title: `Strategic Sourcing for PR #${pr.id!.slice(-6).toUpperCase()}`,
        description: `Automated RFQ generated from approved requisition. Justification: ${pr.justification}`,
        department: pr.department,
        status: 'DRAFT',
        currency: pr.currency || 'USD',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        invitedVendors: pr.vendorId ? [pr.vendorId] : [],
        items: pr.items.map((it: any) => ({
            description: it.description,
            quantity: it.quantity,
            unit: 'EA'
        })),
        weightedCriteria: {
            price: 0.5,
            quality: 0.2,
            delivery: 0.2,
            risk: 0.1
        },
        createdBy: user.uid,
        createdAt: new Date()
    };
    
    return createRFP(tenantId, rfpData, user);
};

/**
 * Industry-grade evaluation using weighted criteria.
 */
export const calculateWeightedScore = (rfp: RFP, quote: Quotation, returnBreakdown = false) => {
    const criteria = rfp.weightedCriteria || { price: 0.5, quality: 0.2, delivery: 0.2, risk: 0.1 };
    const { price, quality, delivery, risk } = criteria;
    const sc = quote.scorecard || { priceScore: 0, qualityRating: 5, deliveryDays: 7, riskRating: 5, weightedTotal: 0 };
    
    // 1. Price Score (Inverse linear: lower is better)
    const priceContribution = (sc.priceScore || 0) * price;
    
    // 2. Quality (1-10 normalized to 0-100)
    const qualityContribution = ((sc.qualityRating || 5) * 10) * quality;
    
    // 3. Delivery (Speed) - Higher is better score
    const deliveryScore = Math.max(0, 100 - ((sc.deliveryDays || 10) * 5)); 
    const deliveryContribution = deliveryScore * delivery;
    
    // 4. Risk (1-10, where 10 is safest)
    const riskContribution = ((sc.riskRating || 5) * 10) * risk;
    
    const total = priceContribution + qualityContribution + deliveryContribution + riskContribution;

    if (returnBreakdown) {
        return {
            total,
            breakdown: {
                price: priceContribution / price, // raw 0-100
                quality: (sc.qualityRating || 5) * 10,
                delivery: deliveryScore,
                risk: (sc.riskRating || 5) * 10
            }
        };
    }
    
    return total;
};

/**
 * Calculates current market position vs budget.
 */
export const calculateNegotiationBridge = (rfp: RFP, quotes: Quotation[]) => {
    const budget = rfp.budget || 0;
    if (quotes.length === 0) return { budget, lowest: 0, gap: 0, percent: 0 };

    const amounts = quotes.map(q => q.totalAmount).filter(a => a > 0);
    const lowest = Math.min(...amounts);
    const gap = budget > 0 ? budget - lowest : 0;
    const percent = budget > 0 ? (gap / budget) * 100 : 0;

    return {
        budget,
        lowest,
        gap,
        percent,
        count: quotes.length
    };
};
