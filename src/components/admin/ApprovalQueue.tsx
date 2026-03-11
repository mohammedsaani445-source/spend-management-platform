"use client";

import { useState, useEffect } from "react";
import { db, DB_PREFIX } from "@/lib/firebase";
import { ref, onValue, set, remove, get } from "firebase/database";
import { getAllTenants, Tenant } from "@/lib/tenants";
import { CheckCircle2, XCircle, Building2, User, Mail, Loader2, Search, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import styles from "@/app/dashboard/settings/Settings.module.css";
import RoleSelector from "./RoleSelector";

interface PendingUser {
    uid: string;
    email: string;
    displayName: string;
    status: string;
    createdAt: number;
}

export default function ApprovalQueue() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedTenantId, setSelectedTenantId] = useState<string>("");
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [userToApprove, setUserToApprove] = useState<PendingUser | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>("REQUESTER");

    const ROLES = ["ADMIN", "SUPERUSER", "APPROVER", "FINANCE", "REQUESTER", "AP_USER", "FINANCE_MANAGER", "STRATEGIC_SOURCER", "PURCHASER", "RECEIVER", "REPORTER"];

    const [error, setError] = useState<string | null>(null);
    const [backfilling, setBackfilling] = useState(false);

    useEffect(() => {
        const pendingRef = ref(db, `${DB_PREFIX}/users_pending`);
        const unsubscribe = onValue(pendingRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setPendingUsers(Object.entries(data).map(([uid, val]: [string, any]) => ({
                    uid,
                    ...val
                })));
            } else {
                setPendingUsers([]);
            }
            setLoading(false);
        });

        // Load tenants for assignment
        loadTenants();

        return () => unsubscribe();
    }, []);

    const loadTenants = async () => {
        try {
            setError(null);
            const data = await getAllTenants();
            setTenants(data);
        } catch (err: any) {
            console.error("Failed to load tenants:", err);
            if (err.message && err.message.includes("permission_denied")) {
                setError("Permission Denied: Please ensure your Firebase security rules allow reading the 'tenant_registry' path.");
            } else {
                setError("Failed to load workspace list.");
            }
        }
    };

    const handleBackfill = async () => {
        const { backfillTenantRegistry } = await import("@/lib/tenants");
        setBackfilling(true);
        try {
            const count = await backfillTenantRegistry();
            alert(`Successfully synced ${count} workspaces to the registry.`);
            loadTenants();
        } catch (err) {
            console.error("Backfill failed:", err);
            alert("Sync failed. You may not have high-level read permissions on the main /tenants path.");
        } finally {
            setBackfilling(false);
        }
    };

    const handleApprove = async () => {
        if (!userToApprove || !selectedTenantId) return;
        setProcessingId(userToApprove.uid);
        try {
            // 1. Map user to tenant
            await set(ref(db, `${DB_PREFIX}/userTenants/${userToApprove.uid}`), {
                tenantId: selectedTenantId
            });

            // 2. Create user profile in tenant
            await set(ref(db, `${DB_PREFIX}/tenants/${selectedTenantId}/users/${userToApprove.uid}`), {
                email: userToApprove.email,
                displayName: userToApprove.displayName,
                role: selectedRole,
                userType: 'PRO',
                isActive: true,
                createdAt: userToApprove.createdAt || Date.now()
            });

            // 3. Remove from pending
            await remove(ref(db, `${DB_PREFIX}/users_pending/${userToApprove.uid}`));

            setIsApprovalModalOpen(false);
            setUserToApprove(null);
            setSelectedTenantId("");
        } catch (error) {
            console.error("Failed to approve user:", error);
            alert("Failed to approve user.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (uid: string) => {
        if (!confirm("Are you sure you want to reject this access request?")) return;
        setProcessingId(uid);
        try {
            await remove(ref(db, `${DB_PREFIX}/users_pending/${uid}`));
        } catch (error) {
            console.error("Failed to reject user:", error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" /> Loading requests...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={22} color="var(--brand)" /> Access Requests
                </h3>
                <p className={styles.subtitle}>Review and onboard new users seeking access to the platform.</p>

                {error && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertTriangle size={16} /> Configuration Required
                            </div>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: '#667085' }}>{error}</p>
                        </div>
                        <button
                            onClick={handleBackfill}
                            disabled={backfilling}
                            className={styles.secondaryButton}
                            style={{ fontSize: '0.75rem', height: '32px' }}
                        >
                            {backfilling ? "Syncing..." : "Sync Tenant Registry"}
                        </button>
                    </div>
                )}
            </div>

            {pendingUsers.length === 0 ? (
                <div className={styles.card} style={{ padding: '4rem 2rem', textAlign: 'center', background: '#F9FAFB', border: '2px dashed #E5E7EB' }}>
                    <div style={{ background: 'white', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <User size={32} color="#9CA3AF" />
                    </div>
                    <h4 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>No pending requests</h4>
                    <p style={{ color: '#637381', maxWidth: '300px', margin: '0 auto' }}>
                        All caught up! New signups will appear here for your review and workspace assignment.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {pendingUsers.map(u => (
                        <div key={u.uid} className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', border: '1px solid #E5E7EB', transition: 'transform 0.2s', cursor: 'default' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'linear-gradient(135deg, #E8572A 0%, #FF8C66 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.25rem' }}>
                                    {u.displayName[0].toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>{u.displayName}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#637381' }}>
                                        <Mail size={14} /> {u.email}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => handleReject(u.uid)}
                                    className={styles.secondaryButton}
                                    style={{ color: '#EF4444', borderColor: '#FEE2E2', background: '#FEF2F2' }}
                                    disabled={processingId === u.uid}
                                >
                                    <XCircle size={18} /> Reject
                                </button>
                                <button
                                    onClick={() => { setUserToApprove(u); setIsApprovalModalOpen(true); }}
                                    className={styles.primaryButton}
                                    disabled={processingId === u.uid}
                                >
                                    {processingId === u.uid ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> Approve & Assign</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Approval Modal */}
            {isApprovalModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className={styles.card} style={{ maxWidth: '450px', width: '100%', padding: '2rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <button onClick={() => setIsApprovalModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
                            <XCircle size={24} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: 64, height: 64, background: '#ECFDF5', color: '#059669', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Building2 size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Assign Workspace</h3>
                            <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Choose an organization for **{userToApprove?.displayName}**.</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Target Workspace</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    className={styles.input}
                                    value={selectedTenantId}
                                    onChange={(e) => setSelectedTenantId(e.target.value)}
                                    style={{ paddingRight: '2.5rem' }}
                                >
                                    <option value="">Select a workspace...</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.currency})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <RoleSelector
                                label="Assign System Role"
                                value={selectedRole as any}
                                onChange={(role) => setSelectedRole(role)}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                            <button className={styles.secondaryButton} style={{ justifyContent: 'center' }} onClick={() => setIsApprovalModalOpen(false)}>
                                Cancel
                            </button>
                            <button
                                className={styles.primaryButton}
                                style={{ justifyContent: 'center' }}
                                onClick={handleApprove}
                                disabled={!selectedTenantId || !!processingId}
                            >
                                {processingId ? <Loader2 className="animate-spin" /> : "Confirm Approval"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
