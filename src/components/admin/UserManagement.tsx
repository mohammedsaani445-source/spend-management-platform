"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AppUser, UserRole } from "@/types";
import { getAllUsers, updateUserRole, updateUserHierarchy, updateUserManager, setUserStatus } from "@/lib/users";
import { getLocations } from "@/lib/locations";
import { getDepartments } from "@/lib/departments";
import { Location, Department } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { useModal } from "@/context/ModalContext";
import styles from "@/app/dashboard/settings/Settings.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import ApprovalQueue from "./ApprovalQueue";
import {
    Users, Search, Shield, MapPin,
    Building2, UserCog, ChevronDown, ShieldCheck,
    CheckCircle2, XCircle
} from "lucide-react";
import Loader from "@/components/common/Loader";
import RoleSelector from "./RoleSelector";

export default function UserManagement() {
    const { user: currentUser } = useAuth();
    const { showError } = useModal();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    const ROLES: UserRole[] = ["ADMIN", "SUPERUSER", "APPROVER", "FINANCE", "REQUESTER", "AP_USER", "FINANCE_MANAGER", "STRATEGIC_SOURCER", "PURCHASER", "RECEIVER", "REPORTER"];
    const [activeSubTab, setActiveSubTab] = useState<'DIRECTORY' | 'REQUESTS'>('DIRECTORY');

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



    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(filter.toLowerCase()) ||
        (u.displayName || "").toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return <Loader text="Loading user directory..." />;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.125rem' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <button
                        onClick={() => setActiveSubTab('DIRECTORY')}
                        style={{
                            padding: '1rem 0',
                            border: 'none',
                            background: 'none',
                            fontSize: '0.9375rem',
                            fontWeight: 800,
                            color: activeSubTab === 'DIRECTORY' ? 'var(--brand)' : 'var(--text-secondary)',
                            borderBottom: activeSubTab === 'DIRECTORY' ? '2px solid var(--brand)' : '2px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.625rem',
                            marginBottom: '-1px'
                        }}
                    >
                        <Users size={20} /> User Directory
                    </button>
                    <button
                        onClick={() => setActiveSubTab('REQUESTS')}
                        style={{
                            padding: '1rem 0',
                            border: 'none',
                            background: 'none',
                            fontSize: '0.9375rem',
                            fontWeight: 800,
                            color: activeSubTab === 'REQUESTS' ? 'var(--brand)' : 'var(--text-secondary)',
                            borderBottom: activeSubTab === 'REQUESTS' ? '2px solid var(--brand)' : '2px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.625rem',
                            marginBottom: '-1px'
                        }}
                    >
                        <ShieldCheck size={20} /> Access Requests
                    </button>
                </div>

                {activeSubTab === 'DIRECTORY' && (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '0.5rem' }}>
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
                    </div>
                )}
            </div>
            {activeSubTab === 'REQUESTS' ? (
                <ApprovalQueue />
            ) : (
                <>
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
                                                    <RoleSelector
                                                        variant="compact"
                                                        value={u.role}
                                                        onChange={(newRole) => handleRoleChange(u.uid, newRole)}
                                                        disabled={u.uid === currentUser?.uid}
                                                    />
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
                </>
            )}
        </div>
    );
}
