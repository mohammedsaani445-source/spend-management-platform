"use client";

import { useEffect, useState } from "react";
import { Budget, Requisition } from "@/types";
import { getBudgets, createBudget, updateBudget } from "@/lib/budgets";
import { getSpendAnalytics } from "@/lib/analytics";
import { getRequisitions } from "@/lib/requisitions";
import { CURRENCIES, formatCurrency } from "@/lib/currencies";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { logAction } from "@/lib/audit";
import CustomSelect from "@/components/ui/CustomSelect";
import BudgetDetailModal from "@/components/budgets/BudgetDetailModal";
import { Plus, Wallet, TrendingUp, AlertCircle, Calendar, Briefcase, CreditCard, AlertTriangle, PieChart, Info, ArrowUpRight, X } from "lucide-react";
import Loader from "@/components/common/Loader";
import styles from "@/components/layout/Layout.module.css";

const DEPT_OPTIONS = ["General", "IT", "Marketing", "Operations", "Finance", "HR"];

function BudgetProgressCard({ budget, spent, onEdit, onClick }: {
    budget: Budget; spent: number;
    onEdit: (b: Budget) => void; onClick: (b: Budget) => void;
}) {
    const currency = budget.currency || 'USD';
    const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - spent;
    const isOver = percent > 100;
    const isWarning = percent > 80 && !isOver;
    const barColor = isOver ? 'var(--error)' : isWarning ? 'var(--warning-dark)' : 'var(--success)';
    const barBg = isOver ? 'var(--error-bg)' : isWarning ? 'var(--warning-bg)' : 'var(--success-bg)';

    return (
        <div
            onClick={() => onClick(budget)}
            style={{
                background: 'white', border: '1px solid var(--border)', borderRadius: 12,
                padding: '1.5rem', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(232,87,42,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                            {budget.department.slice(0, 2).toUpperCase()}
                        </div>
                        <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>{budget.department}</h3>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>FY {budget.fiscalYear}</span>
                </div>
                {isOver && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, background: 'var(--error-bg)', color: 'var(--error)', padding: '4px 10px', borderRadius: 9999 }}><AlertTriangle size={14} /> Over Budget</span>}
                {isWarning && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, background: 'var(--warning-bg)', color: 'var(--warning-dark)', padding: '4px 10px', borderRadius: 9999 }}><AlertCircle size={14} /> Near Limit</span>}
            </div>

            {/* Progress */}
            <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spend Status</span>
                        <span style={{ color: isOver ? 'var(--error)' : 'var(--text-primary)', fontWeight: 700, fontSize: '1.125rem' }}>{formatCurrency(spent, currency)}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: isOver ? 'var(--error)' : 'var(--text-secondary)', fontSize: '1rem' }}>{percent.toFixed(0)}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--surface-hover)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: barColor, width: `${Math.min(percent, 100)}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </div>
            </div>

            {/* Budget details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'var(--surface-hover)', borderRadius: 8, padding: '0.625rem 0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.125rem' }}>Total Limit</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{formatCurrency(budget.amount, currency)}</div>
                </div>
                <div style={{ background: remaining >= 0 ? 'var(--success-bg)' : 'var(--error-bg)', borderRadius: 8, padding: '0.625rem 0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.125rem' }}>Remaining</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: remaining >= 0 ? 'var(--success)' : 'var(--error)' }}>{formatCurrency(Math.abs(remaining), currency)}{remaining < 0 ? ' over' : ''}</div>
                </div>
            </div>

            {/* Footer action */}
            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
                <button onClick={e => { e.stopPropagation(); onEdit(budget); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: 'var(--brand)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    Adjust Limit <ArrowUpRight size={14} />
                </button>
            </div>
        </div>
    );
}

export default function BudgetsPage() {
    const { user } = useAuth();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [spendByDept, setSpendByDept] = useState<Record<string, number>>({});
    const [allRequisitions, setAllRequisitions] = useState<Requisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { showError } = useModal();
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [deptRequisitions, setDeptRequisitions] = useState<Requisition[]>([]);
    const [formData, setFormData] = useState({ department: 'General', amount: 0, currency: 'USD', fiscalYear: '2026' });

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        const [budgetData, analyticsData, reqData] = await Promise.all([
            getBudgets(user), getSpendAnalytics(user), getRequisitions(user)
        ]);
        setBudgets(budgetData);
        setSpendByDept(analyticsData.spendByDepartment);
        setAllRequisitions(reqData);
        setLoading(false);
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    const handleEdit = (budget: Budget) => {
        setEditingId(budget.id!);
        setFormData({ department: budget.department, amount: budget.amount, currency: budget.currency || 'USD', fiscalYear: budget.fiscalYear });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({ department: 'General', amount: 0, currency: 'USD', fiscalYear: '2026' });
        setShowModal(true);
    };

    const handleOpenDetail = (budget: Budget) => {
        const relevant = allRequisitions.filter(r => r.department === budget.department && ['APPROVED', 'ORDERED', 'RECEIVED', 'PAID'].includes(r.status));
        setSelectedBudget(budget);
        setDeptRequisitions(relevant);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!user) return;
            if (editingId) {
                await updateBudget(user.tenantId, editingId, formData);
            } else {
                await createBudget(user.tenantId, formData);
            }
            setShowModal(false);
            setFormData({ department: 'General', amount: 0, currency: 'USD', fiscalYear: '2026' });
            fetchData();
            if (user) {
                await logAction({
                    tenantId: user.tenantId, actorId: user.uid,
                    actorName: user.displayName || 'System',
                    action: editingId ? 'UPDATE' : 'CREATE', entityType: 'BUDGET',
                    entityId: editingId || formData.department,
                    description: `${editingId ? 'Updated' : 'Created'} budget for ${formData.department}: ${formatCurrency(formData.amount, formData.currency)}`,
                    changes: []
                });
            }
        } catch { await showError("Error", "Error saving budget"); }
    };

    // Summary stats
    const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + (spendByDept[b.department] || 0), 0);
    const overCount = budgets.filter(b => (spendByDept[b.department] || 0) > b.amount).length;
    const currencyCount = budgets.reduce((acc, b) => {
        const c = b.currency || 'USD';
        acc[c] = (acc[c] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const displayCurrency = Object.keys(currencyCount).sort((a, b) => currencyCount[b] - currencyCount[a])[0] || 'USD';

    if (loading) return (
        <div className="page-container">
            <Loader text="Loading budgets..." />
        </div>
    );

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Budgets</h1>
                    <p className="page-subtitle">Track spend against department limits and forecast future costs</p>
                </div>
                {budgets.length > 0 && (
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <Plus size={18} style={{ marginRight: 6 }} /> Set Budget
                    </button>
                )}
            </div>

            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Budget', value: formatCurrency(totalBudget, displayCurrency), color: 'var(--brand)', bg: 'var(--brand-soft)', icon: <PieChart size={22} className="text-secondary" /> },
                    { label: 'Total Spent', value: formatCurrency(totalSpent, displayCurrency), color: 'var(--warning-dark)', bg: 'var(--warning-bg)', icon: <CreditCard size={22} /> },
                    { label: 'Over Budget', value: `${overCount} dept${overCount !== 1 ? 's' : ''}`, color: 'var(--error)', bg: 'var(--error-bg)', icon: <AlertTriangle size={22} /> },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: `4px solid ${s.color}`, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                        <div style={{ width: 48, height: 48, background: s.bg, borderRadius: 12, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{s.label}</div>
                            <div style={{ fontWeight: 800, fontSize: '1.5rem', color: s.color, letterSpacing: '-0.3px' }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Budget cards grid */}
            {budgets.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><Briefcase size={40} /></div>
                        <h3>No budgets set</h3>
                        <p>Set department budgets to track and control spending.</p>
                        <button className="btn btn-primary" onClick={handleCreate}><Plus size={18} style={{ marginRight: 6 }} /> Set First Budget</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {budgets.map(budget => (
                        <BudgetProgressCard
                            key={budget.id}
                            budget={budget}
                            spent={spendByDept[budget.department] || 0}
                            onEdit={handleEdit}
                            onClick={handleOpenDetail}
                        />
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-backdrop" style={{ animation: "fadeIn 0.2s ease-out" }}>
                    <div className="modal" style={{ maxWidth: 480, width: "95%", animation: "slideUp 0.3s ease-out", padding: 0, overflow: "hidden" }}>
                        <div className="modal-header" style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", background: "var(--surface-hover)" }}>
                            <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: "1.25rem" }}>
                                {editingId ? <><Briefcase size={24} color="var(--brand)" /> Edit Budget</> : <><Plus size={24} color="var(--brand)" /> Set Department Budget</>}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ display: 'grid', gap: '1.25rem', padding: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label">Fiscal Year</label>
                                        <input className="form-input" type="text" readOnly value="2026" style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }} />
                                    </div>
                                    <div>
                                        <label className="form-label">Department</label>
                                        <select className="form-select" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                            {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <CustomSelect
                                    label="Currency"
                                    value={formData.currency}
                                    onChange={val => setFormData({ ...formData, currency: val })}
                                    options={CURRENCIES.map(c => ({ label: `${c.code} - ${c.name}`, value: c.code, icon: c.flag }))}
                                />
                                <div>
                                    <label className="form-label">Budget Limit</label>
                                    <input type="number" step="1000" required className="form-input"
                                        value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="modal-footer" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border)", background: "var(--surface-hover)" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Create Budget'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedBudget && (
                <BudgetDetailModal
                    budget={selectedBudget}
                    requisitions={deptRequisitions}
                    onClose={() => setSelectedBudget(null)}
                />
            )}
        </div>
    );
}
