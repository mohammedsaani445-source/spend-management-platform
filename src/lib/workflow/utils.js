// ═══════════════════════════════════════════════════════════════
// FILE: lib/workflow/utils.js
// Helper utilities for the workflow engine
// ═══════════════════════════════════════════════════════════════

// Add working days (skip weekends)
export function addWorkingDays(date, days) {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++; // skip Saturday (6) and Sunday (0)
  }
  return result;
}

// How many hours overdue is a step
export function getHoursOverdue(dueAt) {
  const diff = Date.now() - new Date(dueAt).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
}

// Format GHS amount for display
export function formatAmount(amount, currency = "GHS") {
  return `${currency} ${Number(amount).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Map module name to human-readable label
export const MODULE_LABELS = {
  REQUISITION:          "Purchase Requisition",
  PURCHASE_ORDER:       "Purchase Order",
  INVOICE:              "Invoice",
  PAYMENT:              "Payment",
  CONTRACT:             "Contract",
  VENDOR:               "Vendor Approval",
  TENDER:               "Tender Publication",
  BUDGET_OVERRIDE:      "Budget Override",
  ASSET_DISPOSAL:       "Asset Disposal",
  INVENTORY_ADJUSTMENT: "Inventory Adjustment",
};

export const ROLE_LABELS = {
  superuser:    "Platform Superuser",
  finance_mgr:  "Finance Manager",
  proc_mgr:     "Procurement Manager",
  proc_officer: "Procurement Officer",
  dept_head:    "Department Head",
  requester:    "Requester",
  ap_officer:   "AP Officer",
  auditor:      "Auditor",
  warehouse:    "Warehouse",
  asset_mgr:    "Asset Manager",
  cfo:          "CFO / Executive",
};
