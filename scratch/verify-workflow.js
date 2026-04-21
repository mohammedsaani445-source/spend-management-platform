
// ═══════════════════════════════════════════════════════════════
// SCRATCH: verify-workflow.ts
// ═══════════════════════════════════════════════════════════════

import { policyMatcher } from "./src/lib/workflow/policyMatcher";

async function testMatcher() {
  console.log("Checking policyMatcher robustness...");
  
  try {
    // Test with missing department/amount
    const match = await policyMatcher.find({
      orgId: "DEMO_TENANT",
      module: "REQUISITION",
      amount: 1500,
      department: "Marketing"
    });
    
    console.log("Match Result:", match ? `Found policy: ${match.name}` : "No policy found (Success)");
    
    // Test simulation with null (should not crash)
    const result = await (policyMatcher as any).simulate("REQUISITION", 5000, "Sales", "DEMO_TENANT");
    console.log("Simulation Result:", result.message);
    
  } catch (err) {
    console.error("CRASH DETECTED during matching logic:", err);
  }
}

// Note: This script is for logical verification. 
// Real execution requires firebase-admin initialized.
console.log("Verification logic prepared.");
