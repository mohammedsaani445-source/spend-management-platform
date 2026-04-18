// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/seed.js
// Seeds the 5 default approval policies on new org creation
// Call this once when a new org signs up
// ═══════════════════════════════════════════════════════════════
import { prisma } from "@/lib/prisma";

export async function seedDefaultPolicies(orgId, createdBy) {
  console.log(`[Seed] Creating default approval policies for org ${orgId}`);

  const defaults = [
    {
      name:        "Standard Requisition Approval",
      description: "Default flow for routine requisitions under GHS 10,000",
      module:      "REQUISITION",
      amount_min:  0,
      amount_max:  10000,
      active:      true,
      priority:    1,
      steps: [
        { step_number: 1, role: "dept_head",    role_label: "Department Head",     sla_days: 2 },
        { step_number: 2, role: "proc_officer", role_label: "Procurement Officer", sla_days: 1 },
      ],
    },
    {
      name:        "High-Value PO Approval",
      description: "Multi-level approval for high-value purchase orders",
      module:      "PURCHASE_ORDER",
      amount_min:  10000,
      amount_max:  100000,
      active:      true,
      priority:    2,
      steps: [
        { step_number: 1, role: "proc_mgr",    role_label: "Procurement Manager", sla_days: 2 },
        { step_number: 2, role: "finance_mgr", role_label: "Finance Manager",     sla_days: 1 },
      ],
    },
    {
      name:        "Executive PO Sign-Off",
      description: "Three-tier sign-off for all orders exceeding GHS 100,000",
      module:      "PURCHASE_ORDER",
      amount_min:  100000,
      amount_max:  999999999,
      active:      true,
      priority:    3,
      steps: [
        { step_number: 1, role: "proc_mgr",    role_label: "Procurement Manager", sla_days: 2 },
        { step_number: 2, role: "finance_mgr", role_label: "Finance Manager",     sla_days: 2 },
        { step_number: 3, role: "cfo",         role_label: "CFO / Executive",     sla_days: 3 },
      ],
    },
    {
      name:              "Invoice Fast-Track",
      description:       "Invoices under GHS 1,000 auto-approved after 3-way match passes",
      module:            "INVOICE",
      amount_min:        0,
      amount_max:        5000,
      auto_approve:      true,
      auto_approve_limit: 1000,
      active:            true,
      priority:          1,
      steps: [
        { step_number: 1, role: "ap_officer", role_label: "AP Officer", sla_days: 1 },
      ],
    },
    {
      name:        "Contract Review & Sign",
      description: "Parallel legal + finance review then executive sign-off",
      module:      "CONTRACT",
      amount_min:  0,
      amount_max:  999999999,
      active:      false,  // Inactive by default
      priority:    1,
      steps: [
        { step_number: 1, role: "proc_mgr",    role_label: "Procurement Manager", sla_days: 3, is_parallel: true },
        { step_number: 2, role: "finance_mgr", role_label: "Finance Manager",     sla_days: 3, is_parallel: true },
        { step_number: 3, role: "cfo",         role_label: "CFO / Executive",     sla_days: 5 },
      ],
    },
  ];

  for (const policy of defaults) {
    const { steps, ...policyData } = policy;

    const created = await prisma.approvalPolicy.create({
      data: {
        ...policyData,
        org_id:     orgId,
        created_by: createdBy,
        steps: {
          create: steps,
        },
      },
    });

    console.log(`[Seed] Created policy: "${created.name}" (${created.id})`);
  }

  console.log(`[Seed] Done — 5 default policies created for org ${orgId}`);
}
