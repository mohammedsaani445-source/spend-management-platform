"use client";

import { useState, useEffect } from "react";
import { AppUser, UserRole } from "@/types";
import { getAllUsers, updateUserRole, updateUserHierarchy, updateUserManager, setUserStatus } from "@/lib/users";
import { getLocations } from "@/lib/locations";
import { getDepartments } from "@/lib/departments";
import { Location, Department } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import styles from "@/components/layout/Layout.module.css";

export default function UserManagement() {
    const { user: currentUser } = useAuth();
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
            alert("Failed to update role");
        }
    };

    const handleHierarchyChange = async (uid: string, locationId?: string, departmentId?: string) => {
        if (!currentUser) return;
        try {
            const updates = {
                ...(locationId ? { locationId } : {}),
                ...(departmentId ? { departmentId } : {})
            };
            await updateUserHierarchy(currentUser.tenantId, uid, updates, currentUser.uid);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...updates } : u));
        } catch (error) {
            alert("Failed to update hierarchy");
        }
    };

    const handleManagerChange = async (uid: string, managerId: string) => {
        if (!currentUser) return;
        try {
            await updateUserManager(currentUser.tenantId, uid, managerId, currentUser.uid);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, managerId } : u));
        } catch (error) {
            alert("Failed to update manager");
        }
    };

    const handleStatusToggle = async (uid: string, currentStatus: boolean | undefined) => {
        if (!currentUser) return;
        const newStatus = !(currentStatus ?? true);
        try {
            await setUserStatus(currentUser.tenantId, uid, newStatus, currentUser.uid);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isActive: newStatus } : u));
        } catch (error) {
            alert("Failed to update status");
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
            alert("User invited successfully! If RESEND_API_KEY is configured, an email was sent.");
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

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading user directory...</div>;

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className={styles.modalBackdrop} style={{ zIndex: 1000 }}>
                    <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', margin: 'auto', position: 'relative' }}>
                        <button
                            onClick={() => setIsInviteModalOpen(false)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            ✕
                        </button>
                        <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 800 }}>Invite Team Member</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Send an invitation email with a secure setup link.
                        </p>

                        <form onSubmit={handleInviteUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {inviteError && (
                                <div style={{ padding: '1rem', backgroundColor: 'var(--error-soft)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {inviteError}
                                </div>
                            )}
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={inviteData.displayName}
                                    placeholder="Optional"
                                    onChange={(e) => setInviteData({ ...inviteData, displayName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>System Role *</label>
                                <select
                                    required
                                    value={inviteData.role}
                                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as UserRole })}
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Location</label>
                                    <select
                                        value={inviteData.locationId}
                                        onChange={(e) => setInviteData({ ...inviteData, locationId: e.target.value })}
                                    >
                                        <option value="">None</option>
                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select
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
                            <div className="form-group">
                                <label>Direct Manager</label>
                                <select
                                    value={inviteData.managerId}
                                    onChange={(e) => setInviteData({ ...inviteData, managerId: e.target.value })}
                                >
                                    <option value="">None</option>
                                    {users.map(m => (
                                        <option key={m.uid} value={m.uid}>{m.displayName || m.email}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isInviting || !inviteData.email}
                                style={{ marginTop: '1rem', padding: '0.875rem' }}
                            >
                                {isInviting ? "Sending Invitation..." : "Send Invitation"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                <div>
                    <h3 style={{ margin: 0, fontWeight: 800 }}>User Directory</h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Manage permissions and team structural assignments.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="form-control"
                        style={{ width: '250px', borderRadius: '10px' }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}
                        onClick={() => setIsInviteModalOpen(true)}
                    >
                        + Invite Member
                    </button>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>User</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Role</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Organization</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Manager</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.uid} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'var(--brand)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 800,
                                            fontSize: '1rem'
                                        }}>
                                            {(u.displayName || u.email || "U")[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{u.displayName || "Standard User"}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--background)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            color: u.role === 'ADMIN' ? 'var(--brand)' : 'var(--text-main)'
                                        }}
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <select
                                            value={u.locationId || ""}
                                            onChange={(e) => handleHierarchyChange(u.uid, e.target.value)}
                                            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem' }}
                                        >
                                            <option value="">Select Location...</option>
                                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                        <select
                                            value={u.departmentId || ""}
                                            onChange={(e) => handleHierarchyChange(u.uid, undefined, e.target.value)}
                                            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem' }}
                                        >
                                            <option value="">Select Department...</option>
                                            {departments.filter(d => !u.locationId || d.locationId === u.locationId).map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <select
                                        value={u.managerId || ""}
                                        onChange={(e) => handleManagerChange(u.uid, e.target.value)}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--background)',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <option value="">No Manager</option>
                                        {users.filter(potentialManager => potentialManager.uid !== u.uid).map(m => (
                                            <option key={m.uid} value={m.uid}>{m.displayName || m.email}</option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <button
                                        onClick={() => handleStatusToggle(u.uid, u.isActive)}
                                        style={{
                                            padding: '0.4rem 1rem',
                                            borderRadius: '20px',
                                            border: 'none',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            background: (u.isActive ?? true) ? 'var(--status-approved-bg)' : 'var(--status-rejected-bg)',
                                            color: (u.isActive ?? true) ? 'var(--status-approved)' : 'var(--status-rejected)'
                                        }}
                                    >
                                        {(u.isActive ?? true) ? "● Active" : "○ Disabled"}
                                    </button>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {u.createdAt.toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
