const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

const serviceAccount = require("./src/lib/service-account.json");

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
        databaseURL: "https://spend-management-platform-default-rtdb.firebaseio.com"
    });
}

const db = getDatabase();

async function run() {
    const tenantsRef = db.ref("ApexProcure/tenants");
    const snap = await tenantsRef.once("value");
    if (!snap.exists()) {
        console.log("No tenants found");
        return;
    }
    const val = snap.val();
    for (const tenantId in val) {
        console.log(`\nTenant: ${tenantId}`);
        const users = val[tenantId].users;
        if (users) {
            for (const uid in users) {
                console.log(`  User: ${uid} | Name: ${users[uid].name} | Role: ${users[uid].role}`);
            }
        }
    }
    process.exit(0);
}

run().catch(console.error);
