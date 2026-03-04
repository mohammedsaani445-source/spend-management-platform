"use client";

import { useState, useEffect } from "react";
import { AuditLog } from "@/types";
import { ref, get, query, orderByChild, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase";
import styles from "@/components/assets/Assets.module.css"; // Reuse table styles

export default function AuditLogTable() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const logsRef = query(ref(db, 'auditLogs'), orderByChild('timestamp'), limitToLast(50));
                let snapshot;
                try {
                    snapshot = await get(logsRef);
                } catch (e: any) {
                    if (e.message?.includes('Index not defined')) {
                        console.warn("Index not yet deployed. Falling back to client-side sorting.");
                        // Fallback: fetch without index and sort (NOT recommended for large datasets, but fixes the crash)
                        const rawSnap = await get(ref(db, 'auditLogs'));
                        if (rawSnap.exists()) {
                            const data = Object.values(rawSnap.val()) as AuditLog[];
                            setLogs(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50));
                        }
                        return;
                    }
                    throw e;
                }

                if (snapshot.exists()) {
                    const data = Object.values(snapshot.val()) as AuditLog[];
                    // Reverse to show newest first
                    setLogs(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                }
            } catch (error) {
                console.error("Error fetching audit logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) return <div className={styles.loading}>Loading audit trail...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>System Audit Trail</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Showing last 50 actions</span>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Entity</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={styles.empty}>No audit logs found.</td>
                            </tr>
                        ) : (
                            logs.map((log, index) => (
                                <tr key={log.id || index} className={styles.row}>
                                    <td className={styles.mono}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{log.actorName}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ID: {log.actorId?.substring(0, 8) || "UNKNOWN"}...</div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[log.action] || styles.STORAGE}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{log.entityType}</div>
                                        <div className={styles.mono} style={{ fontSize: '0.7rem' }}>{log.entityId}</div>
                                    </td>
                                    <td style={{ maxWidth: '300px' }}>
                                        {log.description}
                                        {log.changes && log.changes.length > 0 && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '4px' }}>
                                                {log.changes.map((c, i) => (
                                                    <div key={i} style={{ borderBottom: i < log.changes!.length - 1 ? '1px solid #e2e8f0' : 'none', padding: '0.2rem 0' }}>
                                                        <strong>{c.field}:</strong> {String(c.oldValue)} → <span style={{ color: '#15803d', fontWeight: 600 }}>{String(c.newValue)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
