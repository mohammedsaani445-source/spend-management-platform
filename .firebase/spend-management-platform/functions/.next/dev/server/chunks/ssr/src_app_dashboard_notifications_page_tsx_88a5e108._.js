module.exports = [
"[project]/src/app/dashboard/notifications/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NotificationsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/notifications.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function NotificationsPage() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [notifications, setNotifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('ALL');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!user) return;
        const targetId = user.uid;
        const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subscribeToNotifications"])(targetId, (data)=>{
            setNotifications(data);
            setLoading(false);
        });
        return ()=>unsubscribe();
    }, [
        user
    ]);
    const filteredNotifications = filter === 'ALL' ? notifications : notifications.filter((n)=>!n.read);
    const getIcon = (type)=>{
        switch(type){
            case 'APPROVAL_REQUEST':
                return '📝';
            case 'PO_ACKNOWLEDGED':
                return '✅';
            case 'PO_OPENED':
                return '👁️';
            case 'BUDGET_ALERT':
                return '⚠️';
            default:
                return '🔔';
        }
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '2rem'
        },
        children: "Loading Notifications..."
    }, void 0, false, {
        fileName: "[project]/src/app/dashboard/notifications/page.tsx",
        lineNumber: 43,
        columnNumber: 25
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            maxWidth: '1000px',
            margin: '0 auto'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: {
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    marginBottom: '0.5rem'
                                },
                                children: "Notification Center"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                lineNumber: 49,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: 'var(--text-secondary)'
                                },
                                children: "Manage your alerts and system communications."
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                lineNumber: 50,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                        lineNumber: 48,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '1rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn",
                                style: {
                                    backgroundColor: 'white',
                                    border: '1px solid var(--border)'
                                },
                                onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["markAllAsRead"])(user.uid, notifications),
                                children: "Mark all as read"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                lineNumber: 53,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-primary",
                                style: {
                                    backgroundColor: 'var(--error)',
                                    borderColor: 'var(--error)'
                                },
                                onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearNotifications"])(user.uid, notifications),
                                children: "Clear history"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                lineNumber: 60,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                        lineNumber: 52,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                lineNumber: 47,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    padding: 0,
                    overflow: 'hidden'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            borderBottom: '1px solid var(--border)',
                            padding: '0 1.5rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setFilter('ALL'),
                                style: {
                                    padding: '1.25rem 1.5rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: filter === 'ALL' ? '2px solid var(--primary)' : '2px solid transparent',
                                    color: filter === 'ALL' ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                },
                                children: [
                                    "All Updates (",
                                    notifications.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                lineNumber: 76,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setFilter('UNREAD'),
                                style: {
                                    padding: '1.25rem 1.5rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: filter === 'UNREAD' ? '2px solid var(--primary)' : '2px solid transparent',
                                    color: filter === 'UNREAD' ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                },
                                children: [
                                    "Unread (",
                                    notifications.filter((n)=>!n.read).length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                lineNumber: 90,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                        lineNumber: 71,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            minHeight: '400px'
                        },
                        children: filteredNotifications.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '4rem',
                                textAlign: 'center',
                                color: 'var(--text-secondary)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: '3rem',
                                        marginBottom: '1.5rem'
                                    },
                                    children: "📭"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                    lineNumber: 109,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    style: {
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        color: 'var(--text-main)',
                                        marginBottom: '0.5rem'
                                    },
                                    children: "No notifications found"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                    lineNumber: 110,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: [
                                        "You have no ",
                                        filter === 'UNREAD' ? 'unread' : '',
                                        " alerts at this time."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                    lineNumber: 113,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                            lineNumber: 108,
                            columnNumber: 25
                        }, this) : filteredNotifications.map((notif)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '1.5rem',
                                    borderBottom: '1px solid var(--border)',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    backgroundColor: notif.read ? 'transparent' : 'rgba(4, 156, 99, 0.02)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                },
                                onClick: ()=>{
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["markNotificationAsRead"])(notif.id);
                                    if (notif.link) window.location.href = notif.link;
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem'
                                        },
                                        children: getIcon(notif.type)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                        lineNumber: 133,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '0.25rem'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        style: {
                                                            fontSize: '1rem',
                                                            fontWeight: 700,
                                                            margin: 0
                                                        },
                                                        children: notif.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                                        lineNumber: 148,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '0.8rem',
                                                            color: 'var(--text-secondary)'
                                                        },
                                                        children: [
                                                            new Date(notif.createdAt).toLocaleDateString(),
                                                            " at ",
                                                            new Date(notif.createdAt).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                                        lineNumber: 149,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                                lineNumber: 147,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: '0.9rem',
                                                    color: 'var(--text-secondary)',
                                                    margin: '0 0 0.5rem 0',
                                                    lineHeight: 1.5
                                                },
                                                children: notif.message
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                                lineNumber: 153,
                                                columnNumber: 37
                                            }, this),
                                            !notif.read && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    padding: '0.2rem 0.6rem',
                                                    backgroundColor: 'var(--primary)',
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700
                                                },
                                                children: "NEW"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                                lineNumber: 157,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                        lineNumber: 146,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, notif.id, true, {
                                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                                lineNumber: 117,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                        lineNumber: 106,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/notifications/page.tsx",
                lineNumber: 70,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/notifications/page.tsx",
        lineNumber: 46,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=src_app_dashboard_notifications_page_tsx_88a5e108._.js.map