const { adminDb } = require('./src/lib/firebaseAdmin');

async function test() {
  try {
    console.log("Checking connection...");
    const snap = await adminDb.ref('.info/connected').once('value');
    console.log("Connected:", snap.val());
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err.message);
    process.exit(1);
  }
}

test();
