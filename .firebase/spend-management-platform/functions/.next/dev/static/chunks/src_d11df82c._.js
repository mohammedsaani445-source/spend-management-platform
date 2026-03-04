(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/approvals.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/requisitions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRequisition",
    ()=>createRequisition,
    "getRequisitions",
    ()=>getRequisitions,
    "updateRequisitionStatus",
    ()=>updateRequisitionStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$approvals$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/approvals.ts [app-client] (ecmascript)");
;
;
;
const COLLECTION_NAME = "requisitions";
const createRequisition = async (requisition)=>{
    try {
        // Determine Approver
        const approver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$approvals$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApproverForRequest"])(requisition.department, requisition.totalAmount);
        const reqsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION_NAME);
        const newReqRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["push"])(reqsRef);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["set"])(newReqRef, {
            ...requisition,
            id: newReqRef.key,
            createdAt: new Date().toISOString(),
            status: 'PENDING',
            approverId: approver.uid,
            approverName: approver.name // Optional: Store name for display
        });
        // Trigger Notification for Approver
        const { createNotification } = await __turbopack_context__.A("[project]/src/lib/notifications.ts [app-client] (ecmascript, async loader)");
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
        const dbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"]);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["get"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["child"])(dbRef, COLLECTION_NAME));
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
    const reqRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], `${COLLECTION_NAME}/${reqId}`);
    const updates = {
        status
    };
    if (approverId) updates.approverId = approverId;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["update"])(reqRef, updates);
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
"[project]/src/components/requisitions/RequisitionDetailModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RequisitionDetailModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/currencies.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function RequisitionDetailModal({ requisition, onClose, onDuplicate }) {
    _s();
    // Status Timeline Logic
    const steps = [
        {
            status: 'DRAFT',
            label: 'Draft'
        },
        {
            status: 'PENDING',
            label: 'Pending Approval'
        },
        {
            status: 'APPROVED',
            label: 'Approved'
        },
        {
            status: 'ORDERED',
            label: 'Ordered'
        },
        {
            status: 'RECEIVED',
            label: 'Received'
        } // Future state
    ];
    const currentStepIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RequisitionDetailModal.useMemo[currentStepIndex]": ()=>{
            if (requisition.status === 'REJECTED') return -1;
            // Map current status to index
            const map = {
                'PENDING': 1,
                'APPROVED': 2,
                'ORDERED': 3,
                'RECEIVED': 4
            };
            return map[requisition.status] || 0;
        }
    }["RequisitionDetailModal.useMemo[currentStepIndex]"], [
        requisition.status
    ]);
    const getStepStatus = (index)=>{
        if (requisition.status === 'REJECTED') return 'inactive';
        if (index < currentStepIndex) return 'completed';
        if (index === currentStepIndex) return 'current';
        return 'inactive';
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "card",
            style: {
                width: '800px',
                maxWidth: '95%',
                maxHeight: '90vh',
                overflowY: 'auto',
                animation: 'slideIn 0.3s ease-out'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '2rem'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: '0.875rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.25rem'
                                    },
                                    children: [
                                        "Requisition #",
                                        requisition.id?.slice(-6).toUpperCase()
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 60,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    style: {
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    },
                                    children: requisition.items[0]?.description || 'Purchase Requisition'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 63,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        gap: '1rem',
                                        marginTop: '0.5rem'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                padding: '0.25rem 0.5rem',
                                                background: '#f3f4f6',
                                                color: '#374151',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem'
                                            },
                                            children: [
                                                "📅 ",
                                                requisition.createdAt.toLocaleDateString()
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                            lineNumber: 65,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                padding: '0.25rem 0.5rem',
                                                background: '#f3f4f6',
                                                color: '#374151',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem'
                                            },
                                            children: [
                                                "🏢 ",
                                                requisition.department
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                            lineNumber: 68,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 64,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                            lineNumber: 59,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            style: {
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)'
                            },
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                            lineNumber: 73,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                    lineNumber: 58,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginBottom: '2.5rem',
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: {
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                marginBottom: '1.5rem',
                                color: 'var(--text-secondary)'
                            },
                            children: "Request Status"
                        }, void 0, false, {
                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                            lineNumber: 80,
                            columnNumber: 21
                        }, this),
                        requisition.status === 'REJECTED' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '1rem',
                                backgroundColor: '#fef2f2',
                                color: 'var(--error)',
                                borderRadius: '6px',
                                border: '1px solid #fecaca',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '1.25rem'
                                    },
                                    children: "❌"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 84,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontWeight: 600
                                    },
                                    children: "This request has been Rejected."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 85,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                            lineNumber: 83,
                            columnNumber: 25
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                position: 'relative'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: 'absolute',
                                        top: '12px',
                                        left: '0',
                                        right: '0',
                                        height: '2px',
                                        backgroundColor: '#e5e7eb',
                                        zIndex: 0
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 90,
                                    columnNumber: 29
                                }, this),
                                steps.map((step, i)=>{
                                    const status = getStepStatus(i);
                                    const isCompleted = status === 'completed';
                                    const isCurrent = status === 'current';
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            zIndex: 1,
                                            position: 'relative'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    backgroundColor: isCompleted || isCurrent ? 'var(--primary)' : 'white',
                                                    border: `2px solid ${isCompleted || isCurrent ? 'var(--primary)' : '#d1d5db'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    marginBottom: '0.5rem',
                                                    transition: 'all 0.3s ease'
                                                },
                                                children: [
                                                    isCompleted && '✓',
                                                    isCurrent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: '8px',
                                                            height: '8px',
                                                            backgroundColor: 'white',
                                                            borderRadius: '50%'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                        lineNumber: 108,
                                                        columnNumber: 59
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                lineNumber: 99,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '0.8rem',
                                                    fontWeight: isCurrent ? 600 : 400,
                                                    color: isCompleted || isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)'
                                                },
                                                children: step.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                lineNumber: 110,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                        lineNumber: 98,
                                        columnNumber: 37
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                            lineNumber: 88,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                    lineNumber: 79,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '2rem'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    style: {
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        marginBottom: '0.75rem',
                                        borderBottom: '2px solid var(--primary)',
                                        display: 'inline-block',
                                        paddingBottom: '0.25rem'
                                    },
                                    children: "Line Items"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 129,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    style: {
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '0.9rem'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            style: {
                                                backgroundColor: '#f9fafb',
                                                borderBottom: '1px solid var(--border)'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            padding: '0.75rem',
                                                            textAlign: 'left'
                                                        },
                                                        children: "Item Description"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                        lineNumber: 133,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            padding: '0.75rem',
                                                            textAlign: 'center'
                                                        },
                                                        children: "Qty"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                        lineNumber: 134,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            padding: '0.75rem',
                                                            textAlign: 'right'
                                                        },
                                                        children: "Unit Price"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                        lineNumber: 135,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            padding: '0.75rem',
                                                            textAlign: 'right'
                                                        },
                                                        children: "Total"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                        lineNumber: 136,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                lineNumber: 132,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                            lineNumber: 131,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: requisition.items.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    style: {
                                                        borderBottom: '1px solid #f3f4f6'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '0.75rem'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontWeight: 500
                                                                    },
                                                                    children: item.description
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                                    lineNumber: 143,
                                                                    columnNumber: 45
                                                                }, this),
                                                                item.glCode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontSize: '0.75rem',
                                                                        color: 'var(--text-secondary)'
                                                                    },
                                                                    children: [
                                                                        "GL: ",
                                                                        item.glCode
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                                    lineNumber: 144,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                            lineNumber: 142,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '0.75rem',
                                                                textAlign: 'center'
                                                            },
                                                            children: item.quantity
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                            lineNumber: 146,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '0.75rem',
                                                                textAlign: 'right'
                                                            },
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(item.unitPrice, requisition.currency)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                            lineNumber: 147,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '0.75rem',
                                                                textAlign: 'right',
                                                                fontWeight: 600
                                                            },
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(item.total, requisition.currency)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                            lineNumber: 148,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                    lineNumber: 141,
                                                    columnNumber: 37
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                            lineNumber: 139,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tfoot", {
                                            style: {
                                                borderTop: '2px solid var(--border)'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        colSpan: 3,
                                                        style: {
                                                            padding: '1rem 0.75rem',
                                                            textAlign: 'right',
                                                            fontWeight: 600
                                                        },
                                                        children: "Total Amount"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                        lineNumber: 154,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '1rem 0.75rem',
                                                            textAlign: 'right',
                                                            fontWeight: 700,
                                                            fontSize: '1.1rem',
                                                            color: 'var(--primary)'
                                                        },
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(requisition.totalAmount, requisition.currency)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                        lineNumber: 155,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                lineNumber: 153,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                            lineNumber: 152,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 130,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                            lineNumber: 128,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                backgroundColor: '#f9fafb',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                height: 'fit-content'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: '1.5rem'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                                marginBottom: '0.25rem'
                                            },
                                            children: "Vendor"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                            lineNumber: 166,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontWeight: 600
                                            },
                                            children: requisition.vendorName || 'Not Specified'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                            lineNumber: 167,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 165,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: '1.5rem'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                                marginBottom: '0.25rem'
                                            },
                                            children: "Business Justification"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                            lineNumber: 171,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '0.9rem',
                                                lineHeight: '1.5',
                                                fontStyle: 'italic',
                                                color: '#4b5563'
                                            },
                                            children: [
                                                '"',
                                                requisition.justification,
                                                '"'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                            lineNumber: 172,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 170,
                                    columnNumber: 25
                                }, this),
                                requisition.approverName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                                marginBottom: '0.25rem'
                                            },
                                            children: "Approver"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                            lineNumber: 179,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#d1d5db',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.7rem'
                                                    },
                                                    children: "👤"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                    lineNumber: 181,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontWeight: 500
                                                    },
                                                    children: requisition.approverName
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                                    lineNumber: 182,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                            lineNumber: 180,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 178,
                                    columnNumber: 29
                                }, this),
                                onDuplicate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>onDuplicate(requisition),
                                    style: {
                                        width: '100%',
                                        marginTop: '2rem',
                                        padding: '0.75rem',
                                        backgroundColor: 'white',
                                        border: '1px solid var(--primary)',
                                        color: 'var(--primary)',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    },
                                    children: "🔁 Duplicate Request"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                                    lineNumber: 188,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                            lineNumber: 164,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
                    lineNumber: 125,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
            lineNumber: 53,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/requisitions/RequisitionDetailModal.tsx",
        lineNumber: 48,
        columnNumber: 9
    }, this);
}
_s(RequisitionDetailModal, "ch1GIr7lh8U+TdxH5wj6SB/NYA8=");
_c = RequisitionDetailModal;
var _c;
__turbopack_context__.k.register(_c, "RequisitionDetailModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/requisitions/RequisitionsList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RequisitionsList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$requisitions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/requisitions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/currencies.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$requisitions$2f$RequisitionDetailModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/requisitions/RequisitionDetailModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function RequisitionsList() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [requisitions, setRequisitions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedReq, setSelectedReq] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RequisitionsList.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$requisitions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRequisitions"])().then({
                "RequisitionsList.useEffect": (data)=>{
                    // Sort by newest first
                    setRequisitions(data.sort({
                        "RequisitionsList.useEffect": (a, b)=>b.createdAt.getTime() - a.createdAt.getTime()
                    }["RequisitionsList.useEffect"]));
                    setLoading(false);
                }
            }["RequisitionsList.useEffect"]);
        }
    }["RequisitionsList.useEffect"], []);
    const handleDuplicate = (req)=>{
        // Logic to duplicate could be complex, for now let's just go to new page
        // In a real app, we'd pass state or query params to pre-fill
        router.push('/dashboard/requisitions/new');
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "Loading requests..."
    }, void 0, false, {
        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
        lineNumber: 31,
        columnNumber: 25
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            fontSize: '1.875rem',
                            fontWeight: 'bold',
                            color: 'var(--primary)'
                        },
                        children: "Purchase Requisitions"
                    }, void 0, false, {
                        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                        lineNumber: 36,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/dashboard/requisitions/new",
                        className: "btn btn-primary",
                        children: "+ New Request"
                    }, void 0, false, {
                        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                        lineNumber: 37,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                lineNumber: 35,
                columnNumber: 13
            }, this),
            requisitions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    textAlign: 'center',
                    padding: '3rem'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: 'var(--text-secondary)'
                    },
                    children: "No pending requests found."
                }, void 0, false, {
                    fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                    lineNumber: 44,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                lineNumber: 43,
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
                                        children: "Date"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                        lineNumber: 51,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Req #"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                        lineNumber: 52,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Requester"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                        lineNumber: 53,
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
                                        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                        lineNumber: 54,
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
                                        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                        lineNumber: 55,
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
                                        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                        lineNumber: 56,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                lineNumber: 50,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                            lineNumber: 49,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: requisitions.map((req)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    onClick: ()=>setSelectedReq(req),
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
                                                fontSize: '0.9rem'
                                            },
                                            children: req.createdAt.toLocaleDateString()
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                            lineNumber: 72,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                fontWeight: 500
                                            },
                                            children: [
                                                "#",
                                                req.id?.slice(-6).toUpperCase()
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                            lineNumber: 73,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: req.requesterName
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                            lineNumber: 74,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: req.vendorName || '-'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                            lineNumber: 75,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                fontWeight: 600
                                            },
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(req.totalAmount, req.currency)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                            lineNumber: 76,
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
                                                    backgroundColor: req.status === 'APPROVED' ? '#dcfce7' : req.status === 'PENDING' ? '#fef9c3' : req.status === 'ORDERED' ? '#dbeafe' : '#fee2e2',
                                                    color: req.status === 'APPROVED' ? '#166534' : req.status === 'PENDING' ? '#854d0e' : req.status === 'ORDERED' ? '#1e40af' : '#991b1b',
                                                    border: `1px solid ${req.status === 'APPROVED' ? '#bbf7d0' : req.status === 'PENDING' ? '#fde047' : req.status === 'ORDERED' ? '#bfdbfe' : '#fecaca'}`
                                                },
                                                children: req.status
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                                lineNumber: 78,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                            lineNumber: 77,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, req.id, true, {
                                    fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                    lineNumber: 61,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                            lineNumber: 59,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                    lineNumber: 48,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                lineNumber: 47,
                columnNumber: 17
            }, this),
            selectedReq && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$requisitions$2f$RequisitionDetailModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                requisition: selectedReq,
                onClose: ()=>setSelectedReq(null),
                onDuplicate: handleDuplicate
            }, void 0, false, {
                fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                lineNumber: 97,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
        lineNumber: 34,
        columnNumber: 9
    }, this);
}
_s(RequisitionsList, "w+23Vf0ywnVFFsEK8UnoyAaj6CY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = RequisitionsList;
var _c;
__turbopack_context__.k.register(_c, "RequisitionsList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_d11df82c._.js.map