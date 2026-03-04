import { db, DB_PREFIX } from "./firebase";
import { ref, get, query, orderByChild, limitToLast, equalTo } from "firebase/database";
import { Invoice, Requisition } from "@/types";

/**
 * COMPLIANCE & FRAUD DETECTION ENGINE.
 */
export const runComplianceCheck = async (tenantId: string, entity: Invoice | Requisition) => {
    const findings: string[] = [];
    const currentAmount = 'amount' in entity ? entity.amount : (entity as Requisition).totalAmount;

    // 1. Duplicate Detection
    if ('invoiceNumber' in entity && (entity as Invoice).invoiceNumber) {
        const invRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/invoices`);
        const q = query(invRef, orderByChild('invoiceNumber'), equalTo((entity as Invoice).invoiceNumber));
        const snap = await get(q);
        if (snap.exists()) {
            const matches = Object.values(snap.val() as Record<string, Invoice>);
            const isSelf = matches.some(m => m.id === entity.id);
            if (matches.length > (isSelf ? 1 : 0)) {
                findings.push("🛑 DUPLICATE DETECTED: This invoice number already exists in the system.");
            }
        }
    }

    // 2. Statistical Price Surge
    const histRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/invoices`);
    const histSnap = await get(query(histRef, limitToLast(30)));

    if (histSnap.exists()) {
        const history = Object.values(histSnap.val() as Record<string, Invoice>);
        const amounts = history.map(i => i.amount);

        if (amounts.length >= 3) {
            const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            const deviation = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length);
            const zScore = deviation > 0 ? (currentAmount - mean) / deviation : 0;

            if (zScore > 2) {
                findings.push(`🚩 STATISTICAL ANOMALY: Amount is ${zScore.toFixed(1)}σ above the historic mean.`);
            } else if (currentAmount > mean * 2.5) {
                findings.push(`⚠️ PRICE SURGE: Amount is 2.5x higher than the historic average.`);
            }
        }
    }

    // 3. Budget Stress Check
    const budgetRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/budgets`);
    const budgetSnap = await get(query(budgetRef, orderByChild('department'), equalTo(entity.department)));
    if (budgetSnap.exists()) {
        const budgets = Object.values(budgetSnap.val() as Record<string, any>);
        const activeBudget = budgets[0];
        if (activeBudget && currentAmount > activeBudget.amount * 0.25) {
            findings.push(`⚖️ CONCENTRATION RISK: This single request consumes >25% of the ${entity.department} budget.`);
        }
    }

    let riskScore = findings.length * 35;
    if (riskScore > 100) riskScore = 100;

    return {
        isSafe: findings.length === 0,
        riskScore,
        findings,
        timestamp: new Date().toISOString()
    };
};
