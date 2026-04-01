"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Users, UserPlus, Shield, LayoutGrid, List, MailOpen, Search } from 'lucide-react';
import StatCards from '@/components/users/StatCards';
import UserTable from '@/components/users/UserTable';
import PendingInvitesTable from '@/components/users/PendingInvitesTable';
import RoleGrid from '@/components/users/RoleGrid';
import InviteUserModal from '@/components/users/InviteUserModal';
import RoleDetailModal from '@/components/users/RoleDetailModal';
import PermissionMatrixModal from '@/components/users/PermissionMatrixModal';
import EditUserModal from '@/components/users/EditUserModal';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { getAllUsers } from '@/lib/users';
import { AppUser, Invite, UserRole } from '@/types';
import Loader from '@/components/common/Loader';
import { toast } from 'sonner';

export default function UsersDashboardPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'invites'>('users');
    
    // Modal states
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<UserRole | null>(null);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<AppUser | null>(null);
    const [isMatrixOpen, setIsMatrixOpen] = useState(false);

    useEffect(() => {
        if (user === null) {
            setLoading(false);
        } else if (user?.tenantId) {
            fetchData();
        }
    }, [user, user?.tenantId]);

    const fetchData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [fetchedUsers, fetchedInvitesResponse] = await Promise.all([
                getAllUsers(user!.tenantId),
                fetch('/api/v1/invites', {
                    headers: { 'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}` }
                }).then(res => res.json())
            ]);
            
            setUsers(fetchedUsers);
            setInvites(fetchedInvitesResponse.invites || []);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            if (!silent) toast.error("Failed to load user management data");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'pending') => {
        if (!user) return;
        
        const promise = new Promise(async (resolve, reject) => {
            try {
                const idToken = await auth.currentUser?.getIdToken();
                const response = await fetch(`/api/v1/users/${userId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to update user status');
                }

                // Update local state
                setUsers(prev => prev.map(u => u.uid === userId ? { ...u, status: newStatus } : u));
                resolve(true);
            } catch (error: any) {
                console.error("Status update error:", error);
                reject(error);
            }
        });

        toast.promise(promise, {
            loading: 'Updating user status...',
            success: `User status updated to ${newStatus}`,
            error: (err: any) => err.message
        });
    };

    const handleRevokeInvite = async (inviteId: string) => {
        const idToken = await auth.currentUser?.getIdToken();
        const response = await fetch(`/api/v1/invites/${inviteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to revoke invitation');
        }

        // Update local state
        setInvites(prev => prev.filter(i => i.id !== inviteId));
    };

    if (loading) {
        return <Loader text="Loading Team Management..." />;
    }

    const tabs = [
        { id: 'users', label: 'Staff Directory', icon: List },
        { id: 'roles', label: 'Access Hierarchies', icon: LayoutGrid },
        { id: 'invites', label: 'Pending Invites', icon: MailOpen }
    ];

    return (
        <div className="animate-in" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Team Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Staff hierarchies, role permissions, and organizational invites.</p>
                </div>
                <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    style={{ 
                        padding: '0.75rem 1.5rem', 
                        borderRadius: '12px', 
                        background: 'var(--brand)', 
                        border: 'none', 
                        color: '#FFF', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        cursor: 'pointer', 
                        fontWeight: 900, 
                        fontSize: '0.8125rem', 
                        boxShadow: '0 8px 16px rgba(232, 87, 42, 0.2)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 20px rgba(232, 87, 42, 0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(232, 87, 42, 0.2)'; }}
                >
                    <UserPlus size={18} /> Invite Member
                </button>
            </div>

            {/* ── Stats Strip ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: '2.5rem' }}>
                <StatCards 
                    totalUsers={users.length} 
                    pendingInvites={invites.length} 
                    activeAdmins={users.filter(u => u.role?.toLowerCase().includes('admin') || u.role?.toLowerCase().includes('administrator')).length}
                    activeSessions={users.filter(u => u.status === 'active').length}
                />
            </div>

            {/* ── Tab Bar ─────────────────────────────────────────────────── */}
            <div style={{ 
                display: 'flex',
                gap: '0.25rem',
                background: 'var(--surface-2)', 
                padding: '0.375rem', 
                borderRadius: '14px', 
                width: 'fit-content', 
                marginBottom: '2rem', 
                border: '1px solid var(--border)' 
            }}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                padding: '0.625rem 1.25rem', 
                                borderRadius: '10px', 
                                border: 'none', 
                                fontWeight: isActive ? 800 : 600, 
                                fontSize: '0.8125rem', 
                                cursor: 'pointer', 
                                transition: 'all 0.2s ease',
                                background: isActive ? 'var(--surface)' : 'transparent',
                                color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                                letterSpacing: isActive ? '-0.01em' : '0'
                            }}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Content Area ────────────────────────────────────────────── */}
            {activeTab === 'users' ? (
                <UserTable 
                    users={users} 
                    onEdit={(u) => setSelectedUserForEdit(u)} 
                    onStatusChange={handleStatusChange} 
                />
            ) : activeTab === 'invites' ? (
                <PendingInvitesTable 
                    invites={invites} 
                    onRevoke={handleRevokeInvite} 
                />
            ) : (
                <RoleGrid 
                    onViewPermissions={(r) => setSelectedRoleForDetail(r)} 
                    onViewMatrix={() => setIsMatrixOpen(true)}
                />
            )}

            {/* Modals */}
            <InviteUserModal 
                isOpen={isInviteModalOpen} 
                onClose={() => setIsInviteModalOpen(false)} 
                onInviteCreated={() => fetchData(true)}
            />

            <RoleDetailModal 
                roleId={selectedRoleForDetail || undefined}
                isOpen={!!selectedRoleForDetail}
                onClose={() => setSelectedRoleForDetail(null)}
            />

            <PermissionMatrixModal 
                isOpen={isMatrixOpen}
                onClose={() => setIsMatrixOpen(false)}
            />

            <EditUserModal 
                isOpen={!!selectedUserForEdit}
                onClose={() => setSelectedUserForEdit(null)}
                user={selectedUserForEdit as any}
                onUserUpdated={() => fetchData(true)}
            />
        </div>
    );
}
