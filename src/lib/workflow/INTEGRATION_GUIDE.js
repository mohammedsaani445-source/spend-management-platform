// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/INTEGRATION_GUIDE.js
//
// HOW TO CONNECT EVERY MODULE TO THE WORKFLOW ENGINE
// Copy the relevant snippet into each module's submit handler
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// REQUISITIONS
// Where: app/api/requisitions/route.js — POST handler
// ─────────────────────────────────────────────────────────────
/*
import { WorkflowEngine } from "@/lib/workflow/engine";

// When user clicks "Submit Requisition":
export async function POST(request) {
  const session = await getServerSession(authOptions);
  const body    = await request.json();

  // 1. Save the requisition as DRAFT first
  const requisition = await prisma.requisition.create({
    data: {
      ...body,
      org_id:     session.user.orgId,
      created_by: session.user.id,
      status:     "DRAFT",
      ref:        await generateRef(session.user.orgId, "PR"),
    },
  });

  // 2. Submit to workflow engine
  const workflowResult = await WorkflowEngine.submit(
    {
      module:      "REQUISITION",
      entityId:    requisition.id,
      entityRef:   requisition.ref,
      entityTitle: body.title || body.description,
      amount:      body.total_amount,
      currency:    body.currency || "GHS",
      department:  body.department,
      source:      "USER",
    },
    {
      userId:   session.user.id,
      userName: session.user.name,
      orgId:    session.user.orgId,
      role:     session.user.role,
    }
  );

  // 3. Return result to frontend
  return NextResponse.json({
    requisition,
    workflow: workflowResult,
    // workflowResult.status will be:
    // "PENDING"       → needs approvals
    // "AUTO_APPROVED" → was below auto-approve threshold
    // "NO_POLICY"     → no matching policy, escalated to superuser
  });
}
*/

// ─────────────────────────────────────────────────────────────
// PURCHASE ORDERS
// Where: app/api/purchase-orders/route.js
// ─────────────────────────────────────────────────────────────
/*
  const workflowResult = await WorkflowEngine.submit(
    {
      module:      "PURCHASE_ORDER",
      entityId:    purchaseOrder.id,
      entityRef:   purchaseOrder.po_ref,
      entityTitle: `PO for ${vendor.name}`,
      amount:      purchaseOrder.amount,
      currency:    purchaseOrder.currency,
      department:  purchaseOrder.department,
      source:      "USER",
    },
    context
  );
*/

// ─────────────────────────────────────────────────────────────
// INVOICES
// Where: app/api/invoices/route.js — when invoice is recorded
// ─────────────────────────────────────────────────────────────
/*
  const workflowResult = await WorkflowEngine.submit(
    {
      module:      "INVOICE",
      entityId:    invoice.id,
      entityRef:   invoice.invoice_ref,
      entityTitle: `Invoice from ${vendor.name}`,
      amount:      invoice.amount,
      currency:    invoice.currency,
      department:  invoice.department,
      source:      "USER",
    },
    context
  );
*/

// ─────────────────────────────────────────────────────────────
// PAYMENTS
// Where: app/api/payments/route.js
// ─────────────────────────────────────────────────────────────
/*
  const workflowResult = await WorkflowEngine.submit(
    {
      module:      "PAYMENT",
      entityId:    payment.id,
      entityRef:   payment.payment_ref,
      entityTitle: `Payment to ${vendor.name}`,
      amount:      payment.amount,
      currency:    payment.currency,
      department:  payment.department,
      source:      "USER",
    },
    context
  );
*/

// ─────────────────────────────────────────────────────────────
// CONTRACTS
// Where: app/api/contracts/route.js
// ─────────────────────────────────────────────────────────────
/*
  const workflowResult = await WorkflowEngine.submit(
    {
      module:      "CONTRACT",
      entityId:    contract.id,
      entityRef:   contract.contract_ref,
      entityTitle: contract.title,
      amount:      contract.value,
      currency:    contract.currency,
      department:  contract.department,
      source:      "USER",
    },
    context
  );
*/

// ─────────────────────────────────────────────────────────────
// VENDORS
// Where: app/api/vendors/route.js — when new vendor is onboarded
// ─────────────────────────────────────────────────────────────
/*
  const workflowResult = await WorkflowEngine.submit(
    {
      module:      "VENDOR",
      entityId:    vendor.id,
      entityRef:   vendor.vendor_ref,
      entityTitle: vendor.name,
      amount:      0,
      currency:    "GHS",
      department:  "Procurement",
      source:      "USER",
    },
    context
  );
*/

// ─────────────────────────────────────────────────────────────
// TENDERS / RFQs
// Where: app/api/tenders/route.js
// ─────────────────────────────────────────────────────────────
/*
  const workflowResult = await WorkflowEngine.submit(
    {
      module:      "TENDER",
      entityId:    tender.id,
      entityRef:   tender.tender_ref,
      entityTitle: tender.title,
      amount:      tender.estimated_value,
      currency:    tender.currency,
      department:  tender.department,
      source:      "USER",
    },
    context
  );
*/

// ─────────────────────────────────────────────────────────────
// APPROVALS PAGE — handle approve/reject button clicks
// Where: app/api/approvals/[id]/route.js
// ─────────────────────────────────────────────────────────────
/*
import { WorkflowEngine } from "@/lib/workflow/engine";

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  const { decision, comment } = await request.json();
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  const result = await WorkflowEngine.decide(
    params.id,          // requestId
    session.user.id,    // approverId
    decision,           // "APPROVED" or "REJECTED"
    comment,            // optional comment
    { ipAddress: ip, userAgent: request.headers.get("user-agent") }
  );

  return NextResponse.json(result);
}
*/

// ─────────────────────────────────────────────────────────────
// FRONTEND: Submit button on Requisition form
// Where: components/requisitions/NewRequisitionForm.jsx
// ─────────────────────────────────────────────────────────────
/*
import { useWorkflow } from "@/hooks/useWorkflow";

function NewRequisitionForm() {
  const { submit, loading, error, result } = useWorkflow();

  const handleSubmit = async (formData) => {
    try {
      const workflowResult = await submit({
        module:      "REQUISITION",
        entityId:    formData.id,
        entityRef:   formData.ref,
        entityTitle: formData.title,
        amount:      formData.total_amount,
        currency:    "GHS",
        department:  formData.department,
        source:      "USER",
      });

      if (workflowResult.status === "AUTO_APPROVED") {
        toast.success("Requisition auto-approved ✓");
      } else if (workflowResult.status === "PENDING") {
        toast.info(`Submitted for approval. ${workflowResult.nextApprover} has been notified.`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ...form fields... */}
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit for Approval"}
      </button>

      {/* Show workflow status after submit */}
      {result && (
        <div className="workflow-status">
          <p>{result.message}</p>
          {result.totalSteps && (
            <p>Requires {result.totalSteps} approval(s) — next: {result.nextApprover}</p>
          )}
        </div>
      )}
    </form>
  );
}
*/

// ─────────────────────────────────────────────────────────────
// FRONTEND: Approve/Reject buttons on Approvals page
// Where: components/approvals/ApprovalCard.jsx
// ─────────────────────────────────────────────────────────────
/*
import { useWorkflow } from "@/hooks/useWorkflow";

function ApprovalCard({ request }) {
  const { decide, loading } = useWorkflow();
  const [comment, setComment] = useState("");

  const handleApprove = async () => {
    const result = await decide(request.requestId, "APPROVED", comment);
    if (result.status === "FULLY_APPROVED") {
      toast.success(`${request.entityRef} fully approved and executed! ✓`);
    } else if (result.status === "IN_PROGRESS") {
      toast.success(`Step approved. Next: ${result.nextRole}`);
    }
  };

  const handleReject = async () => {
    if (!comment) { alert("Please provide a reason for rejection"); return; }
    const result = await decide(request.requestId, "REJECTED", comment);
    toast.error(`${request.entityRef} rejected. Requester notified.`);
  };

  return (
    <div className="approval-card">
      <h3>{request.entityRef} — {request.entityTitle}</h3>
      <p>Amount: GHS {request.amount?.toLocaleString()}</p>
      <p>Step {request.stepNumber} of {request.totalSteps}</p>
      <p>Requested by: {request.requesterName}</p>
      {request.isOverdue && <span className="overdue"> {request.hoursOverdue}h overdue</span>}
      {request.triggeredBy === "AI" && <span className="ai-badge"> AI-triggered</span>}

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Add a comment (required for rejection)"
      />

      <button onClick={handleApprove} disabled={loading}>Approve ✓</button>
      <button onClick={handleReject}  disabled={loading}>Reject ✗</button>
    </div>
  );
}
*/

// ─────────────────────────────────────────────────────────────
// AI ANALYST — how the AI triggers workflow
// Where: app/api/ai/command/route.js
// ─────────────────────────────────────────────────────────────
/*
import { aiGateway } from "@/lib/workflow/aiGateway";

// When AI Analyst wants to create a PO:
const aiResult = await aiGateway.executeCommand(
  {
    id:         "ai_cmd_001",
    intent:     "CREATE_PURCHASE_ORDER",
    entityData: {
      vendor_id:  "vendor_123",
      amount:     50000,
      currency:   "GHS",
      department: "IT",
      title:      "Server hardware upgrade",
      items:      [],
    },
    reasoning:  "Based on approved requisition PR-2026-0041 and budget availability",
    confidence: 0.95,
  },
  context  // { userId, userName, orgId, role }
);

// The AI should tell the user:
// aiResult.aiResponse → "I have submitted PO-2026-0042 for approval.
//                        It requires 2 approval(s) — first up is the
//                        Finance Manager. I will notify you once approved."
*/

// ─────────────────────────────────────────────────────────────
// NEW ORG SETUP — seed policies when org is created
// Where: app/api/organisations/route.js — POST handler
// ─────────────────────────────────────────────────────────────
/*
import { seedDefaultPolicies } from "@/lib/workflow/seed";

// After creating the org and the first superuser:
await seedDefaultPolicies(org.id, superuser.id);
*/

// ─────────────────────────────────────────────────────────────
// VERCEL.JSON — add cron job for SLA checks
// ─────────────────────────────────────────────────────────────
/*
{
  "crons": [
    {
      "path": "/api/cron/workflow-sla",
      "schedule": "0 * * * *"
    }
  ]
}

// Also add to .env.local:
// CRON_SECRET=your-random-secret-here-at-least-32-chars
*/

// ─────────────────────────────────────────────────────────────
// FILE STRUCTURE — COMPLETE ENGINE
// ─────────────────────────────────────────────────────────────
/*
src/
├── lib/
│   ├── prisma.ts                          ← Firebase RTDB adapter (Prisma-like API)
│   └── workflow/
│       ├── engine.js                      ← THE CORE ENGINE (main file)
│       ├── policyMatcher.js               ← Finds matching policies
│       ├── executor.js                    ← Executes actions after approval
│       ├── notifier.js                    ← Sends notifications
│       ├── auditLogger.js                 ← Writes to audit trail
│       ├── aiGateway.js                   ← AI Analyst connection point
│       ├── seed.js                        ← Seeds default policies for new orgs
│       ├── utils.js                       ← Helper functions
│       ├── types.ts                       ← TypeScript type definitions
│       └── INTEGRATION_GUIDE.js           ← This file (reference)
│
├── app/api/
│   ├── workflow/
│   │   ├── submit/route.js                ← POST: submit action for approval
│   │   ├── decide/route.js                ← POST: approve or reject
│   │   ├── cancel/route.js                ← POST: cancel a request
│   │   ├── pending/route.js               ← GET:  pending approvals for user
│   │   ├── status/[requestId]/route.js    ← GET:  status of a request
│   │   ├── notifications/route.js         ← GET/PUT: notifications
│   │   ├── policies/route.js              ← GET/POST: policy CRUD
│   │   ├── policies/[id]/route.js         ← PATCH/PUT/DELETE: single policy
│   │   └── simulate/route.js              ← POST: workflow simulator
│   └── cron/
│       └── workflow-sla/route.js          ← Hourly SLA breach check
│
├── hooks/
│   └── useWorkflow.js                     ← React hook for components
│
└── vercel.json                            ← Add cron schedule
*/

// ═══════════════════════════════════════════════════════════════
// DATA STORED IN FIREBASE RTDB:
// ═══════════════════════════════════════════════════════════════
/*
v2_production/tenants/{tenantId}/workflow/
  ├── approval_policies/{id}
  ├── approval_policy_steps/{id}
  ├── approval_requests/{id}
  ├── approval_step_records/{id}
  ├── approval_notifications/{id}
  └── audit_logs/{id}
*/
