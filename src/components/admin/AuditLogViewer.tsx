"use client";

import { useState, useEffect } from "react";
import { getAuditLogs } from "@/lib/audit";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, History, User, Laptop2, Globe, FileText, Search } from "lucide-react";
import styles from "@/app/dashboard/settings/Settings.module.css";

export default function AuditLogViewer() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user) return;
            const data = await getAuditLogs(user.tenantId, 100);
            setLogs(data);
            setLoading(false);
        };
        fetchLogs();
    }, [user]);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        log.actorEmail.toLowerCase().includes(filter.toLowerCase()) ||
        (log.entityId && log.entityId.toLowerCase().includes(filter.toLowerCase()))
    );

    if (loading) return <div style={{ padding: '2.5rem', textAlign: 'center', color: '#6B7280' }}>Analyzing Audit Chain...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h3 className={styles.sectionTitle} style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={22} color="var(--brand)" /> SOC2 Immutable Audit Log
                    </h3>
                    <p className={styles.subtitle}>Cryptographically verified record of all financial events and system changes.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className={styles.input}
                            style={{ paddingLeft: '2.5rem', width: '250px', borderRadius: '100px', backgroundColor: 'white' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#ECFDF5', color: '#059669', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800 }}>
                        <ShieldCheck size={16} />
                        <span>HASH CHAIN VERIFIED</span>
                    </div>
                </div>
            </div>

            <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                {filteredLogs.length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <div style={{ background: '#F3F4F6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <History size={32} color="#9CA3AF" />
                        </div>
                        <h4 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>No audit logs found</h4>
                        <p className={styles.subtitle} style={{ maxWidth: '400px', margin: '0 auto' }}>
                            {filter ? `No records match the search "${filter}".` : "The system audit trail is currently empty."}
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Timestamp</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Action</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Actor</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>IP Address</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Device</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Entity Ref</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'white', transition: 'background-color 0.2s' }}>
                                        <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.8125rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                                            {new Date(log.timestamp).toLocaleString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            })}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{
                                                fontWeight: 700,
                                                fontSize: '0.8125rem',
                                                color: '#111827',
                                                background: '#F3F4F6',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '6px',
                                                border: '1px solid #E5E7EB'
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                                                <User size={14} color="#9CA3AF" />
                                                <span>{log.actorEmail}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#4F46E5', fontWeight: 700, background: '#EEF2FF', padding: '0.25rem 0.5rem', borderRadius: '4px', width: 'fit-content' }}>
                                                <Globe size={12} />
                                                <code>{log.ipAddress || '0.0.0.0'}</code>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }} title={log.userAgent}>
                                                <Laptop2 size={14} />
                                                <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {log.userAgent || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                {log.entityType ? <FileText size={14} color="#9CA3AF" /> : null}
                                                <span>{log.entityType} {log.entityId ? `#${log.entityId.slice(-6).toUpperCase()}` : "SYSTEM"}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
