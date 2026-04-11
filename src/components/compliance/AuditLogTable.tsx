"use client";

import { useState, useEffect } from "react";
import { AuditLog } from "@/types";
import { ref, get, query, orderByChild, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getAuditLogs } from "@/lib/audit";
import styles from "@/components/assets/Assets.module.css"; // Reuse table styles

import { Search, Filter, Shield, Activity, DollarSign, Lock, Eye } from "lucide-react";

interface AuditLogTableProps {
    externalLogs?: any[];
    onSelectLog?: (log: any) => void;
}

export default function AuditLogTable({ externalLogs, onSelectLog }: AuditLogTableProps) {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (externalLogs) {
            setLogs(externalLogs as AuditLog[]);
            setLoading(false);
            return;
        }

        const fetchLogs = async () => {
            if (!user) return;
            try {
                const data = await getAuditLogs(user.tenantId, 50);
                setLogs(data as AuditLog[]);
            } catch (error) {
                console.error("Error fetching audit logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [user, externalLogs]);

    const getCategoryIcon = (log: AuditLog) => {
        if (log.action.includes('LOGIN') || log.action.includes('USER')) return <Lock size={14} />;
        if (log.entityType === 'REQUISITION' || log.entityType === 'PO' || log.entityType === 'INVOICE' || log.entityType === 'CONTRACT') return <DollarSign size={14} />;
        if (log.action.includes('POLICY') || log.action.includes('CONFIG')) return <Shield size={14} />;
        return <Activity size={14} />;
    };

    const getCategoryColor = (log: AuditLog) => {
        if (log.action.includes('LOGIN') || log.action.includes('USER')) return { bg: '#EEF2FF', border: '#C7D2FE', text: '#4F46E5' }; // Indigo
        if (log.entityType === 'REQUISITION' || log.entityType === 'PO' || log.entityType === 'INVOICE' || log.entityType === 'CONTRACT') return { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' }; // Emerald
        if (log.action.includes('POLICY') || log.action.includes('CONFIG')) return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' }; // Amber
        return { bg: '#F8FAFC', border: '#E2E8F0', text: '#64748B' }; // Slate
    };

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1.5rem', width: '32px', height: '32px', border: '2px solid #E2E8F0', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div style={{ color: '#64748B', fontWeight: 600 }}>Deciphering Ledger...</div>
        </div>
    );

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <tr>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>Timeline</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>Event Type</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>Custodian</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>Description</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                    {logs.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ padding: '6rem 2rem', textAlign: 'center', color: '#94A3B8' }}>No records found in the specified audit window.</td>
                        </tr>
                    ) : (
                        logs.map((log, index) => {
                            const colors = getCategoryColor(log);
                            return (
                                <tr 
                                    key={log.id || index} 
                                    onClick={() => onSelectLog?.(log)}
                                    style={{ 
                                        borderBottom: '1px solid #F1F5F9', 
                                        cursor: onSelectLog ? 'pointer' : 'default',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }}>
                                        <div style={{ color: '#1E293B', fontWeight: 700, fontSize: '0.8125rem' }}>
                                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                        <div style={{ color: '#64748B', fontSize: '0.7rem' }}>
                                            {new Date(log.timestamp).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ 
                                            display: 'flex', alignItems: 'center', gap: '6px', 
                                            background: colors.bg, color: colors.text, 
                                            border: `1px solid ${colors.border}`,
                                            padding: '4px 10px', borderRadius: '8px', 
                                            width: 'fit-content', fontSize: '0.75rem', fontWeight: 800,
                                            textTransform: 'uppercase', letterSpacing: '0.02em'
                                        }}>
                                            {getCategoryIcon(log)}
                                            {log.action}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.8125rem' }}>{log.actorName}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>IP: {log.ipAddress || "Unknown"}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', maxWidth: '350px' }}>
                                        <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {log.description}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px', fontFamily: 'monospace' }}>
                                            {log.entityType} • {log.entityId?.slice(-8).toUpperCase() || 'SYSTEM'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <button style={{ 
                                            background: 'none', border: 'none', color: 'var(--brand)', 
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', 
                                            gap: '4px', fontSize: '0.8125rem', fontWeight: 800,
                                            marginLeft: 'auto'
                                        }}>
                                            Verify <Eye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
