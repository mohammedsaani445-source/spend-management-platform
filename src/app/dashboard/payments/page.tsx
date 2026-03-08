"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Bill, PaymentRun, PaymentMethod, AppUser } from "@/types";
import { getBills, getPaymentHistory, processBillPayment, scheduleBill, voidBill } from "@/lib/payments";
import { formatCurrency } from "@/lib/currencies";
import { Search, CreditCard, CalendarDays, CheckCircle2, AlertCircle, Banknote, X, ArrowRight, History, Receipt, Building2, Filter, FileText } from "lucide-react";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";

// ─── Status styles ────────────────────────────────────────────────────────────
const BILL_STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
    UNPAID: { bg: "#FFF7CD", color: "#B76E00", dot: "#B76E00" },
    SCHEDULED: { bg: "#CAFDF5", color: "#006098", dot: "#006098" },
    PROCESSING: { bg: "#E8EAF6", color: "#5C6AC4", dot: "#5C6AC4" },
    PAID: { bg: "#E9FBF0", color: "#00AB55", dot: "#00AB55" },
    FAILED: { bg: "#FFE7D9", color: "#B72136", dot: "#B72136" },
    VOID: { bg: "#F4F6F8", color: "#919EAB", dot: "#919EAB" },
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string; desc: string }[] = [
    { value: "ACH", label: "ACH Transfer", desc: "1-3 business days" },
    { value: "WIRE", label: "Wire Transfer", desc: "Same day (before 2pm EST)" },
    { value: "EFT", label: "EFT", desc: "Electronic Funds Transfer (Canada)" },
    { value: "CHECK", label: "Paper Check", desc: "5-7 business days" },
    { value: "CREDIT_CARD", label: "Credit Card", desc: "Instant, card fees apply" },
];

export default function PaymentsPage() {
    const { user } = useAuth();
    const { showConfirm, showError, showAlert } = useModal();

    const [bills, setBills] = useState<Bill[]>([]);
    const [history, setHistory] = useState<PaymentRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"bills" | "history">("bills");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // ── Pay Modal state ──────────────────────────────────────────────────────
    const [showPayModal, setShowPayModal] = useState(false);
    const [payMethod, setPayMethod] = useState<PaymentMethod>("ACH");
    const [scheduleDate, setScheduleDate] = useState("");
    const [isScheduling, setIsScheduling] = useState(false);
    const [payNotes, setPayNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // ── Schedule single bill ─────────────────────────────────────────────────
    const [scheduleTarget, setScheduleTarget] = useState<Bill | null>(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const [billsData, histData] = await Promise.all([
            getBills(user),
            getPaymentHistory(user.tenantId),
        ]);
        setBills(billsData);
        setHistory(histData);
        setLoading(false);
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const today = new Date();
        const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const outstanding = bills
            .filter(b => ["UNPAID", "SCHEDULED"].includes(b.status))
            .reduce((s, b) => s + b.amount, 0);

        const dueThisWeek = bills
            .filter(b => b.status === "UNPAID" && new Date(b.dueDate) <= weekEnd)
            .reduce((s, b) => s + b.amount, 0);

        const overdue = bills
            .filter(b => b.status === "UNPAID" && new Date(b.dueDate) < today)
            .reduce((s, b) => s + b.amount, 0);

        const paidThisMonth = bills
            .filter(b => b.status === "PAID" && b.paymentDate && new Date(b.paymentDate) >= monthStart)
            .reduce((s, b) => s + b.amount, 0);

        return { outstanding, dueThisWeek, overdue, paidThisMonth };
    }, [bills]);

    // ── Filtered bills ────────────────────────────────────────────────────────
    const filteredBills = useMemo(() => {
        const q = search.toLowerCase();
        return bills.filter(b => {
            const matchSearch = !q || b.vendorName.toLowerCase().includes(q) || b.invoiceNumber.toLowerCase().includes(q) || (b.poNumber || "").toLowerCase().includes(q);
            const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [bills, search, statusFilter]);

    // ── Selection utils ───────────────────────────────────────────────────────
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        const payable = filteredBills.filter(b => b.status === "UNPAID");
        if (selectedIds.size === payable.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(payable.map(b => b.id)));
        }
    };

    const selectedBills = bills.filter(b => selectedIds.has(b.id));
    const selectedTotal = selectedBills.reduce((s, b) => s + b.amount, 0);

    const isOverdue = (bill: Bill) =>
        bill.status === "UNPAID" && new Date(bill.dueDate) < new Date();

    // ── Process payment ───────────────────────────────────────────────────────
    const handlePayBills = async () => {
        if (selectedIds.size === 0) {
            await showAlert("No bills selected", "Please select at least one unpaid bill to pay.");
            return;
        }
        if (isScheduling && !scheduleDate) {
            await showAlert("Schedule date required", "Please pick a future payment date.");
            return;
        }
        const confirmed = await showConfirm(
            isScheduling ? "Schedule Payment" : "Confirm Payment",
            `${isScheduling ? "Schedule" : "Process"} payment of ${formatCurrency(selectedTotal, "USD")} for ${selectedIds.size} bill(s) via ${payMethod}?`
        );
        if (!confirmed) return;

        setSubmitting(true);
        try {
            await processBillPayment(
                user!.tenantId,
                Array.from(selectedIds),
                payMethod,
                user!.uid,
                user!.displayName,
                isScheduling ? scheduleDate : undefined,
                payNotes || undefined
            );
            setShowPayModal(false);
            setSelectedIds(new Set());
            setScheduleDate("");
            setPayNotes("");
            await fetchData();
        } catch (e: any) {
            await showError("Payment Failed", e.message || "Payment processing failed.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Schedule single bill ──────────────────────────────────────────────────
    const handleScheduleSingle = async () => {
        if (!scheduleTarget || !scheduleDate) return;
        setSubmitting(true);
        try {
            await scheduleBill(user!.tenantId, scheduleTarget.id, scheduleDate, payMethod);
            setShowScheduleModal(false);
            setScheduleTarget(null);
            setScheduleDate("");
            await fetchData();
        } catch (e: any) {
            await showError("Error", e.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Void bill ─────────────────────────────────────────────────────────────
    const handleVoidBill = async (bill: Bill) => {
        const confirmed = await showConfirm("Void Bill", `Void invoice ${bill.invoiceNumber} from ${bill.vendorName}?`);
        if (!confirmed) return;
        try {
            await voidBill(user!.tenantId, bill.id);
            await fetchData();
        } catch (e: any) {
            await showError("Error", e.message);
        }
    };

    if (loading) return (
        <div className="page-container">
            <Loader text="Loading payments..." />
        </div>
    );

    const payableCount = filteredBills.filter(b => b.status === "UNPAID").length;

    return (
        <div className="page-container">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Payments</h1>
                    <p className="page-subtitle">Manage bills, process vendor payments, and track AP runs</p>
                </div>
                {selectedIds.size > 0 && (
                    <button className="btn btn-primary" onClick={() => setShowPayModal(true)}>
                        <CreditCard size={18} style={{ marginRight: 6 }} /> Pay {selectedIds.size} Bill{selectedIds.size !== 1 ? "s" : ""} · {formatCurrency(selectedTotal, "USD")}
                    </button>
                )}
            </div>

            {/* ── Stats Strip ─────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                    { label: "Total Outstanding", value: formatCurrency(stats.outstanding, "USD"), color: "#5C6AC4", bg: "#E8EAF6", icon: <Banknote size={22} className="text-secondary" /> },
                    { label: "Due This Week", value: formatCurrency(stats.dueThisWeek, "USD"), color: "#B76E00", bg: "#FFF7CD", icon: <CalendarDays size={22} /> },
                    { label: "Overdue", value: formatCurrency(stats.overdue, "USD"), color: "#B72136", bg: "#FFE7D9", icon: <AlertCircle size={22} /> },
                    { label: "Paid This Month", value: formatCurrency(stats.paidThisMonth, "USD"), color: "#00AB55", bg: "#E9FBF0", icon: <CheckCircle2 size={22} /> },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ background: "white", border: "1px solid #DFE3E8", borderRadius: 12, padding: "1.25rem", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#637381" }}>{s.label}</span>
                            <div style={{ width: 36, height: 36, background: s.bg, color: s.color, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                        </div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* ── Tab Bar ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "0.25rem", background: "#F4F6F8", padding: "0.375rem", borderRadius: 10, width: "fit-content", marginBottom: "1.5rem", border: "1px solid #DFE3E8" }}>
                {(["bills", "history"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.5rem 1.25rem", borderRadius: 8, border: "none", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", transition: "all 0.15s ease",
                        background: tab === t ? "white" : "transparent",
                        color: tab === t ? "#5C6AC4" : "#637381",
                        boxShadow: tab === t ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
                    }}>
                        {t === "bills" ? <><Receipt size={16} /> Bills ({payableCount})</> : <><History size={16} /> Payment History</>}
                    </button>
                ))}
            </div>

            {/* ════════════════════════════════════════════════════════════════
                TAB: Bills
            ════════════════════════════════════════════════════════════════ */}
            {tab === "bills" && (
                <>
                    {/* ── Toolbar ────────────────────────────────────────── */}
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", background: "white", padding: "0.75rem", borderRadius: 12, border: "1px solid #DFE3E8" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
                            <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#919EAB" }}><Search size={18} /></span>
                            <input type="text" placeholder="Search vendor, invoice #, PO..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="form-input" style={{ paddingLeft: "2.75rem", background: "#F4F6F8", border: "none" }} />
                        </div>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                            {["ALL", "UNPAID", "SCHEDULED", "PROCESSING", "PAID", "FAILED"].map(s => (
                                <button key={s} onClick={() => setStatusFilter(s)} style={{
                                    padding: "0.4rem 0.875rem", borderRadius: 8, border: "none", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
                                    background: statusFilter === s ? "#5C6AC4" : "#F4F6F8",
                                    color: statusFilter === s ? "white" : "#637381",
                                }}>
                                    {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Batch Action Bar ──────────────────────────────── */}
                    {selectedIds.size > 0 && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#E8EAF6", border: "1px solid #C5CAE9", borderRadius: 10, padding: "0.75rem 1.25rem", marginBottom: "1rem" }}>
                            <span style={{ fontWeight: 700, color: "#5C6AC4" }}>
                                {selectedIds.size} bill{selectedIds.size !== 1 ? "s" : ""} selected · {formatCurrency(selectedTotal, "USD")} total
                            </span>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedIds(new Set())}>Clear</button>
                                <button className="btn btn-primary" onClick={() => { setIsScheduling(false); setShowPayModal(true); }}>
                                    <CreditCard size={16} style={{ marginRight: 6 }} /> Pay Now
                                </button>
                                <button className="btn btn-secondary" onClick={() => { setIsScheduling(true); setShowPayModal(true); }}>
                                    <CalendarDays size={16} style={{ marginRight: 6 }} /> Schedule
                                </button>
                            </div>
                        </div>
                    )}

                    {filteredBills.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon" style={{ background: "#F3F4FD", color: "#5C6AC4" }}><Receipt size={40} /></div>
                                <h3>No bills to display</h3>
                                <p>Approved invoices will appear here as bills ready for payment.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 36 }}>
                                            <input type="checkbox"
                                                checked={selectedIds.size === filteredBills.filter(b => b.status === "UNPAID").length && payableCount > 0}
                                                onChange={selectAll}
                                                style={{ accentColor: "#5C6AC4" }}
                                            />
                                        </th>
                                        <th>Invoice #</th>
                                        <th>Vendor</th>
                                        <th>PO #</th>
                                        <th>Department</th>
                                        <th>Issue Date</th>
                                        <th>Due Date</th>
                                        <th style={{ textAlign: "right" }}>Amount</th>
                                        <th>Status</th>
                                        <th>Method</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBills.map(bill => {
                                        const style = BILL_STATUS_STYLES[bill.status] || BILL_STATUS_STYLES.UNPAID;
                                        const overdue = isOverdue(bill);
                                        const isSelected = selectedIds.has(bill.id);
                                        return (
                                            <tr key={bill.id} style={{ background: isSelected ? "#F3F4FD" : undefined }}>
                                                <td>
                                                    {bill.status === "UNPAID" && (
                                                        <input type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelect(bill.id)}
                                                            style={{ accentColor: "#5C6AC4" }}
                                                        />
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#5C6AC4", fontSize: "0.875rem" }}>
                                                        {bill.invoiceNumber}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F4F6F8", color: "#5C6AC4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", border: "1px solid #DFE3E8" }}>
                                                            {bill.vendorName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 600, color: "#212B36" }}>{bill.vendorName}</span>
                                                    </div>
                                                </td>
                                                <td style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#637381", display: 'flex', alignItems: 'center', gap: '4px', height: 48 }}>
                                                    {bill.poNumber ? <><FileText size={14} /> {bill.poNumber}</> : "—"}
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: "0.75rem", background: "#E8EAF6", color: "#5C6AC4", padding: "4px 8px", borderRadius: 6, fontWeight: 700, display: "inline-block" }}>
                                                        {bill.department}
                                                    </span>
                                                </td>
                                                <td style={{ color: "#637381", fontSize: "0.875rem" }}>
                                                    {new Date(bill.issueDate).toLocaleDateString()}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                        <span style={{ color: overdue ? "#B72136" : "#637381", fontWeight: overdue ? 700 : 400 }}>
                                                            {new Date(bill.dueDate).toLocaleDateString()}
                                                        </span>
                                                        {overdue && (
                                                            <span style={{ background: "#FFE7D9", color: "#B72136", fontSize: "0.65rem", fontWeight: 800, padding: "1px 6px", borderRadius: 4, letterSpacing: "0.04em" }}>OVERDUE</span>
                                                        )}
                                                        {bill.scheduledDate && bill.status === "SCHEDULED" && (
                                                            <span style={{ background: "#CAFDF5", color: "#006098", fontSize: "0.65rem", fontWeight: 800, padding: "1px 6px", borderRadius: 4 }}>
                                                                → {new Date(bill.scheduledDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: "right", fontWeight: 800, color: overdue ? "#B72136" : "#212B36" }}>
                                                    {formatCurrency(bill.amount, bill.currency || "USD")}
                                                </td>
                                                <td>
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700, background: style.bg, color: style.color }}>
                                                        ● {bill.status}
                                                    </span>
                                                </td>
                                                <td style={{ color: "#637381", fontSize: "0.8rem" }}>
                                                    {bill.paymentMethod || "—"}
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "0.375rem" }}>
                                                        {bill.status === "UNPAID" && (
                                                            <>
                                                                <button
                                                                    className="btn btn-primary btn-sm"
                                                                    style={{ padding: "0.35rem 0.75rem" }}
                                                                    onClick={() => { setSelectedIds(new Set([bill.id])); setIsScheduling(false); setShowPayModal(true); }}>
                                                                    Pay
                                                                </button>
                                                                <button
                                                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: "1px solid #DFE3E8", background: "white", color: "#637381", cursor: "pointer", transition: "all 0.15s" }}
                                                                    onMouseEnter={e => { e.currentTarget.style.background = "#F4F6F8"; e.currentTarget.style.color = "#212B36"; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#637381"; }}
                                                                    title="Schedule Payment"
                                                                    onClick={() => { setScheduleTarget(bill); setShowScheduleModal(true); }}>
                                                                    <CalendarDays size={14} />
                                                                </button>
                                                                <button
                                                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: "1px solid #FFE7D9", background: "white", color: "#B72136", cursor: "pointer", transition: "all 0.15s" }}
                                                                    onMouseEnter={e => { e.currentTarget.style.background = "#FFE7D9"; e.currentTarget.style.color = "#7A0C2E"; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#B72136"; }}
                                                                    title="Void Bill"
                                                                    onClick={() => handleVoidBill(bill)}>
                                                                    <X size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {bill.paymentRef && (
                                                            <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "#919EAB" }} title="Bank Reference">
                                                                {bill.paymentRef.slice(0, 12)}…
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB: Payment History
            ════════════════════════════════════════════════════════════════ */}
            {tab === "history" && (
                history.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon" style={{ background: "#F4F6F8", color: "#637381" }}><History size={40} /></div>
                            <h3>No payment runs yet</h3>
                            <p>Completed and scheduled payment runs will appear here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Reference #</th>
                                    <th>Bills</th>
                                    <th style={{ textAlign: "right" }}>Total</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Created By</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(run => {
                                    const runStyle = {
                                        COMPLETED: { bg: "#E9FBF0", color: "#00AB55" },
                                        PENDING: { bg: "#FFF7CD", color: "#B76E00" },
                                        PROCESSING: { bg: "#E8EAF6", color: "#5C6AC4" },
                                        FAILED: { bg: "#FFE7D9", color: "#B72136" },
                                    }[run.status] || { bg: "#F4F6F8", color: "#637381" };

                                    return (
                                        <tr key={run.id}>
                                            <td style={{ color: "#637381", fontSize: "0.8125rem" }}>
                                                <div>{new Date(run.createdAt).toLocaleDateString()}</div>
                                                {run.processedAt && (
                                                    <div style={{ fontSize: "0.75rem", color: "#919EAB" }}>
                                                        Processed: {new Date(run.processedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#5C6AC4", fontSize: "0.8rem" }}>
                                                {run.referenceNumber}
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700 }}>{run.billIds.length}</span>
                                                <span style={{ color: "#919EAB", fontSize: "0.8rem" }}> bill{run.billIds.length !== 1 ? "s" : ""}</span>
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: 800 }}>
                                                {formatCurrency(run.totalAmount, run.currency || "USD")}
                                            </td>
                                            <td style={{ color: "#637381" }}>{run.paymentMethod}</td>
                                            <td>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700, background: runStyle.bg, color: runStyle.color }}>
                                                    ● {run.status}
                                                </span>
                                                {run.status === "PENDING" && run.paymentDate && (
                                                    <div style={{ fontSize: "0.7rem", color: "#006098", marginTop: 2 }}>
                                                        Scheduled: {new Date(run.paymentDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ color: "#637381", fontSize: "0.875rem" }}>{run.createdByName}</td>
                                            <td style={{ color: "#919EAB", fontSize: "0.8rem" }}>{run.notes || "—"}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* ════════════════════════════════════════════════════════════════
                PAY BILLS MODAL
            ════════════════════════════════════════════════════════════════ */}
            {showPayModal && (
                <div className="modal-backdrop" style={{ animation: "fadeIn 0.2s ease-out" }}>
                    <div className="modal" style={{ maxWidth: 560, width: "95%", animation: "slideUp 0.3s ease-out", padding: 0, overflow: "hidden" }}>
                        <div className="modal-header" style={{ padding: "1.5rem", borderBottom: "1px solid #DFE3E8", background: "#F9FAFB" }}>
                            <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0, fontSize: "1.25rem" }}>
                                {isScheduling ? <><CalendarDays size={24} color="#006098" /> Schedule Payment</> : <><CreditCard size={24} color="#5C6AC4" /> Process Payment</>}
                            </h2>
                            <button onClick={() => setShowPayModal(false)} style={{ background: "none", border: "none", color: "#919EAB", cursor: "pointer", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "#212B36"} onMouseLeave={e => e.currentTarget.style.color = "#919EAB"}><X size={24} /></button>
                        </div>

                        <div className="modal-body" style={{ padding: "1.5rem" }}>
                            {/* Selected Bills Summary */}
                            <div style={{ background: "#F4F6F8", borderRadius: 10, padding: "0.875rem 1rem", marginBottom: "1.25rem" }}>
                                <div style={{ fontWeight: 700, color: "#212B36", marginBottom: "0.5rem" }}>
                                    {selectedBills.length} bill{selectedBills.length !== 1 ? "s" : ""} selected
                                </div>
                                {selectedBills.map(b => (
                                    <div key={b.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#637381", paddingTop: "0.25rem" }}>
                                        <span>{b.vendorName} · {b.invoiceNumber}</span>
                                        <span style={{ fontWeight: 600 }}>{formatCurrency(b.amount, b.currency)}</span>
                                    </div>
                                ))}
                                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #DFE3E8", marginTop: "0.5rem", paddingTop: "0.5rem", fontWeight: 800, color: "#212B36" }}>
                                    <span>Total</span>
                                    <span style={{ color: "#5C6AC4" }}>{formatCurrency(selectedTotal, "USD")}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div style={{ marginBottom: "1.25rem" }}>
                                <label className="form-label">Payment Method</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    {PAYMENT_METHODS.map(pm => (
                                        <label key={pm.value} style={{
                                            display: "flex", alignItems: "center", gap: "0.75rem",
                                            padding: "0.75rem 1rem", border: `2px solid ${payMethod === pm.value ? "#5C6AC4" : "#DFE3E8"}`,
                                            borderRadius: 10, cursor: "pointer",
                                            background: payMethod === pm.value ? "#F3F4FD" : "white",
                                            transition: "all 0.15s"
                                        }}>
                                            <input type="radio" name="payMethod" value={pm.value}
                                                checked={payMethod === pm.value}
                                                onChange={() => setPayMethod(pm.value)}
                                                style={{ accentColor: "#5C6AC4", width: 18, height: 18 }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: payMethod === pm.value ? "#212B36" : "#454F5B" }}>{pm.label}</div>
                                                <div style={{ fontSize: "0.8rem", color: "#637381", marginTop: 2 }}>{pm.desc}</div>
                                            </div>
                                            <div style={{ color: payMethod === pm.value ? "#5C6AC4" : "#DFE3E8", opacity: payMethod === pm.value ? 1 : 0.5, transition: "all 0.2s" }}>
                                                {pm.value === "CREDIT_CARD" ? <CreditCard size={24} /> : pm.value === "CHECK" ? <FileText size={24} /> : <Building2 size={24} />}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Schedule date (always shown if isScheduling) */}
                            {isScheduling && (
                                <div style={{ marginBottom: "1rem" }}>
                                    <label className="form-label">Payment Date *</label>
                                    <input type="date"
                                        className="form-input"
                                        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                                        value={scheduleDate}
                                        onChange={e => setScheduleDate(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="form-label">Notes (optional)</label>
                                <textarea rows={2} className="form-input"
                                    placeholder="Batch reference, remittance info..."
                                    value={payNotes}
                                    onChange={e => setPayNotes(e.target.value)}
                                    style={{ resize: "vertical" }}
                                />
                            </div>
                        </div>

                        <div className="modal-footer" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #DFE3E8", background: "#F9FAFB" }}>
                            <button className="btn btn-secondary" onClick={() => setShowPayModal(false)} disabled={submitting}>Cancel</button>
                            <button className="btn btn-primary" onClick={handlePayBills} disabled={submitting}>
                                {submitting ? "Processing..." : isScheduling ? <><CalendarDays size={18} style={{ marginRight: 6 }} /> Schedule Payment</> : <><CreditCard size={18} style={{ marginRight: 6 }} /> Process Payment</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                SCHEDULE SINGLE BILL MODAL
            ════════════════════════════════════════════════════════════════ */}
            {showScheduleModal && scheduleTarget && (
                <div className="modal-backdrop" style={{ animation: "fadeIn 0.2s ease-out" }}>
                    <div className="modal" style={{ maxWidth: 440, width: "95%", animation: "slideUp 0.3s ease-out", padding: 0, overflow: "hidden" }}>
                        <div className="modal-header" style={{ padding: "1.5rem", borderBottom: "1px solid #DFE3E8", background: "#F9FAFB" }}>
                            <h2 className="modal-title" style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: 8, margin: 0, fontSize: "1.25rem" }}><CalendarDays size={24} color="#006098" /> Schedule Bill</h2>
                            <button onClick={() => setShowScheduleModal(false)} style={{ background: "none", border: "none", color: "#919EAB", cursor: "pointer", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "#212B36"} onMouseLeave={e => e.currentTarget.style.color = "#919EAB"}><X size={24} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: "1.5rem" }}>
                            <p style={{ color: "#637381", marginBottom: "1rem", fontSize: "0.875rem" }}>
                                Schedule payment for <strong>{scheduleTarget.invoiceNumber}</strong> from{" "}
                                <strong>{scheduleTarget.vendorName}</strong> — {formatCurrency(scheduleTarget.amount, scheduleTarget.currency)}
                            </p>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">Payment Date *</label>
                                <input type="date" className="form-input"
                                    min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                                    value={scheduleDate}
                                    onChange={e => setScheduleDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="form-label">Payment Method</label>
                                <select className="form-input" value={payMethod} onChange={e => setPayMethod(e.target.value as PaymentMethod)}>
                                    {PAYMENT_METHODS.map(pm => (
                                        <option key={pm.value} value={pm.value}>{pm.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #DFE3E8", background: "#F9FAFB" }}>
                            <button className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleScheduleSingle} disabled={submitting || !scheduleDate}>
                                {submitting ? "Saving..." : <><CalendarDays size={18} style={{ marginRight: 6 }} /> Schedule</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
