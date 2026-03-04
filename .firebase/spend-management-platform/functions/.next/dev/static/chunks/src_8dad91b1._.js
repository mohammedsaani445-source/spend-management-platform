(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/vendors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/index.esm.js [app-client] (ecmascript)");
;
;
const COLLECTION_NAME = "vendors";
const addVendor = async (vendor)=>{
    try {
        const vendorsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION_NAME);
        const newVendorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["push"])(vendorsRef);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["set"])(newVendorRef, {
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
        const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"]);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["child"])(dbRef, COLLECTION_NAME));
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
    const vendorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], `${COLLECTION_NAME}/${vendorId}`);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["update"])(vendorRef, {
        status
    });
};
const getVendor = async (id)=>{
    const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"]);
    const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["child"])(dbRef, `${COLLECTION_NAME}/${id}`));
    if (snapshot.exists()) {
        return {
            ...snapshot.val(),
            id
        };
    }
    return null;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/purchaseOrders.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vendors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/vendors.ts [app-client] (ecmascript)");
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
        const vendor = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vendors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVendor"])(requisition.vendorId);
        const poRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION_NAME);
        const newPORef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["push"])(poRef);
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
            expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            issuedBy: userId
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["set"])(newPORef, newPO);
        // Update Requisition status
        const reqRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], `requisitions/${requisition.id}`);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["update"])(reqRef, {
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
        const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"]);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["child"])(dbRef, COLLECTION_NAME));
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
    const poRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], `${COLLECTION_NAME}/${poId}`);
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
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["update"])(poRef, updates);
};
const logDeliveryEvent = async (poId, action, performer)=>{
    try {
        const poRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], `${COLLECTION_NAME}/${poId}`);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["get"])(poRef);
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
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["update"])(poRef, updates);
        // Trigger Notifications for Admin/Stakeholders
        const { createNotification } = await __turbopack_context__.A("[project]/src/lib/notifications.ts [app-client] (ecmascript, async loader)");
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
        const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"]);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["child"])(dbRef, `${COLLECTION_NAME}/${id}`));
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/currencies.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/emailTemplates.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EMAIL_TEMPLATES",
    ()=>EMAIL_TEMPLATES,
    "getTemplateById",
    ()=>getTemplateById,
    "getTemplatesByCategory",
    ()=>getTemplatesByCategory,
    "replaceEmailVariables",
    ()=>replaceEmailVariables
]);
const EMAIL_TEMPLATES = [
    {
        id: 'standard-po',
        name: 'Standard PO Notification',
        category: 'standard',
        description: 'Professional notification for new purchase orders',
        subject: 'Purchase Order {PO_NUMBER} - Action Required',
        body: `Dear {VENDOR_NAME} Team,

We are pleased to issue Purchase Order {PO_NUMBER} for your review and acknowledgment.

**Order Details:**
- PO Number: {PO_NUMBER}
- Total Amount: {TOTAL_AMOUNT}
- Expected Delivery: {DUE_DATE}

**Items Ordered:**
{ITEM_LIST}

**Next Steps:**
Please review the attached purchase order and confirm receipt by acknowledging this order within 2 business days. If you have any questions or concerns, please contact us immediately.

**Important:** This purchase order is subject to our standard terms and conditions. Please ensure all items are delivered by the specified date.

Thank you for your continued partnership.

Best regards,
{CONTACT_NAME}
{COMPANY_NAME}
Procurement Department`
    },
    {
        id: 'urgent-po',
        name: 'Urgent Request',
        category: 'urgent',
        description: 'High-priority notification requiring immediate attention',
        subject: '🔴 URGENT: Purchase Order {PO_NUMBER} - Immediate Attention Required',
        body: `URGENT ATTENTION REQUIRED

Dear {VENDOR_NAME} Team,

This is an URGENT purchase order that requires your immediate attention and acknowledgment.

**CRITICAL ORDER DETAILS:**
- PO Number: {PO_NUMBER}
- Total Amount: {TOTAL_AMOUNT}
- REQUIRED Delivery Date: {DUE_DATE}
- Priority Level: HIGH

**Items Ordered:**
{ITEM_LIST}

**IMMEDIATE ACTION REQUIRED:**
⚠️ Please acknowledge this purchase order within 24 hours
⚠️ Confirm delivery capability by {DUE_DATE}
⚠️ Contact us immediately if there are any concerns

This order is time-sensitive and critical to our operations. Your prompt response is essential.

For urgent inquiries, please contact:
{CONTACT_NAME}
{COMPANY_NAME}
Procurement Department

Thank you for your urgent attention to this matter.`
    },
    {
        id: 'followup-reminder',
        name: 'Follow-up Reminder',
        category: 'followup',
        description: 'Polite reminder for pending acknowledgments',
        subject: 'Reminder: Purchase Order {PO_NUMBER} Awaiting Acknowledgment',
        body: `Dear {VENDOR_NAME} Team,

This is a friendly reminder regarding Purchase Order {PO_NUMBER}, which was sent on {SENT_DATE} and is still awaiting your acknowledgment.

**Order Summary:**
- PO Number: {PO_NUMBER}
- Total Amount: {TOTAL_AMOUNT}
- Expected Delivery: {DUE_DATE}

**Items:**
{ITEM_LIST}

**Action Needed:**
We kindly request that you acknowledge receipt of this purchase order at your earliest convenience. If you have already processed this order, please disregard this reminder.

If there are any issues or questions regarding this order, please don't hesitate to reach out to us.

Thank you for your attention to this matter.

Best regards,
{CONTACT_NAME}
{COMPANY_NAME}
Procurement Department`
    },
    {
        id: 'custom-template',
        name: 'Custom Template',
        category: 'custom',
        description: 'Blank template for custom messages',
        subject: 'Purchase Order {PO_NUMBER}',
        body: `Dear {VENDOR_NAME} Team,

[Your custom message here]

**Order Details:**
- PO Number: {PO_NUMBER}
- Total Amount: {TOTAL_AMOUNT}

**Items:**
{ITEM_LIST}

Best regards,
{CONTACT_NAME}
{COMPANY_NAME}`
    }
];
const replaceEmailVariables = (template, po, contactName = 'Procurement Team', companyName = 'Acme Corp Inc.', sentDate)=>{
    const itemList = po.items.map((item, idx)=>`${idx + 1}. ${item.description} - Qty: ${item.quantity} @ ${item.unitPrice} ${po.currency}`).join('\n');
    const variables = {
        '{PO_NUMBER}': po.poNumber,
        '{VENDOR_NAME}': po.vendorName,
        '{TOTAL_AMOUNT}': `${po.totalAmount.toLocaleString()} ${po.currency}`,
        '{DUE_DATE}': 'To be confirmed',
        '{ITEM_LIST}': itemList,
        '{CONTACT_NAME}': contactName,
        '{COMPANY_NAME}': companyName,
        '{SENT_DATE}': sentDate ? sentDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }) : new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    };
    let result = template;
    Object.entries(variables).forEach(([key, value])=>{
        result = result.replace(new RegExp(key, 'g'), value);
    });
    return result;
};
const getTemplateById = (id)=>{
    return EMAIL_TEMPLATES.find((t)=>t.id === id);
};
const getTemplatesByCategory = (category)=>{
    return EMAIL_TEMPLATES.filter((t)=>t.category === category);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/communications.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCommunicationHistory",
    ()=>getCommunicationHistory,
    "getPendingVendorActions",
    ()=>getPendingVendorActions,
    "getVendorActionStatus",
    ()=>getVendorActionStatus,
    "logCommunication",
    ()=>logCommunication,
    "markCommunicationAsRead",
    ()=>markCommunicationAsRead,
    "saveVendorActionStatus",
    ()=>saveVendorActionStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/index.esm.js [app-client] (ecmascript)");
;
;
const COMMUNICATIONS_COLLECTION = "communications";
const VENDOR_ACTIONS_COLLECTION = "vendorActions";
const logCommunication = async (log)=>{
    try {
        const commRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COMMUNICATIONS_COLLECTION);
        const newCommRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["push"])(commRef);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["set"])(newCommRef, {
            ...log,
            timestamp: log.timestamp.toISOString()
        });
        return newCommRef.key;
    } catch (error) {
        console.error("Error logging communication:", error);
        throw error;
    }
};
const getCommunicationHistory = async (poId)=>{
    try {
        const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"]);
        const commQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["child"])(dbRef, COMMUNICATIONS_COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderByChild"])('poId'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["equalTo"])(poId));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["get"])(commQuery);
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.entries(data).map(([key, v])=>({
                    id: key,
                    ...v,
                    timestamp: new Date(v.timestamp),
                    readReceipt: v.readReceipt ? new Date(v.readReceipt) : undefined
                }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching communication history:", error);
        return [];
    }
};
const markCommunicationAsRead = async (logId)=>{
    try {
        const commRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], `${COMMUNICATIONS_COLLECTION}/${logId}`);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["set"])(commRef, {
            readReceipt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error marking communication as read:", error);
        throw error;
    }
};
const getVendorActionStatus = async (poId)=>{
    try {
        const history = await getCommunicationHistory(poId);
        if (history.length === 0) {
            return {
                poId,
                status: 'PENDING_ACKNOWLEDGMENT',
                escalationLevel: 0
            };
        }
        // Sort by timestamp descending
        const sortedHistory = history.sort((a, b)=>new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const lastContact = sortedHistory[0];
        const lastContactDate = new Date(lastContact.timestamp);
        const now = new Date();
        const daysSinceLastContact = Math.floor((now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
        // Determine status based on communication history
        const hasAcknowledgment = history.some((log)=>log.type === 'EMAIL' && log.subject.toLowerCase().includes('acknowledged'));
        let status = 'PENDING_ACKNOWLEDGMENT';
        let escalationLevel = 0;
        if (hasAcknowledgment) {
            status = 'ACKNOWLEDGED';
        } else if (daysSinceLastContact > 7) {
            status = 'OVERDUE';
            escalationLevel = 3;
        } else if (daysSinceLastContact > 3) {
            status = 'OVERDUE';
            escalationLevel = 2;
        } else if (daysSinceLastContact > 1) {
            escalationLevel = 1;
        }
        return {
            poId,
            status,
            lastContact: lastContactDate,
            responseDeadline: new Date(lastContactDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            escalationLevel,
            daysSinceLastContact
        };
    } catch (error) {
        console.error("Error calculating vendor action status:", error);
        return null;
    }
};
const saveVendorActionStatus = async (status)=>{
    try {
        const statusRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], `${VENDOR_ACTIONS_COLLECTION}/${status.poId}`);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["set"])(statusRef, {
            ...status,
            lastContact: status.lastContact?.toISOString(),
            responseDeadline: status.responseDeadline?.toISOString()
        });
    } catch (error) {
        console.error("Error saving vendor action status:", error);
        throw error;
    }
};
const getPendingVendorActions = async ()=>{
    try {
        const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"]);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["child"])(dbRef, VENDOR_ACTIONS_COLLECTION));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.values(data).map((v)=>({
                    ...v,
                    lastContact: v.lastContact ? new Date(v.lastContact) : undefined,
                    responseDeadline: v.responseDeadline ? new Date(v.responseDeadline) : undefined
                }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching pending vendor actions:", error);
        return [];
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/purchase-orders/EmailComposerModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EmailComposerModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emailTemplates$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/emailTemplates.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$communications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/communications.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function EmailComposerModal({ po, onClose, onSent }) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [selectedTemplate, setSelectedTemplate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emailTemplates$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMAIL_TEMPLATES"][0]);
    const [subject, setSubject] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [body, setBody] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [ccEmails, setCcEmails] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [bccEmails, setBccEmails] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [showPreview, setShowPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Update subject and body when template changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EmailComposerModal.useEffect": ()=>{
            const processedSubject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emailTemplates$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["replaceEmailVariables"])(selectedTemplate.subject, po, user?.displayName);
            const processedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emailTemplates$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["replaceEmailVariables"])(selectedTemplate.body, po, user?.displayName);
            setSubject(processedSubject);
            setBody(processedBody);
        }
    }["EmailComposerModal.useEffect"], [
        selectedTemplate,
        po,
        user
    ]);
    const handleSend = async ()=>{
        try {
            // Log the communication
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$communications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logCommunication"])({
                poId: po.id,
                type: 'EMAIL',
                subject,
                body,
                sentBy: user?.uid || 'unknown',
                sentByName: user?.displayName || 'Unknown User',
                sentTo: [
                    po.vendorEmail || 'vendor@example.com'
                ],
                timestamp: new Date(),
                templateUsed: selectedTemplate.id
            });
            // Create mailto link
            const vendorEmail = po.vendorEmail || 'vendor@example.com';
            const mailtoLink = `mailto:${vendorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}${ccEmails ? `&cc=${encodeURIComponent(ccEmails)}` : ''}${bccEmails ? `&bcc=${encodeURIComponent(bccEmails)}` : ''}`;
            // Open email client
            window.location.href = mailtoLink;
            // Callback
            if (onSent) onSent();
            // Close modal after a short delay
            setTimeout(()=>onClose(), 500);
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Error logging communication. Please try again.");
        }
    };
    const getCategoryColor = (category)=>{
        switch(category){
            case 'standard':
                return '#3b82f6';
            case 'urgent':
                return '#ef4444';
            case 'followup':
                return '#f59e0b';
            case 'custom':
                return '#8b5cf6';
            default:
                return '#6b7280';
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                backgroundColor: 'var(--surface)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '1400px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    style: {
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        marginBottom: '0.25rem'
                                    },
                                    children: "Compose Email to Vendor"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                    lineNumber: 94,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.9rem'
                                    },
                                    children: [
                                        "PO #",
                                        po.poNumber,
                                        " • ",
                                        po.vendorName
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                    lineNumber: 97,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                            lineNumber: 93,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            style: {
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                padding: '0.5rem'
                            },
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                            lineNumber: 101,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                    lineNumber: 89,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: 'var(--background)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            style: {
                                display: 'block',
                                marginBottom: '0.75rem',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            },
                            children: "Email Template"
                        }, void 0, false, {
                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                            lineNumber: 112,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '0.75rem'
                            },
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emailTemplates$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMAIL_TEMPLATES"].map((template)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSelectedTemplate(template),
                                    style: {
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        textAlign: 'left',
                                        border: selectedTemplate.id === template.id ? `2px solid ${getCategoryColor(template.category)}` : '2px solid var(--border)',
                                        backgroundColor: selectedTemplate.id === template.id ? 'var(--surface)' : 'var(--background)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.5rem'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        backgroundColor: getCategoryColor(template.category)
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                    lineNumber: 134,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem'
                                                    },
                                                    children: template.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 131,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '0.75rem',
                                                color: 'var(--text-secondary)',
                                                margin: 0
                                            },
                                            children: template.description
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 140,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, template.id, true, {
                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                    lineNumber: 117,
                                    columnNumber: 29
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                            lineNumber: 115,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                    lineNumber: 108,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        flex: 1,
                        display: 'flex',
                        overflow: 'hidden'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                flex: showPreview ? 1 : 2,
                                padding: '2rem',
                                overflowY: 'auto',
                                borderRight: showPreview ? '1px solid var(--border)' : 'none'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: '1.5rem'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: 600,
                                                fontSize: '0.9rem'
                                            },
                                            children: "To"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 156,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "email",
                                            value: po.vendorEmail || 'vendor@example.com',
                                            readOnly: true,
                                            style: {
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border)',
                                                backgroundColor: 'var(--background)',
                                                color: 'var(--text-secondary)',
                                                cursor: 'not-allowed'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 159,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                    lineNumber: 155,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '1rem',
                                        marginBottom: '1.5rem'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '0.5rem',
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem'
                                                    },
                                                    children: "CC (optional)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                    lineNumber: 173,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: ccEmails,
                                                    onChange: (e)=>setCcEmails(e.target.value),
                                                    placeholder: "email1@example.com, email2@example.com",
                                                    style: {
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border)',
                                                        backgroundColor: 'var(--background)'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                    lineNumber: 176,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 172,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '0.5rem',
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem'
                                                    },
                                                    children: "BCC (optional)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                    lineNumber: 188,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: bccEmails,
                                                    onChange: (e)=>setBccEmails(e.target.value),
                                                    placeholder: "email1@example.com, email2@example.com",
                                                    style: {
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border)',
                                                        backgroundColor: 'var(--background)'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                    lineNumber: 191,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 187,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                    lineNumber: 171,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: '1.5rem'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: 600,
                                                fontSize: '0.9rem'
                                            },
                                            children: "Subject"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 205,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: subject,
                                            onChange: (e)=>setSubject(e.target.value),
                                            style: {
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border)',
                                                backgroundColor: 'var(--background)',
                                                fontWeight: 600
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 208,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                    lineNumber: 204,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: 600,
                                                fontSize: '0.9rem'
                                            },
                                            children: "Message"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 221,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            value: body,
                                            onChange: (e)=>setBody(e.target.value),
                                            rows: 16,
                                            style: {
                                                width: '100%',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border)',
                                                backgroundColor: 'var(--background)',
                                                fontFamily: 'monospace',
                                                fontSize: '0.9rem',
                                                resize: 'vertical'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 224,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                    lineNumber: 220,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                            lineNumber: 151,
                            columnNumber: 21
                        }, this),
                        showPreview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                flex: 1,
                                padding: '2rem',
                                overflowY: 'auto',
                                backgroundColor: 'var(--background)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '1.5rem'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '1.1rem',
                                                fontWeight: 600
                                            },
                                            children: "Live Preview"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 244,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowPreview(false),
                                            style: {
                                                padding: '0.5rem 1rem',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border)',
                                                backgroundColor: 'var(--surface)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            },
                                            children: "Hide Preview"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 245,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                    lineNumber: 240,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        backgroundColor: 'white',
                                        color: '#000',
                                        padding: '2rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        fontFamily: 'Arial, sans-serif'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: '1.5rem',
                                                paddingBottom: '1rem',
                                                borderBottom: '2px solid #e5e7eb'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '0.85rem',
                                                        color: '#6b7280',
                                                        marginBottom: '0.5rem'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: "From:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                            lineNumber: 264,
                                                            columnNumber: 41
                                                        }, this),
                                                        " ",
                                                        user?.email || 'your-email@company.com'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                    lineNumber: 263,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '0.85rem',
                                                        color: '#6b7280',
                                                        marginBottom: '0.5rem'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: "To:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                            lineNumber: 267,
                                                            columnNumber: 41
                                                        }, this),
                                                        " ",
                                                        po.vendorEmail || 'vendor@example.com'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                    lineNumber: 266,
                                                    columnNumber: 37
                                                }, this),
                                                ccEmails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '0.85rem',
                                                        color: '#6b7280',
                                                        marginBottom: '0.5rem'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: "CC:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                            lineNumber: 271,
                                                            columnNumber: 45
                                                        }, this),
                                                        " ",
                                                        ccEmails
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                    lineNumber: 270,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '1.1rem',
                                                        fontWeight: 600,
                                                        marginTop: '1rem',
                                                        color: '#111827'
                                                    },
                                                    children: subject
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                                    lineNumber: 274,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 262,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                whiteSpace: 'pre-wrap',
                                                lineHeight: 1.6,
                                                fontSize: '0.95rem',
                                                color: '#374151'
                                            },
                                            children: body
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                            lineNumber: 279,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                    lineNumber: 257,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                            lineNumber: 239,
                            columnNumber: 25
                        }, this),
                        !showPreview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setShowPreview(true),
                            style: {
                                position: 'absolute',
                                right: '2rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--surface)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            },
                            children: "Show Preview"
                        }, void 0, false, {
                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                            lineNumber: 287,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                    lineNumber: 149,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '1.5rem 2rem',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--background)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: '0.85rem',
                                color: 'var(--text-secondary)'
                            },
                            children: "📎 PO Document will be attached automatically"
                        }, void 0, false, {
                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                            lineNumber: 308,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: '1rem'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "btn",
                                    style: {
                                        border: '1px solid var(--border)'
                                    },
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                    lineNumber: 312,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSend,
                                    className: "btn btn-primary",
                                    style: {
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        fontWeight: 600
                                    },
                                    children: "Send Email"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                                    lineNumber: 319,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                            lineNumber: 311,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
                    lineNumber: 303,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
            lineNumber: 82,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/purchase-orders/EmailComposerModal.tsx",
        lineNumber: 77,
        columnNumber: 9
    }, this);
}
_s(EmailComposerModal, "0+iLLyowCmd06dZ1fi3FhJsvqQ4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = EmailComposerModal;
var _c;
__turbopack_context__.k.register(_c, "EmailComposerModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/purchase-orders/PODetailModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PODetailModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/currencies.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$purchase$2d$orders$2f$EmailComposerModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/purchase-orders/EmailComposerModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$communications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/communications.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function PODetailModal({ po, onClose, onReceive, onCancel, onEmailVendor }) {
    _s();
    const [showEmailComposer, setShowEmailComposer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [communicationHistory, setCommunicationHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showHistory, setShowHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Load communication history
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PODetailModal.useEffect": ()=>{
            if (po.id) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$communications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCommunicationHistory"])(po.id).then(setCommunicationHistory);
            }
        }
    }["PODetailModal.useEffect"], [
        po.id
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        },
        className: "modal-backdrop",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
                @media print {
                    @page { margin: 0; }
                    body * { visibility: hidden; }
                    .print-container, .print-container * { visibility: visible; }
                    .print-container {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        padding: 2rem !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        background: white !important;
                    }
                    .no-print { display: none !important; }
                    .modal-backdrop { 
                        position: static !important;
                        display: block !important;
                        background: none !important;
                        backdrop-filter: none !important;
                        padding: 0 !important;
                    }
                }
            `
            }, void 0, false, {
                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                lineNumber: 41,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: '2rem',
                    height: '100%',
                    maxHeight: '900px',
                    width: '1200px',
                    flexDirection: 'column',
                    position: 'relative'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "no-print",
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem 0',
                            color: 'white'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.8)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    padding: '0.5rem 0'
                                },
                                onMouseEnter: (e)=>e.currentTarget.style.color = 'white',
                                onMouseLeave: (e)=>e.currentTarget.style.color = 'rgba(255,255,255,0.8)',
                                children: "← Back to Purchase Orders"
                            }, void 0, false, {
                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                lineNumber: 78,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.8rem',
                                            opacity: 0.6
                                        },
                                        children: [
                                            "Reference: ",
                                            po.poNumber
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 92,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onClose,
                                        style: {
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem'
                                        },
                                        onMouseEnter: (e)=>e.currentTarget.style.background = 'rgba(255,255,255,0.2)',
                                        onMouseLeave: (e)=>e.currentTarget.style.background = 'rgba(255,255,255,0.1)',
                                        children: "×"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 93,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                lineNumber: 91,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                        lineNumber: 74,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '2rem',
                            height: '100%',
                            overflow: 'hidden'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: '1',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                    overflowY: 'auto',
                                    padding: '3rem',
                                    position: 'relative',
                                    fontFamily: 'Times New Roman, serif' // Simulate official document
                                },
                                className: "print-container",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%) rotate(-45deg)',
                                            fontSize: '6rem',
                                            fontWeight: 'bold',
                                            color: po.status === 'ISSUED' ? '#eff6ff' : po.status === 'RECEIVED' ? '#ecfdf5' : po.status === 'CANCELLED' ? '#fef2f2' : '#f3f4f6',
                                            zIndex: 0,
                                            pointerEvents: 'none',
                                            border: `8px solid ${po.status === 'ISSUED' ? '#dbeafe' : po.status === 'RECEIVED' ? '#d1fae5' : po.status === 'CANCELLED' ? '#fecaca' : '#e5e7eb'}`,
                                            padding: '1rem 4rem',
                                            opacity: 0.5
                                        },
                                        children: po.status
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 119,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: 'relative',
                                            zIndex: 1
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '3rem'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                                style: {
                                                                    fontSize: '2rem',
                                                                    fontWeight: 'bold',
                                                                    color: '#111827',
                                                                    marginBottom: '0.5rem',
                                                                    fontFamily: 'Arial, sans-serif'
                                                                },
                                                                children: "PURCHASE ORDER"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 134,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '0.9rem',
                                                                    color: '#4b5563'
                                                                },
                                                                children: [
                                                                    "PO Number: ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        children: po.poNumber
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                        lineNumber: 135,
                                                                        columnNumber: 102
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 135,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '0.9rem',
                                                                    color: '#4b5563'
                                                                },
                                                                children: [
                                                                    "Date: ",
                                                                    po.issuedAt.toLocaleDateString()
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 136,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 133,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            textAlign: 'right'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontWeight: 'bold',
                                                                    fontSize: '1.2rem',
                                                                    marginBottom: '0.25rem'
                                                                },
                                                                children: "Acme Corp Inc."
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 139,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '0.9rem',
                                                                    color: '#6b7280'
                                                                },
                                                                children: "123 Enterprise Blvd"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 140,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '0.9rem',
                                                                    color: '#6b7280'
                                                                },
                                                                children: "Tech City, TC 94043"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 141,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 138,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 132,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '3rem',
                                                    gap: '2rem'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            flex: 1,
                                                            border: '1px solid #e5e7eb',
                                                            padding: '1rem'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                style: {
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: 'bold',
                                                                    color: '#374151',
                                                                    marginBottom: '0.5rem',
                                                                    textTransform: 'uppercase'
                                                                },
                                                                children: "Vendor"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 148,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontWeight: 'bold'
                                                                },
                                                                children: po.vendorName
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 149,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: "Attn: Sales Dept"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 150,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: "vendor@example.com"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 151,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 147,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            flex: 1,
                                                            border: '1px solid #e5e7eb',
                                                            padding: '1rem'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                style: {
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: 'bold',
                                                                    color: '#374151',
                                                                    marginBottom: '0.5rem',
                                                                    textTransform: 'uppercase'
                                                                },
                                                                children: "Ship To"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 154,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontWeight: 'bold'
                                                                },
                                                                children: "Acme Corp Warehouse"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 155,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: "Receiving Dock B"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 156,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: "123 Enterprise Blvd, Tech City"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 157,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 153,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 146,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                style: {
                                                    width: '100%',
                                                    borderCollapse: 'collapse',
                                                    marginBottom: '2rem'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            style: {
                                                                backgroundColor: '#111827',
                                                                color: 'white'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        padding: '0.75rem',
                                                                        textAlign: 'left',
                                                                        fontSize: '0.9rem',
                                                                        fontFamily: 'Arial, sans-serif'
                                                                    },
                                                                    children: "Description"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 165,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        padding: '0.75rem',
                                                                        textAlign: 'center',
                                                                        fontSize: '0.9rem',
                                                                        fontFamily: 'Arial, sans-serif'
                                                                    },
                                                                    children: "Quantity"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 166,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        padding: '0.75rem',
                                                                        textAlign: 'right',
                                                                        fontSize: '0.9rem',
                                                                        fontFamily: 'Arial, sans-serif'
                                                                    },
                                                                    children: "Unit Price"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 167,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        padding: '0.75rem',
                                                                        textAlign: 'right',
                                                                        fontSize: '0.9rem',
                                                                        fontFamily: 'Arial, sans-serif'
                                                                    },
                                                                    children: "Total"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 168,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                            lineNumber: 164,
                                                            columnNumber: 37
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 163,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                        children: po.items.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                style: {
                                                                    borderBottom: '1px solid #e5e7eb'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        style: {
                                                                            padding: '0.75rem'
                                                                        },
                                                                        children: item.description
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                        lineNumber: 174,
                                                                        columnNumber: 45
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        style: {
                                                                            padding: '0.75rem',
                                                                            textAlign: 'center'
                                                                        },
                                                                        children: item.quantity
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                        lineNumber: 175,
                                                                        columnNumber: 45
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        style: {
                                                                            padding: '0.75rem',
                                                                            textAlign: 'right'
                                                                        },
                                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(item.unitPrice, po.currency)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                        lineNumber: 176,
                                                                        columnNumber: 45
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        style: {
                                                                            padding: '0.75rem',
                                                                            textAlign: 'right'
                                                                        },
                                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(item.total, po.currency)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                        lineNumber: 177,
                                                                        columnNumber: 45
                                                                    }, this)
                                                                ]
                                                            }, i, true, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 173,
                                                                columnNumber: 41
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 162,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                    marginBottom: '4rem'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: '250px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                padding: '0.5rem 0',
                                                                borderBottom: '1px solid #e5e7eb'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: "Subtotal:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 187,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(po.totalAmount, po.currency)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 188,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                            lineNumber: 186,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                padding: '0.5rem 0',
                                                                borderBottom: '1px solid #e5e7eb'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: "Tax (0%):"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 191,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(0, po.currency)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 192,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                            lineNumber: 190,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                padding: '0.5rem 0',
                                                                fontWeight: 'bold',
                                                                fontSize: '1.2rem',
                                                                marginTop: '0.5rem'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: "Total:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 195,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(po.totalAmount, po.currency)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 196,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                            lineNumber: 194,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                    lineNumber: 185,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 184,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: '3rem',
                                                    marginTop: 'auto'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            flex: 1
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    height: '1px',
                                                                    backgroundColor: 'black',
                                                                    marginBottom: '0.5rem'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 204,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '0.8rem'
                                                                },
                                                                children: "Authorized Signature"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 205,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 203,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            flex: 1
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    height: '1px',
                                                                    backgroundColor: 'black',
                                                                    marginBottom: '0.5rem'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 208,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '0.8rem'
                                                                },
                                                                children: "Date"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 209,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 207,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 202,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 130,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                lineNumber: 111,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '350px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    overflowY: 'auto',
                                    maxHeight: '100%'
                                },
                                className: "no-print",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-bold mb-4",
                                                children: "Actions"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 226,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn btn-primary",
                                                style: {
                                                    width: '100%',
                                                    marginBottom: '0.75rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                },
                                                onClick: ()=>setShowEmailComposer(true),
                                                children: "✉️ Compose Email to Vendor"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 228,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn",
                                                style: {
                                                    width: '100%',
                                                    marginBottom: '0.75rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    border: '1px solid var(--border)',
                                                    background: 'white',
                                                    color: 'var(--text-main)'
                                                },
                                                onClick: ()=>window.print(),
                                                children: "🖨️ Print / Download PDF"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 236,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 225,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card",
                                        style: {
                                            padding: '1rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: '0.9rem',
                                                    fontWeight: 'bold',
                                                    marginBottom: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                },
                                                children: "📡 Live Delivery Analytics"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 250,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '1rem'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: '0.75rem',
                                                            position: 'relative'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    width: '2px',
                                                                    backgroundColor: 'var(--success)',
                                                                    position: 'absolute',
                                                                    top: '12px',
                                                                    bottom: '-20px',
                                                                    left: '10px',
                                                                    zIndex: 0
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 256,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: 'var(--success)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: 'white',
                                                                    fontSize: '0.7rem',
                                                                    zIndex: 1
                                                                },
                                                                children: "✓"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 257,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: '0.8rem',
                                                                            fontWeight: 600
                                                                        },
                                                                        children: "PO Issued"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                        lineNumber: 259,
                                                                        columnNumber: 41
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: '0.7rem',
                                                                            color: 'var(--text-secondary)'
                                                                        },
                                                                        children: po.issuedAt.toLocaleString()
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                        lineNumber: 260,
                                                                        columnNumber: 41
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 258,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 255,
                                                        columnNumber: 33
                                                    }, this),
                                                    po.deliveryHistory?.map((log, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                gap: '0.75rem',
                                                                position: 'relative'
                                                            },
                                                            children: [
                                                                idx < po.deliveryHistory.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        width: '2px',
                                                                        backgroundColor: 'var(--success)',
                                                                        position: 'absolute',
                                                                        top: '12px',
                                                                        bottom: '-20px',
                                                                        left: '10px',
                                                                        zIndex: 0
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 267,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: log.action === 'SENT' ? 'var(--accent)' : 'var(--success)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: 'white',
                                                                        fontSize: '0.7rem',
                                                                        zIndex: 1
                                                                    },
                                                                    children: log.action === 'SENT' ? '✉️' : log.action === 'OPENED' ? '👀' : '✅'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 269,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: '0.8rem',
                                                                                fontWeight: 600
                                                                            },
                                                                            children: log.action === 'SENT' ? 'Link Emailed' : log.action === 'OPENED' ? 'Opened by Vendor' : 'Acknowledged by Vendor'
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                            lineNumber: 277,
                                                                            columnNumber: 45
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: '0.7rem',
                                                                                color: 'var(--text-secondary)'
                                                                            },
                                                                            children: [
                                                                                new Date(log.timestamp).toLocaleString(),
                                                                                " ",
                                                                                log.performedBy === 'VENDOR' ? '(Ref: Vendor Port)' : ''
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                            lineNumber: 280,
                                                                            columnNumber: 45
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                    lineNumber: 276,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, idx, true, {
                                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                            lineNumber: 265,
                                                            columnNumber: 37
                                                        }, this)),
                                                    (!po.deliveryHistory || po.deliveryHistory.length === 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '0.75rem',
                                                            color: 'var(--text-secondary)',
                                                            fontStyle: 'italic',
                                                            paddingLeft: '1.75rem'
                                                        },
                                                        children: "Pending delivery to vendor..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 288,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 254,
                                                columnNumber: 29
                                            }, this),
                                            po.firstViewedAt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: '1rem',
                                                    paddingTop: '1rem',
                                                    borderTop: '1px solid var(--border)',
                                                    fontSize: '0.75rem'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Total Views:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 296,
                                                        columnNumber: 37
                                                    }, this),
                                                    " ",
                                                    po.deliveryHistory?.filter((h)=>h.action === 'OPENED').length || 0
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 295,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 249,
                                        columnNumber: 25
                                    }, this),
                                    po.status === 'ISSUED' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card",
                                        style: {
                                            border: '2px solid var(--primary)',
                                            backgroundColor: 'var(--surface)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-bold mb-2",
                                                children: "Goods Receipt"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 303,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-gray-500 mb-4",
                                                children: "Confirm that the items have been delivered to the warehouse."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 304,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn btn-primary",
                                                style: {
                                                    width: '100%'
                                                },
                                                onClick: ()=>onReceive(po.id, po.poNumber),
                                                children: "✅ Mark as Received"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 307,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 302,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card",
                                        style: {
                                            padding: '1rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '1rem'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        style: {
                                                            fontSize: '0.9rem',
                                                            fontWeight: 'bold',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        },
                                                        children: "💬 Communication History"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 319,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setShowHistory(!showHistory),
                                                        style: {
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: 'var(--accent)',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600
                                                        },
                                                        children: showHistory ? 'Hide' : `View (${communicationHistory.length})`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 322,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 318,
                                                columnNumber: 29
                                            }, this),
                                            showHistory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    maxHeight: '300px',
                                                    overflowY: 'auto'
                                                },
                                                children: communicationHistory.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        padding: '1rem',
                                                        textAlign: 'center',
                                                        color: 'var(--text-secondary)',
                                                        fontSize: '0.8rem',
                                                        fontStyle: 'italic',
                                                        border: '1px dashed var(--border)',
                                                        borderRadius: '4px'
                                                    },
                                                    children: [
                                                        "No communications recorded for this PO.",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                            lineNumber: 338,
                                                            columnNumber: 45
                                                        }, this),
                                                        'Use "Compose Email" to start a thread.'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                    lineNumber: 336,
                                                    columnNumber: 41
                                                }, this) : communicationHistory.map((log, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            padding: '0.75rem',
                                                            marginBottom: '0.5rem',
                                                            borderLeft: '3px solid var(--accent)',
                                                            backgroundColor: 'var(--background)',
                                                            borderRadius: '4px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    marginBottom: '0.25rem'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: 600,
                                                                            color: 'var(--accent)'
                                                                        },
                                                                        children: log.type
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                        lineNumber: 353,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: '0.7rem',
                                                                            color: 'var(--text-secondary)'
                                                                        },
                                                                        children: new Date(log.timestamp).toLocaleDateString()
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                        lineNumber: 356,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 352,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 600,
                                                                    marginBottom: '0.25rem'
                                                                },
                                                                children: log.subject
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 360,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '0.75rem',
                                                                    color: 'var(--text-secondary)'
                                                                },
                                                                children: [
                                                                    "By: ",
                                                                    log.sentByName
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 363,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, log.id || idx, true, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 343,
                                                        columnNumber: 45
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 334,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 317,
                                        columnNumber: 25
                                    }, this),
                                    po.status !== 'CANCELLED' && po.status !== 'CLOSED' && onCancel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card",
                                        style: {
                                            padding: '1rem',
                                            backgroundColor: '#fef2f2',
                                            border: '1px solid #fecaca'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: '0.9rem',
                                                    fontWeight: 'bold',
                                                    color: '#991b1b',
                                                    marginBottom: '0.5rem'
                                                },
                                                children: "⚠️ Administrative Actions"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 376,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: '0.75rem',
                                                    color: '#7f1d1d',
                                                    marginBottom: '1rem'
                                                },
                                                children: "Voiding this PO will notify the vendor and release committed funds."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 379,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn",
                                                style: {
                                                    width: '100%',
                                                    backgroundColor: '#fee2e2',
                                                    color: '#991b1b',
                                                    border: '1px solid #fecaca'
                                                },
                                                onClick: ()=>onCancel(po.id, po.poNumber),
                                                children: "🚫 Void / Cancel Purchase Order"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 382,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 375,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 'auto'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: onClose,
                                            style: {
                                                width: '100%',
                                                padding: '1rem',
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                border: '1px solid rgba(255,255,255,0.4)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            },
                                            children: "Close Preview"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                            lineNumber: 393,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 392,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                lineNumber: 216,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                        lineNumber: 109,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                lineNumber: 68,
                columnNumber: 13
            }, this),
            showEmailComposer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$purchase$2d$orders$2f$EmailComposerModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                po: po,
                onClose: ()=>setShowEmailComposer(false),
                onSent: ()=>{
                    // Refresh communication history
                    if (po.id) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$communications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCommunicationHistory"])(po.id).then(setCommunicationHistory);
                    }
                }
            }, void 0, false, {
                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                lineNumber: 411,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
        lineNumber: 36,
        columnNumber: 9
    }, this);
}
_s(PODetailModal, "RAjBxcgxGkSIeJSlYmzQplftDRc=");
_c = PODetailModal;
var _c;
__turbopack_context__.k.register(_c, "PODetailModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/dashboard/purchase-orders/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PurchaseOrdersPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$purchaseOrders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/purchaseOrders.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/currencies.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ModalContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ModalContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$purchase$2d$orders$2f$PODetailModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/purchase-orders/PODetailModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function PurchaseOrdersPage() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { showConfirm, showAlert, showError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ModalContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModal"])();
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedPO, setSelectedPO] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Filter State
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('ALL');
    const fetchData = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$purchaseOrders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPurchaseOrders"])().then((data)=>{
            setPos(data.sort((a, b)=>b.issuedAt.getTime() - a.issuedAt.getTime()));
            setLoading(false);
        });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PurchaseOrdersPage.useEffect": ()=>{
            fetchData();
        }
    }["PurchaseOrdersPage.useEffect"], []);
    // Stats Calculation
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PurchaseOrdersPage.useMemo[stats]": ()=>{
            const totalCommitted = pos.filter({
                "PurchaseOrdersPage.useMemo[stats].totalCommitted": (p)=>p.status !== 'CANCELLED'
            }["PurchaseOrdersPage.useMemo[stats].totalCommitted"]).reduce({
                "PurchaseOrdersPage.useMemo[stats].totalCommitted": (acc, p)=>acc + p.totalAmount
            }["PurchaseOrdersPage.useMemo[stats].totalCommitted"], 0);
            const pendingValue = pos.filter({
                "PurchaseOrdersPage.useMemo[stats].pendingValue": (p)=>p.status === 'ISSUED' || p.status === 'SENT' || p.status === 'OPENED' || p.status === 'ACKNOWLEDGED'
            }["PurchaseOrdersPage.useMemo[stats].pendingValue"]).reduce({
                "PurchaseOrdersPage.useMemo[stats].pendingValue": (acc, p)=>acc + p.totalAmount
            }["PurchaseOrdersPage.useMemo[stats].pendingValue"], 0);
            const fulfilledRate = pos.length > 0 ? Math.round(pos.filter({
                "PurchaseOrdersPage.useMemo[stats]": (p)=>p.status === 'RECEIVED' || p.status === 'FULFILLED' || p.status === 'CLOSED'
            }["PurchaseOrdersPage.useMemo[stats]"]).length / pos.length * 100) : 0;
            const activeCount = pos.filter({
                "PurchaseOrdersPage.useMemo[stats]": (p)=>p.status !== 'CANCELLED' && p.status !== 'CLOSED'
            }["PurchaseOrdersPage.useMemo[stats]"]).length;
            return {
                totalCommitted,
                pendingValue,
                fulfilledRate,
                activeCount
            };
        }
    }["PurchaseOrdersPage.useMemo[stats]"], [
        pos
    ]);
    const filteredPOs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PurchaseOrdersPage.useMemo[filteredPOs]": ()=>{
            return pos.filter({
                "PurchaseOrdersPage.useMemo[filteredPOs]": (po)=>{
                    const matchesSearch = po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) || po.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
                    return matchesSearch && matchesStatus;
                }
            }["PurchaseOrdersPage.useMemo[filteredPOs]"]);
        }
    }["PurchaseOrdersPage.useMemo[filteredPOs]"], [
        pos,
        searchQuery,
        statusFilter
    ]);
    const handleReceive = async (id, poNumber)=>{
        const confirmed = await showConfirm("Confirm Receipt", `Mark ${poNumber} as Received? This confirms all items have been delivered.`);
        if (!confirmed) return;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$purchaseOrders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updatePOStatus"])(id, 'RECEIVED');
            await showAlert("Success", "Goods Receipt Confirmed");
            setSelectedPO(null);
            fetchData();
        } catch (error) {
            await showError("Error", "Error updating status");
        }
    };
    const handleCancel = async (id, poNumber)=>{
        const confirmed = await showConfirm("Void Purchase Order", `Are you sure you want to VOID ${poNumber}? This action cannot be undone and will notify the vendor.`);
        if (!confirmed) return;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$purchaseOrders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updatePOStatus"])(id, 'CANCELLED');
            await showAlert("PO Voided", `Purchase Order ${poNumber} has been successfully cancelled.`);
            setSelectedPO(null);
            fetchData();
        } catch (error) {
            await showError("Error", "Error cancelling purchase order");
        }
    };
    const handleEmailVendor = async (po)=>{
        await showAlert("Email Sent", `Purchase Order ${po.poNumber} has been emailed to ${po.vendorName}.`);
    };
    const getStatusColor = (status)=>{
        switch(status){
            case 'ISSUED':
                return {
                    bg: '#eff6ff',
                    text: '#1e40af',
                    border: '#bfdbfe'
                };
            case 'SENT':
                return {
                    bg: '#fef3c7',
                    text: '#92400e',
                    border: '#fde68a'
                };
            case 'OPENED':
                return {
                    bg: '#ede9fe',
                    text: '#5b21b6',
                    border: '#ddd6fe'
                };
            case 'ACKNOWLEDGED':
                return {
                    bg: '#e0f2fe',
                    text: '#075985',
                    border: '#bae6fd'
                };
            case 'RECEIVED':
                return {
                    bg: '#dcfce7',
                    text: '#166534',
                    border: '#bbf7d0'
                };
            case 'CANCELLED':
                return {
                    bg: '#fee2e2',
                    text: '#991b1b',
                    border: '#fecaca'
                };
            case 'CLOSED':
                return {
                    bg: '#f3f4f6',
                    text: '#374151',
                    border: '#e5e7eb'
                };
            default:
                return {
                    bg: '#f3f4f6',
                    text: '#4b5563',
                    border: '#e5e7eb'
                };
        }
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-secondary)'
        },
        children: "Loading Procurement Data..."
    }, void 0, false, {
        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
        lineNumber: 104,
        columnNumber: 9
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '1rem'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: {
                                    fontSize: '1.875rem',
                                    fontWeight: 900,
                                    color: 'var(--primary)',
                                    letterSpacing: '-0.03em',
                                    marginBottom: '0.25rem'
                                },
                                children: "Purchasing & Procurement"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                lineNumber: 113,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem'
                                },
                                children: "Manage purchase orders, vendor acknowledgments, and goods receipt."
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                lineNumber: 114,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                        lineNumber: 112,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn btn-primary",
                        onClick: ()=>window.location.href = '/dashboard/requisitions',
                        style: {
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px'
                        },
                        children: "+ New Requisition"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                        lineNumber: 116,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 111,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '2.5rem'
                },
                children: [
                    {
                        label: 'Total Committed',
                        value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(stats.totalCommitted, 'USD'),
                        sub: 'Excl. Cancelled',
                        icon: '💰'
                    },
                    {
                        label: 'Pending Receipt',
                        value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(stats.pendingValue, 'USD'),
                        sub: `${pos.filter((p)=>p.status === 'ISSUED' || p.status === 'SENT').length} orders pending`,
                        icon: '⏳'
                    },
                    {
                        label: 'Fulfilment Rate',
                        value: `${stats.fulfilledRate}%`,
                        sub: 'Received / Issued',
                        icon: '📊'
                    },
                    {
                        label: 'Active Orders',
                        value: stats.activeCount,
                        sub: 'Requiring action',
                        icon: '📦'
                    }
                ].map((s, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        style: {
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            border: '1px solid var(--border)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '0.8rem',
                                            color: 'var(--text-secondary)',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        },
                                        children: s.label
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 131,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '1.2rem'
                                        },
                                        children: s.icon
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 132,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                lineNumber: 130,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '1.75rem',
                                    fontWeight: 800,
                                    color: 'var(--text-main)'
                                },
                                children: s.value
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                lineNumber: 134,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '0.75rem',
                                    color: s.label === 'Fulfilment Rate' ? 'var(--success)' : 'var(--text-secondary)'
                                },
                                children: s.sub
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                lineNumber: 135,
                                columnNumber: 25
                            }, this)
                        ]
                    }, idx, true, {
                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                        lineNumber: 129,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 122,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: 'relative',
                            flex: 1
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    opacity: 0.5
                                },
                                children: "🔍"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                lineNumber: 143,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Search PO # or Vendor...",
                                value: searchQuery,
                                onChange: (e)=>setSearchQuery(e.target.value),
                                style: {
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                lineNumber: 144,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                        lineNumber: 142,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '0.5rem'
                        },
                        children: [
                            'ALL',
                            'ISSUED',
                            'SENT',
                            'RECEIVED',
                            'CANCELLED'
                        ].map((status)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setStatusFilter(status),
                                style: {
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: statusFilter === status ? 'var(--primary)' : 'var(--border)',
                                    backgroundColor: statusFilter === status ? 'var(--primary)' : 'transparent',
                                    color: statusFilter === status ? 'white' : 'var(--text-secondary)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                },
                                children: status
                            }, status, false, {
                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                lineNumber: 162,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                        lineNumber: 160,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 141,
                columnNumber: 13
            }, this),
            filteredPOs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    textAlign: 'center',
                    padding: '4rem',
                    border: '1px dashed var(--border)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '2rem',
                            marginBottom: '1rem'
                        },
                        children: "📄"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                        lineNumber: 187,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: 'var(--text-secondary)',
                            marginBottom: '1rem'
                        },
                        children: "No purchase orders match your filters."
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                        lineNumber: 188,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn",
                        onClick: ()=>{
                            setSearchQuery("");
                            setStatusFilter("ALL");
                        },
                        style: {
                            padding: '0.5rem 1rem'
                        },
                        children: "Clear Filters"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                        lineNumber: 189,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 186,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    overflow: 'hidden',
                    padding: 0,
                    border: '1px solid var(--border)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                style: {
                                    backgroundColor: 'var(--background)',
                                    borderBottom: '1px solid var(--border)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1.25rem 1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase'
                                        },
                                        children: "PO Details"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 196,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1.25rem 1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Vendor"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 197,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1.25rem 1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Amount"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 198,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1.25rem 1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 199,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1.25rem 1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Issued Date"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 200,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1.25rem 1rem'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 201,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                lineNumber: 195,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                            lineNumber: 194,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: filteredPOs.map((po, idx)=>{
                                const colors = getStatusColor(po.status);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    onClick: ()=>setSelectedPO(po),
                                    style: {
                                        borderBottom: idx === filteredPOs.length - 1 ? 'none' : '1px solid var(--border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: idx % 2 === 0 ? 'var(--surface)' : 'rgba(0,0,0,0.01)'
                                    },
                                    onMouseEnter: (e)=>e.currentTarget.style.background = 'rgba(4, 156, 99, 0.03)',
                                    onMouseLeave: (e)=>e.currentTarget.style.background = idx % 2 === 0 ? 'var(--surface)' : 'rgba(0,0,0,0.01)',
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1.25rem 1rem'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontWeight: 700,
                                                        color: 'var(--text-main)',
                                                        fontSize: '0.95rem'
                                                    },
                                                    children: po.poNumber
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                    lineNumber: 221,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '0.7rem',
                                                        color: 'var(--text-secondary)'
                                                    },
                                                    children: [
                                                        "Req: ",
                                                        po.requisitionId.slice(-6).toUpperCase()
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                    lineNumber: 222,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 220,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1.25rem 1rem'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontWeight: 600,
                                                        color: 'var(--text-main)',
                                                        fontSize: '0.9rem'
                                                    },
                                                    children: po.vendorName
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                    lineNumber: 225,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '0.7rem',
                                                        color: 'var(--text-secondary)'
                                                    },
                                                    children: "Standard Terms"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                    lineNumber: 226,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 224,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1.25rem 1rem'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontWeight: 700,
                                                        color: 'var(--text-main)',
                                                        fontSize: '0.95rem'
                                                    },
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(po.totalAmount, po.currency)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                    lineNumber: 229,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '0.7rem',
                                                        color: 'var(--text-secondary)'
                                                    },
                                                    children: [
                                                        po.items.length,
                                                        " line items"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                    lineNumber: 230,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 228,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1.25rem 1rem'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    backgroundColor: colors.bg,
                                                    color: colors.text,
                                                    border: `1px solid ${colors.border}`,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    textTransform: 'uppercase'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            backgroundColor: colors.text
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                        lineNumber: 246,
                                                        columnNumber: 49
                                                    }, this),
                                                    po.status
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                lineNumber: 233,
                                                columnNumber: 45
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 232,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1.25rem 1rem'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '0.9rem',
                                                        color: 'var(--text-main)'
                                                    },
                                                    children: po.issuedAt.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                    lineNumber: 251,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '0.7rem',
                                                        color: 'var(--text-secondary)'
                                                    },
                                                    children: po.issuedAt.toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                    lineNumber: 252,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 250,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1.25rem 1rem',
                                                textAlign: 'right'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-text",
                                                style: {
                                                    fontSize: '0.85rem'
                                                },
                                                children: "Open →"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                lineNumber: 255,
                                                columnNumber: 45
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 254,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, po.id, true, {
                                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                    lineNumber: 208,
                                    columnNumber: 37
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                            lineNumber: 204,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                    lineNumber: 193,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 192,
                columnNumber: 17
            }, this),
            selectedPO && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$purchase$2d$orders$2f$PODetailModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                po: selectedPO,
                onClose: ()=>setSelectedPO(null),
                onReceive: handleReceive,
                onCancel: handleCancel,
                onEmailVendor: handleEmailVendor
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 266,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
        lineNumber: 110,
        columnNumber: 9
    }, this);
}
_s(PurchaseOrdersPage, "3+0kl6RJ4hfgf/jEGosJRLBDmo8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ModalContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModal"]
    ];
});
_c = PurchaseOrdersPage;
var _c;
__turbopack_context__.k.register(_c, "PurchaseOrdersPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_8dad91b1._.js.map