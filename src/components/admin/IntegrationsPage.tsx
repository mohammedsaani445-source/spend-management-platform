"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiKeys, generateApiKey, revokeApiKey } from "@/lib/apiKey";
import { getErpSyncLogs } from "@/lib/erp/engine";
import { ApiKey, ErpSyncLog } from "@/types";
import styles from "./Integrations.module.css";

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
            alert(`Sync failed: ${error.message || "Uknown error"}. Check logs for details.`);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Enterprise Integrations</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage API access and ERP connectivity for external systems.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setShowCreate(true); setNewKeyRaw(null); }}
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none' }}
                >
                    🔌 Generate New API Key
                </button>
            </div>

            {newKeyRaw && (
                <div style={{ backgroundColor: '#fefce8', border: '1px solid #eab308', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <div style={{ fontWeight: 700, color: '#854d0e', marginBottom: '0.5rem' }}>⚠️ API Key Generated Successfully</div>
                    <p style={{ fontSize: '0.9rem', color: '#a16207', marginBottom: '1rem' }}>
                        Copy this key now. For your security, we will never show it again.
                    </p>
                    <code style={{ background: '#fff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fde047', fontSize: '1.1rem', fontWeight: 600, display: 'block' }}>
                        {newKeyRaw}
                    </code>
                    <button
                        className="btn"
                        onClick={() => setNewKeyRaw(null)}
                        style={{ marginTop: '1rem', background: '#eab308', border: 'none', color: '#fff' }}
                    >
                        I have copied the key
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Active API Connections</h3>
                    {loading ? <p>Loading API configurations...</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {keys.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No active API keys found.</p> : keys.map(key => (
                                <div key={key.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: key.isActive ? 'transparent' : '#f8fafc' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {key.name}
                                            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '99px', background: key.isActive ? '#dcfce7' : '#f1f5f9', color: key.isActive ? '#166534' : '#64748b' }}>
                                                {key.isActive ? 'Active' : 'Revoked'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            Scopes: {key.scopes.join(', ')} • Created: {new Date(key.createdAt).toLocaleDateString()}
                                        </div>
                                        {key.lastUsedAt && (
                                            <div style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#0ea5e9' }}>
                                                Last used: {new Date(key.lastUsedAt).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                    {key.isActive && (
                                        <button onClick={() => handleRevoke(key.id!)} style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>Revoke</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>ERP Connectors</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600 }}>GIFMIS (Govt of Ghana)</span>
                                <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Ready to Configure</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Official GoG Financial System integration for MDAs and MMDAs.</p>
                            <button className="btn" onClick={() => setActiveErp('GIFMIS')} style={{ width: '100%', fontSize: '0.8rem', background: '#fff', border: '1px solid #3b82f6', color: '#3b82f6' }}>
                                Configure Connection
                            </button>
                        </div>
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600 }}>Microsoft Dynamics 365</span>
                                <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Ready to Configure</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Advanced Business Central & F&O connectivity for private enterprises.</p>
                            <button className="btn" onClick={() => setActiveErp('DYNAMICS')} style={{ width: '100%', fontSize: '0.8rem', background: '#fff', border: '1px solid #22c55e', color: '#22c55e' }}>
                                Configure Connection
                            </button>
                        </div>
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600 }}>Sage Evolution / X3</span>
                                <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Ready to Configure</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Popular private sector ERP for inventory and financial control in Ghana.</p>
                            <button className="btn" onClick={() => handleTestSync('SAGE')} style={{ width: '100%', fontSize: '0.8rem', background: '#fff', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                Execute Sync Test
                            </button>
                        </div>
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600 }}>TallyPrime</span>
                                <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Ready to Configure</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Optimized accounting sync for Ghanaian SMEs and private firms.</p>
                            <button className="btn" onClick={() => handleTestSync('TALLY')} style={{ width: '100%', fontSize: '0.8rem', background: '#fff', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                Execute Sync Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Real-time Synchronization Logs</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Timestamp</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Entity</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Action</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {syncLogs.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent sync activities.</td></tr>
                            ) : syncLogs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>{log.entityType} #{log.entityId.slice(-6)}</td>
                                    <td style={{ padding: '1rem' }}><span style={{ fontWeight: 600 }}>{log.action}</span></td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            backgroundColor: log.status === 'SUCCESS' ? '#dcfce7' : '#fee2e2',
                                            color: log.status === 'SUCCESS' ? '#166534' : '#991b1b',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{log.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '450px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Generate New API Key</h3>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Application Name</label>
                                <input
                                    className="input"
                                    placeholder="e.g. Data Warehouse Sync"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Access Scope</label>
                                <select
                                    className="input"
                                    value={formData.scope}
                                    onChange={e => setFormData({ ...formData, scope: e.target.value as any })}
                                >
                                    <option value="FULL_ADMIN">Full Admin Access</option>
                                    <option value="REQUISITIONS_READ">Requisitions (Read Only)</option>
                                    <option value="PO_READ">Purchase Orders (Read Only)</option>
                                    <option value="INVOICES_WRITE">Invoices (Write Only)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Generate Key</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ERP Config Modal */}
            {activeErp && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🔌</div>
                            <div>
                                <h3 style={{ margin: 0 }}>Configure {activeErp}</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Production ERP Synchronization Settings</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>Production API Endpoint</label>
                                <input className="input" placeholder="https://api.erp-system.com/v2" value={erpConfig.apiUrl} onChange={e => setErpConfig({ ...erpConfig, apiUrl: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>Client ID</label>
                                    <input className="input" type="password" value={erpConfig.clientId} onChange={e => setErpConfig({ ...erpConfig, clientId: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>Client Secret</label>
                                    <input className="input" type="password" value={erpConfig.clientSecret} onChange={e => setErpConfig({ ...erpConfig, clientSecret: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>Data Mapping Profile</label>
                                <select className="input" value={erpConfig.mappingScheme} onChange={e => setErpConfig({ ...erpConfig, mappingScheme: e.target.value })}>
                                    <option value="DIRECT">Direct 1:1 Mapping</option>
                                    <option value="GL_TRANSFORM">GL Account Transformation</option>
                                    <option value="AGGREGATED">Aggregated Monthly Batch</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                            <button className="btn" style={{ flex: 1 }} onClick={() => setActiveErp(null)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
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
