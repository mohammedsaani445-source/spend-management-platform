"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createRequisition } from "@/lib/requisitions";
import { getVendors } from "@/lib/vendors";
import { RequisitionItem, Vendor } from "@/types";
import { CURRENCIES, formatCurrency } from "@/lib/currencies";
import { getDepartmentBudgetStatus } from "@/lib/budgets";
import { createBudgetAdjustmentRequest } from "@/lib/budgetAdjustments";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import CustomSelect from "../ui/CustomSelect";

type BudgetEnforcementLevel = 'SOFT' | 'HARD';

export default function RequisitionForm() {
    const { user } = useAuth();
    const router = useRouter();
    const { showError } = useModal();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [selectedVendorId, setSelectedVendorId] = useState("");
    const [department, setDepartment] = useState("General");
    const [currency, setCurrency] = useState("USD");
    const [justification, setJustification] = useState("");
    const [items, setItems] = useState<RequisitionItem[]>([
        { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);

    // Budget State
    const [budgetStatus, setBudgetStatus] = useState<{
        budget: number;
        committed: number;
        spent: number;
        totalUtilization: number;
        remaining: number;
        percent: number;
        enforcementLevel: BudgetEnforcementLevel;
        currency: string;
    } | null>(null);

    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [adjustmentReason, setAdjustmentReason] = useState("");
    const [adjustmentAmount, setAdjustmentAmount] = useState(0);
    const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);
    const [adjustmentSubmitted, setAdjustmentSubmitted] = useState(false);

    useEffect(() => {
        if (!user) return;
        getVendors(user.tenantId).then(setVendors);
    }, [user?.tenantId, user]);

    // Check budget when department changes
    useEffect(() => {
        const checkBudget = async () => {
            if (!user) return;
            const status = await getDepartmentBudgetStatus(user, department);
            setBudgetStatus(status as any); // Use any for now or define a proper type that matches budgets.ts
        };
        checkBudget();
    }, [department, user]);

    const handleItemChange = (index: number, field: keyof RequisitionItem, value: string | number) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Auto-calc total
        if (field === 'quantity' || field === 'unitPrice') {
            item.total = Number(item.quantity) * Number(item.unitPrice);
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, {
            id: `${Date.now()}-${items.length + 1}`,
            description: '',
            quantity: 1,
            unitPrice: 0,
            total: 0
        }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const calculateTotal = () => items.reduce((sum, item) => sum + item.total, 0);

    const handleRequestAdjustment = async () => {
        if (!user || !budgetStatus || adjustmentAmount <= 0 || !adjustmentReason) return;

        setIsSubmittingAdjustment(true);
        try {
            await createBudgetAdjustmentRequest({
                tenantId: user.tenantId,
                requesterId: user.uid,
                requesterName: user.displayName || 'Anonymous',
                department: department,
                amount: adjustmentAmount,
                currency: currency, // Should ideally follow department currency
                type: 'INCREASE',
                reason: adjustmentReason,
            });
            setAdjustmentSubmitted(true);
            setTimeout(() => {
                setIsAdjustmentModalOpen(false);
                setAdjustmentSubmitted(false);
                setAdjustmentReason("");
                setAdjustmentAmount(0);
            }, 2000);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to submit adjustment request.";
            await showError("Submission Error", errorMessage);
        } finally {
            setIsSubmittingAdjustment(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // --- Phase 58: Budget Enforcement Logic ---
        const total = calculateTotal();
        const isOverBudget = budgetStatus && total > budgetStatus.remaining;
        const isHardBlocked = isOverBudget && budgetStatus.enforcementLevel === 'HARD';

        if (isHardBlocked) {
            await showError(
                "Budget Blocked (HARD Enforcement)",
                `Critical Policy: This requisition (${formatCurrency(total, currency)}) exceeds the available budget of ${formatCurrency(budgetStatus.remaining, budgetStatus.currency)}. Submission is prohibited under current fiscal guidelines.`
            );
            return; // Block submission
        } else if (isOverBudget) {
            // SOFT Enforcement - Just a warning but allow submit
            const confirmed = window.confirm(
                `Budget Warning: This request exceeds the department budget limit. It will be flagged as 'OVER_BUDGET' for approvers. Do you wish to proceed?`
            );
            if (!confirmed) return;
        }

        setLoading(true);
        try {
            const vendor = vendors.find(v => v.id === selectedVendorId);

            await createRequisition({
                tenantId: user.tenantId,
                requesterId: user.uid,
                requesterName: user.displayName || "Unknown",
                department,
                vendorId: selectedVendorId,
                vendorName: vendor?.name || "",
                items,
                totalAmount: calculateTotal(),
                currency,
                justification,
                status: 'PENDING'
            });

            router.push("/dashboard/requisitions");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            await showError("Submission Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };


    // Dynamic Options State
    const [departments, setDepartments] = useState([
        { label: "General", value: "General" },
        { label: "IT", value: "IT" },
        { label: "Marketing", value: "Marketing" },
        { label: "Operations", value: "Operations" }
    ]);

    const handleAddDepartment = (name: string) => {
        setDepartments([...departments, { label: name, value: name }]);
    };

    const totalAmount = calculateTotal();
    const isOverBudget = budgetStatus && totalAmount > budgetStatus.remaining;
    const isHardBlocked = isOverBudget && budgetStatus?.enforcementLevel === 'HARD';

    return (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>New Purchase Requisition</h2>

            <form onSubmit={handleSubmit}>
                {/* Header Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <CustomSelect
                            label="Department"
                            options={departments}
                            value={department}
                            onChange={setDepartment}
                            creatable={true}
                            onAddOption={handleAddDepartment}
                            placeholder="Select Dept..."
                        />
                    </div>
                    <div>
                        <CustomSelect
                            label="Preferred Vendor"
                            options={vendors.map(v => ({ label: v.name, value: v.id || "" }))}
                            value={selectedVendorId}
                            onChange={setSelectedVendorId}
                            placeholder="Select Vendor"
                        />
                    </div>
                    <div>
                        <CustomSelect
                            label="Currency"
                            options={CURRENCIES.map(c => ({ label: `${c.code} - ${c.name}`, value: c.code, icon: c.flag }))}
                            value={currency}
                            onChange={setCurrency}
                        />
                    </div>
                </div>

                {/* Line Items */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Order Items</label>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                        <thead style={{ backgroundColor: 'var(--background)', textAlign: 'left', fontSize: '0.875rem' }}>
                            <tr>
                                <th style={{ padding: '0.5rem' }}>Description</th>
                                <th style={{ padding: '0.5rem', width: '80px' }}>Qty</th>
                                <th style={{ padding: '0.5rem', width: '120px' }}>Price</th>
                                <th style={{ padding: '0.5rem', width: '120px' }}>Total</th>
                                <th style={{ padding: '0.5rem', width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input type="text" required style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', padding: '0.25rem' }}
                                            value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input type="number" min="0" required style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', padding: '0.25rem' }}
                                            value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value === "" ? "" : Number(e.target.value))} />
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input type="number" min="0" step="0.01" required style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', padding: '0.25rem' }}
                                            value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} />
                                    </td>
                                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>
                                        {formatCurrency(item.total, currency)}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        {items.length > 1 && (
                                            <button type="button" onClick={() => removeItem(index)} style={{ color: 'var(--error)', border: 'none', background: 'none' }}>✕</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button type="button" onClick={addItem} style={{ fontSize: '0.875rem', color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 500 }}>
                        + Add Another Item
                    </button>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Justification / Notes</label>
                        <textarea style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', minHeight: '80px' }}
                            value={justification} onChange={e => setJustification(e.target.value)} required />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            Total: {formatCurrency(calculateTotal(), currency)}
                            {budgetStatus && (() => {
                                const currentTotal = calculateTotal();
                                const newSpend = (budgetStatus.spent || 0) + currentTotal;
                                const safeBudget = Math.max(budgetStatus.budget, 0.01);
                                const newPercent = (newSpend / safeBudget) * 100;
                                const isOverBudget = newSpend > budgetStatus.budget;
                                const isWarning = newPercent > 80;

                                return (
                                    <div style={{ marginTop: '1rem', width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                            <span>
                                                Budget Utilization:
                                                <strong style={{ marginLeft: '0.5rem', color: isOverBudget ? 'var(--error)' : isWarning ? 'var(--warning)' : 'var(--success)' }}>
                                                    {Math.round(newPercent)}%
                                                </strong>
                                            </span>
                                            <span style={{ color: 'var(--text-secondary)' }}>Limit: {formatCurrency(budgetStatus.budget, budgetStatus.currency)}</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={{ height: '10px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '5px', overflow: 'hidden', display: 'flex', marginTop: '0.5rem' }}>
                                            {/* Existing Spend */}
                                            <div style={{ width: `${Math.min(budgetStatus.percent, 100)}%`, backgroundColor: 'var(--text-disabled)' }} title="Existing Spend"></div>
                                            {/* This Request */}
                                            <div style={{
                                                width: `${Math.min((currentTotal / safeBudget) * 100, 100 - Math.min(budgetStatus.percent, 100))}%`,
                                                backgroundColor: isOverBudget ? 'var(--error)' : isWarning ? 'var(--warning)' : 'var(--success)',
                                                transition: 'width 0.3s'
                                            }} title="This Request"></div>
                                        </div>

                                        {/* Warning Messages */}
                                        {isOverBudget && (
                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.75rem',
                                                backgroundColor: isHardBlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 147, 79, 0.1)',
                                                borderRadius: '8px',
                                                borderLeft: `3px solid ${isHardBlocked ? '#ef4444' : '#ff934f'}`,
                                                fontSize: '0.85rem',
                                                fontWeight: 'normal'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: isHardBlocked ? '#ef4444' : '#ff934f' }}>
                                                    <AlertTriangle size={14} />
                                                    {isHardBlocked ? 'Budget Blocked' : 'Budget Warning'}
                                                </div>
                                                <p style={{ marginTop: '0.25rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                                                    This request exceeds the available budget by <strong>{formatCurrency(totalAmount - (budgetStatus.remaining || 0), currency)}</strong>.
                                                    {isHardBlocked
                                                        ? " Hard enforcement is active. You must request a budget increase to proceed."
                                                        : " Requisition will be flagged for budget override."}
                                                </p>
                                                {isHardBlocked && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAdjustmentAmount(Math.ceil(totalAmount - (budgetStatus.remaining || 0)));
                                                            setIsAdjustmentModalOpen(true);
                                                        }}
                                                        style={{
                                                            marginTop: '0.75rem',
                                                            padding: '6px 12px',
                                                            backgroundColor: 'var(--brand)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '16px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem'
                                                        }}
                                                    >
                                                        <ArrowRight size={14} /> Request Budget Increase
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {!isOverBudget && isWarning ? (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '0.5rem' }}>
                                                ⚠️ Approaching budget limit. Approval may require additional review.
                                            </div>
                                        ) : !isOverBudget && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.5rem' }}>
                                                ✅ Within budget parameters.
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" className="btn" style={{ border: '1px solid var(--border)' }} onClick={() => router.back()}>Cancel</button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!!(loading || isHardBlocked)}
                                style={{ opacity: (loading || isHardBlocked) ? 0.7 : 1, cursor: (loading || isHardBlocked) ? 'not-allowed' : 'pointer' }}
                            >
                                {loading ? "Submitting..." : (isHardBlocked ? "Budget Exceeded" : "Submit Requisition")}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Adjustment Modal */}
            {isAdjustmentModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-main)',
                        padding: '2rem',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '450px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Request Budget Increase</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Submit a request to the finance department to increase the budget for <strong>{department}</strong>.
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Requested Amount ({currency})</label>
                            <input
                                type="number"
                                value={adjustmentAmount}
                                onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-side)', color: 'var(--text-main)' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Reason for Increase</label>
                            <textarea
                                value={adjustmentReason}
                                onChange={(e) => setAdjustmentReason(e.target.value)}
                                placeholder="Explain why additional funds are needed..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-side)', color: 'var(--text-main)', minHeight: '100px', resize: 'vertical' }}
                            />
                        </div>

                        {adjustmentSubmitted ? (
                            <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, justifyContent: 'center', padding: '1rem' }}>
                                <CheckCircle2 size={20} /> Request Submitted Successfully
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    onClick={() => setIsAdjustmentModalOpen(false)}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-main)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestAdjustment}
                                    disabled={isSubmittingAdjustment || !adjustmentReason || adjustmentAmount <= 0}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'var(--brand)',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: (isSubmittingAdjustment || !adjustmentReason || adjustmentAmount <= 0) ? 'not-allowed' : 'pointer',
                                        opacity: (isSubmittingAdjustment || !adjustmentReason || adjustmentAmount <= 0) ? 0.7 : 1
                                    }}
                                >
                                    {isSubmittingAdjustment ? "Sending..." : "Submit Request"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
