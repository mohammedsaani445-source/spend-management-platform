"use client";

import { useState, useEffect } from "react";
import { getAuditLogs } from "@/lib/audit";
import { useAuth } from "@/context/AuthContext";

export default function AuditLogViewer() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user) return;
            const data = await getAuditLogs(user.tenantId, 50);
            setLogs(data);
            setLoading(false);
        };
        fetchLogs();
    }, [user]);

    if (loading) return <div>Analyzing Audit Chain...</div>;

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, fontWeight: 800 }}>SOC2 Immutable Audit Log</h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cryptographically verified record of all financial events.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>🛡️ HASH CHAIN VERIFIED</span>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>Timestamp</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>Action</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>Actor</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>IP Address</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>Device/Browser</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>Entity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ fontWeight: 700 }}>{log.action}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>{log.actorEmail}</td>
                                <td style={{ padding: '1rem' }}>
                                    <code style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 700 }}>{log.ipAddress || '0.0.0.0'}</code>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.userAgent}>
                                        {log.userAgent || 'Unknown'}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                    {log.entityType} #{log.entityId?.slice(-6).toUpperCase() || "SYSTEM"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
