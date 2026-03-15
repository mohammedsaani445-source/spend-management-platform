"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    generateSpendSummary, generateAgingReport, generateVendorPerformance,
    generateBudgetVsActual, getPaymentSummary,
    exportSpendSummaryToCsv, exportAgingToCsv, exportVendorPerformanceToCsv,
    exportBudgetVsActualToCsv,
    SpendSummary, AgingReport, VendorPerformanceRow, BudgetVsActualRow, DateRange
} from "@/lib/reports";
import { formatCurrency } from "@/lib/currencies";
import {
    BarChart3, Download, TrendingUp, TrendingDown, Clock, Users, Wallet,
    CalendarDays, Filter, FileSpreadsheet, PieChart, ArrowUpRight, ArrowDownRight,
    Building2, AlertTriangle, CheckCircle2, Minus
} from "lucide-react";
import Loader from "@/components/common/Loader";

// ── Tab Items ─────────────────────────────────────────────────────────────────
const REPORT_TABS = [
    { id: "spend", label: "Spend Summary", icon: <BarChart3 size={16} /> },
    { id: "aging", label: "Payment Aging", icon: <Clock size={16} /> },
    { id: "vendors", label: "Vendor Performance", icon: <Users size={16} /> },
    { id: "budget", label: "Budget vs Actual", icon: <Wallet size={16} /> },
] as const;

type ReportTab = typeof REPORT_TABS[number]["id"];

// ── Inline SVG Bar Chart Component ────────────────────────────────────────────
function MiniBarChart({ data, color = "#5C6AC4" }: { data: { label: string; value: number }[]; color?: string }) {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: 120, padding: "0.5rem 0" }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                        width: "100%", maxWidth: 40,
                        height: `${Math.max(4, (d.value / max) * 100)}%`,
                        background: `linear-gradient(180deg, ${color}, ${color}88)`,
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.5s ease",
                        minHeight: 4,
                    }} />
                    <span style={{ fontSize: "0.6rem", color: "#919EAB", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 50 }}>
                        {d.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ── Donut Chart Component ─────────────────────────────────────────────────────
function DonutChart({ segments, size = 140 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    if (total === 0) return <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", color: "#919EAB" }}>No data</div>;

    const radius = size / 2 - 8;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.filter(s => s.value > 0).map((seg, i) => {
                const pct = seg.value / total;
                const dash = circumference * pct;
                const currentOffset = offset;
                offset += dash;
                return (
                    <circle key={i}
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={seg.color} strokeWidth={20}
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-currentOffset}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        style={{ transition: "stroke-dasharray 0.5s ease" }}
                    />
                );
            })}
            <circle cx={size / 2} cy={size / 2} r={radius - 16} fill="white" />
        </svg>
    );
}

// ── Score Badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
    const color = score >= 80 ? "#00AB55" : score >= 60 ? "#B76E00" : "#B72136";
    const bg = score >= 80 ? "#E9FBF0" : score >= 60 ? "#FFF7CD" : "#FFE7D9";
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700, background: bg, color }}>
            {score}
        </span>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
export default function ReportsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<ReportTab>("spend");
    const [range, setRange] = useState<DateRange>({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
    });

    // Report data
    const [spendData, setSpendData] = useState<SpendSummary | null>(null);
    const [agingData, setAgingData] = useState<AgingReport | null>(null);
    const [vendorData, setVendorData] = useState<VendorPerformanceRow[]>([]);
    const [budgetData, setBudgetData] = useState<BudgetVsActualRow[]>([]);
    const [paymentSummary, setPaymentSummary] = useState<{ totalPaid: number; runCount: number; byMethod: Record<string, number> } | null>(null);

    const fetchReports = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [spend, aging, vendors, budget, payments] = await Promise.all([
                generateSpendSummary(user.tenantId, range),
                generateAgingReport(user.tenantId),
                generateVendorPerformance(user.tenantId, range),
                generateBudgetVsActual(user.tenantId),
                getPaymentSummary(user.tenantId, range),
            ]);
            setSpendData(spend);
            setAgingData(aging);
            setVendorData(vendors);
            setBudgetData(budget);
            setPaymentSummary(payments);
        } catch (err) {
            console.error("[Reports] Error loading reports:", err);
        } finally {
            setLoading(false);
        }
    }, [user, range]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    // ── Export handlers ────────────────────────────────────────────────────────
    const handleExport = () => {
        if (tab === "spend" && spendData) exportSpendSummaryToCsv(spendData);
        else if (tab === "aging" && agingData) exportAgingToCsv(agingData);
        else if (tab === "vendors" && vendorData.length > 0) exportVendorPerformanceToCsv(vendorData);
        else if (tab === "budget" && budgetData.length > 0) exportBudgetVsActualToCsv(budgetData);
    };

    const DONUT_COLORS = ["#5C6AC4", "#00AB55", "#B76E00", "#006098", "#B72136", "#7C3AED", "#0EA5E9"];

    if (loading) return (
        <div className="page-container">
            <Loader text="Generating reports from live data..." />
        </div>
    );

    return (
        <div className="page-container">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Real-time financial and operational insights powered by live data</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button className="btn btn-secondary" onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* ── KPI Strip ───────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                    { label: "Total Spend", value: formatCurrency(spendData?.totalSpend || 0, "USD"), color: "#5C6AC4", bg: "#E8EAF6", icon: <TrendingUp size={22} /> },
                    { label: "Outstanding", value: formatCurrency(agingData?.totalOutstanding || 0, "USD"), color: "#B76E00", bg: "#FFF7CD", icon: <Clock size={22} /> },
                    { label: "Payments Made", value: formatCurrency(paymentSummary?.totalPaid || 0, "USD"), color: "#00AB55", bg: "#E9FBF0", icon: <CheckCircle2 size={22} /> },
                    { label: "Active Vendors", value: String(vendorData.length), color: "#006098", bg: "#CAFDF5", icon: <Users size={22} /> },
                ].map(s => (
                    <div key={s.label} style={{ background: "white", border: "1px solid #DFE3E8", borderRadius: 12, padding: "1.25rem", transition: "all 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#637381" }}>{s.label}</span>
                            <div style={{ width: 36, height: 36, background: s.bg, color: s.color, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                        </div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* ── Date Range Filter ───────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.5rem", background: "white", padding: "0.75rem 1rem", borderRadius: 12, border: "1px solid #DFE3E8" }}>
                <CalendarDays size={18} color="#637381" />
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#637381" }}>Date Range:</span>
                <input type="date" className="form-input" value={range.start}
                    onChange={e => setRange(r => ({ ...r, start: e.target.value }))}
                    style={{ maxWidth: 160, padding: "0.4rem 0.6rem", fontSize: "0.85rem" }} />
                <span style={{ color: "#919EAB" }}>to</span>
                <input type="date" className="form-input" value={range.end}
                    onChange={e => setRange(r => ({ ...r, end: e.target.value }))}
                    style={{ maxWidth: 160, padding: "0.4rem 0.6rem", fontSize: "0.85rem" }} />
                <button className="btn btn-primary btn-sm" onClick={fetchReports}
                    style={{ padding: "0.4rem 1rem", marginLeft: "auto" }}>
                    <Filter size={14} style={{ marginRight: 4 }} /> Apply
                </button>
            </div>

            {/* ── Tab Bar ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "0.25rem", background: "#F4F6F8", padding: "0.375rem", borderRadius: 10, width: "fit-content", marginBottom: "1.5rem", border: "1px solid #DFE3E8" }}>
                {REPORT_TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.5rem 1.25rem", borderRadius: 8, border: "none", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", transition: "all 0.15s ease",
                        background: tab === t.id ? "white" : "transparent",
                        color: tab === t.id ? "#5C6AC4" : "#637381",
                        boxShadow: tab === t.id ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
                    }}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ════════════════════════════════════════════════════════════════
                TAB: Spend Summary
            ════════════════════════════════════════════════════════════════ */}
            {tab === "spend" && spendData && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    {/* By Department */}
                    <div style={{ background: "white", border: "1px solid #DFE3E8", borderRadius: 12, padding: "1.5rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#212B36", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                            <Building2 size={18} color="#5C6AC4" /> Spend by Department
                        </h3>
                        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                            <DonutChart segments={Object.entries(spendData.byDepartment).map(([dept, val], i) => ({
                                label: dept, value: val, color: DONUT_COLORS[i % DONUT_COLORS.length]
                            }))} />
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {Object.entries(spendData.byDepartment)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 6)
                                    .map(([dept, amount], i) => (
                                        <div key={dept} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.35rem 0", borderBottom: "1px solid #F4F6F8" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: 3, background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                                                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#454F5B" }}>{dept}</span>
                                            </div>
                                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#212B36" }}>{formatCurrency(amount, "USD")}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    <div style={{ background: "white", border: "1px solid #DFE3E8", borderRadius: 12, padding: "1.5rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#212B36", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                            <TrendingUp size={18} color="#00AB55" /> Monthly Spend Trend
                        </h3>
                        {spendData.byMonth.length > 0 ? (
                            <MiniBarChart data={spendData.byMonth.map(m => ({
                                label: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
                                value: m.amount
                            }))} color="#00AB55" />
                        ) : (
                            <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#919EAB" }}>
                                No monthly data available
                            </div>
                        )}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1rem" }}>
                            <div style={{ background: "#F4F6F8", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                                <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#919EAB", textTransform: "uppercase", marginBottom: 4 }}>Invoices</div>
                                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#212B36" }}>{spendData.invoiceCount}</div>
                            </div>
                            <div style={{ background: "#F4F6F8", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                                <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#919EAB", textTransform: "uppercase", marginBottom: 4 }}>Avg Invoice</div>
                                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#212B36" }}>{formatCurrency(spendData.averageInvoice, "USD")}</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Vendors */}
                    <div style={{ gridColumn: "1 / -1", background: "white", border: "1px solid #DFE3E8", borderRadius: 12, padding: "1.5rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#212B36", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                            <Users size={18} color="#006098" /> Top Vendors by Spend
                        </h3>
                        {Object.entries(spendData.byVendor).sort(([, a], [, b]) => b - a).length === 0 ? (
                            <div style={{ padding: "2rem", textAlign: "center", color: "#919EAB" }}>No vendor data available</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {Object.entries(spendData.byVendor)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 8)
                                    .map(([vendor, amount]) => {
                                        const pct = spendData.totalSpend > 0 ? (amount / spendData.totalSpend) * 100 : 0;
                                        return (
                                            <div key={vendor} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.5rem 0" }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E8EAF6", color: "#5C6AC4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem" }}>
                                                    {vendor.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ width: 160, fontWeight: 600, fontSize: "0.875rem", color: "#212B36", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor}</span>
                                                <div style={{ flex: 1, height: 8, background: "#F4F6F8", borderRadius: 4, overflow: "hidden" }}>
                                                    <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #5C6AC4, #7C3AED)", borderRadius: 4, transition: "width 0.5s ease" }} />
                                                </div>
                                                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#212B36", minWidth: 100, textAlign: "right" }}>{formatCurrency(amount, "USD")}</span>
                                                <span style={{ fontSize: "0.75rem", color: "#919EAB", minWidth: 40 }}>{pct.toFixed(1)}%</span>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB: Payment Aging
            ════════════════════════════════════════════════════════════════ */}
            {tab === "aging" && agingData && (
                <div>
                    {/* Aging Buckets */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                        {agingData.buckets.map((bucket, i) => {
                            const colors = [
                                { bg: "#E9FBF0", color: "#00AB55", border: "#B7F2D3" },
                                { bg: "#FFF7CD", color: "#B76E00", border: "#FFE16A" },
                                { bg: "#FFE7D9", color: "#B72136", border: "#FFAC82" },
                                { bg: "#FFE7D9", color: "#7A0C2E", border: "#FF6B93" },
                            ][i];
                            return (
                                <div key={bucket.label} style={{
                                    background: "white", border: `1px solid ${colors.border}`, borderTop: `4px solid ${colors.color}`,
                                    borderRadius: 12, padding: "1.25rem", transition: "all 0.2s"
                                }}>
                                    <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#637381", marginBottom: "0.5rem" }}>
                                        {bucket.label}
                                    </div>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.color, marginBottom: "0.25rem" }}>
                                        {formatCurrency(bucket.amount, "USD")}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#919EAB" }}>
                                        <span>{bucket.count} bill{bucket.count !== 1 ? "s" : ""}</span>
                                        <span>{bucket.percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detailed aging table */}
                    {agingData.totalCount > 0 ? (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Vendor</th>
                                        <th>Invoice #</th>
                                        <th style={{ textAlign: "right" }}>Amount</th>
                                        <th>Days Overdue</th>
                                        <th>Bucket</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agingData.buckets.flatMap(bucket =>
                                        bucket.bills.map((b, i) => (
                                            <tr key={`${bucket.label}-${i}`}>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                        <div style={{ width: 28, height: 28, borderRadius: 6, background: "#F4F6F8", color: "#5C6AC4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem" }}>
                                                            {b.vendor.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 600 }}>{b.vendor}</span>
                                                    </div>
                                                </td>
                                                <td style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#5C6AC4", fontWeight: 700 }}>{b.invoice}</td>
                                                <td style={{ textAlign: "right", fontWeight: 700 }}>{formatCurrency(b.amount, "USD")}</td>
                                                <td>
                                                    <span style={{
                                                        fontWeight: 700,
                                                        color: b.daysOverdue > 60 ? "#B72136" : b.daysOverdue > 30 ? "#B76E00" : "#00AB55",
                                                    }}>
                                                        {b.daysOverdue > 0 ? `${b.daysOverdue} days` : "Current"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: "2px 10px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700,
                                                        background: bucket.label === "Current" ? "#E9FBF0" : bucket.label === "31–60" ? "#FFF7CD" : "#FFE7D9",
                                                        color: bucket.label === "Current" ? "#00AB55" : bucket.label === "31–60" ? "#B76E00" : "#B72136",
                                                    }}>
                                                        {bucket.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon" style={{ background: "#E9FBF0", color: "#00AB55" }}><CheckCircle2 size={40} /></div>
                                <h3>All caught up!</h3>
                                <p>No outstanding bills at this time.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB: Vendor Performance
            ════════════════════════════════════════════════════════════════ */}
            {tab === "vendors" && (
                vendorData.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon" style={{ background: "#E8EAF6", color: "#5C6AC4" }}><Users size={40} /></div>
                            <h3>No vendor data</h3>
                            <p>Vendor performance will appear here once invoices and POs are processed.</p>
                        </div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Vendor</th>
                                    <th style={{ textAlign: "right" }}>Total Spend</th>
                                    <th style={{ textAlign: "center" }}>Invoices</th>
                                    <th style={{ textAlign: "center" }}>POs</th>
                                    <th style={{ textAlign: "center" }}>On-Time %</th>
                                    <th style={{ textAlign: "center" }}>Avg Pay Days</th>
                                    <th style={{ textAlign: "center" }}>Score</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendorData.map(v => (
                                    <tr key={v.vendorId}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E8EAF6", color: "#5C6AC4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem" }}>
                                                    {v.vendorName.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600, color: "#212B36" }}>{v.vendorName}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right", fontWeight: 800 }}>{formatCurrency(v.totalSpend, "USD")}</td>
                                        <td style={{ textAlign: "center", fontWeight: 600 }}>{v.invoiceCount}</td>
                                        <td style={{ textAlign: "center", fontWeight: 600 }}>{v.poCount}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <span style={{
                                                fontWeight: 700,
                                                color: v.onTimeRate >= 90 ? "#00AB55" : v.onTimeRate >= 70 ? "#B76E00" : "#B72136",
                                            }}>
                                                {v.onTimeRate}%
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "center", color: "#637381" }}>{v.averagePayDays}d</td>
                                        <td style={{ textAlign: "center" }}><ScoreBadge score={v.performanceScore} /></td>
                                        <td>
                                            <span style={{
                                                padding: "2px 10px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700,
                                                background: v.status === "ACTIVE" ? "#E9FBF0" : "#F4F6F8",
                                                color: v.status === "ACTIVE" ? "#00AB55" : "#919EAB",
                                            }}>
                                                {v.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB: Budget vs Actual
            ════════════════════════════════════════════════════════════════ */}
            {tab === "budget" && (
                budgetData.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon" style={{ background: "#E8EAF6", color: "#5C6AC4" }}><Wallet size={40} /></div>
                            <h3>No budget data</h3>
                            <p>Budget allocations will appear here once configured.</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Visual Budget Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                            {budgetData.map(b => {
                                const pct = b.budgetAmount > 0 ? Math.min(100, (b.actualSpend / b.budgetAmount) * 100) : 0;
                                const barColor = b.status === "OVER" ? "#B72136" : b.status === "ON_TRACK" ? "#B76E00" : "#00AB55";
                                return (
                                    <div key={b.department} style={{ background: "white", border: "1px solid #DFE3E8", borderRadius: 12, padding: "1.25rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                                            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#212B36" }}>{b.department}</span>
                                            <span style={{
                                                padding: "2px 10px", borderRadius: 9999, fontSize: "0.7rem", fontWeight: 700,
                                                background: b.status === "OVER" ? "#FFE7D9" : b.status === "ON_TRACK" ? "#FFF7CD" : "#E9FBF0",
                                                color: barColor, display: "flex", alignItems: "center", gap: 4,
                                            }}>
                                                {b.status === "OVER" ? <ArrowUpRight size={12} /> : b.status === "UNDER" ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                                                {b.status}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#637381", marginBottom: "0.5rem" }}>
                                            <span>Spent: <strong style={{ color: "#212B36" }}>{formatCurrency(b.actualSpend, b.currency)}</strong></span>
                                            <span>Budget: <strong>{formatCurrency(b.budgetAmount, b.currency)}</strong></span>
                                        </div>
                                        <div style={{ height: 8, background: "#F4F6F8", borderRadius: 4, overflow: "hidden", marginBottom: "0.5rem" }}>
                                            <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 4, transition: "width 0.5s ease" }} />
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                                            <span style={{ color: "#919EAB" }}>{pct.toFixed(1)}% utilized</span>
                                            <span style={{ fontWeight: 700, color: barColor }}>
                                                {b.variance > 0 ? "+" : ""}{formatCurrency(b.variance, b.currency)} ({b.variancePercent > 0 ? "+" : ""}{b.variancePercent.toFixed(1)}%)
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Table */}
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Department</th>
                                        <th style={{ textAlign: "right" }}>Budget</th>
                                        <th style={{ textAlign: "right" }}>Actual Spend</th>
                                        <th style={{ textAlign: "right" }}>Variance</th>
                                        <th style={{ textAlign: "center" }}>Utilization</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {budgetData.map(b => (
                                        <tr key={b.department}>
                                            <td style={{ fontWeight: 600 }}>{b.department}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurrency(b.budgetAmount, b.currency)}</td>
                                            <td style={{ textAlign: "right", fontWeight: 700 }}>{formatCurrency(b.actualSpend, b.currency)}</td>
                                            <td style={{
                                                textAlign: "right", fontWeight: 700,
                                                color: b.variance >= 0 ? "#00AB55" : "#B72136",
                                            }}>
                                                {b.variance >= 0 ? "+" : ""}{formatCurrency(b.variance, b.currency)}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <span style={{ fontWeight: 700, color: "#5C6AC4" }}>
                                                    {b.budgetAmount > 0 ? `${((b.actualSpend / b.budgetAmount) * 100).toFixed(1)}%` : "—"}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: "2px 10px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700,
                                                    background: b.status === "OVER" ? "#FFE7D9" : b.status === "ON_TRACK" ? "#FFF7CD" : "#E9FBF0",
                                                    color: b.status === "OVER" ? "#B72136" : b.status === "ON_TRACK" ? "#B76E00" : "#00AB55",
                                                }}>
                                                    ● {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
