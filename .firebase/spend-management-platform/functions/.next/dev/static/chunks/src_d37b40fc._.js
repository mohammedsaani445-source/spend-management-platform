(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/purchaseOrders.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createPOFromRequisition",
    ()=>createPOFromRequisition,
    "getPurchaseOrders",
    ()=>getPurchaseOrders,
    "updatePOStatus",
    ()=>updatePOStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/index.esm.js [app-client] (ecmascript)");
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
        const poRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION_NAME);
        const newPORef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["push"])(poRef);
        const newPO = {
            poNumber,
            requisitionId: requisition.id,
            vendorId: requisition.vendorId,
            vendorName: requisition.vendorName,
            items: requisition.items,
            totalAmount: requisition.totalAmount,
            currency: requisition.currency,
            status: 'ISSUED',
            issuedAt: new Date().toISOString(),
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
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["update"])(poRef, updates);
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
"[project]/src/components/purchase-orders/PODetailModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PODetailModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/currencies.ts [app-client] (ecmascript)");
"use client";
;
;
function PODetailModal({ po, onClose, onReceive, onEmailVendor }) {
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
                lineNumber: 27,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: '2rem',
                    height: '100%',
                    maxHeight: '900px',
                    width: '1200px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: '1',
                            backgroundColor: 'white',
                            borderRadius: '4px',
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
                                    color: po.status === 'ISSUED' ? '#eff6ff' : po.status === 'RECEIVED' ? '#ecfdf5' : '#f3f4f6',
                                    zIndex: 0,
                                    pointerEvents: 'none',
                                    border: `8px solid ${po.status === 'ISSUED' ? '#dbeafe' : po.status === 'RECEIVED' ? '#d1fae5' : '#e5e7eb'}`,
                                    padding: '1rem 4rem',
                                    opacity: 0.5
                                },
                                children: po.status
                            }, void 0, false, {
                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                lineNumber: 65,
                                columnNumber: 21
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
                                                        lineNumber: 78,
                                                        columnNumber: 33
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
                                                                lineNumber: 79,
                                                                columnNumber: 98
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 79,
                                                        columnNumber: 33
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
                                                        lineNumber: 80,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 77,
                                                columnNumber: 29
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
                                                        lineNumber: 83,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '0.9rem',
                                                            color: '#6b7280'
                                                        },
                                                        children: "123 Enterprise Blvd"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 84,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '0.9rem',
                                                            color: '#6b7280'
                                                        },
                                                        children: "Tech City, TC 94043"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 85,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 82,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 76,
                                        columnNumber: 25
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
                                                        lineNumber: 92,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: 'bold'
                                                        },
                                                        children: po.vendorName
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 93,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: "Attn: Sales Dept"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 94,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: "vendor@example.com"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 95,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 91,
                                                columnNumber: 29
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
                                                        lineNumber: 98,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: 'bold'
                                                        },
                                                        children: "Acme Corp Warehouse"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 99,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: "Receiving Dock B"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 100,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: "123 Enterprise Blvd, Tech City"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 101,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 97,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 90,
                                        columnNumber: 25
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
                                                            lineNumber: 109,
                                                            columnNumber: 37
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
                                                            lineNumber: 110,
                                                            columnNumber: 37
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
                                                            lineNumber: 111,
                                                            columnNumber: 37
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
                                                            lineNumber: 112,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                    lineNumber: 108,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 107,
                                                columnNumber: 29
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
                                                                lineNumber: 118,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                style: {
                                                                    padding: '0.75rem',
                                                                    textAlign: 'center'
                                                                },
                                                                children: item.quantity
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 119,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                style: {
                                                                    padding: '0.75rem',
                                                                    textAlign: 'right'
                                                                },
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(item.unitPrice, po.currency)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 120,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                style: {
                                                                    padding: '0.75rem',
                                                                    textAlign: 'right'
                                                                },
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(item.total, po.currency)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                                lineNumber: 121,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, i, true, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 37
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 115,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 106,
                                        columnNumber: 25
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
                                                            lineNumber: 131,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(po.totalAmount, po.currency)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                            lineNumber: 132,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                    lineNumber: 130,
                                                    columnNumber: 33
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
                                                            lineNumber: 135,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(0, po.currency)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                            lineNumber: 136,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                    lineNumber: 134,
                                                    columnNumber: 33
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
                                                            lineNumber: 139,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(po.totalAmount, po.currency)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                            lineNumber: 140,
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
                                            lineNumber: 129,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 128,
                                        columnNumber: 25
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
                                                        lineNumber: 148,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '0.8rem'
                                                        },
                                                        children: "Authorized Signature"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 149,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 147,
                                                columnNumber: 29
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
                                                        lineNumber: 152,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '0.8rem'
                                                        },
                                                        children: "Date"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                        lineNumber: 153,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                                lineNumber: 151,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 146,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                lineNumber: 74,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                        lineNumber: 57,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: '350px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
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
                                        lineNumber: 163,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "btn",
                                        style: {
                                            width: '100%',
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        },
                                        onClick: ()=>window.print(),
                                        children: "🖨️ Print / Download PDF"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 165,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: `mailto:vendor@example.com?subject=Purchase%20Order%20${po.poNumber}&body=Dear%20${po.vendorName},%0D%0A%0D%0APlease%20find%20attached%20Purchase%20Order%20${po.poNumber}%20for%20your%20review.%0D%0A%0D%0ATotal:%20${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(po.totalAmount, po.currency)}%0D%0A%0D%0AThank%20you,%0D%0AAcme%20Corp`,
                                        className: "btn",
                                        style: {
                                            width: '100%',
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            textDecoration: 'none',
                                            color: 'var(--text-primary)',
                                            backgroundColor: '#fff',
                                            border: '1px solid var(--border)'
                                        },
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        children: "📧 Email to Vendor"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 173,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                lineNumber: 162,
                                columnNumber: 21
                            }, this),
                            po.status === 'ISSUED' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card",
                                style: {
                                    border: '2px solid var(--primary)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-bold mb-2",
                                        children: "Goods Receipt"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 189,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 mb-4",
                                        children: "Confirm that the items have been delivered to the warehouse."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                        lineNumber: 190,
                                        columnNumber: 29
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
                                        lineNumber: 193,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                lineNumber: 188,
                                columnNumber: 25
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
                                    lineNumber: 204,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                                lineNumber: 203,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                        lineNumber: 160,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
                lineNumber: 54,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/purchase-orders/PODetailModal.tsx",
        lineNumber: 22,
        columnNumber: 9
    }, this);
}
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
    const fetchData = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$purchaseOrders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPurchaseOrders"])().then((data)=>{
            setPos(data.sort((a, b)=>b.issuedAt.getTime() - a.issuedAt.getTime()));
            setLoading(false);
        });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PurchaseOrdersPage.useEffect": ()=>{
            fetchData();
        }
    }["PurchaseOrdersPage.useEffect"], []);
    const handleReceive = async (id, poNumber)=>{
        const confirmed = await showConfirm("Confirm Receipt", `Mark ${poNumber} as Received? This confirms all items have been delivered.`);
        if (!confirmed) return;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$purchaseOrders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updatePOStatus"])(id, 'RECEIVED');
            await showAlert("Success", "Goods Receipt Confirmed");
            setSelectedPO(null); // Close modal
            fetchData();
        } catch (error) {
            await showError("Error", "Error updating status");
        }
    };
    const handleEmailVendor = async (po)=>{
        // Simulation of sending email
        await showAlert("Email Sent", `Purchase Order ${po.poNumber} has been emailed to ${po.vendorName}.`);
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "Loading Purchase Orders..."
    }, void 0, false, {
        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
        lineNumber: 49,
        columnNumber: 25
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    fontSize: '1.875rem',
                    fontWeight: 'bold',
                    marginBottom: '2rem',
                    color: 'var(--primary)'
                },
                children: "Purchase Orders"
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 53,
                columnNumber: 13
            }, this),
            pos.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    textAlign: 'center',
                    padding: '3rem'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: 'var(--text-secondary)'
                    },
                    children: "No Purchase Orders issued yet."
                }, void 0, false, {
                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                    lineNumber: 57,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 56,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    overflowX: 'auto',
                    padding: 0
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            style: {
                                backgroundColor: 'var(--background)',
                                borderBottom: '1px solid var(--border)'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "PO Number"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 64,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Date Issued"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 65,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Vendor"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 66,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Total"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 67,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 68,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Action"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 69,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                lineNumber: 63,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                            lineNumber: 62,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: pos.map((po)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    onClick: ()=>setSelectedPO(po),
                                    style: {
                                        borderBottom: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    },
                                    onMouseEnter: (e)=>e.currentTarget.style.backgroundColor = '#f9fafb',
                                    onMouseLeave: (e)=>e.currentTarget.style.backgroundColor = 'transparent',
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                fontWeight: 600
                                            },
                                            children: po.poNumber
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 85,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: po.issuedAt.toLocaleDateString()
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 86,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: po.vendorName
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 87,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                fontWeight: 600
                                            },
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(po.totalAmount, po.currency)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 88,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.75rem',
                                                    backgroundColor: po.status === 'ISSUED' ? '#eff6ff' : po.status === 'RECEIVED' ? '#dcfce7' : '#f3f4f6',
                                                    color: po.status === 'ISSUED' ? '#1e40af' : po.status === 'RECEIVED' ? '#166534' : '#4b5563',
                                                    border: `1px solid ${po.status === 'ISSUED' ? '#bfdbfe' : po.status === 'RECEIVED' ? '#bbf7d0' : '#e5e7eb'}`
                                                },
                                                children: po.status
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                lineNumber: 90,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 89,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-text",
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    setSelectedPO(po);
                                                },
                                                style: {
                                                    fontSize: '0.875rem',
                                                    color: 'var(--primary)'
                                                },
                                                children: "View Document"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                lineNumber: 102,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 101,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, po.id, true, {
                                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                    lineNumber: 74,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                            lineNumber: 72,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                    lineNumber: 61,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 60,
                columnNumber: 17
            }, this),
            selectedPO && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$purchase$2d$orders$2f$PODetailModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                po: selectedPO,
                onClose: ()=>setSelectedPO(null),
                onReceive: handleReceive,
                onEmailVendor: handleEmailVendor
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 121,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
        lineNumber: 52,
        columnNumber: 9
    }, this);
}
_s(PurchaseOrdersPage, "Jaz/jJrFM77NYEMqeF/l1F3H/y4=", false, function() {
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

//# sourceMappingURL=src_d37b40fc._.js.map