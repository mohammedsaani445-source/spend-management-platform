module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[project]/src/lib/firebase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "app",
    ()=>app,
    "auth",
    ()=>auth,
    "db",
    ()=>db,
    "storage",
    ()=>storage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$storage$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/storage/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/storage/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
;
;
;
;
const firebaseConfig = {
    apiKey: "AIzaSyBTj9jFKQlLuJD7U_Pu8BKXC_iVni7dzPY",
    authDomain: "spend-management-platform.firebaseapp.com",
    databaseURL: "https://spend-management-platform-default-rtdb.firebaseio.com",
    projectId: "spend-management-platform",
    storageBucket: "spend-management-platform.firebasestorage.app",
    messagingSenderId: "357613361639",
    appId: "1:357613361639:web:4d6c518be69a8969120542",
    measurementId: "G-0TBPB171J8"
};
// Initialize Firebase (Singleton pattern)
const app = !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApps"])().length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApp"])();
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuth"])(app);
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDatabase"])(app); // Realtime Database instance
const storage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStorage"])(app);
;
}),
"[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    loading: true,
    updateProfile: async ()=>{}
});
const AuthProvider = ({ children })=>{
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"], async (firebaseUser)=>{
            if (firebaseUser) {
                // Fetch additional user info from DB
                const userRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], `users/${firebaseUser.uid}`);
                const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["get"])(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    const email = firebaseUser.email?.toLowerCase() || "";
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || "",
                        displayName: firebaseUser.displayName || "User",
                        photoURL: firebaseUser.photoURL || undefined,
                        role: email === 'mohammedsaani445@gmail.com' ? 'ADMIN' : userData.role || 'REQUESTER',
                        department: userData.department,
                        createdAt: new Date(userData.createdAt || Date.now())
                    });
                } else {
                    // Fallback for new users or demo (Default to ADMIN for first user or matching email)
                    const email = firebaseUser.email?.toLowerCase() || "";
                    const isDefaultAdmin = email.includes('admin') || email === 'mohammedsaani445@gmail.com';
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || "",
                        displayName: firebaseUser.displayName || "User",
                        photoURL: firebaseUser.photoURL || undefined,
                        role: isDefaultAdmin ? 'ADMIN' : 'REQUESTER',
                        createdAt: new Date()
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return ()=>unsubscribe();
    }, []);
    const updateProfile = async (data)=>{
        if (!user) return;
        try {
            const userRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], `users/${user.uid}`);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(userRef, data);
            // State will update via the onAuthStateChanged or we can manually update here for immediate feedback
            setUser((prev)=>prev ? {
                    ...prev,
                    ...data
                } : null);
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            updateProfile
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AuthContext.tsx",
        lineNumber: 80,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
const useAuth = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
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
"[project]/src/context/ThemeContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ThemeProvider({ children }) {
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('light');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Check local storage or system preference on mount
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Apply theme class to document element
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [
        theme
    ]);
    const toggleTheme = ()=>{
        setTheme((prev)=>prev === 'light' ? 'dark' : 'light');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: {
            theme,
            toggleTheme
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/ThemeContext.tsx",
        lineNumber: 38,
        columnNumber: 9
    }, this);
}
function useTheme() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
}),
"[project]/src/lib/help.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HELP_ARTICLES",
    ()=>HELP_ARTICLES,
    "searchHelpArticles",
    ()=>searchHelpArticles,
    "submitSupportTicket",
    ()=>submitSupportTicket,
    "subscribeToTickets",
    ()=>subscribeToTickets,
    "subscribeToUserTickets",
    ()=>subscribeToUserTickets,
    "updateTicketStatus",
    ()=>updateTicketStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
;
;
const TICKETS_COLLECTION = "support_tickets";
const HELP_ARTICLES = [
    {
        id: '1',
        category: 'GETTING_STARTED',
        title: 'Platform Overview',
        content: 'Welcome to the Spend Management Platform. This guide covers the basics of navigating the dashboard, managing requisitions, and tracking purchase orders.'
    },
    {
        id: '2',
        category: 'REQUISITIONS',
        title: 'How to create a Requisition',
        content: 'To create a requisition, go to the "Purchase Requisitions" tab and click "New Requisition". Fill in the items, vendor, and justification before submitting for approval.'
    },
    {
        id: '3',
        category: 'BUDGETS',
        title: 'Understanding Budget Alerts',
        content: 'Budget alerts are triggered when a department spend exceeds 80% or 100% of its allocated fiscal year budget. These are visible in the Notification Center.'
    },
    {
        id: '4',
        category: 'VENDORS',
        title: 'Vendor Acknowledgment',
        content: 'When you send a PO to a vendor, they receive a secure link. Once they "Acknowledge" the order, a digital watermark is applied and your dashboard is updated in real-time.'
    },
    {
        id: '5',
        category: 'POLICIES',
        title: 'Approval Hierarchies',
        content: 'Requisitions are automatically routed to the correct manager based on total amount and department policies. Managers can approve or reject directly from their portal.'
    },
    {
        id: '6',
        category: 'SECURITY',
        title: 'Setting up Two-Factor Authentication (2FA)',
        content: 'Enhance your account security by enabling TOTP-based 2FA in your Security Settings. Scan the provided QR code with an app like Google Authenticator or Authy to receive secure login codes.'
    },
    {
        id: '7',
        category: 'ACCOUNTING',
        title: '3-Way Matching Process',
        content: 'SpendLogic automates 3-way matching by comparing Purchase Orders, Goods Receipts, and Invoices. Discrepancies outside of tolerance levels are flagged for manual review to prevent payment errors.'
    },
    {
        id: '8',
        category: 'COMPLIANCE',
        title: 'Audit Trail & Transparency',
        content: 'Every action in the system—from requisition creation to payment—is logged in a permanent audit trail. This ensures high-level financial transparency and facilitates external audits.'
    }
];
const submitSupportTicket = async (ticket)=>{
    try {
        const ticketsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], TICKETS_COLLECTION);
        const newTicketRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["push"])(ticketsRef);
        const newTicket = {
            ...ticket,
            id: newTicketRef.key,
            status: 'OPEN',
            createdAt: new Date().toISOString()
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["set"])(newTicketRef, newTicket);
        return newTicketRef.key;
    } catch (error) {
        console.error("Error submitting support ticket:", error);
        throw error;
    }
};
const subscribeToTickets = (callback)=>{
    const ticketsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], TICKETS_COLLECTION);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onValue"])(ticketsRef, (snapshot)=>{
        if (snapshot.exists()) {
            const data = snapshot.val();
            const ticketsList = Object.values(data);
            // Sort by descending date
            ticketsList.sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            callback(ticketsList);
        } else {
            callback([]);
        }
    });
};
const subscribeToUserTickets = (userId, callback)=>{
    const ticketsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], TICKETS_COLLECTION);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onValue"])(ticketsRef, (snapshot)=>{
        if (snapshot.exists()) {
            const data = snapshot.val();
            const ticketsList = Object.values(data);
            const filtered = ticketsList.filter((t)=>t.userId === userId);
            // Sort by descending date
            filtered.sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            callback(filtered);
        } else {
            callback([]);
        }
    });
};
const updateTicketStatus = async (ticketId, status)=>{
    try {
        const ticketRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], `${TICKETS_COLLECTION}/${ticketId}`);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(ticketRef, {
            status
        });
    } catch (error) {
        console.error("Error updating ticket status:", error);
    }
};
const searchHelpArticles = (query)=>{
    if (!query) return HELP_ARTICLES;
    const lowerQuery = query.toLowerCase();
    return HELP_ARTICLES.filter((article)=>article.title.toLowerCase().includes(lowerQuery) || article.content.toLowerCase().includes(lowerQuery));
};
}),
"[project]/src/lib/gemini.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGeminiResponse",
    ()=>getGeminiResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-ssr] (ecmascript)");
;
const API_KEY = ("TURBOPACK compile-time value", "AIzaSyAYq_EpGYTD9DyPWny5lqccxVBLObIjOvE") || "";
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](API_KEY);
const SYSTEM_PROMPT = `
You are the SpendLogic AI Assistant, a high-level enterprise support specialist for the SpendLogic Spend Management Platform. 
Your goal is to help users navigate the platform, answer technical questions, and troubleshoot issues.

Platform Context:
- SpendLogic is a procure-to-pay solution similar to Procurify.
- Key features: Purchase Requisitions, Purchase Orders (POs), Budget Tracking, 3-Way Matching, Vendor Management, and 2FA Security.
- Security: Users can enable TOTP-based 2FA in Settings > Security.
- Ghana Cedis (GHS) is a supported currency.
- Vendors receive secure links to acknowledge POs.
- Budgets are tracked at the department level.

Tone: Professional, helpful, concise, and enterprise-grade.
If you don't know something about the user's specific private data, explain that you are an AI assistant and they should contact a human specialist for account-specific financial details.
`;
const getGeminiResponse = async (userMessage, history)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const runChat = async (modelId, apiVersion, useSystem)=>{
        try {
            // First attempt with native systemInstruction
            const model = genAI.getGenerativeModel({
                model: modelId,
                ...useSystem ? {
                    systemInstruction: SYSTEM_PROMPT
                } : {}
            }, {
                apiVersion
            });
            const rawHistory = history.map((m)=>({
                    role: m.role === 'AI' ? 'model' : 'user',
                    parts: [
                        {
                            text: m.text
                        }
                    ]
                }));
            const firstUserIdx = rawHistory.findIndex((m)=>m.role === 'user');
            const finalHistory = firstUserIdx !== -1 ? rawHistory.slice(firstUserIdx) : [];
            const chat = model.startChat({
                history: finalHistory,
                generationConfig: {
                    maxOutputTokens: 800
                }
            });
            const result = await chat.sendMessage(userMessage);
            const resp = await result.response;
            return resp.text();
        } catch (error) {
            // If the error is about 'systemInstruction' not being supported (400)
            if (useSystem && (error.message?.includes("systemInstruction") || error.message?.includes("400"))) {
                console.warn(`[SpendLogic AI] systemInstruction failed for ${modelId} (${apiVersion}), retrying with preamble...`);
                // Retry by prepending the system prompt to the user message
                const fallbackModel = genAI.getGenerativeModel({
                    model: modelId
                }, {
                    apiVersion
                });
                const rawHistory = history.map((m)=>({
                        role: m.role === 'AI' ? 'model' : 'user',
                        parts: [
                            {
                                text: m.text
                            }
                        ]
                    }));
                const firstUserIdx = rawHistory.findIndex((m)=>m.role === 'user');
                const finalHistory = firstUserIdx !== -1 ? rawHistory.slice(firstUserIdx) : [];
                const chat = fallbackModel.startChat({
                    history: finalHistory,
                    generationConfig: {
                        maxOutputTokens: 800
                    }
                });
                // Prepend system prompt to guide the AI
                const guideMessage = `System Instruction: ${SYSTEM_PROMPT}\n\nUser Message: ${userMessage}`;
                const result = await chat.sendMessage(guideMessage);
                const resp = await result.response;
                return resp.text();
            }
            throw error;
        }
    };
    // Comprehensive fallback chain: IDs and API Versions
    const configurations = [
        {
            id: "gemini-1.5-flash",
            version: "v1beta",
            system: true
        },
        {
            id: "gemini-1.5-flash",
            version: "v1",
            system: true
        },
        {
            id: "gemini-1.5-pro",
            version: "v1beta",
            system: true
        },
        {
            id: "gemini-pro",
            version: "v1beta",
            system: false
        },
        {
            id: "gemini-pro",
            version: "v1",
            system: false
        }
    ];
    let lastError = "";
    for (const config of configurations){
        try {
            console.log(`[SpendLogic AI] Connecting to ${config.id} via ${config.version}...`);
            return await runChat(config.id, config.version, config.system);
        } catch (error) {
            lastError = error.message || "Unknown error";
            console.warn(`[SpendLogic AI] ${config.id} (${config.version}) failed:`, lastError);
            // 404/not supported or 400 systemInstruction error are retryable fallbacks
            const isRetryable = lastError.includes("404") || lastError.toLowerCase().includes("not found") || lastError.toLowerCase().includes("not supported") || lastError.includes("systemInstruction");
            if (!isRetryable) {
                break;
            }
        }
    }
    return `SpendLogic Assistant is having trouble connecting to its brain (tried multiple endpoints). Last Error: ${lastError}. Please verify your API key and region support.`;
};
}),
"[project]/src/components/layout/Layout.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "actionButton": "Layout-module__e_xTDG__actionButton",
  "actions": "Layout-module__e_xTDG__actions",
  "articleBody": "Layout-module__e_xTDG__articleBody",
  "articleCategory": "Layout-module__e_xTDG__articleCategory",
  "articleItem": "Layout-module__e_xTDG__articleItem",
  "articleLink": "Layout-module__e_xTDG__articleLink",
  "backButton": "Layout-module__e_xTDG__backButton",
  "badge": "Layout-module__e_xTDG__badge",
  "bottomSection": "Layout-module__e_xTDG__bottomSection",
  "breadcrumbActive": "Layout-module__e_xTDG__breadcrumbActive",
  "breadcrumbs": "Layout-module__e_xTDG__breadcrumbs",
  "btnDanger": "Layout-module__e_xTDG__btnDanger",
  "btnFull": "Layout-module__e_xTDG__btnFull",
  "btnOutline": "Layout-module__e_xTDG__btnOutline",
  "cardIcon": "Layout-module__e_xTDG__cardIcon",
  "closeButton": "Layout-module__e_xTDG__closeButton",
  "drawerBackdrop": "Layout-module__e_xTDG__drawerBackdrop",
  "drawerContent": "Layout-module__e_xTDG__drawerContent",
  "drawerFooter": "Layout-module__e_xTDG__drawerFooter",
  "drawerHeader": "Layout-module__e_xTDG__drawerHeader",
  "emptyNotifications": "Layout-module__e_xTDG__emptyNotifications",
  "fadeIn": "Layout-module__e_xTDG__fadeIn",
  "formGroup": "Layout-module__e_xTDG__formGroup",
  "helpCard": "Layout-module__e_xTDG__helpCard",
  "helpDrawer": "Layout-module__e_xTDG__helpDrawer",
  "helpDrawerOpen": "Layout-module__e_xTDG__helpDrawerOpen",
  "helpGrid": "Layout-module__e_xTDG__helpGrid",
  "helpIcon": "Layout-module__e_xTDG__helpIcon",
  "logoContainer": "Layout-module__e_xTDG__logoContainer",
  "logoIcon": "Layout-module__e_xTDG__logoIcon",
  "logoText": "Layout-module__e_xTDG__logoText",
  "logoutIcon": "Layout-module__e_xTDG__logoutIcon",
  "logoutModal": "Layout-module__e_xTDG__logoutModal",
  "menuFadeIn": "Layout-module__e_xTDG__menuFadeIn",
  "menuHeader": "Layout-module__e_xTDG__menuHeader",
  "menuItem": "Layout-module__e_xTDG__menuItem",
  "menuItemDanger": "Layout-module__e_xTDG__menuItemDanger",
  "modalBackdrop": "Layout-module__e_xTDG__modalBackdrop",
  "modalButtons": "Layout-module__e_xTDG__modalButtons",
  "modalScaleUp": "Layout-module__e_xTDG__modalScaleUp",
  "navIcon": "Layout-module__e_xTDG__navIcon",
  "navLink": "Layout-module__e_xTDG__navLink",
  "navLinkActive": "Layout-module__e_xTDG__navLinkActive",
  "notifContent": "Layout-module__e_xTDG__notifContent",
  "notifIcon": "Layout-module__e_xTDG__notifIcon",
  "notifMessage": "Layout-module__e_xTDG__notifMessage",
  "notifTime": "Layout-module__e_xTDG__notifTime",
  "notifTitle": "Layout-module__e_xTDG__notifTitle",
  "notificationDropdown": "Layout-module__e_xTDG__notificationDropdown",
  "notificationFooter": "Layout-module__e_xTDG__notificationFooter",
  "notificationHeader": "Layout-module__e_xTDG__notificationHeader",
  "notificationItem": "Layout-module__e_xTDG__notificationItem",
  "notificationList": "Layout-module__e_xTDG__notificationList",
  "notificationWrapper": "Layout-module__e_xTDG__notificationWrapper",
  "pulse": "Layout-module__e_xTDG__pulse",
  "searchContainer": "Layout-module__e_xTDG__searchContainer",
  "sectionTitle": "Layout-module__e_xTDG__sectionTitle",
  "sidebar": "Layout-module__e_xTDG__sidebar",
  "slideIn": "Layout-module__e_xTDG__slideIn",
  "statusDot": "Layout-module__e_xTDG__statusDot",
  "successMessage": "Layout-module__e_xTDG__successMessage",
  "systemStatus": "Layout-module__e_xTDG__systemStatus",
  "ticketForm": "Layout-module__e_xTDG__ticketForm",
  "topbar": "Layout-module__e_xTDG__topbar",
  "unread": "Layout-module__e_xTDG__unread",
  "unreadDot": "Layout-module__e_xTDG__unreadDot",
  "userAvatar": "Layout-module__e_xTDG__userAvatar",
  "userInfo": "Layout-module__e_xTDG__userInfo",
  "userMenuDropdown": "Layout-module__e_xTDG__userMenuDropdown",
  "userMenuWrapper": "Layout-module__e_xTDG__userMenuWrapper",
  "userName": "Layout-module__e_xTDG__userName",
  "userProfile": "Layout-module__e_xTDG__userProfile",
  "userRole": "Layout-module__e_xTDG__userRole",
});
}),
"[project]/src/components/layout/HelpCenter.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HelpCenter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$help$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/help.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gemini$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gemini.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/components/layout/Layout.module.css [app-ssr] (css module)");
"use client";
;
;
;
;
;
;
function HelpCenter() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('HOME');
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [filteredArticles, setFilteredArticles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$help$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HELP_ARTICLES"]);
    const [selectedArticle, setSelectedArticle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [userTickets, setUserTickets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [ticketForm, setTicketForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        subject: "",
        type: "QUESTION",
        description: ""
    });
    const [chatMessages, setChatMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            role: 'AI',
            text: "Hello! I'm your SpendLogic Assistant. How can I help you navigate the SpendLogic platform today?"
        }
    ]);
    const [chatInput, setChatInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isTyping, setIsTyping] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [submitSuccess, setSubmitSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const drawerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setFilteredArticles((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$help$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["searchHelpArticles"])(searchQuery));
    }, [
        searchQuery
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleOpenEvent = ()=>{
            setIsOpen(true);
            setView('HOME');
        };
        window.addEventListener('open-help-center', handleOpenEvent);
        return ()=>window.removeEventListener('open-help-center', handleOpenEvent);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (user && isOpen && view === 'MY_TICKETS') {
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$help$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subscribeToUserTickets"])(user.uid, (tickets)=>{
                setUserTickets(tickets);
            });
            return ()=>unsubscribe();
        }
    }, [
        user,
        isOpen,
        view
    ]);
    const handleSendMessage = async ()=>{
        if (!chatInput.trim() || isTyping) return;
        const userMsgText = chatInput;
        const newMsg = {
            role: 'USER',
            text: userMsgText
        };
        setChatMessages((prev)=>[
                ...prev,
                newMsg
            ]);
        setChatInput("");
        setIsTyping(true);
        try {
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gemini$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGeminiResponse"])(userMsgText, chatMessages);
            setChatMessages((prev)=>[
                    ...prev,
                    {
                        role: 'AI',
                        text: response
                    }
                ]);
        } catch (error) {
            setChatMessages((prev)=>[
                    ...prev,
                    {
                        role: 'AI',
                        text: "I'm sorry, I'm having trouble responding right now. Please try again later."
                    }
                ]);
        } finally{
            setIsTyping(false);
        }
    };
    const handleSubmitTicket = async (e)=>{
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$help$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["submitSupportTicket"])({
                userId: user.uid,
                userName: user.displayName,
                userEmail: user.email,
                ...ticketForm
            });
            setSubmitSuccess(true);
            setTicketForm({
                subject: "",
                type: "QUESTION",
                description: ""
            });
            setTimeout(()=>{
                setSubmitSuccess(false);
                setIsOpen(false);
            }, 3000);
        } catch (error) {
            alert("Failed to submit ticket. Please try again.");
        } finally{
            setIsSubmitting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].drawerBackdrop,
                onClick: ()=>setIsOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                lineNumber: 97,
                columnNumber: 24
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].helpDrawer} ${isOpen ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].helpDrawerOpen : ''}`,
                ref: drawerRef,
                style: {
                    width: '480px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].drawerHeader,
                        style: {
                            background: 'var(--surface)',
                            border: 'none',
                            padding: '1.5rem 2rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '1.5rem'
                                        },
                                        children: "🤝"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 103,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        style: {
                                            fontSize: '1.25rem',
                                            fontWeight: 900,
                                            margin: 0
                                        },
                                        children: "Support Center"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 104,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                lineNumber: 102,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].closeButton,
                                onClick: ()=>setIsOpen(false),
                                style: {
                                    fontSize: '1.5rem'
                                },
                                children: "✕"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                lineNumber: 106,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                        lineNumber: 101,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].drawerContent,
                        style: {
                            padding: 0
                        },
                        children: [
                            view === 'HOME' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].helpHome,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: 'linear-gradient(180deg, #FCD535 0%, #F0B90B 100%)',
                                            padding: '2.5rem 2rem',
                                            textAlign: 'center',
                                            color: '#1E2329'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                style: {
                                                    fontSize: '1.8rem',
                                                    fontWeight: 900,
                                                    marginBottom: '1.5rem'
                                                },
                                                children: "How can we help?"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 119,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: 'relative',
                                                    maxWidth: '360px',
                                                    margin: '0 auto'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "Search for articles or topics...",
                                                        value: searchQuery,
                                                        style: {
                                                            width: '100%',
                                                            padding: '1rem 3rem 1rem 1.25rem',
                                                            borderRadius: '12px',
                                                            border: 'none',
                                                            fontSize: '0.95rem',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                            color: '#1E2329'
                                                        },
                                                        onChange: (e)=>{
                                                            setSearchQuery(e.target.value);
                                                            if (e.target.value) setView('ARTICLES');
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 125,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            position: 'absolute',
                                                            right: '1.25rem',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            opacity: 0.5
                                                        },
                                                        children: "🔍"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 143,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 120,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 113,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '2rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: '1rem',
                                                    marginBottom: '2rem'
                                                },
                                                children: [
                                                    {
                                                        icon: '📚',
                                                        label: 'Knowledge Base',
                                                        view: 'ARTICLES'
                                                    },
                                                    {
                                                        icon: '💬',
                                                        label: 'Live Support',
                                                        view: 'CHAT'
                                                    },
                                                    {
                                                        icon: '🎫',
                                                        label: 'Submit Ticket',
                                                        view: 'CONTACT'
                                                    },
                                                    {
                                                        icon: '📋',
                                                        label: 'My Requests',
                                                        view: 'MY_TICKETS'
                                                    },
                                                    {
                                                        icon: '🔒',
                                                        label: 'Account Security',
                                                        view: 'ARTICLES'
                                                    },
                                                    {
                                                        icon: '⚡',
                                                        label: 'Quick Tutorials',
                                                        view: 'ARTICLES'
                                                    }
                                                ].map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>setView(item.view),
                                                        style: {
                                                            padding: '1.25rem',
                                                            borderRadius: '16px',
                                                            border: '1px solid var(--border)',
                                                            textAlign: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            background: 'var(--surface)'
                                                        },
                                                        onMouseEnter: (e)=>e.currentTarget.style.borderColor = '#F0B90B',
                                                        onMouseLeave: (e)=>e.currentTarget.style.borderColor = 'var(--border)',
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '1.5rem',
                                                                    marginBottom: '0.5rem'
                                                                },
                                                                children: item.icon
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                lineNumber: 173,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: 700
                                                                },
                                                                children: item.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                lineNumber: 174,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, idx, true, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 41
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 149,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recentArticles,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            marginBottom: '1rem'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                style: {
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: 800
                                                                },
                                                                children: "Trending Topics"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                lineNumber: 182,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '0.75rem',
                                                                    color: '#F0B90B',
                                                                    fontWeight: 700,
                                                                    cursor: 'pointer'
                                                                },
                                                                children: "View All"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                lineNumber: 183,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 181,
                                                        columnNumber: 37
                                                    }, this),
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$help$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HELP_ARTICLES"].slice(0, 4).map((article)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].articleLink,
                                                            onClick: ()=>{
                                                                setSelectedArticle(article);
                                                                setView('ARTICLE_DETAIL');
                                                            },
                                                            style: {
                                                                padding: '0.875rem 0',
                                                                borderBottom: '1px solid rgba(0,0,0,0.03)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '1rem'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        opacity: 0.3,
                                                                        fontSize: '0.7rem'
                                                                    },
                                                                    children: "●"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                    lineNumber: 190,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        flex: 1
                                                                    },
                                                                    children: article.title
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                    lineNumber: 191,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        opacity: 0.3
                                                                    },
                                                                    children: "›"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                    lineNumber: 192,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, article.id, true, {
                                                            fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                            lineNumber: 186,
                                                            columnNumber: 41
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 180,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 148,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                lineNumber: 111,
                                columnNumber: 25
                            }, this),
                            (view === 'ARTICLES' || searchQuery) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].articleList,
                                style: {
                                    padding: '2rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].backButton,
                                        onClick: ()=>{
                                            setView('HOME');
                                            setSearchQuery("");
                                        },
                                        style: {
                                            marginBottom: '1.5rem',
                                            color: '#F0B90B',
                                            fontWeight: 700
                                        },
                                        children: "← Back to Support"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 202,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '1.25rem',
                                            fontWeight: 900,
                                            marginBottom: '1.5rem'
                                        },
                                        children: searchQuery ? `Results for "${searchQuery}"` : 'Knowledge Base'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 206,
                                        columnNumber: 29
                                    }, this),
                                    filteredArticles.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            textAlign: 'center',
                                            padding: '3rem 1rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '3rem',
                                                    marginBottom: '1rem'
                                                },
                                                children: "🔦"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 209,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    color: 'var(--text-secondary)'
                                                },
                                                children: "No articles found. Try different keywords."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 210,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 208,
                                        columnNumber: 33
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.75rem'
                                        },
                                        children: filteredArticles.map((article)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].articleItem,
                                                onClick: ()=>{
                                                    setSelectedArticle(article);
                                                    setView('ARTICLE_DETAIL');
                                                },
                                                style: {
                                                    padding: '1.25rem',
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--border)',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                },
                                                onMouseEnter: (e)=>e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)',
                                                onMouseLeave: (e)=>e.currentTarget.style.backgroundColor = 'transparent',
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '0.7rem',
                                                            color: '#F0B90B',
                                                            fontWeight: 800,
                                                            marginBottom: '0.25rem'
                                                        },
                                                        children: article.category.toUpperCase()
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 232,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: 700,
                                                            fontSize: '0.95rem'
                                                        },
                                                        children: article.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 233,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, article.id, true, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 215,
                                                columnNumber: 41
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 213,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                lineNumber: 201,
                                columnNumber: 25
                            }, this),
                            view === 'ARTICLE_DETAIL' && selectedArticle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].articleDetail,
                                style: {
                                    padding: '2rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].backButton,
                                        onClick: ()=>setView('ARTICLES'),
                                        style: {
                                            color: '#F0B90B',
                                            fontWeight: 700
                                        },
                                        children: "← Back"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 243,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: '2rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '0.75rem',
                                                    color: '#F0B90B',
                                                    fontWeight: 800,
                                                    letterSpacing: '0.05em'
                                                },
                                                children: selectedArticle.category.toUpperCase()
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 245,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                style: {
                                                    fontSize: '1.75rem',
                                                    fontWeight: 900,
                                                    margin: '0.75rem 0 1.5rem 0',
                                                    lineHeight: 1.2
                                                },
                                                children: selectedArticle.title
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 246,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '1rem',
                                                    lineHeight: 1.6,
                                                    color: 'var(--text-main)',
                                                    background: 'var(--background)',
                                                    padding: '1.5rem',
                                                    borderRadius: '16px',
                                                    border: '1px solid var(--border)'
                                                },
                                                children: selectedArticle.content
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 247,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: '2.5rem',
                                                    padding: '1.5rem',
                                                    borderRadius: '12px',
                                                    background: 'rgba(0,0,0,0.02)',
                                                    textAlign: 'center'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: '0.9rem',
                                                            marginBottom: '1rem',
                                                            fontWeight: 600
                                                        },
                                                        children: "Was this article helpful?"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 259,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            gap: '1rem'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn",
                                                                style: {
                                                                    padding: '0.5rem 1.5rem',
                                                                    border: '1px solid var(--border)'
                                                                },
                                                                children: "👍 Yes"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                lineNumber: 261,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn",
                                                                style: {
                                                                    padding: '0.5rem 1.5rem',
                                                                    border: '1px solid var(--border)'
                                                                },
                                                                children: "👎 No"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                lineNumber: 262,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 260,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 258,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 244,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                lineNumber: 242,
                                columnNumber: 25
                            }, this),
                            view === 'CONTACT' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].contactSupport,
                                style: {
                                    padding: '2rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].backButton,
                                        onClick: ()=>setView('HOME'),
                                        style: {
                                            color: '#F0B90B',
                                            fontWeight: 700
                                        },
                                        children: "← Back"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 271,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        style: {
                                            fontSize: '1.5rem',
                                            fontWeight: 900,
                                            margin: '1.5rem 0 0.5rem 0'
                                        },
                                        children: "Submit Request"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 272,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            color: 'var(--text-secondary)',
                                            marginBottom: '2rem',
                                            fontSize: '0.9rem'
                                        },
                                        children: "Our specialists typically respond within 12-24 hours."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 273,
                                        columnNumber: 29
                                    }, this),
                                    submitSuccess ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            textAlign: 'center',
                                            padding: '3rem 1rem',
                                            background: 'rgba(4, 156, 99, 0.05)',
                                            borderRadius: '24px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '4rem',
                                                    marginBottom: '1.5rem'
                                                },
                                                children: "✅"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 279,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontWeight: 900,
                                                    marginBottom: '0.5rem'
                                                },
                                                children: "Ticket Received"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 280,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.9rem'
                                                },
                                                children: "We've assigned a specialist to your case."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 281,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 278,
                                        columnNumber: 33
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].ticketForm,
                                        onSubmit: handleSubmitTicket,
                                        style: {
                                            gap: '1.25rem',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            fontWeight: 700
                                                        },
                                                        children: "Subject"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 286,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        required: true,
                                                        style: {
                                                            borderRadius: '10px'
                                                        },
                                                        placeholder: "Briefly describe your issue",
                                                        value: ticketForm.subject,
                                                        onChange: (e)=>setTicketForm({
                                                                ...ticketForm,
                                                                subject: e.target.value
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 287,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 285,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            fontWeight: 700
                                                        },
                                                        children: "Issue Category"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 296,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        style: {
                                                            borderRadius: '10px'
                                                        },
                                                        value: ticketForm.type,
                                                        onChange: (e)=>setTicketForm({
                                                                ...ticketForm,
                                                                type: e.target.value
                                                            }),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "QUESTION",
                                                                children: "Account Inquiry"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                lineNumber: 302,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "BUG",
                                                                children: "Technical Issue"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                lineNumber: 303,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "FEATURE_REQUEST",
                                                                children: "Feature Suggestion"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                lineNumber: 304,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 297,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 295,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            fontWeight: 700
                                                        },
                                                        children: "Detailed Description"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 308,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        required: true,
                                                        rows: 4,
                                                        style: {
                                                            borderRadius: '10px'
                                                        },
                                                        placeholder: "Provide as much detail as possible...",
                                                        value: ticketForm.description,
                                                        onChange: (e)=>setTicketForm({
                                                                ...ticketForm,
                                                                description: e.target.value
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 309,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 307,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                className: "btn btn-primary",
                                                style: {
                                                    width: '100%',
                                                    padding: '1rem',
                                                    background: '#F0B90B',
                                                    border: 'none',
                                                    color: '#1E2329',
                                                    fontWeight: 800
                                                },
                                                disabled: isSubmitting,
                                                children: isSubmitting ? 'Processing...' : 'Submit Request'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 318,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 284,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                lineNumber: 270,
                                columnNumber: 25
                            }, this),
                            view === 'CHAT' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '1rem 2rem',
                                            borderBottom: '1px solid var(--border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setView('HOME'),
                                                style: {
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '1.2rem'
                                                },
                                                children: "←"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 329,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: 'relative'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            background: '#F0B90B',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        },
                                                        children: "🤖"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 331,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            right: 0,
                                                            width: '10px',
                                                            height: '10px',
                                                            background: '#049C63',
                                                            borderRadius: '50%',
                                                            border: '2px solid white'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 332,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 330,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: 800,
                                                            fontSize: '0.9rem'
                                                        },
                                                        children: "SpendLogic AI Assistant"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 335,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '0.7rem',
                                                            color: 'var(--text-secondary)'
                                                        },
                                                        children: "Online • Instant Response"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 336,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 334,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 328,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1,
                                            padding: '2rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1.5rem',
                                            background: 'rgba(0,0,0,0.01)',
                                            overflowY: 'auto'
                                        },
                                        children: [
                                            chatMessages.map((msg, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        alignSelf: msg.role === 'AI' ? 'flex-start' : 'flex-end',
                                                        background: msg.role === 'AI' ? 'white' : '#F0B90B',
                                                        color: msg.role === 'AI' ? '#1E2329' : '#1E2329',
                                                        padding: '1rem',
                                                        borderRadius: msg.role === 'AI' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                                                        maxWidth: '85%',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: msg.role === 'USER' ? 600 : 400
                                                    },
                                                    children: msg.text
                                                }, i, false, {
                                                    fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                    lineNumber: 342,
                                                    columnNumber: 37
                                                }, this)),
                                            isTyping && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    alignSelf: 'flex-start',
                                                    background: 'white',
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '16px 16px 16px 4px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                    display: 'flex',
                                                    gap: '4px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].dot,
                                                        style: {
                                                            width: '6px',
                                                            height: '6px',
                                                            backgroundColor: '#F0B90B',
                                                            borderRadius: '50%',
                                                            animation: 'bounce 1s infinite'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 366,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].dot,
                                                        style: {
                                                            width: '6px',
                                                            height: '6px',
                                                            backgroundColor: '#F0B90B',
                                                            borderRadius: '50%',
                                                            animation: 'bounce 1s infinite 0.2s'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 367,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].dot,
                                                        style: {
                                                            width: '6px',
                                                            height: '6px',
                                                            backgroundColor: '#F0B90B',
                                                            borderRadius: '50%',
                                                            animation: 'bounce 1s infinite 0.4s'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 368,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 357,
                                                columnNumber: 37
                                            }, this),
                                            view === 'CHAT' && chatMessages.length === 1 && !isTyping && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '0.5rem'
                                                },
                                                children: [
                                                    'Reset 2FA',
                                                    'Login Issues',
                                                    'Contact Specialist'
                                                ].map((q)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            setChatInput(q);
                                                        // Note: useEffect or manual trigger would handle this better
                                                        },
                                                        style: {
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '20px',
                                                            border: '1px solid #F0B90B',
                                                            background: 'white',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            color: '#F0B90B',
                                                            cursor: 'pointer'
                                                        },
                                                        children: q
                                                    }, q, false, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 374,
                                                        columnNumber: 45
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 372,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 340,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '1.5rem 2rem',
                                            borderTop: '1px solid var(--border)',
                                            background: 'white',
                                            display: 'flex',
                                            gap: '1rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                placeholder: isTyping ? "AI is thinking..." : "Type your message...",
                                                value: chatInput,
                                                disabled: isTyping,
                                                onChange: (e)=>setChatInput(e.target.value),
                                                onKeyDown: (e)=>e.key === 'Enter' && handleSendMessage(),
                                                style: {
                                                    flex: 1,
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--border)',
                                                    fontSize: '0.9rem',
                                                    opacity: isTyping ? 0.6 : 1
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 390,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleSendMessage,
                                                disabled: isTyping,
                                                className: "btn btn-primary",
                                                style: {
                                                    background: '#F0B90B',
                                                    border: 'none',
                                                    width: '45px',
                                                    height: '45px',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    opacity: isTyping ? 0.6 : 1
                                                },
                                                children: "➤"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 398,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 389,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                lineNumber: 327,
                                columnNumber: 25
                            }, this),
                            view === 'MY_TICKETS' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '2rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].backButton,
                                        onClick: ()=>setView('HOME'),
                                        style: {
                                            color: '#F0B90B',
                                            fontWeight: 700
                                        },
                                        children: "← Back"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 412,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        style: {
                                            fontSize: '1.5rem',
                                            fontWeight: 900,
                                            margin: '1.5rem 0 1.5rem 0'
                                        },
                                        children: user ? 'My Requests' : 'Support Tickets'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 413,
                                        columnNumber: 29
                                    }, this),
                                    !user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            textAlign: 'center',
                                            padding: '3rem 1rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '3rem',
                                                    marginBottom: '1rem'
                                                },
                                                children: "🔐"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 417,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    color: 'var(--text-secondary)'
                                                },
                                                children: "Please sign in to view your support history and track active requests."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 418,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 416,
                                        columnNumber: 33
                                    }, this) : userTickets.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            textAlign: 'center',
                                            padding: '3rem 1rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '3rem',
                                                    marginBottom: '1rem'
                                                },
                                                children: "🎫"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 422,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    color: 'var(--text-secondary)'
                                                },
                                                children: "You haven't submitted any tickets yet."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 423,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn",
                                                onClick: ()=>setView('CONTACT'),
                                                style: {
                                                    marginTop: '1rem',
                                                    color: '#F0B90B',
                                                    fontWeight: 700
                                                },
                                                children: "Submit Your First Ticket"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 424,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 421,
                                        columnNumber: 33
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem'
                                        },
                                        children: userTickets.map((ticket)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '1.25rem',
                                                    borderRadius: '16px',
                                                    border: '1px solid var(--border)',
                                                    background: 'var(--surface)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'flex-start',
                                                            marginBottom: '0.5rem'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontWeight: 800,
                                                                    fontSize: '0.95rem'
                                                                },
                                                                children: ticket.subject
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                lineNumber: 436,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '0.65rem',
                                                                    fontWeight: 900,
                                                                    padding: '2px 8px',
                                                                    borderRadius: '10px',
                                                                    background: ticket.status === 'OPEN' ? 'rgba(4, 156, 99, 0.1)' : 'rgba(0,0,0,0.05)',
                                                                    color: ticket.status === 'OPEN' ? '#049C63' : 'var(--text-secondary)'
                                                                },
                                                                children: ticket.status
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                                lineNumber: 437,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 435,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: '0.85rem',
                                                            color: 'var(--text-secondary)',
                                                            margin: '0 0 1rem 0'
                                                        },
                                                        children: [
                                                            ticket.description.substring(0, 100),
                                                            "..."
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 448,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '0.7rem',
                                                            color: 'var(--text-secondary)',
                                                            fontWeight: 500
                                                        },
                                                        children: [
                                                            "Submitted on ",
                                                            new Date(ticket.createdAt).toLocaleDateString()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                        lineNumber: 449,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, ticket.id, true, {
                                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                                lineNumber: 429,
                                                columnNumber: 41
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                        lineNumber: 427,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                lineNumber: 411,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                        lineNumber: 109,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].drawerFooter,
                        style: {
                            textAlign: 'center',
                            padding: '1rem'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--text-secondary)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: '#049C63'
                                    },
                                    children: "●"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/layout/HelpCenter.tsx",
                                    lineNumber: 462,
                                    columnNumber: 25
                                }, this),
                                " System Status: All Systems Operational"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/layout/HelpCenter.tsx",
                            lineNumber: 461,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/HelpCenter.tsx",
                        lineNumber: 460,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/HelpCenter.tsx",
                lineNumber: 100,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b05330e6._.js.map