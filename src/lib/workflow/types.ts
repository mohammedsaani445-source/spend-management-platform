// ═══════════════════════════════════════════════════════════════
// WORKFLOW ENGINE — DATA MODEL REFERENCE
// ═══════════════════════════════════════════════════════════════
// This file documents the data structure used by the Approval
// Workflow Engine. In this project, data is stored in Firebase
// Realtime Database under:
//
//   v2_production/tenants/{tenantId}/workflow/
//     ├── approval_policies/{id}
//     ├── approval_policy_steps/{id}
//     ├── approval_requests/{id}
//     ├── approval_step_records/{id}
//     ├── approval_notifications/{id}
//     └── audit_logs/{id}
//
// The prisma.ts adapter provides a Prisma-like API on top of
// this structure so the engine files work without modification.
// ═══════════════════════════════════════════════════════════════

// ── ENUMS ─────────────────────────────────────────────────────

export type ApprovalModule =
  | "REQUISITION"
  | "PURCHASE_ORDER"
  | "INVOICE"
  | "PAYMENT"
  | "CONTRACT"
  | "VENDOR"
  | "TENDER"
  | "BUDGET_OVERRIDE"
  | "ASSET_DISPOSAL"
  | "INVENTORY_ADJUSTMENT";

export type ApproverRole =
  | "superuser"
  | "finance_mgr"
  | "proc_mgr"
  | "proc_officer"
  | "dept_head"
  | "requester"
  | "ap_officer"
  | "auditor"
  | "warehouse"
  | "asset_mgr"
  | "cfo";

export type RequestStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "FULLY_APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "ESCALATED"
  | "AUTO_APPROVED";

export type StepStatus =
  | "WAITING"
  | "ACTIVE"
  | "APPROVED"
  | "REJECTED"
  | "SKIPPED"
  | "ESCALATED";

export type TriggerSource =
  | "USER"
  | "AI"
  | "SYSTEM"
  | "API"
  | "CRON";

export type NotificationType =
  | "APPROVAL_REQUESTED"
  | "STEP_APPROVED"
  | "STEP_REJECTED"
  | "REQUEST_COMPLETED"
  | "SLA_WARNING"
  | "SLA_BREACHED"
  | "ESCALATION";

// ── MODELS ────────────────────────────────────────────────────

export interface WorkflowApprovalPolicy {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  module: ApprovalModule;
  department_scope: string;       // "ALL" or specific dept name
  amount_min: number;             // default: 0
  amount_max: number;             // default: 999999999
  auto_approve: boolean;          // default: false
  auto_approve_limit?: number;    // default: 0
  active: boolean;                // default: true
  priority: number;               // higher = matched first
  created_by: string;
  created_at: string;             // ISO datetime
  updated_at: string;             // ISO datetime
  steps?: WorkflowApprovalPolicyStep[];
}

export interface WorkflowApprovalPolicyStep {
  id: string;
  policy_id: string;
  step_number: number;
  role: ApproverRole;
  role_label: string;
  sla_days: number;               // default: 2
  is_required: boolean;           // default: true
  is_parallel: boolean;           // default: false
}

export interface WorkflowApprovalRequest {
  id: string;
  org_id: string;
  policy_id?: string;
  entity_type: ApprovalModule;
  entity_id: string;
  entity_ref?: string;
  entity_title?: string;
  amount: number;
  currency: string;               // default: "GHS"
  department?: string;
  requested_by: string;
  requester_name?: string;
  status: RequestStatus;          // default: "PENDING"
  current_step: number;           // default: 1
  total_steps: number;            // default: 1
  triggered_by: TriggerSource;    // default: "USER"
  ai_command_id?: string;
  reject_reason?: string;
  rejected_by?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  step_records?: WorkflowApprovalStepRecord[];
  notifications?: WorkflowApprovalNotification[];
}

export interface WorkflowApprovalStepRecord {
  id: string;
  request_id: string;
  step_number: number;
  approver_role: ApproverRole;
  approver_id?: string;
  approver_name?: string;
  status: StepStatus;             // default: "WAITING"
  due_at: string;                 // ISO datetime
  acted_at?: string;
  comment?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface WorkflowApprovalNotification {
  id: string;
  request_id: string;
  recipient_id?: string;
  recipient_role?: ApproverRole;
  type: NotificationType;
  channel: string;                // "IN_APP" | "EMAIL" | "WHATSAPP"
  sent_at: string;
  read_at?: string;
  payload?: any;
}

// ── ENGINE INTERFACES ─────────────────────────────────────────

export interface WorkflowAction {
  module: ApprovalModule;
  entityId: string;
  entityRef: string;
  entityTitle: string;
  amount: number;
  currency: string;
  department?: string;
  source?: TriggerSource;
  aiCommandId?: string;
}

export interface WorkflowContext {
  userId: string;
  userName: string;
  orgId: string;
  role: string;
}

export interface WorkflowSubmitResult {
  status: string;
  requestId?: string;
  policyName?: string;
  totalSteps?: number;
  nextApprover?: string;
  message?: string;
  aiMessage?: string;
}

export type ApprovalDecision = "APPROVED" | "REJECTED" | "SKIP" | "ESCALATE";

export interface WorkflowDecideResult {
  status: string;
  message: string;
  nextStep?: number;
  nextRole?: string;
  reason?: string;
  rejectedBy?: string;
  execResult?: any;
}

export interface WorkflowGetPendingResult {
  requestId: string;
  entityType: ApprovalModule;
  entityId: string;
  entityRef: string;
  entityTitle: string;
  amount: number;
  currency: string;
  requesterName: string;
  stepNumber: number;
  totalSteps: number;
  dueAt: string | Date;
  isOverdue: boolean;
  hoursOverdue: number;
  triggeredBy: TriggerSource;
  createdAt: string | Date;
}

export interface WorkflowGetStatusResult {
  id: string;
  status: string;
  entityType: ApprovalModule;
  entityId: string;
  entityRef: string;
  entityTitle: string;
  amount: number;
  currency: string;
  currentStep: number;
  totalSteps: number;
  policyName?: string;
  triggeredBy: TriggerSource;
  requesterName?: string;
  createdAt: string | Date;
  completedAt?: string | Date;
  rejectReason?: string;
  steps: {
    stepNumber: number;
    role: ApproverRole;
    status: StepStatus;
    approverName?: string;
    actedAt?: string | Date;
    comment?: string;
    dueAt: string | Date;
    isOverdue: boolean;
  }[];
}

