import "server-only";
// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/policyMatcher.ts
// ═══════════════════════════════════════════════════════════════
// FULLY DYNAMIC — reads from DB on every call.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import { seedDefaultPolicies } from "./seed";
import { ApprovalModule, WorkflowApprovalPolicy } from "./types";

interface MatchOptions {
  orgId: string;
  module: ApprovalModule;
  amount: number;
  department?: string;
}

export const policyMatcher = {
  /**
   * FIND — called by the engine on every submission
   * Returns the single best-matching active policy, or null
   */
  async find({ orgId, module, amount, department }: MatchOptions): Promise<WorkflowApprovalPolicy | null> {
    // ── Auto-Zero Recovery: Seed defaults if this org has NO policies at all ─────
    const totalPolicies = await (prisma as any).approvalPolicy.count({ where: { org_id: orgId } });
    if (totalPolicies === 0) {
      await seedDefaultPolicies(orgId, "SYSTEM_AUTO");
    }

    // Pull every active policy that could match this action
    const candidates = await (prisma as any).approvalPolicy.findMany({
      where: {
        org_id:     orgId,
        module:     module,
        active:     true,
        amount_min: { lte: amount },
        amount_max: { gte: amount },
      },
      include: {
        steps: { orderBy: { step_number: "asc" } },
      },
    });

    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // ── Multiple candidates — apply priority rules ──────────
    return _pickBest(candidates, department);
  },

  /**
   * SIMULATE — used by the Workflow Simulator on the dashboard
   */
  async simulate({ orgId, module, amount, department }: MatchOptions) {
    const totalPolicies = await (prisma as any).approvalPolicy.count({ where: { org_id: orgId } });
    if (totalPolicies === 0) {
      await seedDefaultPolicies(orgId, "SIMULATOR_AUTO");
    }

    const allActive = await (prisma as any).approvalPolicy.findMany({
      where: {
        org_id:     orgId,
        module:     module,
        active:     true,
        amount_min: { lte: amount },
        amount_max: { gte: amount },
      },
      include: {
        steps: { orderBy: { step_number: "asc" } },
      },
    });

    if (allActive.length === 0) {
      return {
        matched:        false,
        policies:       [],
        winningPolicy:  null,
        message: `No active policies match a ${module} for ${amount > 0 ? "GHS " + amount.toLocaleString() : "any amount"}${department ? " in the " + department + " department" : ""}.`,
      };
    }

    const winner = _pickBest(allActive, department);

    const wouldAutoApprove =
      winner.auto_approve &&
      amount <= (winner.auto_approve_limit || 0);

    return {
      matched:       true,
      winningPolicy: {
        id:               winner.id,
        name:             winner.name,
        description:      winner.description,
        module:           winner.module,
        amountMin:        winner.amount_min,
        amountMax:        winner.amount_max,
        autoApprove:      winner.auto_approve,
        autoApproveLimit: winner.auto_approve_limit,
        wouldAutoApprove,
        stepCount:        winner.steps.length,
        steps:            winner.steps.map((s: any) => ({
          stepNumber: s.step_number,
          role:       s.role,
          roleLabel:  s.role_label,
          slaDays:    s.sla_days,
          isParallel: s.is_parallel,
          isRequired: s.is_required,
        })),
      },
      allMatches: allActive.map((p: any) => ({
        id:          p.id,
        name:        p.name,
        isWinner:    p.id === winner.id,
        stepCount:   p.steps.length,
        priority:    p.priority,
        deptScope:   p.department_scope,
      })),
      message: wouldAutoApprove
        ? `This transaction would be AUTO-APPROVED — amount GHS ${amount.toLocaleString()} is below the GHS ${winner.auto_approve_limit?.toLocaleString()} threshold.`
        : `Policy "${winner.name}" would apply — ${winner.steps.length} approval step(s) required.`,
    };
  },

  /**
   * GET_ALL — for the Configurator page to load all policies
   */
  async getAll(orgId: string) {
    return (prisma as any).approvalPolicy.findMany({
      where:   { org_id: orgId },
      include: { steps: { orderBy: { step_number: "asc" } } },
      orderBy: [{ active: "desc" }, { created_at: "desc" }],
    });
  },

  /**
   * CHECK_COVERAGE — gaps in policy setup
   */
  async checkCoverage(orgId: string) {
    const policies = await (prisma as any).approvalPolicy.findMany({
      where:   { org_id: orgId, active: true },
      include: { steps: true },
    });

    const modules = [
      "REQUISITION", "PURCHASE_ORDER", "INVOICE",
      "PAYMENT", "CONTRACT", "VENDOR", "TENDER",
    ];

    const report = modules.map(mod => {
      const matching = policies.filter((p: any) => p.module === mod);
      const coversZero = matching.some((p: any) => p.amount_min === 0);
      const coversHigh = matching.some((p: any) => p.amount_max >= 999999999);

      return {
        module:        mod,
        policyCount:   matching.length,
        hasCoverage:   matching.length > 0,
        coversAllAmounts: coversZero && coversHigh,
        gaps: [
          !coversZero  && "No policy covers small amounts (GHS 0+)",
          !coversHigh  && "No policy covers large amounts (GHS 100,000+)",
          matching.length === 0 && "No policies at all — actions will escalate to superuser",
        ].filter(Boolean),
      };
    });

    return {
      totalActivePolicies: policies.length,
      coverage: report,
      fullyProtected: report.every(r => r.hasCoverage),
      gaps: report.filter(r => r.gaps.length > 0),
    };
  },
};

/**
 * Private: pick the single best policy from multiple candidates
 */
function _pickBest(candidates: any[], department?: string): any {
  if (department) {
    const deptSpecific = candidates.filter(
      p => p.department_scope === department
    );
    if (deptSpecific.length > 0) {
      return _highestPriority(deptSpecific);
    }
  }

  const allScoped = candidates.filter(p => p.department_scope === "ALL");
  const pool = allScoped.length > 0 ? allScoped : candidates;

  return _highestPriority(pool);
}

function _highestPriority(policies: any[]): any {
  return policies.reduce((best, current) => {
    if (current.priority > best.priority) return current;
    if (current.priority < best.priority) return best;

    if (current.amount_min > best.amount_min) return current;
    if (current.amount_min < best.amount_min) return best;

    if (new Date(current.created_at) > new Date(best.created_at)) return current;
    return best;
  });
}
