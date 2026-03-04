const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

const firebaseConfig = {
    apiKey: "AIzaSyBTj9jFKQlLuJD7U_Pu8BKXC_iVni7dzPY",
    authDomain: "spend-management-platform.firebaseapp.com",
    databaseURL: "https://spend-management-platform-default-rtdb.firebaseio.com",
    projectId: "spend-management-platform",
    storageBucket: "spend-management-platform.firebasestorage.app",
    messagingSenderId: "357613361639",
    appId: "1:357613361639:web:4d6c518be69a8969120542",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function wipe() {
    console.log("!!! PLATFORM RESET IN PROGRESS !!!");
    try {
        await set(ref(db, '/'), null);
        console.log(">>> DATABASE WIPED CLEAN.");

        await set(ref(db, 'meta/status'), {
            isFresh: true,
            resetAt: new Date().toISOString(),
            message: "Platform Reset to Factory Settings"
        });
        console.log(">>> Factory Reset Successful.");
        process.exit(0);
    } catch (error) {
        console.error(">>> RESET FAILED:", error);
        process.exit(1);
    }
}

wipe();
