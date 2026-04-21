import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Seeds the default approval policies on new organization creation.
 */
export async function seedDefaultPolicies(orgId: string, createdBy: string = 'system') {
  console.log(`[Seed] Creating default approval policies for org ${orgId}`);

  const defaults = [
    {
      name:        "Standard Requisition Approval",
      description: "Default flow for routine requisitions",
      module:      "REQUISITION" as const,
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
      module:      "PURCHASE_ORDER" as const,
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
      description: "Three-tier sign-off for orders exceeding GHS 100,000",
      module:      "PURCHASE_ORDER" as const,
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
      description:       "Auto-approved for amounts below threshold",
      module:            "INVOICE" as const,
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
      module:      "CONTRACT" as const,
      amount_min:  0,
      amount_max:  999999999,
      active:      false,
      priority:    1,
      steps: [
        { step_number: 1, role: "proc_mgr",    role_label: "Procurement Manager", sla_days: 3, is_parallel: true },
        { step_number: 2, role: "finance_mgr", role_label: "Finance Manager",     sla_days: 3, is_parallel: true },
        { step_number: 3, role: "cfo",         role_label: "CFO / Executive",     sla_days: 5 },
      ],
    },
  ];

  for (const policy of defaults) {
    const { steps, ...policyData } = policy as any;

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

  console.log(`[Seed] Done — Default policies created for org ${orgId}`);
}
