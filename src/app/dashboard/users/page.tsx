"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, UserPlus, Info, Shield, LayoutGrid, List, MailOpen } from 'lucide-react';
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader text="Loading Staff Directory..." />
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Team Management</h1>
                    <p className="page-subtitle">Manage Apex Procure staff hierarchies, role permissions, and pending organizational invites.</p>
                </div>
                <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="btn btn-primary"
                >
                    <UserPlus size={18} style={{ marginRight: 6 }} /> Invite New User
                </button>
            </div>

            {/* ── Stats Strip ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: "1.5rem" }}>
                <StatCards 
                    totalUsers={users.length} 
                    pendingInvites={invites.length} 
                    activeAdmins={users.filter(u => u.role?.toLowerCase().includes('admin') || u.role?.toLowerCase().includes('administrator')).length}
                    activeSessions={users.filter(u => u.status === 'active').length}
                />
            </div>

            {/* ── Tab Bar ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", background: "#F4F6F8", padding: "0.375rem", borderRadius: 10, width: "fit-content", marginBottom: "1.5rem", border: "1px solid #DFE3E8" }}>
                {[
                    { id: 'users', label: 'Staff Directory', icon: List },
                    { id: 'roles', label: 'Access Hierarchies', icon: LayoutGrid },
                    { id: 'invites', label: 'Pending Invites', icon: MailOpen }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.5rem 1.25rem", borderRadius: 8, border: "none", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", transition: "all 0.15s ease",
                            background: activeTab === tab.id ? "white" : "transparent",
                            color: activeTab === tab.id ? "#5C6AC4" : "#637381",
                            boxShadow: activeTab === tab.id ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
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

