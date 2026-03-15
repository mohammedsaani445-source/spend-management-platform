"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAuditLogsFiltered, exportAuditLogsCsv, AuditLogFilters } from "@/lib/audit";
import { AuditAction, AuditEntityType } from "@/types";
import {
    Shield, Search, Download, Filter, Clock, User, Activity,
    Globe, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2,
    XCircle, Plus, Edit, Trash2, LogIn, LogOut, FileText, CreditCard, Eye
} from "lucide-react";
import Loader from "@/components/common/Loader";

// ── Action badge styles ──────────────────────────────────────────────────────
const ACTION_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    LOGIN: { bg: "#CAFDF5", color: "#006098", icon: <LogIn size={12} /> },
    LOGOUT: { bg: "#F4F6F8", color: "#637381", icon: <LogOut size={12} /> },
    CREATE: { bg: "#E9FBF0", color: "#00AB55", icon: <Plus size={12} /> },
    PR_CREATED: { bg: "#E9FBF0", color: "#00AB55", icon: <Plus size={12} /> },
    PO_CREATED: { bg: "#E9FBF0", color: "#00AB55", icon: <Plus size={12} /> },
    USER_CREATED: { bg: "#E9FBF0", color: "#00AB55", icon: <Plus size={12} /> },
    TENDER_CREATED: { bg: "#E9FBF0", color: "#00AB55", icon: <Plus size={12} /> },
    UPDATE: { bg: "#E8EAF6", color: "#5C6AC4", icon: <Edit size={12} /> },
    PO_SENT: { bg: "#E8EAF6", color: "#5C6AC4", icon: <Edit size={12} /> },
    DELETE: { bg: "#FFE7D9", color: "#B72136", icon: <Trash2 size={12} /> },
    APPROVE: { bg: "#E9FBF0", color: "#00AB55", icon: <CheckCircle2 size={12} /> },
    PR_APPROVED: { bg: "#E9FBF0", color: "#00AB55", icon: <CheckCircle2 size={12} /> },
    REJECT: { bg: "#FFE7D9", color: "#B72136", icon: <XCircle size={12} /> },
    PR_REJECTED: { bg: "#FFE7D9", color: "#B72136", icon: <XCircle size={12} /> },
    PAYMENT_PROCESSED: { bg: "#CAFDF5", color: "#006098", icon: <CreditCard size={12} /> },
    INVOICE_UPLOADED: { bg: "#FFF7CD", color: "#B76E00", icon: <FileText size={12} /> },
    RECEIPT_CREATED: { bg: "#FFF7CD", color: "#B76E00", icon: <FileText size={12} /> },
    BID_SUBMITTED: { bg: "#E8EAF6", color: "#5C6AC4", icon: <FileText size={12} /> },
    MATCH_VERIFIED: { bg: "#E9FBF0", color: "#00AB55", icon: <CheckCircle2 size={12} /> },
    MATCH_DISCREPANCY: { bg: "#FFE7D9", color: "#B72136", icon: <AlertTriangle size={12} /> },
    USER_DISABLED: { bg: "#FFE7D9", color: "#B72136", icon: <XCircle size={12} /> },
};

const ENTITY_COLORS: Record<string, string> = {
    USER: "#006098",
    REQUISITION: "#5C6AC4",
    PURCHASE_ORDER: "#7C3AED",
    RECEIPT: "#B76E00",
    INVOICE: "#0EA5E9",
    PAYMENT: "#00AB55",
    TENDER: "#D97706",
    BID: "#EC4899",
    WORKFLOW: "#8B5CF6",
    BUDGET: "#10B981",
    VENDOR: "#F97316",
};

const ALL_ACTIONS: AuditAction[] = [
    'LOGIN', 'LOGOUT', 'PR_CREATED', 'PR_APPROVED', 'PR_REJECTED',
    'PO_CREATED', 'PO_SENT', 'RECEIPT_CREATED', 'INVOICE_UPLOADED',
    'MATCH_VERIFIED', 'MATCH_DISCREPANCY', 'PAYMENT_PROCESSED',
    'USER_CREATED', 'USER_DISABLED', 'TENDER_CREATED', 'BID_SUBMITTED',
    'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT',
];

const ALL_ENTITIES: AuditEntityType[] = [
    'USER', 'REQUISITION', 'PURCHASE_ORDER', 'RECEIPT', 'INVOICE',
    'PAYMENT', 'TENDER', 'BID', 'WORKFLOW', 'BUDGET', 'VENDOR',
];

const PAGE_SIZE = 50;

// ════════════════════════════════════════════════════════════════════════════════
export default function AuditTrailPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);

    // Filters
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState<AuditAction | 'ALL'>("ALL");
    const [entityFilter, setEntityFilter] = useState<AuditEntityType | 'ALL'>("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchLogs = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const filters: AuditLogFilters = {
                search: search || undefined,
                actionType: actionFilter,
                entityType: entityFilter,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                limit: 500,
            };
            const data = await getAuditLogsFiltered(user.tenantId, filters);
            setLogs(data);
            setPage(0);
        } catch (err) {
            console.error("[AuditTrail] Error:", err);
        } finally {
            setLoading(false);
        }
    }, [user, search, actionFilter, entityFilter, startDate, endDate]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const formatTimestamp = (ts: any) => {
        if (!ts) return "—";
        const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
        return isNaN(d.getTime()) ? "—" : d.toLocaleString();
    };

    const pageStart = page * PAGE_SIZE;
    const pageLogs = logs.slice(pageStart, pageStart + PAGE_SIZE);
    const totalPages = Math.ceil(logs.length / PAGE_SIZE);

    // Stats
    const stats = {
        total: logs.length,
        creates: logs.filter(l => ['CREATE', 'PR_CREATED', 'PO_CREATED', 'USER_CREATED', 'TENDER_CREATED'].includes(l.action)).length,
        approvals: logs.filter(l => ['APPROVE', 'PR_APPROVED', 'MATCH_VERIFIED'].includes(l.action)).length,
        payments: logs.filter(l => l.action === 'PAYMENT_PROCESSED').length,
    };

    if (loading) return (
        <div className="page-container">
            <Loader text="Loading audit trail..." />
        </div>
    );

    return (
        <div className="page-container">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Audit Trail</h1>
                    <p className="page-subtitle">Complete forensic log of every action across your organization</p>
                </div>
                <button className="btn btn-secondary" onClick={() => exportAuditLogsCsv(logs)}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* ── Stats Strip ─────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                    { label: "Total Events", value: stats.total, color: "#5C6AC4", bg: "#E8EAF6", icon: <Activity size={20} /> },
                    { label: "Creates", value: stats.creates, color: "#00AB55", bg: "#E9FBF0", icon: <Plus size={20} /> },
                    { label: "Approvals", value: stats.approvals, color: "#006098", bg: "#CAFDF5", icon: <CheckCircle2 size={20} /> },
                    { label: "Payments", value: stats.payments, color: "#B76E00", bg: "#FFF7CD", icon: <CreditCard size={20} /> },
                ].map(s => (
                    <div key={s.label} style={{ background: "white", border: "1px solid #DFE3E8", borderRadius: 12, padding: "1rem", transition: "all 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#637381" }}>{s.label}</span>
                            <div style={{ width: 32, height: 32, background: s.bg, color: s.color, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                        </div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* ── Filters ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem", background: "white", padding: "0.75rem 1rem", borderRadius: 12, border: "1px solid #DFE3E8" }}>
                {/* Search */}
                <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                    <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#919EAB" }}><Search size={16} /></span>
                    <input type="text" placeholder="Search actor, description, ID..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="form-input" style={{ paddingLeft: "2.5rem", background: "#F4F6F8", border: "none", fontSize: "0.85rem" }} />
                </div>

                {/* Action Type */}
                <select className="form-input" value={actionFilter}
                    onChange={e => setActionFilter(e.target.value as any)}
                    style={{ maxWidth: 180, padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}>
                    <option value="ALL">All Actions</option>
                    {ALL_ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                </select>

                {/* Entity Type */}
                <select className="form-input" value={entityFilter}
                    onChange={e => setEntityFilter(e.target.value as any)}
                    style={{ maxWidth: 180, padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}>
                    <option value="ALL">All Entities</option>
                    {ALL_ENTITIES.map(e => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
                </select>

                {/* Date Range */}
                <input type="date" className="form-input" value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{ maxWidth: 140, padding: "0.4rem 0.6rem", fontSize: "0.85rem" }} />
                <span style={{ color: "#919EAB", fontSize: "0.8rem" }}>to</span>
                <input type="date" className="form-input" value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    style={{ maxWidth: 140, padding: "0.4rem 0.6rem", fontSize: "0.85rem" }} />
            </div>

            {/* ── Timeline ────────────────────────────────────────────────── */}
            {pageLogs.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon" style={{ background: "#E8EAF6", color: "#5C6AC4" }}><Shield size={40} /></div>
                        <h3>No audit entries found</h3>
                        <p>Adjust your filters or try a broader search to see audit activity.</p>
                    </div>
                </div>
            ) : (
                <div style={{ background: "white", border: "1px solid #DFE3E8", borderRadius: 12, overflow: "hidden" }}>
                    {pageLogs.map((log, i) => {
                        const style = ACTION_STYLES[log.action] || { bg: "#F4F6F8", color: "#637381", icon: <Activity size={12} /> };
                        const entityColor = ENTITY_COLORS[log.entityType] || "#637381";

                        return (
                            <div key={log.id || i} style={{
                                display: "flex", gap: "1rem", padding: "1rem 1.25rem",
                                borderBottom: i < pageLogs.length - 1 ? "1px solid #F4F6F8" : "none",
                                transition: "background 0.15s",
                                cursor: "default",
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"}
                                onMouseLeave={e => e.currentTarget.style.background = "white"}>

                                {/* Timeline dot */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 2 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8, background: style.bg, color: style.color,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        {style.icon}
                                    </div>
                                    {i < pageLogs.length - 1 && (
                                        <div style={{ width: 2, flex: 1, background: "#F4F6F8", marginTop: 4, borderRadius: 1 }} />
                                    )}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: 4 }}>
                                        {/* Action badge */}
                                        <span style={{
                                            display: "inline-flex", alignItems: "center", gap: 4,
                                            padding: "2px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700,
                                            background: style.bg, color: style.color,
                                        }}>
                                            {log.action?.replace(/_/g, ' ')}
                                        </span>
                                        {/* Entity badge */}
                                        <span style={{
                                            padding: "2px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700,
                                            background: `${entityColor}15`, color: entityColor,
                                        }}>
                                            {log.entityType?.replace(/_/g, ' ')}
                                        </span>
                                        {/* Timestamp */}
                                        <span style={{ fontSize: "0.75rem", color: "#919EAB", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                                            <Clock size={12} /> {formatTimestamp(log.timestamp)}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p style={{ fontSize: "0.875rem", color: "#454F5B", margin: "4px 0", lineHeight: 1.5 }}>
                                        {log.description}
                                    </p>

                                    {/* Meta row */}
                                    <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.75rem", color: "#919EAB", marginTop: 4, flexWrap: "wrap" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <User size={12} /> {log.actorName || "Unknown"}
                                        </span>
                                        {log.entityId && (
                                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "monospace" }}>
                                                ID: {log.entityId.length > 20 ? log.entityId.slice(0, 20) + "…" : log.entityId}
                                            </span>
                                        )}
                                        {log.ipAddress && (
                                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                <Globe size={12} /> {log.ipAddress}
                                            </span>
                                        )}
                                    </div>

                                    {/* Change diffs */}
                                    {log.changes && log.changes.length > 0 && (
                                        <div style={{ marginTop: 8, background: "#F9FAFB", borderRadius: 8, padding: "0.5rem 0.75rem", border: "1px solid #F4F6F8" }}>
                                            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#637381", marginBottom: 4, textTransform: "uppercase" }}>Changes</div>
                                            {log.changes.map((c: any, j: number) => (
                                                <div key={j} style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem", padding: "2px 0", fontFamily: "monospace" }}>
                                                    <span style={{ color: "#5C6AC4", fontWeight: 600 }}>{c.field}:</span>
                                                    <span style={{ color: "#B72136", textDecoration: "line-through" }}>{String(c.oldValue)}</span>
                                                    <span style={{ color: "#919EAB" }}>→</span>
                                                    <span style={{ color: "#00AB55" }}>{String(c.newValue)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem", borderTop: "1px solid #DFE3E8", background: "#F9FAFB" }}>
                            <span style={{ fontSize: "0.8rem", color: "#637381" }}>
                                Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, logs.length)} of {logs.length} entries
                            </span>
                            <div style={{ display: "flex", gap: "0.375rem" }}>
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        width: 32, height: 32, borderRadius: 6, border: "1px solid #DFE3E8",
                                        background: page === 0 ? "#F4F6F8" : "white", color: page === 0 ? "#C4CDD5" : "#637381",
                                        cursor: page === 0 ? "default" : "pointer",
                                    }}>
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const p = page < 3 ? i : page + i - 2;
                                    if (p >= totalPages) return null;
                                    return (
                                        <button key={p} onClick={() => setPage(p)}
                                            style={{
                                                width: 32, height: 32, borderRadius: 6,
                                                border: p === page ? "2px solid #5C6AC4" : "1px solid #DFE3E8",
                                                background: p === page ? "#E8EAF6" : "white",
                                                color: p === page ? "#5C6AC4" : "#637381",
                                                fontWeight: p === page ? 700 : 400, fontSize: "0.8rem",
                                                cursor: "pointer",
                                            }}>
                                            {p + 1}
                                        </button>
                                    );
                                })}
                                <button
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        width: 32, height: 32, borderRadius: 6, border: "1px solid #DFE3E8",
                                        background: page >= totalPages - 1 ? "#F4F6F8" : "white",
                                        color: page >= totalPages - 1 ? "#C4CDD5" : "#637381",
                                        cursor: page >= totalPages - 1 ? "default" : "pointer",
                                    }}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
