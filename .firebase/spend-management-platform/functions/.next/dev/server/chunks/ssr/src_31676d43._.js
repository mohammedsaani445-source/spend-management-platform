module.exports = [
"[project]/src/lib/purchaseOrders.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createPOFromRequisition",
    ()=>createPOFromRequisition,
    "getPurchaseOrders",
    ()=>getPurchaseOrders,
    "updatePOStatus",
    ()=>updatePOStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
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
        const poRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], COLLECTION_NAME);
        const newPORef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["push"])(poRef);
        const newPO = {
            poNumber,
            requisitionId: requisition.id,
            vendorId: requisition.vendorId,
            vendorName: requisition.vendorName,
            items: requisition.items,
            totalAmount: requisition.totalAmount,
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
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(poRef, updates);
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
"[project]/src/context/ModalContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModalProvider",
    ()=>ModalProvider,
    "useModal",
    ()=>useModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const ModalContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ModalProvider({ children }) {
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [type, setType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('ALERT');
    const [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // Promise resolvers
    const [resolvePromise, setResolvePromise] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const showAlert = (title, message)=>{
        return new Promise((resolve)=>{
            setTitle(title);
            setMessage(message);
            setType('ALERT');
            setIsOpen(true);
            setResolvePromise(()=>resolve);
        });
    };
    const showError = (title, message)=>{
        return new Promise((resolve)=>{
            setTitle(title);
            setMessage(message);
            setType('ERROR');
            setIsOpen(true);
            setResolvePromise(()=>resolve);
        });
    };
    const showConfirm = (title, message)=>{
        return new Promise((resolve)=>{
            setTitle(title);
            setMessage(message);
            setType('CONFIRM');
            setIsOpen(true);
            setResolvePromise(()=>resolve);
        });
    };
    const handleConfirm = ()=>{
        setIsOpen(false);
        if (resolvePromise) {
            resolvePromise(true); // For confirm, true
        // For alert/error, just resolves void, which is fine
        }
    };
    const handleCancel = ()=>{
        setIsOpen(false);
        if (resolvePromise) {
            resolvePromise(false); // For confirm, false
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ModalContext.Provider, {
        value: {
            showAlert,
            showConfirm,
            showError
        },
        children: [
            children,
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "card",
                    style: {
                        width: '400px',
                        maxWidth: '90%',
                        textAlign: 'center',
                        padding: '2rem',
                        animation: 'fadeIn 0.2s ease-out'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: '3rem',
                                marginBottom: '1rem'
                            },
                            children: type === 'ERROR' ? '⛔' : type === 'CONFIRM' ? '❓' : 'ℹ️'
                        }, void 0, false, {
                            fileName: "[project]/src/context/ModalContext.tsx",
                            lineNumber: 83,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: {
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                marginBottom: '1rem',
                                color: type === 'ERROR' ? 'var(--error)' : 'var(--text-primary)'
                            },
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/src/context/ModalContext.tsx",
                            lineNumber: 87,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                marginBottom: '2rem',
                                lineHeight: '1.5',
                                color: 'var(--text-secondary)'
                            },
                            children: message
                        }, void 0, false, {
                            fileName: "[project]/src/context/ModalContext.tsx",
                            lineNumber: 94,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'center'
                            },
                            children: [
                                type === 'CONFIRM' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "btn",
                                    onClick: handleCancel,
                                    style: {
                                        minWidth: '100px'
                                    },
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/context/ModalContext.tsx",
                                    lineNumber: 100,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "btn btn-primary",
                                    onClick: handleConfirm,
                                    style: {
                                        minWidth: '100px',
                                        backgroundColor: type === 'ERROR' ? 'var(--error)' : 'var(--primary)'
                                    },
                                    children: type === 'CONFIRM' ? 'Confirm' : 'OK'
                                }, void 0, false, {
                                    fileName: "[project]/src/context/ModalContext.tsx",
                                    lineNumber: 104,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/context/ModalContext.tsx",
                            lineNumber: 98,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/context/ModalContext.tsx",
                    lineNumber: 79,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/context/ModalContext.tsx",
                lineNumber: 75,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/context/ModalContext.tsx",
        lineNumber: 70,
        columnNumber: 9
    }, this);
}
function useModal() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
}),
"[project]/src/app/dashboard/purchase-orders/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PurchaseOrdersPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$purchaseOrders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/purchaseOrders.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/currencies.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ModalContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ModalContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function PurchaseOrdersPage() {
    const { user } = useAuth();
    const { showConfirm, showAlert, showError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ModalContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useModal"])();
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const fetchData = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$purchaseOrders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPurchaseOrders"])().then((data)=>{
            setPos(data.sort((a, b)=>b.issuedAt.getTime() - a.issuedAt.getTime()));
            setLoading(false);
        });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchData();
    }, []);
    const handleReceive = async (id, poNumber)=>{
        const confirmed = await showConfirm("Confirm Receipt", `Mark ${poNumber} as Received? This confirms all items have been delivered.`);
        if (!confirmed) return;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$purchaseOrders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updatePOStatus"])(id, 'RECEIVED');
            await showAlert("Success", "Goods Receipt Confirmed");
            fetchData(); // Changed function name to match logic
        } catch (error) {
            await showError("Error", "Error updating status");
        }
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "Loading Purchase Orders..."
    }, void 0, false, {
        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
        lineNumber: 40,
        columnNumber: 25
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    fontSize: '1.875rem',
                    fontWeight: 'bold',
                    marginBottom: '2rem',
                    color: 'var(--primary)'
                },
                children: "Purchase Orders"
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 44,
                columnNumber: 13
            }, this),
            pos.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    textAlign: 'center',
                    padding: '3rem'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: 'var(--text-secondary)'
                    },
                    children: "No Purchase Orders issued yet."
                }, void 0, false, {
                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                    lineNumber: 48,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 47,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    overflowX: 'auto',
                    padding: 0
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            style: {
                                backgroundColor: 'var(--background)',
                                borderBottom: '1px solid var(--border)'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "PO Number"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 55,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Date Issued"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 56,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Vendor"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 57,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Total"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 58,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 59,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Action"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                        lineNumber: 60,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                lineNumber: 54,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                            lineNumber: 53,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: pos.map((po)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        borderBottom: '1px solid var(--border)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                fontWeight: 600
                                            },
                                            children: po.poNumber
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 66,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: po.issuedAt.toLocaleDateString()
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 67,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: po.vendorName
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 68,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                fontWeight: 600
                                            },
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCurrency"])(po.totalAmount, po.currency)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 69,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.75rem',
                                                    backgroundColor: po.status === 'ISSUED' ? '#eff6ff' : po.status === 'RECEIVED' ? '#dcfce7' : '#f3f4f6',
                                                    color: po.status === 'ISSUED' ? '#1e40af' : po.status === 'RECEIVED' ? '#166534' : '#4b5563'
                                                },
                                                children: po.status
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                lineNumber: 71,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 70,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: po.status === 'ISSUED' && po.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>po.id && handleReceive(po.id, po.poNumber),
                                                style: {
                                                    color: 'var(--success)',
                                                    background: 'none',
                                                    border: '1px solid var(--success)',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem'
                                                },
                                                children: "Receive Goods"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                lineNumber: 83,
                                                columnNumber: 45
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-secondary)'
                                                },
                                                children: po.status === 'RECEIVED' ? 'Received' : 'View'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                                lineNumber: 90,
                                                columnNumber: 45
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                            lineNumber: 81,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, po.id, true, {
                                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                                    lineNumber: 65,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                            lineNumber: 63,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                    lineNumber: 52,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
                lineNumber: 51,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/purchase-orders/page.tsx",
        lineNumber: 43,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=src_31676d43._.js.map