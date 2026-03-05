"use client";

import { useState, useEffect } from "react";
import { AppUser, UserRole } from "@/types";
import { getAllUsers, updateUserRole, updateUserHierarchy, updateUserManager, setUserStatus } from "@/lib/users";
import { getLocations } from "@/lib/locations";
import { getDepartments } from "@/lib/departments";
import { Location, Department } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { useModal } from "@/context/ModalContext";
import styles from "@/app/dashboard/settings/Settings.module.css";
import {
    Users, Search, UserPlus, Shield, MapPin,
    Building2, UserCog, Mail, X, CheckCircle2,
    XCircle, AlertCircle, ChevronDown
} from "lucide-react";

export default function UserManagement() {
    const { user: currentUser } = useAuth();
    const { showError } = useModal();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    const ROLES: UserRole[] = ["ADMIN", "APPROVER", "FINANCE", "REQUESTER", "AP_USER", "FINANCE_MANAGER", "STRATEGIC_SOURCER"];

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const [userData, locData, deptData] = await Promise.all([
                getAllUsers(currentUser.tenantId),
                getLocations(currentUser.tenantId),
                getDepartments(currentUser.tenantId)
            ]);
            setUsers(userData);
            setLocations(locData);
            setDepartments(deptData);
        } catch (error) {
            console.error("Failed to load user directory data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (uid: string, newRole: UserRole) => {
        if (!currentUser) return;
        try {
            await updateUserRole(currentUser.tenantId, uid, newRole, currentUser.uid);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (error) {
            showError("Update Failed", "Failed to update user role.");
        }
    };

    const handleHierarchyChange = async (uid: string, locationId?: string, departmentId?: string) => {
        if (!currentUser) return;
        try {
            const updates = {
                ...(locationId !== undefined ? { locationId } : {}),
                ...(departmentId !== undefined ? { departmentId } : {})
            };
            await updateUserHierarchy(currentUser.tenantId, uid, updates, currentUser.uid);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...updates } : u));
        } catch (error) {
            showError("Update Failed", "Failed to update organizational hierarchy.");
        }
    };

    const handleManagerChange = async (uid: string, managerId: string) => {
        if (!currentUser) return;
        try {
            await updateUserManager(currentUser.tenantId, uid, managerId, currentUser.uid);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, managerId } : u));
        } catch (error) {
            showError("Update Failed", "Failed to update manager assignment.");
        }
    };

    const handleStatusToggle = async (uid: string, currentStatus: boolean | undefined) => {
        if (!currentUser) return;
        const newStatus = !(currentStatus ?? true);
        try {
            await setUserStatus(currentUser.tenantId, uid, newStatus, currentUser.uid);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isActive: newStatus } : u));
        } catch (error) {
            showError("Update Failed", "Failed to update user status.");
        }
    };

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteData, setInviteData] = useState({
        email: "",
        displayName: "",
        role: "REQUESTER" as UserRole,
        locationId: "",
        departmentId: "",
        managerId: ""
    });
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState("");

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        setInviteError("");

        try {
            const idToken = await auth.currentUser?.getIdToken();
            const response = await fetch("/api/invitations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify(inviteData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to invite user");
            }

            // Success
            setIsInviteModalOpen(false);
            setInviteData({
                email: "",
                displayName: "",
                role: "REQUESTER",
                locationId: "",
                departmentId: "",
                managerId: ""
            });
            // Refresh directory
            fetchUsers();

            // Show success via custom logic since we don't have a showSuccess in ModalContext right now
            alert("User invited successfully! If email is configured, an invitation was sent.");
        } catch (err: any) {
            setInviteError(err.message);
        } finally {
            setIsInviting(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(filter.toLowerCase()) ||
        (u.displayName || "").toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return <div style={{ padding: '2.5rem', textAlign: 'center', color: '#6B7280' }}>Loading user directory...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.2s ease-out' }}>
                    <div className={styles.card} style={{ maxWidth: '500px', width: '100%', margin: '1rem', padding: '0', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: '#E0E7FF', color: '#4F46E5', width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800 }}>Invite Team Member</h2>
                                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Send an invitation email with a secure setup link.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsInviteModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '0.25rem' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 150px)' }}>
                            <form onSubmit={handleInviteUser}>
                                {inviteError && (
                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#FEF2F2', color: '#EF4444', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '0.75rem', border: '1px solid #FEE2E2' }}>
                                        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                                        <span>{inviteError}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email Address *</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                            <input
                                                type="email"
                                                className={styles.input}
                                                style={{ paddingLeft: '2.5rem' }}
                                                required
                                                value={inviteData.email}
                                                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                                placeholder="colleague@company.com"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Full Name</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={inviteData.displayName}
                                            placeholder="Optional"
                                            onChange={(e) => setInviteData({ ...inviteData, displayName: e.target.value })}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>System Role *</label>
                                        <select
                                            className={styles.input}
                                            required
                                            value={inviteData.role}
                                            onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as UserRole })}
                                        >
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Location</label>
                                            <select
                                                className={styles.input}
                                                value={inviteData.locationId}
                                                onChange={(e) => setInviteData({ ...inviteData, locationId: e.target.value })}
                                            >
                                                <option value="">None</option>
                                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Department</label>
                                            <select
                                                className={styles.input}
                                                value={inviteData.departmentId}
                                                onChange={(e) => setInviteData({ ...inviteData, departmentId: e.target.value })}
                                            >
                                                <option value="">None</option>
                                                {departments.filter(d => !inviteData.locationId || d.locationId === inviteData.locationId).map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Direct Manager</label>
                                        <select
                                            className={styles.input}
                                            value={inviteData.managerId}
                                            onChange={(e) => setInviteData({ ...inviteData, managerId: e.target.value })}
                                        >
                                            <option value="">None</option>
                                            {users.map(m => (
                                                <option key={m.uid} value={m.uid}>{m.displayName || m.email}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" className={styles.secondaryButton} onClick={() => setIsInviteModalOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className={styles.primaryButton} disabled={isInviting || !inviteData.email} style={{ flex: 1, justifyContent: 'center' }}>
                                        {isInviting ? <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Mail size={16} />}
                                        {isInviting ? "Sending..." : "Send Invitation"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h3 className={styles.sectionTitle} style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={22} color="var(--brand)" /> User Directory
                    </h3>
                    <p className={styles.subtitle}>Manage permissions, team assignments, and reporting structures.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search directory..."
                            className={styles.input}
                            style={{ paddingLeft: '2.5rem', width: '280px', borderRadius: '100px', backgroundColor: 'white' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <button className={styles.primaryButton} onClick={() => setIsInviteModalOpen(true)}>
                        <UserPlus size={18} /> Invite Member
                    </button>
                </div>
            </div>

            <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                {filteredUsers.length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <div style={{ background: '#F3F4F6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <Search size={32} color="#9CA3AF" />
                        </div>
                        <h4 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>No users found</h4>
                        <p className={styles.subtitle} style={{ maxWidth: '400px', margin: '0 auto' }}>
                            {filter ? `No users match the search "${filter}".` : "Your user directory is currently empty."}
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>User</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Role</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Organization</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Manager</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u.uid} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s', backgroundColor: 'white' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {u.photoURL ? (
                                                    <img src={u.photoURL} alt={u.displayName || "User"} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                                                ) : (
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, var(--brand) 0%, #E83E8C 100%)',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 800,
                                                        fontSize: '1.125rem',
                                                        flexShrink: 0
                                                    }}>
                                                        {(u.displayName || u.email || "U")[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{u.displayName || "Standard User"}</div>
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ position: 'relative', width: 'fit-content' }}>
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                                                    className={styles.input}
                                                    style={{
                                                        padding: '0.375rem 2rem 0.375rem 0.75rem',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.8125rem',
                                                        fontWeight: 700,
                                                        backgroundColor: u.role === 'ADMIN' ? '#EEF2FF' : '#F9FAFB',
                                                        color: u.role === 'ADMIN' ? '#4F46E5' : 'var(--text-main)',
                                                        borderColor: u.role === 'ADMIN' ? '#C7D2FE' : 'var(--border)',
                                                        cursor: 'pointer',
                                                        appearance: 'none'
                                                    }}
                                                >
                                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                                <ChevronDown size={14} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: u.role === 'ADMIN' ? '#4F46E5' : '#9CA3AF' }} />
                                            </div>
                                        </td>

                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <MapPin size={12} color="#9CA3AF" style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                                                    <select
                                                        value={u.locationId || ""}
                                                        onChange={(e) => handleHierarchyChange(u.uid, e.target.value, undefined)}
                                                        className={styles.input}
                                                        style={{ padding: '0.375rem 1.75rem 0.375rem 1.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer', color: u.locationId ? 'var(--text-main)' : 'var(--text-secondary)', appearance: 'none', height: 'auto', backgroundColor: 'transparent' }}
                                                    >
                                                        <option value="">No Location Defined</option>
                                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                    </select>
                                                    <ChevronDown size={12} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }} />
                                                </div>

                                                <div style={{ position: 'relative' }}>
                                                    <Building2 size={12} color="#9CA3AF" style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                                                    <select
                                                        value={u.departmentId || ""}
                                                        onChange={(e) => handleHierarchyChange(u.uid, undefined, e.target.value)}
                                                        className={styles.input}
                                                        style={{ padding: '0.375rem 1.75rem 0.375rem 1.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer', color: u.departmentId ? 'var(--text-main)' : 'var(--text-secondary)', appearance: 'none', height: 'auto', backgroundColor: 'transparent' }}
                                                    >
                                                        <option value="">No Department Defined</option>
                                                        {departments.filter(d => !u.locationId || d.locationId === u.locationId).map(d => (
                                                            <option key={d.id} value={d.id}>{d.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={12} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }} />
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ position: 'relative' }}>
                                                <UserCog size={14} color="#9CA3AF" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                                                <select
                                                    value={u.managerId || ""}
                                                    onChange={(e) => handleManagerChange(u.uid, e.target.value)}
                                                    className={styles.input}
                                                    style={{ padding: '0.4rem 2rem 0.4rem 2.25rem', borderRadius: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer', color: u.managerId ? 'var(--text-main)' : 'var(--text-secondary)', appearance: 'none', backgroundColor: '#F9FAFB' }}
                                                >
                                                    <option value="">No Line Manager</option>
                                                    {users.filter(potentialManager => potentialManager.uid !== u.uid).map(m => (
                                                        <option key={m.uid} value={m.uid}>{m.displayName || m.email}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }} />
                                            </div>
                                        </td>

                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <button
                                                onClick={() => handleStatusToggle(u.uid, u.isActive)}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '999px',
                                                    border: 'none',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.375rem',
                                                    transition: 'all 0.2s',
                                                    background: (u.isActive ?? true) ? '#ECFDF5' : '#FEF2F2',
                                                    color: (u.isActive ?? true) ? '#10B981' : '#EF4444'
                                                }}
                                            >
                                                {(u.isActive ?? true) ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {(u.isActive ?? true) ? "Active" : "Disabled"}
                                            </button>
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
