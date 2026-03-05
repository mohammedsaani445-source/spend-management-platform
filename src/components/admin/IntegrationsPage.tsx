"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiKeys, generateApiKey, revokeApiKey } from "@/lib/apiKey";
import { getErpSyncLogs } from "@/lib/erp/engine";
import { ApiKey, ErpSyncLog } from "@/types";
import { Plug, Key, Trash2, Globe, Database, History, CheckCircle2, XCircle, AlertCircle, Plus, Copy, Server, FileText } from "lucide-react";
import styles from "@/app/dashboard/settings/Settings.module.css";

export default function IntegrationsPage() {
    const { user } = useAuth();
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncLogs, setSyncLogs] = useState<ErpSyncLog[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [activeErp, setActiveErp] = useState<string | null>(null);
    const [newKeyRaw, setNewKeyRaw] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", scope: "FULL_ADMIN" as ApiKey['scopes'][0] });
    const [erpConfig, setErpConfig] = useState({
        apiUrl: "",
        clientId: "",
        clientSecret: "",
        mappingScheme: "DIRECT"
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        if (!user) return;
        const [keyData, logData] = await Promise.all([
            getApiKeys(user.tenantId),
            getErpSyncLogs(10)
        ]);
        setKeys(keyData);
        setSyncLogs(logData || []);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        if (!user) return;
        e.preventDefault();
        const { rawKey } = await generateApiKey(user.tenantId, formData.name, [formData.scope]);
        setNewKeyRaw(rawKey);
        setShowCreate(false);
        setFormData({ name: "", scope: "FULL_ADMIN" });
        loadData();
    };

    const handleRevoke = async (id: string) => {
        if (confirm("Are you sure you want to revoke this API key? This will break any external connections using it.")) {
            await revokeApiKey(id);
            loadData();
        }
    };

    const handleTestSync = async (system: string) => {
        if (!user) return;
        try {
            // Find a PO to test with
            const { getPurchaseOrders } = await import("@/lib/purchaseOrders");
            const pos = await getPurchaseOrders(user);
            if (pos.length === 0) {
                alert("No Purchase Orders found to sync. Create a PO first.");
                return;
            }

            const { ErpEngine } = await import("@/lib/erp/engine");
            await ErpEngine.syncPO(pos[0].id!, system);
            alert(`Sync successful for ${system}! Check details in the log below.`);
            loadData();
        } catch (error: any) {
            console.error("Sync failed:", error);
            alert(`Sync failed: ${error.message || "Unknown error"}. Check logs for details.`);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 className={styles.sectionTitle} style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plug size={24} color="var(--brand)" /> Enterprise Integrations
                    </h1>
                    <p className={styles.subtitle}>Manage API access and ERP connectivity for external systems.</p>
                </div>
                <button
                    className={styles.primaryButton}
                    onClick={() => { setShowCreate(true); setNewKeyRaw(null); }}
                >
                    <Plus size={18} /> Generate New API Key
                </button>
            </div>

            {newKeyRaw && (
                <div style={{ backgroundColor: '#FEFCE8', border: '1px solid #EAB308', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#FEF08A', padding: '0.75rem', borderRadius: '50%', color: '#CA8A04' }}>
                        <Key size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 800, color: '#854D0E', marginBottom: '0.5rem', fontSize: '1.125rem' }}>API Key Generated Successfully</h4>
                        <p style={{ fontSize: '0.875rem', color: '#A16207', marginBottom: '1rem', lineHeight: 1.5 }}>
                            Complete authentication key configured. Please copy this key now. For your security, it will never be displayed again.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <code style={{ flex: 1, background: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #FDE047', fontSize: '1rem', fontWeight: 600, color: '#111827', wordBreak: 'break-all' }}>
                                {newKeyRaw}
                            </code>
                            <button
                                className={styles.button}
                                onClick={() => { navigator.clipboard.writeText(newKeyRaw); alert("Key copied to clipboard"); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF08A', color: '#854D0E', border: 'none' }}
                            >
                                <Copy size={16} /> Copy
                            </button>
                        </div>
                        <button
                            onClick={() => setNewKeyRaw(null)}
                            style={{ marginTop: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#CA8A04', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            Dismiss message
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Active API Connections */}
                <div className={styles.card} style={{ padding: '2rem' }}>
                    <h3 className={styles.sectionTitle} style={{ marginBottom: '1.5rem', fontSize: '1.125rem', borderBottom: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Key size={18} color="var(--brand)" /> Active API Connections
                    </h3>
                    {loading ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading API configurations...</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {keys.length === 0 ? (
                                <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                    <Key size={32} color="#9CA3AF" style={{ margin: '0 auto 1rem auto' }} />
                                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>No Active Keys</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Generate an API key to allow external access.</div>
                                </div>
                            ) : keys.map(key => (
                                <div key={key.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px',
                                    backgroundColor: key.isActive ? 'white' : '#F8FAFC',
                                    opacity: key.isActive ? 1 : 0.7
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                            {key.name}
                                            <span style={{
                                                fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '100px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                                                background: key.isActive ? '#ECFDF5' : '#F1F5F9', color: key.isActive ? '#059669' : '#64748B'
                                            }}>
                                                {key.isActive ? 'Active' : 'Revoked'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Globe size={12} /> {key.scopes.join(', ')}</span>
                                            <span>•</span>
                                            <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {key.lastUsedAt && (
                                            <div style={{ fontSize: '0.7rem', color: '#4F46E5', fontWeight: 600, marginTop: '0.5rem', background: '#EEF2FF', padding: '0.2rem 0.5rem', borderRadius: '4px', width: 'fit-content' }}>
                                                Last used: {new Date(key.lastUsedAt).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                    {key.isActive && (
                                        <button
                                            onClick={() => handleRevoke(key.id!)}
                                            style={{ color: '#DC2626', background: '#FEF2F2', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
                                            title="Revoke Key"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ERP Connectors */}
                <div className={styles.card} style={{ padding: '2rem' }}>
                    <h3 className={styles.sectionTitle} style={{ marginBottom: '1.5rem', fontSize: '1.125rem', borderBottom: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Database size={18} color="var(--brand)" /> ERP Connectors
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* GIFMIS */}
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Server size={16} color="#3B82F6" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>GIFMIS (Govt of Ghana)</div>
                                    </div>
                                </div>
                                <span className={styles.badge} style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}>Ready to Configure</span>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.75rem 0 1rem 0' }}>Official GoG Financial System integration for MDAs and MMDAs.</p>
                            <button className={styles.button} onClick={() => setActiveErp('GIFMIS')} style={{ width: '100%', justifyContent: 'center' }}>
                                Configure Connection
                            </button>
                        </div>

                        {/* Dynamics */}
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Server size={16} color="#22C55E" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Microsoft Dynamics 365</div>
                                    </div>
                                </div>
                                <span className={styles.badge} style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}>Ready to Configure</span>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.75rem 0 1rem 0' }}>Advanced Business Central & F&O connectivity for private enterprises.</p>
                            <button className={styles.button} onClick={() => setActiveErp('DYNAMICS')} style={{ width: '100%', justifyContent: 'center' }}>
                                Configure Connection
                            </button>
                        </div>

                        {/* Sage */}
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Server size={16} color="#6B7280" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Sage Evolution / X3</div>
                                    </div>
                                </div>
                                <span className={styles.badge} style={{ background: '#F3F4F6', color: '#4B5563', borderColor: '#E5E7EB' }}>Testing Only</span>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.75rem 0 1rem 0' }}>Popular private sector ERP for inventory and financial control in Ghana.</p>
                            <button className={styles.button} onClick={() => handleTestSync('SAGE')} style={{ width: '100%', justifyContent: 'center', background: '#F9FAFB' }}>
                                Execute Sync Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sync Logs */}
            <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className={styles.sectionTitle} style={{ margin: 0, fontSize: '1.125rem', borderBottom: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={18} color="var(--brand)" /> Real-time Synchronization Logs
                    </h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Timestamp</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Entity</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Action</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {syncLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                                        <History size={32} color="#9CA3AF" style={{ margin: '0 auto 1rem auto' }} />
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>No recent sync activities.</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>System logs will populate here once ERP synchronization begins.</div>
                                    </td>
                                </tr>
                            ) : syncLogs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'white', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.8125rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                                        {new Date(log.timestamp).toLocaleString(undefined, {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.8125rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-main)', fontWeight: 600 }}>
                                            <FileText size={14} color="#9CA3AF" />
                                            {log.entityType} #{log.entityId.slice(-6)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{
                                            fontWeight: 700, fontSize: '0.75rem', color: '#4F46E5', background: '#EEF2FF', padding: '0.25rem 0.5rem', borderRadius: '4px'
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 800, color: log.status === 'SUCCESS' ? '#059669' : '#DC2626' }}>
                                            {log.status === 'SUCCESS' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                            {log.status}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{log.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={styles.card} style={{ width: '100%', maxWidth: '450px', padding: '2rem', animation: 'scaleIn 0.2s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Generate New API Key</h3>
                            <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><XCircle size={24} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Application Name</label>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. Data Warehouse Sync"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Access Scope</label>
                                <select
                                    className={styles.input}
                                    value={formData.scope}
                                    onChange={e => setFormData({ ...formData, scope: e.target.value as any })}
                                >
                                    <option value="FULL_ADMIN">Full Admin Access</option>
                                    <option value="REQUISITIONS_READ">Requisitions (Read Only)</option>
                                    <option value="PO_READ">Purchase Orders (Read Only)</option>
                                    <option value="INVOICES_WRITE">Invoices (Write Only)</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className={styles.button} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className={styles.primaryButton} style={{ flex: 1, justifyContent: 'center' }}>
                                    <Key size={16} /> Generate Key
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ERP Config Modal */}
            {activeErp && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={styles.card} style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', animation: 'scaleIn 0.2s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Server size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Configure {activeErp}</h3>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Production ERP Synchronization Settings</p>
                            </div>
                        </div>

                        <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '8px', border: '1px solid #FEF3C7', display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                            <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#92400E', lineHeight: 1.5 }}>
                                Modifying these settings will immediately affect production data sync. Please ensure coordination with your IT department.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div className={styles.formGroup} style={{ margin: 0 }}>
                                <label className={styles.label}>Production API Endpoint</label>
                                <input className={styles.input} placeholder="https://api.erp-system.com/v2" value={erpConfig.apiUrl} onChange={e => setErpConfig({ ...erpConfig, apiUrl: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className={styles.formGroup} style={{ margin: 0 }}>
                                    <label className={styles.label}>Client ID</label>
                                    <input className={styles.input} type="password" placeholder="••••••••" value={erpConfig.clientId} onChange={e => setErpConfig({ ...erpConfig, clientId: e.target.value })} />
                                </div>
                                <div className={styles.formGroup} style={{ margin: 0 }}>
                                    <label className={styles.label}>Client Secret</label>
                                    <input className={styles.input} type="password" placeholder="••••••••" value={erpConfig.clientSecret} onChange={e => setErpConfig({ ...erpConfig, clientSecret: e.target.value })} />
                                </div>
                            </div>
                            <div className={styles.formGroup} style={{ margin: 0 }}>
                                <label className={styles.label}>Data Mapping Profile</label>
                                <select className={styles.input} value={erpConfig.mappingScheme} onChange={e => setErpConfig({ ...erpConfig, mappingScheme: e.target.value })}>
                                    <option value="DIRECT">Direct 1:1 Mapping</option>
                                    <option value="GL_TRANSFORM">GL Account Transformation</option>
                                    <option value="AGGREGATED">Aggregated Monthly Batch</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                            <button className={styles.button} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveErp(null)}>Cancel</button>
                            <button className={styles.primaryButton} style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                                alert(`${activeErp} configuration saved! Initiating handshake...`);
                                setActiveErp(null);
                            }}>Verify & Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
