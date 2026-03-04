(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
;
;
const COLLECTION_NAME = "requisitions";
const createRequisition = async (requisition)=>{
    try {
        const reqsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION_NAME);
        const newReqRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["push"])(reqsRef);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["set"])(newReqRef, {
            ...requisition,
            id: newReqRef.key,
            createdAt: new Date().toISOString(),
            status: 'PENDING'
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
"[project]/src/app/dashboard/approvals/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ApprovalsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$requisitions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/requisitions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function ApprovalsPage() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [requisitions, setRequisitions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const fetchReqs = async ()=>{
        setLoading(true);
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$requisitions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRequisitions"])();
        // Filter for only PENDING requests
        const pending = data.filter((r)=>r.status === 'PENDING').sort((a, b)=>b.createdAt.getTime() - a.createdAt.getTime());
        setRequisitions(pending);
        setLoading(false);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ApprovalsPage.useEffect": ()=>{
            fetchReqs();
        }
    }["ApprovalsPage.useEffect"], []);
    const handleAction = async (id, action)=>{
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;
        if (!id) return;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$requisitions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateRequisitionStatus"])(id, action, user?.uid);
            if (action === 'APPROVED' && user?.uid) {
                // Auto-generate PO - needs full requisition object, which we have in state
                const req = requisitions.find((r)=>r.id === id);
                if (req) {
                    await createPOFromRequisition(req, user.uid);
                    alert("Request Approved & PO Generated!");
                }
            } else {
                await fetchReqs(); // Refresh list only if not redirecting or other logic
            }
            await fetchReqs(); // Refresh list
        } catch (error) {
            console.error(error);
            alert("Error updating status");
        }
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "Loading approvals..."
    }, void 0, false, {
        fileName: "[project]/src/app/dashboard/approvals/page.tsx",
        lineNumber: 50,
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
                children: "Pending Approvals"
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                lineNumber: 54,
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
                    children: "No pending requests require your approval."
                }, void 0, false, {
                    fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                    lineNumber: 58,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                lineNumber: 57,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gap: '1.5rem'
                },
                children: requisitions.map((req)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    borderBottom: '1px solid var(--border)',
                                    paddingBottom: '1rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem'
                                                },
                                                children: [
                                                    "#",
                                                    req.id?.slice(-6).toUpperCase(),
                                                    " — ",
                                                    req.vendorName
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                                lineNumber: 66,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '0.875rem',
                                                    color: 'var(--text-secondary)'
                                                },
                                                children: [
                                                    "Requested by ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: req.requesterName
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                                        lineNumber: 68,
                                                        columnNumber: 54
                                                    }, this),
                                                    " (",
                                                    req.department,
                                                    ") on ",
                                                    req.createdAt.toLocaleDateString()
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                                lineNumber: 67,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                        lineNumber: 65,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '1.25rem',
                                            fontWeight: 'bold',
                                            color: 'var(--primary)'
                                        },
                                        children: [
                                            "$",
                                            req.totalAmount.toFixed(2)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                        lineNumber: 71,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                lineNumber: 64,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    style: {
                                        width: '100%',
                                        fontSize: '0.9rem'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        children: req.items.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '0.25rem 0'
                                                        },
                                                        children: [
                                                            item.quantity,
                                                            "x ",
                                                            item.description
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                                        lineNumber: 81,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            textAlign: 'right',
                                                            padding: '0.25rem 0'
                                                        },
                                                        children: [
                                                            "$",
                                                            item.total.toFixed(2)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                                        lineNumber: 82,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                                lineNumber: 80,
                                                columnNumber: 45
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                        lineNumber: 78,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                    lineNumber: 77,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                lineNumber: 76,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    backgroundColor: '#f8fafc',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.875rem',
                                    fontStyle: 'italic',
                                    border: '1px solid var(--border)'
                                },
                                children: [
                                    '" ',
                                    req.justification,
                                    ' "'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                lineNumber: 89,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: '1rem',
                                    justifyContent: 'flex-end',
                                    marginTop: '0.5rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>req.id && handleAction(req.id, 'REJECTED'),
                                        className: "btn",
                                        style: {
                                            border: '1px solid var(--error)',
                                            color: 'var(--error)'
                                        },
                                        children: "Reject"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                        lineNumber: 94,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>req.id && handleAction(req.id, 'APPROVED'),
                                        className: "btn btn-primary",
                                        style: {
                                            backgroundColor: 'var(--success)'
                                        },
                                        children: "Approve Request"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                        lineNumber: 101,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                                lineNumber: 93,
                                columnNumber: 29
                            }, this)
                        ]
                    }, req.id, true, {
                        fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                        lineNumber: 63,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/approvals/page.tsx",
                lineNumber: 61,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/approvals/page.tsx",
        lineNumber: 53,
        columnNumber: 9
    }, this);
}
_s(ApprovalsPage, "pezGgdIqkUrgKv6S9pIbUo3M0ug=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = ApprovalsPage;
var _c;
__turbopack_context__.k.register(_c, "ApprovalsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_294774a3._.js.map