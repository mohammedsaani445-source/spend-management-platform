import "server-only";
// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/policyMatcher.ts
// ═══════════════════════════════════════════════════════════════
// UI CONFIGURATOR ADAPTER — bridges the legacy Approval Policies
// created via the Dashboard Configurator with the new
// Enterprise Workflow Engine.
// ═══════════════════════════════════════════════════════════════

import { adminDb } from "@/lib/firebaseAdmin";
import { DB_PREFIX } from "@/lib/firebase";
import { ApprovalModule, WorkflowApprovalPolicy, WorkflowApprovalPolicyStep } from "./types";

interface MatchOptions {
  orgId: string;
  module: ApprovalModule;
  amount: number;
  department?: string;
}

// Map the Engine's MODULE format mapping to the Configurator UI mapping
const MODULE_MAP: Record<ApprovalModule, string> = {
  "REQUISITION": "requisitions",
  "PURCHASE_ORDER": "purchase_orders",
  "INVOICE": "invoices",
  "PAYMENT": "payments",
  "CONTRACT": "contracts",
  "VENDOR": "vendors",
  "TENDER": "tenders",
  "BUDGET_OVERRIDE": "budget_overrides",
  "ASSET_DISPOSAL": "asset_disposals",
  "INVENTORY_ADJUSTMENT": "inventory_adjustments",
};

/**
 * Fetches all legacy policies from the Configurator UI path
 */
async function fetchLegacyPolicies(tenantId: string): Promise<any[]> {
  const ref = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/approval_policies`);
  const snap = await ref.once('value');
  if (!snap.exists()) return [];
  return Object.values(snap.val());
}

/**
 * Adapt legacy Configurator policy format to Engine Format
 */
function adaptPolicy(legacyPolicy: any): WorkflowApprovalPolicy {
  // Infer defaults since Configurator doesn't always save them
  const amount_min = typeof legacyPolicy.minAmount === "number" ? legacyPolicy.minAmount : 0;
  const amount_max = typeof legacyPolicy.maxAmount === "number" ? legacyPolicy.maxAmount : 999999999;
  
  // Convert roles directly and clean up missing values safely
  const steps: WorkflowApprovalPolicyStep[] = (legacyPolicy.steps || []).map((s: any, idx: number) => ({
    id: s.id || `step_${idx}`,
    policy_id: legacyPolicy.id,
    step_number: idx + 1,
    role: s.role || "superuser",
    role_label: s.name || "Approver",
    sla_days: s.sla_hours ? Math.ceil(s.sla_hours / 24) : 2,
    is_required: s.isRequired !== false,
    is_parallel: s.isParallel === true
  }));

  // Reverse mapping for the module back to Engine
  const engineModuleStr = Object.entries(MODULE_MAP).find(
    ([, v]) => v === legacyPolicy.module
  )?.[0] as ApprovalModule || "REQUISITION";

  return {
    id: legacyPolicy.id,
    org_id: legacyPolicy.tenantId,
    name: legacyPolicy.name || "Adapted Policy",
    description: legacyPolicy.description || "",
    module: engineModuleStr,
    department_scope: legacyPolicy.departmentScope === "All Departments" || !legacyPolicy.departmentScope 
      ? "ALL" 
      : legacyPolicy.departmentScope,
    amount_min,
    amount_max,
    auto_approve: !!legacyPolicy.autoApprove,
    auto_approve_limit: typeof legacyPolicy.autoApproveLimit === "number" ? legacyPolicy.autoApproveLimit : 0,
    active: legacyPolicy.isActive !== false,
    priority: legacyPolicy.priority || 0,
    created_by: "system_adapter",
    created_at: legacyPolicy.createdAt || new Date().toISOString(),
    updated_at: legacyPolicy.updatedAt || new Date().toISOString(),
    steps,
  };
}

export const policyMatcher = {
  /**
   * FIND — called by the engine on every submission
   * Returns the single best-matching active policy, or null
   */
  async find({ orgId, module, amount, department }: MatchOptions): Promise<WorkflowApprovalPolicy | null> {
    const legacyPolicies = await fetchLegacyPolicies(orgId);
    if (legacyPolicies.length === 0) return null;

    const targetModule = MODULE_MAP[module] || "requisitions";

    // 1. Filter out inactive, wrong module, or out of amount bounds
    const candidates = legacyPolicies.filter(p => {
      if (p.isActive === false) return false;
      if (p.module !== targetModule) return false;
      
      const min = typeof p.minAmount === "number" ? p.minAmount : 0;
      const max = typeof p.maxAmount === "number" ? p.maxAmount : 999999999;
      
      // Allow exact equal checking (lte/gte logic)
      if (amount < min || amount > max) return false;
      
      if (department && p.departmentScope && p.departmentScope !== "All Departments" && p.departmentScope !== "ALL") {
         if (p.departmentScope !== department) return false;
      }
      return true;
    });

    if (candidates.length === 0) return null;

    // 2. Pick highest priority
    candidates.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // 3. Adapt and return
    return adaptPolicy(candidates[0]);
  },

  /**
   * SIMULATE — used by the Workflow Simulator on the dashboard
   */
  async simulate({ orgId, module, amount, department }: MatchOptions) {
    const policy = await this.find({ orgId, module, amount, department });

    if (!policy) {
      return {
        matched: false,
        policies: [],
        winningPolicy: null,
        message: `No active policies match a ${module} for ${amount > 0 ? "GHS " + amount.toLocaleString() : "any amount"}${department ? " in the " + department + " department" : ""}. Please check your Approval Policies settings.`,
      };
    }

    const wouldAutoApprove = policy.auto_approve && amount <= (policy.auto_approve_limit || 0);

    return {
      matched: true,
      winningPolicy: {
        id: policy.id,
        name: policy.name,
        description: policy.description,
        module: policy.module,
        amountMin: policy.amount_min,
        amountMax: policy.amount_max,
        autoApprove: policy.auto_approve,
        autoApproveLimit: policy.auto_approve_limit,
        wouldAutoApprove,
        stepCount: policy.steps?.length || 0,
        steps: (policy.steps || []).map(s => ({
          stepNumber: s.step_number,
          role: s.role,
          roleLabel: s.role_label,
          slaDays: s.sla_days,
          isParallel: s.is_parallel,
          isRequired: s.is_required,
        })),
      },
      allMatches: [], // UI adapter simplifies this for now
      message: wouldAutoApprove
        ? `This transaction would be AUTO-APPROVED — amount GHS ${amount.toLocaleString()} is below the GHS ${policy.auto_approve_limit?.toLocaleString()} threshold.`
        : `Policy "${policy.name}" would apply — ${policy.steps?.length || 0} approval step(s) required.`,
    };
  },

  /**
   * GET_ALL — for debugging or API checks
   */
  async getAll(orgId: string) {
    const raw = await fetchLegacyPolicies(orgId);
    return raw.map(adaptPolicy);
  },

  /**
   * CHECK_COVERAGE — gaps in policy setup
   */
  async checkCoverage(orgId: string) {
    const allAdapted = await this.getAll(orgId);
    const activeAdapted = allAdapted.filter(p => p.active);

    const modules = [
      "REQUISITION", "PURCHASE_ORDER", "INVOICE",
      "PAYMENT", "CONTRACT", "VENDOR", "TENDER",
    ] as ApprovalModule[];

    const report = modules.map(mod => {
      const matching = activeAdapted.filter(p => p.module === mod);
      const coversZero = matching.some(p => p.amount_min === 0);
      const coversHigh = matching.some(p => p.amount_max >= 999999999);

      return {
        module:        mod,
        policyCount:   matching.length,
        hasCoverage:   matching.length > 0,
        coversAllAmounts: coversZero && coversHigh,
        gaps: [
          !coversZero  && "No policy covers small amounts (GHS 0+)",
          !coversHigh  && "No policy covers large amounts (GHS 100,000+)",
          matching.length === 0 && `No policies configured for ${mod}. Requests will require manual intervention!`,
        ].filter(Boolean),
      };
    });

    return {
      totalActivePolicies: activeAdapted.length,
      coverage: report,
      fullyProtected: report.every(r => r.hasCoverage),
      gaps: report.filter(r => r.gaps.length > 0),
    };
  },
};
