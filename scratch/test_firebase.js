const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const envFile = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envFile, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let key = match[1];
        let value = (match[2] || '').trim().replace(/^["']|["']$/g, '');
        env[key] = value;
    }
});

const projectId = env.FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
let privateKey = (env.FIREBASE_PRIVATE_KEY || "")
    .replace(/\\n/g, '\n')
    .trim();
if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
}

// THE CRITICAL CHECK: Try multiple URLs if the first one fails
const dbUrls = [
    env.FIREBASE_DATABASE_URL,
    `https://${projectId}-default-rtdb.firebaseio.com`,
    `https://${projectId}.firebaseio.com`,
    `https://${projectId}-default-rtdb.europe-west1.firebasedatabase.app`,
    `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`
].filter(Boolean);

async function testUrl(url) {
    console.log(`\n--- Testing URL: ${url} ---`);
    let app;
    try {
        app = admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
            databaseURL: url
        }, "test-" + Math.random());

        console.log("Trying to read root path '/'...");
        // A real read will reveal if the URL/Auth is correct
        const snapshot = await app.database().ref("/").limitToFirst(1).once("value");
        console.log("✅ SUCCESS! Read data from:", url);
        return true;
    } catch (e) {
        console.log(`❌ FAILED: ${url}`);
        console.log(`   Error: ${e.message}`);
        return false;
    } finally {
        if (app) await app.delete();
    }
}

async function run() {
    for (const url of dbUrls) {
        if (await testUrl(url)) {
            console.log("\nFound working URL:", url);
            console.log("UPDATE YOUR .env.local FIREBASE_DATABASE_URL TO THIS!");
            process.exit(0);
        }
    }
    console.log("\n❌ All known URL patterns failed. Please check your Firebase Console for the correct Realtime Database URL.");
    process.exit(1);
}

run();
