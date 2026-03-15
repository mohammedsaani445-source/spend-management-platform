import { db, storage, DB_PREFIX } from "./firebase";
import { ref, push, set, get, child, update } from "firebase/database";
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Vendor, VendorDocument, VendorDocumentType } from "@/types";
import { differenceInDays, parseISO } from "date-fns";

const getVendorsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/vendors`);
const getVendorRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/vendors/${id}`);

export const addVendor = async (tenantId: string, vendor: Omit<Vendor, 'id' | 'createdAt'>) => {
    try {
        const vendorsRef = getVendorsRef(tenantId);
        const newVendorRef = push(vendorsRef);

        await set(newVendorRef, {
            ...vendor,
            id: newVendorRef.key,
            createdAt: new Date().toISOString(),
        });

        return newVendorRef.key;
    } catch (error) {
        console.error("Error adding vendor: ", error);
        throw error;
    }
};

export const getVendors = async (tenantId: string): Promise<Vendor[]> => {
    try {
        const vendorsRef = getVendorsRef(tenantId);
        const snapshot = await get(vendorsRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.values(data).map((v: any) => ({
                ...v,
                createdAt: new Date(v.createdAt),
            })) as Vendor[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching vendors", error);
        return [];
    }
};

export const updateVendorStatus = async (tenantId: string, vendorId: string, status: 'ACTIVE' | 'INACTIVE') => {
    try {
        const vendorRef = getVendorRef(tenantId, vendorId);
        await update(vendorRef, { status });
    } catch (error) {
        console.error(`[Vendors] Error updating vendor ${vendorId}:`, error);
        throw error;
    }
};

export const getVendor = async (tenantId: string, id: string): Promise<Vendor | null> => {
    try {
        const vendorRef = getVendorRef(tenantId, id);
        const snapshot = await get(vendorRef);
        if (snapshot.exists()) {
            return { ...snapshot.val(), id } as Vendor;
        }
    } catch (error: any) {
        if (error.code === 'PERMISSION_DENIED' || error.message?.includes('Permission denied')) {
            console.warn(`[Vendors] Permission denied for vendor ${id} in tenant ${tenantId}`);
        } else {
            console.error(`[Vendors] Error fetching vendor ${id}:`, error);
        }
    }
    return null;
};

/**
 * Computes vendor compliance status based on their stored documents.
 * COMPLIANT     = all 3 required doc types uploaded and ACTIVE
 * EXPIRING      = any doc expires within 30 days
 * NON_COMPLIANT = any required doc missing or EXPIRED
 * PENDING       = no docs uploaded at all
 */
export const updateVendorComplianceStatus = async (
    tenantId: string, 
    vendorId: string,
    // If status is passed explicitly it overrides auto-compute
    status?: 'COMPLIANT' | 'NON_COMPLIANT' | 'EXPIRING' | 'PENDING'
) => {
    try {
        const vendorRef = getVendorRef(tenantId, vendorId);

        if (status) {
            await update(vendorRef, { complianceStatus: status });
            return;
        }

        const snapshot = await get(vendorRef);
        const vendorData = snapshot.val() as Vendor;
        const docs: VendorDocument[] = vendorData.documents || [];

        const REQUIRED_TYPES: VendorDocumentType[] = ['W9', 'INSURANCE', 'COMPLIANCE'];

        if (docs.length === 0) {
            await update(vendorRef, { complianceStatus: 'PENDING' });
            return;
        }

        let computed: 'COMPLIANT' | 'NON_COMPLIANT' | 'EXPIRING' = 'COMPLIANT';
        const now = new Date();

        for (const requiredType of REQUIRED_TYPES) {
            const doc = docs.find(d => d.type === requiredType && d.status === 'ACTIVE');
            if (!doc) {
                computed = 'NON_COMPLIANT';
                break;
            }
            if (doc.expiryDate) {
                const daysUntilExpiry = differenceInDays(new Date(doc.expiryDate), now);
                if (daysUntilExpiry < 0) {
                    computed = 'NON_COMPLIANT';
                    break;
                } else if (daysUntilExpiry <= 30) {
                    computed = 'EXPIRING';
                }
            }
        }

        await update(vendorRef, { complianceStatus: computed });
    } catch (error) {
        console.error(`[Vendors] Error updating compliance status:`, error);
        throw error;
    }
};

/**
 * Calculates a vendor's performance scorecard based on real PO and Receipt data.
 */
export async function calculateVendorScorecard(tenantId: string, vendorId: string): Promise<any | null> {
    try {
        const { differenceInDays, parseISO } = await import('date-fns');
        
        // 1. Fetch all POs for this vendor
        const posRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/purchaseOrders`);
        const posSnap = await get(posRef);
        
        if (!posSnap.exists()) return null;

        const allPos: any[] = Object.values(posSnap.val());
        const vendorPos = allPos.filter(po => po.vendorId === vendorId && (po.status === 'FULFILLED' || po.status === 'CLOSED' || po.status === 'RECEIVED'));

        if (vendorPos.length === 0) return null;

        // 2. Fetch all Receipts for this tenant to check quality
        const receiptsRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/receipts`);
        const receiptsSnap = await get(receiptsRef);
        const allReceipts: any[] = receiptsSnap.exists() ? Object.values(receiptsSnap.val()) : [];

        let leadTimeTotal = 0;
        let qualityTotal = 0;
        let accuracyTotal = 0;
        let fulfilledCount = 0;

        for (const po of vendorPos) {
            // Lead Time Calculation
            if (po.expectedDeliveryDate && po.receivedAt) {
                const expected = typeof po.expectedDeliveryDate === 'string' ? parseISO(po.expectedDeliveryDate) : new Date(po.expectedDeliveryDate);
                const actual = parseISO(po.receivedAt);
                
                const daysLate = Math.max(0, differenceInDays(actual, expected));
                leadTimeTotal += Math.max(0, 100 - (daysLate * 10));
                fulfilledCount++;
            }

            // Quality Score Calculation
            const poReceipts = allReceipts.filter(r => r.poId === po.id);
            if (poReceipts.length > 0) {
                const passedCount = poReceipts.filter(r => r.overallQualityStatus === 'PASSED').length;
                qualityTotal += (passedCount / poReceipts.length) * 100;
            } else if (po.status === 'FULFILLED' || po.status === 'RECEIVED') {
                qualityTotal += 100;
            }

            // Accuracy Score Calculation
            if (po.status === 'DISCREPANCY_FLAGGED') {
                accuracyTotal += 50;
            } else {
                accuracyTotal += 100;
            }
        }

        const totalOrders = vendorPos.length;
        const leadTimeScore = fulfilledCount > 0 ? Math.round(leadTimeTotal / fulfilledCount) : 100;
        const qualityScore = Math.round(qualityTotal / totalOrders);
        const invoiceAccuracyScore = Math.round(accuracyTotal / totalOrders);
        const overallScore = Math.round((leadTimeScore + qualityScore + invoiceAccuracyScore) / 3);

        const scorecard = {
            overallScore,
            leadTimeScore,
            qualityScore,
            invoiceAccuracyScore,
            totalOrders,
            lastUpdated: new Date().toISOString()
        };

        // Update the vendor record
        await update(getVendorRef(tenantId, vendorId), {
            scorecard,
            lastUpdatedScorecard: scorecard.lastUpdated
        });

        return scorecard;
    } catch (error) {
        console.error('Error calculating vendor scorecard:', error);
        return null;
    }
};

/**
 * Uploads a compliance document to Firebase Storage and updates the vendor record.
 */
export const uploadVendorDocument = async (
    tenantId: string, 
    vendorId: string, 
    file: File, 
    docType: VendorDocumentType,
    expiryDate?: string
) => {
    try {
        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${docType}_${Date.now()}.${fileExt}`;
        const storageRef = sRef(storage, `${DB_PREFIX}/tenants/${tenantId}/vendors/${vendorId}/compliance/${fileName}`);
        
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(uploadResult.ref);

        // 2. Create document record
        const vendorRef = getVendorRef(tenantId, vendorId);
        const snapshot = await get(vendorRef);
        const vendorData = snapshot.val() as Vendor;
        
        const newDocId = push(child(vendorRef, 'documents')).key || Date.now().toString();
        const newDoc: VendorDocument = {
            id: newDocId,
            vendorId,
            name: file.name,
            type: docType,
            url: downloadUrl,
            status: 'ACTIVE',
            expiryDate,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'PORTAL'
        };

        const updatedDocuments = [...(vendorData.documents || []), newDoc];

        // 3. Update Vendor record
        await update(vendorRef, {
            documents: updatedDocuments
        });

        // 4. Trigger compliance status update
        await updateVendorComplianceStatus(tenantId, vendorId);

        return newDoc;
    } catch (error) {
        console.error("Error uploading vendor document: ", error);
        throw error;
    }
};
