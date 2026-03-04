module.exports = [
"[project]/src/lib/approvals.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APPROVAL_POLICIES",
    ()=>APPROVAL_POLICIES,
    "getApproverForRequest",
    ()=>getApproverForRequest
]);
const APPROVAL_POLICIES = {
    // General rule: Requests under $500 auto-approve (simulated by assigning to 'AUTO')
    // or arguably just go straight to PO. For now, let's require approval for everything > $0.
    LIMITS: {
        MANAGER: 1000,
        DIRECTOR: 5000,
        VP: 10000,
        CXO: Infinity // C-Level approves everything else
    },
    // Mock approvers for development (In a real app, these would come from a Users DB with 'Role' and 'Department')
    APPROVERS: {
        IT: {
            MANAGER: {
                uid: 'auth-it-manager',
                name: 'IT Manager',
                email: 'it.manager@example.com'
            },
            DIRECTOR: {
                uid: 'auth-it-director',
                name: 'IT Director',
                email: 'it.director@example.com'
            }
        },
        Marketing: {
            MANAGER: {
                uid: 'auth-mkt-manager',
                name: 'Marketing Manager',
                email: 'mkt.manager@example.com'
            }
        },
        Operations: {
            MANAGER: {
                uid: 'auth-ops-manager',
                name: 'Ops Manager',
                email: 'ops.manager@example.com'
            }
        },
        General: {
            FINANCE: {
                uid: 'auth-finance',
                name: 'Finance Controller',
                email: 'finance@example.com'
            } // Fallback
        }
    }
};
const getApproverForRequest = (department, amount)=>{
    // 1. Normalize department
    const dept = APPROVAL_POLICIES.APPROVERS[department] || APPROVAL_POLICIES.APPROVERS.General;
    // 2. Check thresholds
    // Simple logic: If < 1000 -> Manager. If > 1000 -> Finance (Fallback for easier testing)
    // In a real complex app, we'd traverse up the hierarchy.
    if (amount <= APPROVAL_POLICIES.LIMITS.MANAGER && dept.MANAGER) {
        return {
            ...dept.MANAGER,
            role: 'MANAGER'
        };
    }
    if (amount <= APPROVAL_POLICIES.LIMITS.DIRECTOR && dept.DIRECTOR) {
        return {
            ...dept.DIRECTOR,
            role: 'DIRECTOR'
        };
    }
    // Default High Value -> Finance Controller
    return {
        ...APPROVAL_POLICIES.APPROVERS.General.FINANCE,
        role: 'FINANCE'
    };
};
}),
"[project]/src/lib/requisitions.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRequisition",
    ()=>createRequisition,
    "getRequisitions",
    ()=>getRequisitions,
    "updateRequisitionStatus",
    ()=>updateRequisitionStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$approvals$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/approvals.ts [app-ssr] (ecmascript)");
;
;
;
const COLLECTION_NAME = "requisitions";
const createRequisition = async (requisition)=>{
    try {
        // Determine Approver
        const approver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$approvals$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApproverForRequest"])(requisition.department, requisition.totalAmount);
        const reqsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], COLLECTION_NAME);
        const newReqRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["push"])(reqsRef);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["set"])(newReqRef, {
            ...requisition,
            id: newReqRef.key,
            createdAt: new Date().toISOString(),
            status: 'PENDING',
            approverId: approver.uid,
            approverName: approver.name // Optional: Store name for display
        });
        // Trigger Notification for Approver
        const { createNotification } = await __turbopack_context__.A("[project]/src/lib/notifications.ts [app-ssr] (ecmascript, async loader)");
        await createNotification({
            userId: approver.uid,
            type: 'APPROVAL_REQUEST',
            title: 'New Approval Required',
            message: `${requisition.requesterName} has submitted a new requisition for ${requisition.department}. amount: ${requisition.totalAmount} ${requisition.currency || 'USD'}`,
            link: '/dashboard/approvals'
        });
        return newReqRef.key;
    } catch (error) {
        console.error("Error creating requisition: ", error);
        throw error;
    }
};
const getRequisitions = async ()=>{
    try {
        const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"]);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["child"])(dbRef, COLLECTION_NAME));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.values(data).map((v)=>({
                    ...v,
                    createdAt: new Date(v.createdAt)
                }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching requisitions", error);
        return [];
    }
};
const updateRequisitionStatus = async (reqId, status, approverId)=>{
    const reqRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], `${COLLECTION_NAME}/${reqId}`);
    const updates = {
        status
    };
    if (approverId) updates.approverId = approverId;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(reqRef, updates);
};
}),
"[project]/src/lib/vendors.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addVendor",
    ()=>addVendor,
    "getVendor",
    ()=>getVendor,
    "getVendors",
    ()=>getVendors,
    "updateVendorStatus",
    ()=>updateVendorStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
;
;
const COLLECTION_NAME = "vendors";
const addVendor = async (vendor)=>{
    try {
        const vendorsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], COLLECTION_NAME);
        const newVendorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["push"])(vendorsRef);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["set"])(newVendorRef, {
            ...vendor,
            id: newVendorRef.key,
            createdAt: new Date().toISOString()
        });
        return newVendorRef.key;
    } catch (error) {
        console.error("Error adding vendor: ", error);
        throw error;
    }
};
const getVendors = async ()=>{
    try {
        const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"]);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["child"])(dbRef, COLLECTION_NAME));
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Convert object of objects to array
            return Object.values(data).map((v)=>({
                    ...v,
                    createdAt: new Date(v.createdAt)
                }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching vendors", error);
        return [];
    }
};
const updateVendorStatus = async (vendorId, status)=>{
    const vendorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], `${COLLECTION_NAME}/${vendorId}`);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(vendorRef, {
        status
    });
};
const getVendor = async (id)=>{
    const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"]);
    const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["child"])(dbRef, `${COLLECTION_NAME}/${id}`));
    if (snapshot.exists()) {
        return {
            ...snapshot.val(),
            id
        };
    }
    return null;
};
}),
"[project]/src/lib/purchaseOrders.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createPOFromRequisition",
    ()=>createPOFromRequisition,
    "getPurchaseOrderById",
    ()=>getPurchaseOrderById,
    "getPurchaseOrders",
    ()=>getPurchaseOrders,
    "logDeliveryEvent",
    ()=>logDeliveryEvent,
    "updatePOStatus",
    ()=>updatePOStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vendors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/vendors.ts [app-ssr] (ecmascript)");
;
;
;
const COLLECTION_NAME = "purchase_orders";
const generatePONumber = async ()=>{
    // Simple autoincrement logic or timestamp based
    // Ideally use a transaction counter in DB
    const timestamp = Date.now().toString().slice(-6);
    return `PO-2026-${timestamp}`;
};
const createPOFromRequisition = async (requisition, userId)=>{
    try {
        const poNumber = await generatePONumber();
        const vendor = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vendors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getVendor"])(requisition.vendorId);
        const poRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], COLLECTION_NAME);
        const newPORef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["push"])(poRef);
        const newPO = {
            poNumber,
            requisitionId: requisition.id,
            vendorId: requisition.vendorId,
            vendorName: requisition.vendorName,
            vendorEmail: vendor?.email,
            items: requisition.items,
            totalAmount: requisition.totalAmount,
            currency: requisition.currency,
            status: 'ISSUED',
            issuedAt: new Date().toISOString(),
            issuedBy: userId
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["set"])(newPORef, newPO);
        // Update Requisition status
        const reqRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], `requisitions/${requisition.id}`);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(reqRef, {
            status: 'ORDERED'
        });
        return newPORef.key;
    } catch (error) {
        console.error("Error creating PO:", error);
        throw error;
    }
};
const getPurchaseOrders = async ()=>{
    try {
        const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"]);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["child"])(dbRef, COLLECTION_NAME));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.entries(data).map(([key, v])=>({
                    id: key,
                    ...v,
                    issuedAt: new Date(v.issuedAt)
                }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching POs", error);
        return [];
    }
};
const updatePOStatus = async (poId, status)=>{
    const poRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], `${COLLECTION_NAME}/${poId}`);
    const updates = {
        status
    };
    if (status === 'RECEIVED') {
        updates.receivedAt = new Date().toISOString();
    }
    if (status === 'CANCELLED') {
        updates.cancelledAt = new Date().toISOString();
    }
    if (status === 'FULFILLED') {
        updates.fulfilledAt = new Date().toISOString();
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(poRef, updates);
};
const logDeliveryEvent = async (poId, action, performer)=>{
    try {
        const poRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], `${COLLECTION_NAME}/${poId}`);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["get"])(poRef);
        if (!snapshot.exists()) return;
        const currentData = snapshot.val();
        const history = currentData.deliveryHistory || [];
        const newEvent = {
            timestamp: new Date().toISOString(),
            action,
            performedBy: performer
        };
        const updates = {
            deliveryHistory: [
                ...history,
                newEvent
            ]
        };
        // Update top-level status based on tracking
        if (action === 'SENT') updates.status = 'SENT';
        if (action === 'OPENED' && currentData.status !== 'ACKNOWLEDGED') updates.status = 'OPENED';
        if (action === 'ACKNOWLEDGED') updates.status = 'ACKNOWLEDGED';
        if (action === 'OPENED' && !currentData.firstViewedAt) {
            updates.firstViewedAt = newEvent.timestamp;
        }
        if (action === 'OPENED') {
            updates.lastViewedAt = newEvent.timestamp;
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(poRef, updates);
        // Trigger Notifications for Admin/Stakeholders
        const { createNotification } = await __turbopack_context__.A("[project]/src/lib/notifications.ts [app-ssr] (ecmascript, async loader)");
        // Notify the person who issued the PO (not a global admin)
        const recipientId = currentData.issuedBy;
        if (!recipientId) return;
        // Notify of "OPENED" (Read Receipt)
        if (action === 'OPENED') {
            await createNotification({
                userId: recipientId,
                type: 'PO_OPENED',
                title: 'PO Viewed by Vendor',
                message: `${currentData.vendorName} viewed PO ${currentData.poNumber}`,
                link: '/dashboard/purchase-orders'
            });
        }
        // Notify of "ACKNOWLEDGED"
        if (action === 'ACKNOWLEDGED') {
            await createNotification({
                userId: recipientId,
                type: 'PO_ACKNOWLEDGED',
                title: 'PO Acknowledged',
                message: `${currentData.vendorName} confirmed receipt of PO ${currentData.poNumber}`,
                link: '/dashboard/purchase-orders'
            });
        }
    } catch (error) {
        console.error("Error logging delivery event", error);
    }
};
const getPurchaseOrderById = async (id)=>{
    try {
        const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"]);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["child"])(dbRef, `${COLLECTION_NAME}/${id}`));
        if (snapshot.exists()) {
            const v = snapshot.val();
            return {
                id,
                ...v,
                issuedAt: new Date(v.issuedAt)
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching PO by ID", error);
        return null;
    }
};
}),
"[project]/src/lib/budgets.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createBudget",
    ()=>createBudget,
    "getBudgets",
    ()=>getBudgets,
    "getDepartmentBudgetStatus",
    ()=>getDepartmentBudgetStatus,
    "updateBudget",
    ()=>updateBudget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/analytics.ts [app-ssr] (ecmascript)");
;
;
;
const COLLECTION_NAME = "budgets";
const createBudget = async (budget)=>{
    try {
        const budgetsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], COLLECTION_NAME);
        const newBudgetRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["push"])(budgetsRef);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["set"])(newBudgetRef, {
            ...budget,
            createdAt: new Date().toISOString()
        });
        return newBudgetRef.key;
    } catch (error) {
        console.error("Error creating budget: ", error);
        throw error;
    }
};
const getBudgets = async ()=>{
    try {
        const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"]);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["child"])(dbRef, COLLECTION_NAME));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.entries(data).map(([key, v])=>({
                    id: key,
                    ...v,
                    createdAt: new Date(v.createdAt)
                }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching budgets", error);
        return [];
    }
};
const updateBudget = async (id, budget)=>{
    try {
        const budgetRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], `${COLLECTION_NAME}/${id}`);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(budgetRef, budget);
    } catch (error) {
        console.error("Error updating budget:", error);
        throw error;
    }
};
const getDepartmentBudgetStatus = async (department)=>{
    const [budgets, analytics] = await Promise.all([
        getBudgets(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSpendAnalytics"])()
    ]);
    const deptBudget = budgets.find((b)=>b.department === department);
    if (!deptBudget) return null;
    const spent = analytics.spendByDepartment[department] || 0;
    const remaining = deptBudget.amount - spent;
    return {
        budget: deptBudget.amount,
        spent,
        remaining,
        percent: spent / deptBudget.amount * 100,
        currency: deptBudget.currency || 'USD'
    };
};
}),
"[project]/src/lib/analytics.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSpendAnalytics",
    ()=>getSpendAnalytics
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$purchaseOrders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/purchaseOrders.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$requisitions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/requisitions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$budgets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/budgets.ts [app-ssr] (ecmascript)");
;
;
;
const getSpendAnalytics = async ()=>{
    const [pos, reqs, budgets] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$purchaseOrders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPurchaseOrders"])(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$requisitions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRequisitions"])(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$budgets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBudgets"])()
    ]);
    const reqMap = new Map(reqs.map((r)=>[
            r.id,
            r
        ]));
    const summary = {
        totalSpend: 0,
        pendingSpend: 0,
        savings: 0,
        avgApprovalDays: 0,
        spendByDepartment: {},
        spendByVendor: {},
        spendByCategory: {},
        monthlySpend: [],
        budgetUsage: {
            total: 0,
            used: 0,
            percent: 0
        },
        recentTransactions: [],
        activityFeed: []
    };
    // 1. Calculate Budget Usage
    summary.budgetUsage.total = budgets.reduce((acc, b)=>acc + (Number(b.amount) || 0), 0);
    // 2. Prepare Trend Tracking (Last 6 Months)
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
    const currentMonth = new Date().getMonth();
    const trendMap = new Map();
    for(let i = 5; i >= 0; i--){
        const d = new Date();
        d.setMonth(currentMonth - i);
        trendMap.set(months[d.getMonth()], 0);
    }
    let approvalTotalDays = 0;
    let approvedCount = 0;
    pos.forEach((po)=>{
        const amount = Number(po.totalAmount);
        if (po.status !== 'CLOSED') {
            summary.totalSpend += amount;
            summary.budgetUsage.used += amount;
        }
        const vendor = po.vendorName || 'Unknown';
        summary.spendByVendor[vendor] = (summary.spendByVendor[vendor] || 0) + amount;
        const req = reqMap.get(po.requisitionId);
        if (req) {
            const dept = req.department || 'Unassigned';
            summary.spendByDepartment[dept] = (summary.spendByDepartment[dept] || 0) + amount;
            // Calculate Category Distribution from items
            req.items?.forEach((item)=>{
                // If we don't have explicit categories, we can map GL codes or use department as category proxy
                // For this project, lets use common category names based on departments or keywords
                const category = item.description.toLowerCase().includes('it') ? 'IT Hardware' : item.description.toLowerCase().includes('office') ? 'Office Supplies' : item.description.toLowerCase().includes('software') ? 'Software Subs' : dept;
                summary.spendByCategory[category] = (summary.spendByCategory[category] || 0) + (Number(item.total) || 0);
            });
            // Calculate Approval Time
            if (po.issuedAt && req.createdAt) {
                const delta = (new Date(po.issuedAt).getTime() - new Date(req.createdAt).getTime()) / (1000 * 3600 * 24);
                approvalTotalDays += delta;
                approvedCount++;
            }
        }
        // Add to Trend Map
        const poDate = new Date(po.issuedAt);
        const poMonth = months[poDate.getMonth()];
        if (trendMap.has(poMonth)) {
            trendMap.set(poMonth, (trendMap.get(poMonth) || 0) + amount);
        }
        // Mock Savings: 5.2% of PO value for demo (In real system this comes from contract deltas)
        summary.savings += amount * 0.052;
        // Standard Order Event
        summary.activityFeed.push({
            id: po.id,
            type: 'ORDER',
            title: `PO ${po.poNumber} Issued`,
            description: `Order issued to ${po.vendorName}`,
            amount: po.totalAmount,
            currency: po.currency,
            timestamp: po.issuedAt,
            user: 'System',
            status: po.status
        });
        // Add Delivery Events to Feed
        po.deliveryHistory?.forEach((log)=>{
            summary.activityFeed.push({
                id: `${po.id}-${log.timestamp}`,
                type: 'ORDER',
                title: log.action === 'OPENED' ? 'Vendor Opened PO' : log.action === 'ACKNOWLEDGED' ? 'Vendor Acknowledged PO' : 'Link Emailed',
                description: `${log.action === 'OPENED' ? 'PO ' + po.poNumber + ' viewed by vendor' : log.action === 'ACKNOWLEDGED' ? 'Vendor confirmed receipt of ' + po.poNumber : 'PO ' + po.poNumber + ' link sent to vendor'}`,
                amount: po.totalAmount,
                currency: po.currency,
                timestamp: new Date(log.timestamp),
                user: log.performedBy === 'VENDOR' ? po.vendorName : 'Admin',
                status: log.action
            });
        });
    });
    // Finalize KPIs
    summary.avgApprovalDays = approvedCount > 0 ? Number((approvalTotalDays / approvedCount).toFixed(1)) : 0;
    summary.monthlySpend = Array.from(trendMap.entries()).map(([label, value])=>({
            label,
            value
        }));
    summary.budgetUsage.percent = summary.budgetUsage.total > 0 ? summary.budgetUsage.used / summary.budgetUsage.total * 100 : 0;
    // Add Pending Requisitions to Feed
    reqs.filter((r)=>r.status === 'PENDING').slice(0, 5).forEach((req)=>{
        summary.activityFeed.push({
            id: req.id,
            type: 'REQUISITION',
            title: 'New Requisition',
            description: `${req.requesterName} requested ${req.items[0]?.description}`,
            amount: req.totalAmount,
            currency: req.currency,
            timestamp: req.createdAt,
            user: req.requesterName,
            status: req.status
        });
    });
    summary.recentTransactions = pos.sort((a, b)=>b.issuedAt.getTime() - a.issuedAt.getTime()).slice(0, 5);
    summary.activityFeed.sort((a, b)=>b.timestamp.getTime() - a.timestamp.getTime());
    return summary;
};
}),
"[project]/src/lib/currencies.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CURRENCIES",
    ()=>CURRENCIES,
    "formatCurrency",
    ()=>formatCurrency
]);
const CURRENCIES = [
    // North America
    {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        flag: '🇺🇸',
        country: 'United States'
    },
    {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'CA$',
        flag: '🇨🇦',
        country: 'Canada'
    },
    {
        code: 'MXN',
        name: 'Mexican Peso',
        symbol: '$',
        flag: '🇲🇽',
        country: 'Mexico'
    },
    // Europe
    {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        flag: '🇪🇺',
        country: 'European Union'
    },
    {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        flag: '🇬🇧',
        country: 'United Kingdom'
    },
    {
        code: 'CHF',
        name: 'Swiss Franc',
        symbol: 'Fr',
        flag: '🇨🇭',
        country: 'Switzerland'
    },
    {
        code: 'SEK',
        name: 'Swedish Krona',
        symbol: 'kr',
        flag: '🇸🇪',
        country: 'Sweden'
    },
    {
        code: 'NOK',
        name: 'Norwegian Krone',
        symbol: 'kr',
        flag: '🇳🇴',
        country: 'Norway'
    },
    {
        code: 'DKK',
        name: 'Danish Krone',
        symbol: 'kr',
        flag: '🇩🇰',
        country: 'Denmark'
    },
    {
        code: 'PLN',
        name: 'Polish Złoty',
        symbol: 'zł',
        flag: '🇵🇱',
        country: 'Poland'
    },
    {
        code: 'RUB',
        name: 'Russian Ruble',
        symbol: '₽',
        flag: '🇷🇺',
        country: 'Russia'
    },
    {
        code: 'TRY',
        name: 'Turkish Lira',
        symbol: '₺',
        flag: '🇹🇷',
        country: 'Turkey'
    },
    // Asia & Pacific
    {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        flag: '🇦🇺',
        country: 'Australia'
    },
    {
        code: 'NZD',
        name: 'New Zealand Dollar',
        symbol: 'NZ$',
        flag: '🇳🇿',
        country: 'New Zealand'
    },
    {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        flag: '🇯🇵',
        country: 'Japan'
    },
    {
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        flag: '🇨🇳',
        country: 'China'
    },
    {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        flag: '🇮🇳',
        country: 'India'
    },
    {
        code: 'HKD',
        name: 'Hong Kong Dollar',
        symbol: 'HK$',
        flag: '🇭🇰',
        country: 'Hong Kong'
    },
    {
        code: 'SGD',
        name: 'Singapore Dollar',
        symbol: 'S$',
        flag: '🇸🇬',
        country: 'Singapore'
    },
    {
        code: 'KRW',
        name: 'South Korean Won',
        symbol: '₩',
        flag: '🇰🇷',
        country: 'South Korea'
    },
    {
        code: 'IDR',
        name: 'Indonesian Rupiah',
        symbol: 'Rp',
        flag: '🇮🇩',
        country: 'Indonesia'
    },
    {
        code: 'MYR',
        name: 'Malaysian Ringgit',
        symbol: 'RM',
        flag: '🇲🇾',
        country: 'Malaysia'
    },
    {
        code: 'PHP',
        name: 'Philippine Peso',
        symbol: '₱',
        flag: '🇵🇭',
        country: 'Philippines'
    },
    {
        code: 'THB',
        name: 'Thai Baht',
        symbol: '฿',
        flag: '🇹🇭',
        country: 'Thailand'
    },
    {
        code: 'VND',
        name: 'Vietnamese Dong',
        symbol: '₫',
        flag: '🇻🇳',
        country: 'Vietnam'
    },
    {
        code: 'PKR',
        name: 'Pakistani Rupee',
        symbol: '₨',
        flag: '🇵🇰',
        country: 'Pakistan'
    },
    {
        code: 'BDT',
        name: 'Bangladeshi Taka',
        symbol: '৳',
        flag: '🇧🇩',
        country: 'Bangladesh'
    },
    // Middle East
    {
        code: 'AED',
        name: 'UAE Dirham',
        symbol: 'د.إ',
        flag: '🇦🇪',
        country: 'UAE'
    },
    {
        code: 'SAR',
        name: 'Saudi Riyal',
        symbol: '﷼',
        flag: '🇸🇦',
        country: 'Saudi Arabia'
    },
    {
        code: 'QAR',
        name: 'Qatari Riyal',
        symbol: '﷼',
        flag: '🇶🇦',
        country: 'Qatar'
    },
    {
        code: 'KWD',
        name: 'Kuwaiti Dinar',
        symbol: 'KD',
        flag: '🇰🇼',
        country: 'Kuwait'
    },
    {
        code: 'ILS',
        name: 'Israeli New Shekel',
        symbol: '₪',
        flag: '🇮🇱',
        country: 'Israel'
    },
    // South America
    {
        code: 'BRL',
        name: 'Brazilian Real',
        symbol: 'R$',
        flag: '🇧🇷',
        country: 'Brazil'
    },
    {
        code: 'ARS',
        name: 'Argentine Peso',
        symbol: '$',
        flag: '🇦🇷',
        country: 'Argentina'
    },
    {
        code: 'CLP',
        name: 'Chilean Peso',
        symbol: '$',
        flag: '🇨🇱',
        country: 'Chile'
    },
    {
        code: 'COP',
        name: 'Colombian Peso',
        symbol: '$',
        flag: '🇨🇴',
        country: 'Colombia'
    },
    {
        code: 'PEN',
        name: 'Peruvian Sol',
        symbol: 'S/',
        flag: '🇵🇪',
        country: 'Peru'
    },
    // Africa
    {
        code: 'GHS',
        name: 'Ghanaian Cedi',
        symbol: '₵',
        flag: '🇬🇭',
        country: 'Ghana'
    },
    {
        code: 'NGN',
        name: 'Nigerian Naira',
        symbol: '₦',
        flag: '🇳🇬',
        country: 'Nigeria'
    },
    {
        code: 'ZAR',
        name: 'South African Rand',
        symbol: 'R',
        flag: '🇿🇦',
        country: 'South Africa'
    },
    {
        code: 'EGP',
        name: 'Egyptian Pound',
        symbol: 'E£',
        flag: '🇪🇬',
        country: 'Egypt'
    },
    {
        code: 'KES',
        name: 'Kenyan Shilling',
        symbol: 'KSh',
        flag: '🇰🇪',
        country: 'Kenya'
    },
    {
        code: 'MAD',
        name: 'Moroccan Dirham',
        symbol: 'DH',
        flag: '🇲🇦',
        country: 'Morocco'
    },
    {
        code: 'TZS',
        name: 'Tanzanian Shilling',
        symbol: 'TSh',
        flag: '🇹🇿',
        country: 'Tanzania'
    },
    {
        code: 'UGX',
        name: 'Ugandan Shilling',
        symbol: 'USh',
        flag: '🇺🇬',
        country: 'Uganda'
    },
    {
        code: 'DZD',
        name: 'Algerian Dinar',
        symbol: 'DA',
        flag: '🇩🇿',
        country: 'Algeria'
    },
    {
        code: 'TND',
        name: 'Tunisian Dinar',
        symbol: 'DT',
        flag: '🇹🇳',
        country: 'Tunisia'
    },
    {
        code: 'ETB',
        name: 'Ethiopian Birr',
        symbol: 'Br',
        flag: '🇪🇹',
        country: 'Ethiopia'
    },
    {
        code: 'XOF',
        name: 'West African CFA Franc',
        symbol: 'CFA',
        flag: '🇧🇯',
        country: 'West Africa (CFA)'
    },
    {
        code: 'XAF',
        name: 'Central African CFA Franc',
        symbol: 'FCFA',
        flag: '🇨🇲',
        country: 'Central Africa (CFA)'
    },
    {
        code: 'RWF',
        name: 'Rwandan Franc',
        symbol: 'RF',
        flag: '🇷🇼',
        country: 'Rwanda'
    },
    {
        code: 'BWP',
        name: 'Botswana Pula',
        symbol: 'P',
        flag: '🇧🇼',
        country: 'Botswana'
    },
    {
        code: 'ZMW',
        name: 'Zambian Kwacha',
        symbol: 'ZK',
        flag: '🇿🇲',
        country: 'Zambia'
    },
    {
        code: 'AOA',
        name: 'Angolan Kwanza',
        symbol: 'Kz',
        flag: '🇦🇴',
        country: 'Angola'
    },
    {
        code: 'MUR',
        name: 'Mauritian Rupee',
        symbol: '₨',
        flag: '🇲🇺',
        country: 'Mauritius'
    }
];
const formatCurrency = (amount, currencyCode = 'USD')=>{
    const currency = CURRENCIES.find((c)=>c.code === currencyCode) || CURRENCIES[0];
    try {
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
        return `${currency.flag} ${formatted}`;
    } catch (e) {
        return `${currency.flag} ${currency.symbol}${amount.toFixed(2)}`;
    }
};
}),
"[project]/src/components/charts/SimpleCharts.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BudgetDonutChart",
    ()=>BudgetDonutChart,
    "SpendBarChart",
    ()=>SpendBarChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/currencies.ts [app-ssr] (ecmascript)");
"use client";
;
;
function SpendBarChart({ data }) {
    const maxValue = Math.max(...data.map((d)=>d.value));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1rem',
            height: '200px',
            paddingTop: '1rem'
        },
        children: data.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: '100%',
                            height: `${item.value / maxValue * 100}%`,
                            backgroundColor: item.color || 'var(--accent)',
                            borderRadius: '4px 4px 0 0',
                            minHeight: '4px',
                            transition: 'height 0.5s ease-out',
                            position: 'relative'
                        },
                        title: `${item.label}: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCurrency"])(item.value, 'USD')}`
                    }, void 0, false, {
                        fileName: "[project]/src/components/charts/SimpleCharts.tsx",
                        lineNumber: 14,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                        },
                        children: item.label
                    }, void 0, false, {
                        fileName: "[project]/src/components/charts/SimpleCharts.tsx",
                        lineNumber: 28,
                        columnNumber: 21
                    }, this)
                ]
            }, index, true, {
                fileName: "[project]/src/components/charts/SimpleCharts.tsx",
                lineNumber: 13,
                columnNumber: 17
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/charts/SimpleCharts.tsx",
        lineNumber: 11,
        columnNumber: 9
    }, this);
}
function BudgetDonutChart({ total, used }) {
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const percent = Math.min(used / total * 100, 100);
    const strokeDashoffset = circumference - percent / 100 * circumference;
    // Determine color
    let color = 'var(--success)';
    if (percent > 80) color = '#eab308'; // Warning
    if (percent > 100) color = 'var(--error)';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                height: "120",
                width: "120",
                style: {
                    transform: 'rotate(-90deg)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        stroke: "#e2e8f0",
                        strokeWidth: stroke,
                        fill: "transparent",
                        r: normalizedRadius,
                        cx: "60",
                        cy: "60"
                    }, void 0, false, {
                        fileName: "[project]/src/components/charts/SimpleCharts.tsx",
                        lineNumber: 52,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        stroke: color,
                        strokeWidth: stroke,
                        strokeDasharray: circumference + ' ' + circumference,
                        style: {
                            strokeDashoffset,
                            transition: 'stroke-dashoffset 0.5s ease-in-out'
                        },
                        strokeLinecap: "round",
                        fill: "transparent",
                        r: normalizedRadius,
                        cx: "60",
                        cy: "60"
                    }, void 0, false, {
                        fileName: "[project]/src/components/charts/SimpleCharts.tsx",
                        lineNumber: 60,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/charts/SimpleCharts.tsx",
                lineNumber: 51,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    textAlign: 'center'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                        },
                        children: "Used"
                    }, void 0, false, {
                        fileName: "[project]/src/components/charts/SimpleCharts.tsx",
                        lineNumber: 73,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontWeight: 'bold',
                            color: 'var(--text-main)'
                        },
                        children: [
                            Math.round(percent),
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/charts/SimpleCharts.tsx",
                        lineNumber: 74,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/charts/SimpleCharts.tsx",
                lineNumber: 72,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/charts/SimpleCharts.tsx",
        lineNumber: 50,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/ui/CustomSelect.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CustomSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function CustomSelect({ options, value, onChange, placeholder = "Select...", creatable = false, onAddOption, label }) {
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isCreating, setIsCreating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newOptionValue, setNewOptionValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const selectedOption = options.find((o)=>o.value === value);
    // Close on click outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsCreating(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return ()=>document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleSelect = (val)=>{
        onChange(val);
        setIsOpen(false);
        setSearchTerm("");
    };
    const handleCreate = ()=>{
        if (newOptionValue.trim() && onAddOption) {
            onAddOption(newOptionValue.trim());
            onChange(newOptionValue.trim()); // Auto select
            setNewOptionValue("");
            setIsCreating(false);
            setIsOpen(false);
        }
    };
    const filteredOptions = options.filter((opt)=>opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "custom-select-wrapper",
        ref: wrapperRef,
        style: {
            position: 'relative',
            marginBottom: '1rem'
        },
        children: [
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: {
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)'
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/ui/CustomSelect.tsx",
                lineNumber: 73,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: ()=>setIsOpen(!isOpen),
                style: {
                    padding: '0.75rem 1rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '42px',
                    boxShadow: isOpen ? '0 0 0 2px rgba(4, 156, 99, 0.2)' : 'none',
                    transition: 'all 0.2s',
                    color: selectedOption ? 'var(--text-main)' : 'var(--text-secondary)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        },
                        children: [
                            selectedOption?.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: selectedOption.icon
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                lineNumber: 97,
                                columnNumber: 46
                            }, this),
                            selectedOption ? selectedOption.label : placeholder
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/CustomSelect.tsx",
                        lineNumber: 96,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                        },
                        children: "▼"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/CustomSelect.tsx",
                        lineNumber: 100,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/CustomSelect.tsx",
                lineNumber: 79,
                columnNumber: 13
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--surface)',
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    animation: 'fade-in-up 0.2s ease-out forwards'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: 'var(--surface)',
                        opacity: 0.95
                    },
                    children: [
                        options.length > 5 && !isCreating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '0.5rem'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Search...",
                                value: searchTerm,
                                onChange: (e)=>setSearchTerm(e.target.value),
                                onClick: (e)=>e.stopPropagation(),
                                style: {
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--background)',
                                    color: 'var(--text-main)'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                lineNumber: 134,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/CustomSelect.tsx",
                            lineNumber: 133,
                            columnNumber: 29
                        }, this),
                        !isCreating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column'
                            },
                            children: [
                                filteredOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onClick: ()=>handleSelect(opt.value),
                                        style: {
                                            padding: '0.75rem 1rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: 'var(--text-main)',
                                            transition: 'background 0.1s',
                                            background: opt.value === value ? 'rgba(4, 156, 99, 0.1)' : 'transparent',
                                            borderLeft: opt.value === value ? '3px solid var(--accent)' : '3px solid transparent'
                                        },
                                        onMouseEnter: (e)=>e.currentTarget.style.background = 'rgba(4, 156, 99, 0.05)',
                                        onMouseLeave: (e)=>e.currentTarget.style.background = opt.value === value ? 'rgba(4, 156, 99, 0.1)' : 'transparent',
                                        children: [
                                            opt.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: opt.icon
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                                lineNumber: 173,
                                                columnNumber: 54
                                            }, this),
                                            opt.label
                                        ]
                                    }, opt.value, true, {
                                        fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                        lineNumber: 156,
                                        columnNumber: 37
                                    }, this)),
                                filteredOptions.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        padding: '1rem',
                                        textAlign: 'center',
                                        color: 'var(--text-secondary)'
                                    },
                                    children: "No options found."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                    lineNumber: 179,
                                    columnNumber: 37
                                }, this),
                                creatable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: ()=>setIsCreating(true),
                                    style: {
                                        padding: '0.75rem 1rem',
                                        borderTop: '1px solid var(--border)',
                                        color: 'var(--accent)',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    },
                                    onMouseEnter: (e)=>e.currentTarget.style.background = 'var(--background)',
                                    onMouseLeave: (e)=>e.currentTarget.style.background = 'transparent',
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "+"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                            lineNumber: 201,
                                            columnNumber: 41
                                        }, this),
                                        " Add New..."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                    lineNumber: 186,
                                    columnNumber: 37
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ui/CustomSelect.tsx",
                            lineNumber: 154,
                            columnNumber: 29
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '1rem'
                            },
                            onClick: (e)=>e.stopPropagation(),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: {
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem'
                                    },
                                    children: "New Value Name"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                    lineNumber: 207,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        gap: '0.5rem'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            autoFocus: true,
                                            type: "text",
                                            value: newOptionValue,
                                            onChange: (e)=>setNewOptionValue(e.target.value),
                                            onKeyDown: (e)=>e.key === 'Enter' && handleCreate(),
                                            style: {
                                                flex: 1,
                                                padding: '0.5rem',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-sm)',
                                                background: 'var(--background)',
                                                color: 'var(--text-main)'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                            lineNumber: 209,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleCreate,
                                            className: "btn btn-primary",
                                            style: {
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.875rem'
                                            },
                                            children: "Add"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                            lineNumber: 224,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setIsCreating(false),
                                            className: "btn",
                                            style: {
                                                padding: '0.5rem',
                                                color: 'var(--text-secondary)'
                                            },
                                            children: "✕"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                            lineNumber: 231,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ui/CustomSelect.tsx",
                                    lineNumber: 208,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ui/CustomSelect.tsx",
                            lineNumber: 206,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ui/CustomSelect.tsx",
                    lineNumber: 127,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/CustomSelect.tsx",
                lineNumber: 105,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/CustomSelect.tsx",
        lineNumber: 71,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/app/dashboard/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$requisitions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/requisitions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/analytics.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$charts$2f$SimpleCharts$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/charts/SimpleCharts.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/currencies.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$CustomSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/CustomSelect.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
function Dashboard() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [timeRange, setTimeRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Last 6 Months");
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        pendingCount: 0,
        activeCount: 0,
        totalSpend: 0,
        savings: 0,
        avgApprovalDays: 0,
        monthlyData: [],
        activityFeed: [],
        spendByCategory: {},
        budgetUsage: {
            total: 0,
            used: 0,
            percent: 0
        }
    });
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const loadData = async ()=>{
        setLoading(true);
        const [reqs, analytics] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$requisitions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRequisitions"])(),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSpendAnalytics"])()
        ]);
        const pending = reqs.filter((r)=>r.status === 'PENDING').length;
        setStats({
            pendingCount: pending,
            activeCount: reqs.length,
            totalSpend: analytics.totalSpend,
            savings: analytics.savings,
            avgApprovalDays: analytics.avgApprovalDays,
            monthlyData: analytics.monthlySpend,
            activityFeed: analytics.activityFeed,
            spendByCategory: analytics.spendByCategory,
            budgetUsage: analytics.budgetUsage
        });
        setLoading(false);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        loadData();
    }, []);
    const quickActions = [
        {
            name: "New Request",
            href: "/dashboard/requisitions/new",
            icon: "📝",
            color: "var(--accent)"
        },
        {
            name: "Approve Requests",
            href: "/dashboard/approvals",
            icon: "✅",
            color: "var(--success)"
        },
        {
            name: "Check Budget",
            href: "/dashboard/budgets",
            icon: "💰",
            color: "#eab308"
        }
    ];
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '2rem'
        },
        children: "Loading Dashboard..."
    }, void 0, false, {
        fileName: "[project]/src/app/dashboard/page.tsx",
        lineNumber: 63,
        columnNumber: 25
    }, this);
    const categories = Object.entries(stats.spendByCategory || {}).sort((a, b)=>b[1] - a[1]).slice(0, 4);
    const colors = [
        "var(--primary)",
        "var(--accent)",
        "#8b5cf6",
        "#ec4899"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            maxWidth: '1400px',
            margin: '0 auto'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: '2.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: {
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    marginBottom: '0.5rem',
                                    background: 'linear-gradient(135deg, var(--text-main) 0%, var(--text-secondary) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    letterSpacing: '-0.03em'
                                },
                                children: [
                                    "Welcome back, ",
                                    user?.displayName?.split(' ')[0] || 'User'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 76,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: 'var(--text-secondary)',
                                    fontSize: '1.1rem'
                                },
                                children: "Here is a summary of your procurement ecosystem."
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 87,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 75,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '1rem'
                        },
                        children: quickActions.map((action)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: action.href,
                                className: "btn",
                                style: {
                                    display: 'flex',
                                    gap: '0.5rem',
                                    alignItems: 'center',
                                    backgroundColor: 'white',
                                    border: '1px solid var(--border)',
                                    fontSize: '0.875rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: action.icon
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 92,
                                        columnNumber: 29
                                    }, this),
                                    " ",
                                    action.name
                                ]
                            }, action.name, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 91,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 89,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 74,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2.5rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(KPICard, {
                        title: "Total Annual Spend",
                        value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCurrency"])(stats.totalSpend, 'USD'),
                        trend: "+12.5%",
                        icon: "💸",
                        description: "vs previous fiscal year"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 100,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(KPICard, {
                        title: "Realized Savings",
                        value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCurrency"])(stats.savings, 'USD'),
                        trend: "5.2%",
                        icon: "🛡️",
                        description: "negotiated & contract savings"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 107,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(KPICard, {
                        title: "Avg. Approval Time",
                        value: `${stats.avgApprovalDays} Days`,
                        trend: stats.avgApprovalDays > 3 ? "+0.4" : "-0.2",
                        icon: "⏱️",
                        description: "request to order cycle"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 114,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(KPICard, {
                        title: "Pending Actions",
                        value: stats.pendingCount.toString(),
                        urgent: stats.pendingCount > 0,
                        icon: "🔔",
                        description: "requires immediate attention"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 121,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 99,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 380px',
                    gap: '2rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '1.5rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                style: {
                                                    fontSize: '1.2rem',
                                                    fontWeight: 700
                                                },
                                                children: "Expenditure Trend"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 136,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: '180px'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$CustomSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    value: timeRange,
                                                    onChange: setTimeRange,
                                                    options: [
                                                        {
                                                            label: "Last 6 Months",
                                                            value: "Last 6 Months"
                                                        },
                                                        {
                                                            label: "Year to Date",
                                                            value: "Year to Date"
                                                        }
                                                    ]
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 137,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 135,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$charts$2f$SimpleCharts$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SpendBarChart"], {
                                        data: stats.monthlyData
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 148,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 134,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1.5rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    marginBottom: '1.5rem'
                                                },
                                                children: "Budget Utilization"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 153,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    padding: '1rem 0'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$charts$2f$SimpleCharts$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BudgetDonutChart"], {
                                                    total: stats.budgetUsage?.total || 1000,
                                                    used: stats.budgetUsage?.used || 0
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 155,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 154,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: '1rem',
                                                    textAlign: 'center',
                                                    fontSize: '0.875rem',
                                                    color: 'var(--text-secondary)'
                                                },
                                                children: [
                                                    100 - Math.round(stats.budgetUsage?.percent || 0),
                                                    "% of total annual budget remaining"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 157,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 152,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    marginBottom: '1rem'
                                                },
                                                children: "Spend by Category"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 162,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.75rem'
                                                },
                                                children: categories.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: {
                                                        fontSize: '0.875rem',
                                                        color: 'var(--text-secondary)',
                                                        textAlign: 'center',
                                                        marginTop: '2rem'
                                                    },
                                                    children: "No data available."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                                    lineNumber: 165,
                                                    columnNumber: 37
                                                }, this) : categories.map(([label, value], idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CategoryRow, {
                                                        label: label,
                                                        value: Math.round(value / stats.totalSpend * 100),
                                                        color: colors[idx % colors.length]
                                                    }, label, false, {
                                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                                        lineNumber: 168,
                                                        columnNumber: 41
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/page.tsx",
                                                lineNumber: 163,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 161,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 151,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 133,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: '1000px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1.5rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        style: {
                                            fontSize: '1.2rem',
                                            fontWeight: 700
                                        },
                                        children: "Activity Feed"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 184,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '0.75rem',
                                            color: 'var(--primary)',
                                            fontWeight: 600
                                        },
                                        children: "LIVE UPDATES"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 185,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 183,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.25rem',
                                    overflowY: 'auto'
                                },
                                children: stats.activityFeed.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: 'center',
                                        color: 'var(--text-secondary)',
                                        padding: '2rem'
                                    },
                                    children: "No recent activity."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/page.tsx",
                                    lineNumber: 190,
                                    columnNumber: 29
                                }, this) : stats.activityFeed.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityItem, {
                                        event: event
                                    }, event.id, false, {
                                        fileName: "[project]/src/app/dashboard/page.tsx",
                                        lineNumber: 193,
                                        columnNumber: 33
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 188,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-text",
                                style: {
                                    marginTop: 'auto',
                                    padding: '1rem 0',
                                    color: 'var(--primary)',
                                    fontSize: '0.875rem'
                                },
                                children: "View System Audit Log →"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 198,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 182,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 130,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/page.tsx",
        lineNumber: 72,
        columnNumber: 9
    }, this);
}
function KPICard({ title, value, trend, icon, description, urgent }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "card",
        style: {
            position: 'relative',
            overflow: 'hidden',
            borderLeft: urgent ? '4px solid var(--error)' : '1px solid var(--border)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    fontSize: '4rem',
                    opacity: 0.05
                },
                children: icon
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 210,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                    fontWeight: 500
                },
                children: title
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 211,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.5rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '1.75rem',
                            fontWeight: 800,
                            color: 'var(--text-main)'
                        },
                        children: value
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 213,
                        columnNumber: 17
                    }, this),
                    trend && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '0.8rem',
                            color: trend.startsWith('+') ? 'var(--error)' : 'var(--success)',
                            fontWeight: 600
                        },
                        children: trend
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 214,
                        columnNumber: 27
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 212,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.5rem'
                },
                children: description
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 216,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/page.tsx",
        lineNumber: 209,
        columnNumber: 9
    }, this);
}
function CategoryRow({ label, value, color }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontSize: '0.875rem'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 225,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontWeight: 600
                        },
                        children: [
                            value,
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 226,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 224,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: '6px',
                    width: '100%',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '3px',
                    overflow: 'hidden'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: '100%',
                        width: `${value}%`,
                        backgroundColor: color
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/dashboard/page.tsx",
                    lineNumber: 229,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 228,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/page.tsx",
        lineNumber: 223,
        columnNumber: 9
    }, this);
}
function ActivityItem({ event }) {
    const getIcon = ()=>{
        switch(event.type){
            case 'REQUISITION':
                return '📄';
            case 'ORDER':
                return '📦';
            case 'INVOICE':
                return '🧾';
            default:
                return '🔔';
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            gap: '1rem'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0
                },
                children: getIcon()
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 247,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-main)'
                        },
                        children: event.title
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 255,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.25rem'
                        },
                        children: event.description
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 256,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.75rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: 'var(--text-secondary)'
                                },
                                children: [
                                    event.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }),
                                    " • ",
                                    event.user
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 258,
                                columnNumber: 21
                            }, this),
                            event.amount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontWeight: 600
                                },
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCurrency"])(event.amount, event.currency)
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/page.tsx",
                                lineNumber: 261,
                                columnNumber: 38
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/page.tsx",
                        lineNumber: 257,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/page.tsx",
                lineNumber: 254,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/page.tsx",
        lineNumber: 246,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=src_bcbea153._.js.map