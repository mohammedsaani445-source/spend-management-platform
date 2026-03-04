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
"[project]/src/app/dashboard/approvals/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/src/app/dashboard/approvals/page.tsx'\n\nUnterminated regexp literal");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
];

//# sourceMappingURL=src_4e31edb5._.js.map