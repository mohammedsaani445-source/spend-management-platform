// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/policyMatcher.js
// ═══════════════════════════════════════════════════════════════
// FULLY DYNAMIC — reads from DB on every call.
// Works for the 5 default policies AND every new policy
// you create in the Approval Workflow Configurator.
// No code changes needed when you add or edit policies.
// ═══════════════════════════════════════════════════════════════

import { prisma }              from "@/lib/prisma";
import { seedDefaultPolicies }  from "./seed";

export const policyMatcher = {

  // ─────────────────────────────────────────────────────────
  // FIND — called by the engine on every submission
  // Returns the single best-matching active policy, or null
  // ─────────────────────────────────────────────────────────
  async find({ orgId, module, amount, department }) {
    // ── Auto-Zero Recovery: Seed defaults if this org has NO policies at all ─────
    const totalPolicies = await prisma.approvalPolicy.count({ where: { org_id: orgId } });
    if (totalPolicies === 0) {
      await seedDefaultPolicies(orgId, "SYSTEM_AUTO");
    }

    // Pull every active policy that could match this action
    const candidates = await prisma.approvalPolicy.findMany({
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

  // ─────────────────────────────────────────────────────────
  // SIMULATE — used by the Workflow Simulator on the dashboard
  // Returns ALL matching policies (not just the winning one)
  // so the simulator can show the user what would happen
  // ─────────────────────────────────────────────────────────
  async simulate({ orgId, module, amount, department }) {
    // Ensure we have something to simulate against
    const totalPolicies = await prisma.approvalPolicy.count({ where: { org_id: orgId } });
    if (totalPolicies === 0) {
      await seedDefaultPolicies(orgId, "SIMULATOR_AUTO");
    }

    const allActive = await prisma.approvalPolicy.findMany({
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

    // Check if it would be auto-approved
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
        steps:            winner.steps.map(s => ({
          stepNumber: s.step_number,
          role:       s.role,
          roleLabel:  s.role_label,
          slaDays:    s.sla_days,
          isParallel: s.is_parallel,
          isRequired: s.is_required,
        })),
      },
      // All candidates (so simulator can show "also matches" list)
      allMatches: allActive.map(p => ({
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

  // ─────────────────────────────────────────────────────────
  // GET_ALL — for the Configurator page to load all policies
  // ─────────────────────────────────────────────────────────
  async getAll(orgId) {
    return prisma.approvalPolicy.findMany({
      where:   { org_id: orgId },
      include: { steps: { orderBy: { step_number: "asc" } } },
      orderBy: [{ active: "desc" }, { created_at: "desc" }],
    });
  },

  // ─────────────────────────────────────────────────────────
  // CHECK_COVERAGE — tells you if any gaps exist in your policy setup
  // Useful for admin dashboard health check
  // ─────────────────────────────────────────────────────────
  async checkCoverage(orgId) {
    const policies = await prisma.approvalPolicy.findMany({
      where:   { org_id: orgId, active: true },
      include: { steps: true },
    });

    const modules = [
      "REQUISITION", "PURCHASE_ORDER", "INVOICE",
      "PAYMENT", "CONTRACT", "VENDOR", "TENDER",
    ];

    const report = modules.map(mod => {
      const matching = policies.filter(p => p.module === mod);
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

// ─────────────────────────────────────────────────────────────
// Private: pick the single best policy from multiple candidates
// ─────────────────────────────────────────────────────────────
function _pickBest(candidates, department) {

  // Rule 1: Department-specific always beats "ALL"
  if (department) {
    const deptSpecific = candidates.filter(
      p => p.department_scope === department
    );
    if (deptSpecific.length > 0) {
      // Among dept-specific, pick highest priority
      return _highestPriority(deptSpecific);
    }
  }

  // Rule 2: Among remaining candidates, highest priority wins
  // If priority is equal, narrower amount range wins
  const allScoped = candidates.filter(p => p.department_scope === "ALL");
  const pool = allScoped.length > 0 ? allScoped : candidates;

  return _highestPriority(pool);
}

function _highestPriority(policies) {
  return policies.reduce((best, current) => {
    // Compare priority first
    if (current.priority > best.priority) return current;
    if (current.priority < best.priority) return best;

    // Same priority — narrower range wins (higher amount_min)
    if (current.amount_min > best.amount_min) return current;
    if (current.amount_min < best.amount_min) return best;

    // Same range — most recently created wins
    if (new Date(current.created_at) > new Date(best.created_at)) return current;
    return best;
  });
}
