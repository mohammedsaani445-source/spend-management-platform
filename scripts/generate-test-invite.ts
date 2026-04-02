import { adminDb } from "../src/lib/firebaseAdmin";
import { DB_PREFIX } from "../src/lib/firebase";
import crypto from "crypto";

async function createTestInvite() {
  const tenantId = "test-tenant-123";
  const token = "test-token-" + crypto.randomBytes(4).toString('hex');
  const inviteId = "test-invite-id";
  
  const invite = {
    id: inviteId,
    org_id: tenantId,
    token: token,
    code: "AP-123456",
    invited_name: "Test User",
    invited_email: "test-user@example.com",
    role: "ADMIN",
    department: "Engineering",
    expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    used: false,
    created_by: "system",
    created_at: new Date().toISOString()
  };

  const updates: any = {};
  updates[`${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}`] = invite;
  updates[`${DB_PREFIX}/inviteTokens/${token}`] = { tenantId, inviteId };

  console.log(`Creating test invite at ${DB_PREFIX}...`);
  await adminDb.ref().update(updates);
  
  console.log("\n--- TEST LINK GENERATED ---");
  console.log(`http://localhost:3000/activate?token=${token}`);
  console.log("---------------------------\n");
  
  process.exit(0);
}

createTestInvite().catch(err => {
  console.error(err);
  process.exit(1);
});
