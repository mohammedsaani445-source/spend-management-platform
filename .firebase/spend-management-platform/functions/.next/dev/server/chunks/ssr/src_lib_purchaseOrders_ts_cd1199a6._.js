module.exports = [
"[project]/src/lib/purchaseOrders.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/src_lib_notifications_ts_ea964691._.js",
  "server/chunks/ssr/src_lib_567e4d17._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/purchaseOrders.ts [app-ssr] (ecmascript)");
    });
});
}),
];