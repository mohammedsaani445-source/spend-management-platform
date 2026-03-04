(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/src/components/requisitions/RequisitionsList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RequisitionsList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$currencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/currencies.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function RequisitionsList() {
    _s();
    const [requisitions, setRequisitions] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect({
        "RequisitionsList.useEffect": ()=>{
            getRequisitions().then({
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
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "Loading requests..."
    }, void 0, false, {
        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
        lineNumber: 17,
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
                        lineNumber: 22,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Link, {
                        href: "/dashboard/requisitions/new",
                        className: "btn btn-primary",
                        children: "+ New Request"
                    }, void 0, false, {
                        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                        lineNumber: 23,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                lineNumber: 21,
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
                    lineNumber: 30,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                lineNumber: 29,
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
                                        lineNumber: 37,
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
                                        lineNumber: 38,
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
                                        lineNumber: 39,
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
                                        lineNumber: 40,
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
                                        lineNumber: 41,
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
                                        lineNumber: 42,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                lineNumber: 36,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                            lineNumber: 35,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: requisitions.map((req)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        borderBottom: '1px solid var(--border)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                fontSize: '0.9rem'
                                            },
                                            children: req.createdAt.toLocaleDateString()
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                            lineNumber: 48,
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
                                            lineNumber: 49,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: req.requesterName
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                            lineNumber: 50,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            children: req.vendorName || '-'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                            lineNumber: 51,
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
                                            lineNumber: 52,
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
                                                    backgroundColor: req.status === 'APPROVED' ? '#dcfce7' : req.status === 'PENDING' ? '#fef9c3' : '#fee2e2',
                                                    color: req.status === 'APPROVED' ? '#166534' : req.status === 'PENDING' ? '#854d0e' : '#991b1b'
                                                },
                                                children: req.status
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                                lineNumber: 54,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                            lineNumber: 53,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, req.id, true, {
                                    fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                                    lineNumber: 47,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                            lineNumber: 45,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                    lineNumber: 34,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
                lineNumber: 33,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/requisitions/RequisitionsList.tsx",
        lineNumber: 20,
        columnNumber: 9
    }, this);
}
_s(RequisitionsList, "pP0zBn3Q1YY47AfdHeTt5QWU97M=");
_c = RequisitionsList;
var _c;
__turbopack_context__.k.register(_c, "RequisitionsList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_2ec76de7._.js.map