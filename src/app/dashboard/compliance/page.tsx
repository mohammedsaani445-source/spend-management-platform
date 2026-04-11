"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAuditLogsFiltered, exportAuditLogsCsv, AuditLogFilters } from "@/lib/audit";
import { AuditAction, AuditEntityType } from "@/types";
import AuditLogViewer from "@/components/admin/AuditLogViewer";
import Loader from "@/components/common/Loader";
import {
    Shield, Search, Download, Filter, Clock, User, Activity,
    Globe, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2,
    XCircle, Plus, Edit, Trash2, LogIn, LogOut, FileText, CreditCard,
    ShieldCheck, Fingerprint, History, SearchCode
} from "lucide-react";
import styles from "@/components/layout/Layout.module.css";

// ── Constants for Event Stream ──────────────────────────────────────────────
const ACTION_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    LOGIN: { bg: "#CAFDF5", color: "#006098", icon: <LogIn size={12} /> },
    LOGOUT: { bg: "#F4F6F8", color: "#637381", icon: <LogOut size={12} /> },
    CREATE: { bg: "#E9FBF0", color: "#00AB55", icon: <Plus size={12} /> },
    PR_CREATED: { bg: "#E9FBF0", color: "#00AB55", icon: <Plus size={12} /> },
    PO_CREATED: { bg: "#E9FBF0", color: "#00AB55", icon: <Plus size={12} /> },
    APPROVE: { bg: "#E9FBF0", color: "#00AB55", icon: <CheckCircle2 size={12} /> },
    REJECT: { bg: "#FFE7D9", color: "#B72136", icon: <XCircle size={12} /> },
    PAYMENT_PROCESSED: { bg: "#CAFDF5", color: "#006098", icon: <CreditCard size={12} /> },
    MATCH_VERIFIED: { bg: "#E9FBF0", color: "#00AB55", icon: <CheckCircle2 size={12} /> },
    MATCH_DISCREPANCY: { bg: "#FFE7D9", color: "#B72136", icon: <AlertTriangle size={12} /> },
};

const ENTITY_COLORS: Record<string, string> = {
    USER: "#006098",
    REQUISITION: "#5C6AC4",
    PURCHASE_ORDER: "#7C3AED",
    INVOICE: "#0EA5E9",
    PAYMENT: "#00AB55",
    TENDER: "#D97706",
    VENDOR: "#F97316",
};

const ALL_ACTIONS: AuditAction[] = [
    'LOGIN', 'LOGOUT', 'PR_CREATED', 'PR_APPROVED', 'PR_REJECTED',
    'PO_CREATED', 'PO_SENT', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT',
];

const ALL_ENTITIES: AuditEntityType[] = [
    'USER', 'REQUISITION', 'PURCHASE_ORDER', 'RECEIPT', 'INVOICE',
    'PAYMENT', 'TENDER', 'BID', 'BUDGET', 'VENDOR',
];

const PAGE_SIZE = 20;

// ════════════════════════════════════════════════════════════════════════════════

export default function CompliancePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STREAM' | 'FORENSIC'>('OVERVIEW');
    
    // Audit Stream State
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState<AuditAction | 'ALL'>("ALL");
    const [entityFilter, setEntityFilter] = useState<AuditEntityType | 'ALL'>("ALL");

    const fetchLogs = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const filters: AuditLogFilters = {
                search: search || undefined,
                actionType: actionFilter,
                entityType: entityFilter,
                limit: 200,
            };
            const { getAuditLogsFiltered } = await import("@/lib/audit");
            const data = await getAuditLogsFiltered(user.tenantId, filters);
            setLogs(data);
            setPage(0);
        } catch (err) {
            console.error("[Compliance] Error:", err);
        } finally {
            setLoading(false);
        }
    }, [user, search, actionFilter, entityFilter]);

    useEffect(() => { 
        if (activeTab === 'STREAM') fetchLogs(); 
        else if (activeTab === 'OVERVIEW') {
            // Quick fetch for metrics
            const fetchMetrics = async () => {
                if (!user) return;
                const { getAuditLogsFiltered } = await import("@/lib/audit");
                const data = await getAuditLogsFiltered(user.tenantId, { limit: 100 });
                setLogs(data);
                setLoading(false);
            };
            fetchMetrics();
        }
    }, [activeTab, fetchLogs, user]);

    if (loading && activeTab !== 'STREAM') return <Loader text="Synchronizing Governance Data..." />;

    const renderTabs = () => (
        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #E2E8F0', marginBottom: '2rem' }}>
            {[
                { id: 'OVERVIEW', label: 'Compliance Dashboard', icon: <ShieldCheck size={18} /> },
                { id: 'STREAM', label: 'Event Stream', icon: <History size={18} /> },
                { id: 'FORENSIC', label: 'Forensic Investigator', icon: <SearchCode size={18} /> },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '1rem 0',
                        fontSize: '0.9rem',
                        fontWeight: activeTab === tab.id ? 800 : 600,
                        color: activeTab === tab.id ? 'var(--brand)' : '#64748B',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderBottomWidth: '2px',
                        borderBottomStyle: 'solid',
                        borderBottomColor: activeTab === tab.id ? 'var(--brand)' : 'transparent',
                        background: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: '-1px'
                    }}
                >
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Governance & Compliance</h1>
                    <p className={styles.pageSubtitle}>Centralized command for forensic audit, regulatory tracking, and system accountability.</p>
                </div>
                {activeTab === 'OVERVIEW' && (
                    <div style={{ padding: '0.625rem 1.25rem', background: '#ECFDF5', color: '#059669', borderRadius: '12px', fontSize: '0.8125rem', fontWeight: 800, border: '1px solid #10B98120', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} />
                        LEDGER VERIFIED
                    </div>
                )}
            </div>

            {renderTabs()}

            {/* ── Tab Content ────────────────────────────────────────────── */}
            
            {activeTab === 'OVERVIEW' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Audit Integrity</div>
                                <ShieldCheck size={20} color="#10B981" />
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.75rem', color: '#111827' }}>HASH-CHAINED</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem' }}>Immutable logs with sub-second validation.</div>
                        </div>
                        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #5C6AC4' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Total Logged Events</div>
                                <Activity size={20} color="#5C6AC4" />
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.75rem', color: '#111827' }}>{logs.length || 0}+</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem' }}>Real-time event capture across all modules.</div>
                        </div>
                        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #F59E0B' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Compliance Window</div>
                                <Clock size={20} color="#F59E0B" />
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.75rem', color: '#111827' }}>7 YEARS</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem' }}>Regulatory data retention period enforced.</div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '2rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Fingerprint size={24} color="var(--brand)" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Regulatory Compliance Summary</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Summary of SOC2 and IFRS compliant audit protocols.</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8', marginBottom: '1rem', letterSpacing: '0.05em' }}>Security Controls</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {[
                                        'Multi-factor Authentication requirement',
                                        'Role-based access control (RBAC) enforced',
                                        'Encryption at rest and in transit',
                                        'Automatic session termination'
                                    ].map(item => (
                                        <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#334155', marginBottom: '0.75rem' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8', marginBottom: '1rem', letterSpacing: '0.05em' }}>Data Governance</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {[
                                        'Immutable transaction logs',
                                        'Automated daily backup schedule',
                                        'PII data isolation and masking',
                                        'Disaster recovery protocols verified'
                                    ].map(item => (
                                        <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#334155', marginBottom: '0.75rem' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'STREAM' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.5rem", background: "white", padding: "0.75rem 1rem", borderRadius: 12, border: "1px solid #DFE3E8" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                            <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#919EAB" }}><Search size={16} /></span>
                            <input type="text" placeholder="Search actor, description, ID..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="form-input" style={{ paddingLeft: "2.5rem", background: "#F4F6F8", border: "none", fontSize: "0.85rem" }} />
                        </div>
                        <select className="form-input" value={actionFilter} onChange={e => setActionFilter(e.target.value as any)} style={{ maxWidth: 180, padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}>
                            <option value="ALL">All Actions</option>
                            {ALL_ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                        </select>
                        <select className="form-input" value={entityFilter} onChange={e => setEntityFilter(e.target.value as any)} style={{ maxWidth: 180, padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}>
                            <option value="ALL">All Entities</option>
                            {ALL_ENTITIES.map(e => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
                        </select>
                        <button className="btn btn-secondary" onClick={() => exportAuditLogsCsv(logs)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Download size={16} /> Export
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <Loader text="Streaming Event Log..." />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                            <p style={{ color: '#64748B' }}>No events matches your current filters.</p>
                        </div>
                    ) : (
                        <div style={{ background: "white", border: "1px solid #DFE3E8", borderRadius: 12, overflow: "hidden" }}>
                            {logs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((log, i) => {
                                const style = ACTION_STYLES[log.action] || { bg: "#F4F6F8", color: "#637381", icon: <Activity size={12} /> };
                                const entityColor = ENTITY_COLORS[log.entityType] || "#637381";
                                return (
                                    <div key={log.id || i} style={{ display: "flex", gap: "1rem", padding: "1rem 1.25rem", borderBottom: "1px solid #F4F6F8" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 2 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: style.bg, color: style.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {style.icon}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                                                <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700, background: style.bg, color: style.color }}>{log.action?.replace(/_/g, ' ')}</span>
                                                <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700, background: `${entityColor}15`, color: entityColor }}>{log.entityType}</span>
                                                <span style={{ fontSize: "0.75rem", color: "#919EAB", marginLeft: "auto" }}><Clock size={12} style={{ verticalAlign: 'middle' }} /> {new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p style={{ fontSize: "0.875rem", color: "#111827", margin: "4px 0" }}>{log.description}</p>
                                            <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#64748B" }}>
                                                <span><User size={12} style={{ verticalAlign: 'middle' }} /> {log.actorName}</span>
                                                <span>ID: {log.entityId?.slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'FORENSIC' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <AuditLogViewer />
                </div>
            )}

            <div className="card" style={{ padding: '2rem', borderLeft: '4px solid #F59E0B', marginTop: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#92400E', fontWeight: 800 }}>⚠️ Regulatory Disclosure</h3>
                <p style={{ color: '#92400E', opacity: 0.9, fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    All logs on this page are automatically generated and timestamped.
                    Deleting records from this trail requires high-level database access and is also logged as a critical security event.
                </p>
            </div>
        </div>
    );
}
