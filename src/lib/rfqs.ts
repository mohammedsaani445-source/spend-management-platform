import { db } from './firebase';
import { ref, push, set, get, update } from 'firebase/database';
import { RFP, Bid } from '../types';

export const createRFQ = async (rfq: Omit<RFP, 'id' | 'createdAt'>) => {
    const rfqRef = ref(db, 'rfqs');
    const newRfqRef = push(rfqRef);
    const id = newRfqRef.key!;
    
    const newRfq: RFP = {
        ...rfq,
        id,
        createdAt: new Date()
    };
    
    await set(ref(db, `rfqs/${id}`), newRfq);
    return id;
};

export const getRFQs = async (): Promise<RFP[]> => {
    const rfqsRef = ref(db, 'rfqs');
    const snapshot = await get(rfqsRef);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};

export const submitBid = async (bid: Omit<Bid, 'id' | 'submittedAt' | 'status'>) => {
    const bidsRef = ref(db, 'bids');
    const newBidRef = push(bidsRef);
    const id = newBidRef.key!;
    
    const newBid: Bid = {
        ...bid,
        id,
        submittedAt: new Date().toISOString(),
        status: 'PENDING'
    };
    
    await set(ref(db, `bids/${id}`), newBid);
    return id;
};

export const getBidsForRFQ = async (rfqId: string): Promise<Bid[]> => {
    const bidsRef = ref(db, 'bids');
    const snapshot = await get(bidsRef);
    if (!snapshot.exists()) return [];
    const allBids: Bid[] = Object.values(snapshot.val());
    return allBids.filter(b => b.tenderId === rfqId);
};

export const awardBid = async (rfqId: string, bidId: string, vendorId: string) => {
    // 1. Update RFQ status
    await update(ref(db, `rfqs/${rfqId}`), {
        status: 'AWARDED'
    });
    
    // 2. Update Bid status
    await update(ref(db, `bids/${bidId}`), {
        status: 'ACCEPTED'
    });
    
    // 3. Mark others as rejected
    const bids = await getBidsForRFQ(rfqId);
    for (const bid of bids) {
        if (bid.id !== bidId) {
            await update(ref(db, `bids/${bid.id}`), {
                status: 'REJECTED'
            });
        }
    }
};
