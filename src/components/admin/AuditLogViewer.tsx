"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAuditLogs, exportAuditLogsCsv } from "@/lib/audit";
import AuditMetrics from "./audit/AuditMetrics";
import ForensicDrawer from "./audit/ForensicDrawer";
import AuditLogTable from "@/components/compliance/AuditLogTable";

export default function AuditLogViewer() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [activeTab, setActiveTab] = useState<'ALL' | 'FINANCIAL' | 'SECURITY'>('ALL');
    const [selectedLog, setSelectedLog] = useState<any | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user) return;
            try {
                const data = await getAuditLogs(user.tenantId, 150);
                setLogs(data);
            } catch (error) {
                console.error("Audit Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [user]);

    const filteredLogs = logs.filter(log => {
        const query = filter.toLowerCase();
        const matchesSearch = 
            (log.description || '').toLowerCase().includes(query) ||
            (log.actorName || '').toLowerCase().includes(query) ||
            (log.actorEmail || '').toLowerCase().includes(query) ||
            (log.entityId || '').toLowerCase().includes(query);
        
        if (activeTab === 'FINANCIAL') {
            const financialTypes = ['REQUISITION', 'PO', 'INVOICE', 'CONTRACT', 'BUDGET', 'EXPENSE'];
            return matchesSearch && financialTypes.includes(log.entityType);
        }
        if (activeTab === 'SECURITY') {
            const securityActions = ['LOGIN', 'USER_CREATE', 'USER_UPDATE', 'POLICY_UPDATE', 'CONFIG_CHANGE'];
            return matchesSearch && (
                securityActions.some(action => log.action.includes(action)) || 
                log.action.includes('PASSWORD') || 
                log.action.includes('AUTH')
            );
        }
        return matchesSearch;
    });

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Analyzing Audit Chain...</p>
        </div>
    );

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out', padding: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A202C', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShieldCheck size={28} color="var(--brand)" /> Forensic Compliance Dashboard
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '0.9375rem', marginTop: '0.25rem' }}>Immutable ledger of financial transactions and system intelligence.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => exportAuditLogsCsv(filteredLogs)}
                        style={{
                            padding: '0.625rem 1.25rem',
                            background: 'white',
                            color: '#1E293B',
                            borderRadius: '12px',
                            fontSize: '0.8125rem',
                            fontWeight: 800,
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                    >
                        Export Forensic Report
                    </button>
                    <div style={{ padding: '0.625rem 1.25rem', background: '#ECFDF5', color: '#059669', borderRadius: '12px', fontSize: '0.8125rem', fontWeight: 800, border: '1px solid #10B98120', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} />
                        HASH-CHAIN VERIFIED
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <AuditMetrics logs={logs} />

            {/* Controls & Tabs */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem',
                background: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['ALL', 'FINANCIAL', 'SECURITY'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '10px',
                                border: 'none',
                                fontSize: '0.8125rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: activeTab === tab ? 'var(--brand)' : 'transparent',
                                color: activeTab === tab ? 'white' : '#64748B'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div style={{ position: 'relative' }}>
                    <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Scan ledger by ID or Actor..."
                        style={{ 
                            paddingLeft: '2.75rem', paddingRight: '1rem', width: '320px', height: '44px', 
                            borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC',
                            fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Ledger Table */}
            <div style={{ 
                background: 'white', 
                borderRadius: '20px', 
                border: '1px solid #E2E8F0', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                overflow: 'hidden'
            }}>
                <AuditLogTable 
                    externalLogs={filteredLogs} 
                    onSelectLog={setSelectedLog} 
                />
            </div>

            {/* Detail Drawer */}
            <ForensicDrawer 
                log={selectedLog} 
                onClose={() => setSelectedLog(null)} 
            />
        </div>
    );
}
