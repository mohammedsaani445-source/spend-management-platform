"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createRequisition } from "@/lib/requisitions";
import { getVendors } from "@/lib/vendors";
import { RequisitionItem, Vendor } from "@/types";
import { CURRENCIES, formatCurrency } from "@/lib/currencies";
import { getDepartmentBudgetStatus } from "@/lib/budgets";
import { useModal } from "@/context/ModalContext";
import CustomSelect from "../ui/CustomSelect";

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
    const [budgetStatus, setBudgetStatus] = useState<{ budget: number, spent: number, remaining: number, percent: number, currency: string } | null>(null);

    useEffect(() => {
        if (!user) return;
        getVendors(user.tenantId).then(setVendors);
    }, [user?.tenantId]);

    // Check budget when department changes
    useEffect(() => {
        const checkBudget = async () => {
            if (!user) return;
            const status = await getDepartmentBudgetStatus(user, department);
            if (status) {
                setBudgetStatus({
                    budget: status.budget,
                    spent: status.spent,
                    remaining: status.remaining,
                    percent: status.percent,
                    currency: status.currency
                });
            } else {
                setBudgetStatus(null);
            }
        };
        checkBudget();
    }, [department, user]);

    const handleItemChange = (index: number, field: keyof RequisitionItem, value: any) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Strict Budget Check
        if (budgetStatus && calculateTotal() > budgetStatus.remaining) {
            await showError(
                "Budget Exceeded!",
                `Your request total (${formatCurrency(calculateTotal(), currency)}) exceeds the remaining budget (${formatCurrency(budgetStatus.remaining, budgetStatus.currency)}).\n\nPlease reduce the amount or request a budget increase.`
            );
            return; // Block submission
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
        } catch (error: any) {
            await showError("Submission Error", error.message);
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
                                        <input type="number" min="1" required style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', padding: '0.25rem' }}
                                            value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} />
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
                                const newSpend = budgetStatus.spent + currentTotal;
                                const safeBudget = Math.max(budgetStatus.budget, 0.01); // Prevent divide by zero
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
                                        <div style={{ height: '10px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
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
                                        {isOverBudget ? (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '0.5rem', fontWeight: 600 }}>
                                                ⚠️ Request exceeds department budget by {formatCurrency(newSpend - budgetStatus.budget, budgetStatus.currency)}.
                                            </div>
                                        ) : isWarning ? (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '0.5rem' }}>
                                                ⚠️ Approaching budget limit. Approval may require additional review.
                                            </div>
                                        ) : (
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
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
