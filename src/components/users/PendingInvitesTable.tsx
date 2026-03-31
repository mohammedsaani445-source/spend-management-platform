"use client";

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Copy, Shield, Mail, Trash2, Clock, CheckCircle2, AlertCircle, ExternalLink, Zap, RefreshCw, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Invite, UserRole } from '@/types';
import { ROLE_CONFIGS } from '@/lib/roles_config';
import { toast } from 'sonner';

interface PendingInvitesTableProps {
    invites: Invite[];
    onRevoke: (inviteId: string) => Promise<void>;
    onReshare?: (invite: Invite) => void;
}

const PendingInvitesTable: React.FC<PendingInvitesTableProps> = ({ invites, onRevoke, onReshare }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [revokingId, setRevokingId] = useState<string | null>(null);

    const filteredInvites = invites.filter(invite => {
        const matchesSearch = (invite.invited_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                              (invite.invited_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                              (invite.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

    const handleCopyLink = (token: string) => {
        const link = `${window.location.origin}/join/${token}`;
        navigator.clipboard.writeText(link);
        toast.success("Magic Link Synchronized to Clipboard");
    };

    const handleRevoke = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this invitation? This action cannot be undone and will be permanently logged.")) return;
        
        setRevokingId(id);
        const promise = onRevoke(id);
        
        toast.promise(promise, {
            loading: 'Revoking identity record...',
            success: 'Invitation revoked successfully',
            error: 'Failed to revoke invitation'
        });

        try {
            await promise;
        } catch (error) {
            console.error("Revoke error:", error);
        } finally {
            setRevokingId(null);
        }
    };

    return (
        <div>
            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", justifyContent: "space-between" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Filter pending invites by name, email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: "2.25rem", background: "white" }}
                    />
                </div>
                
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", color: "#637381", fontSize: "0.875rem", fontWeight: 600 }}>
                    <Clock size={16} style={{ color: "#E8572A" }} /> {invites.length} Pending Invites
                </div>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Invitee</th>
                            <th>Role & Unit</th>
                            <th>Join Code</th>
                            <th>Status</th>
                            <th align="right" style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                        {filteredInvites.length > 0 ? filteredInvites.map((invite, i) => {
                            const expired = isExpired(invite.expires_at);
                            return (
                                <motion.tr 
                                    key={invite.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="hover:bg-gray-50/50"
                                >
                                <td style={{ padding: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: '#F4F6F8', color: '#637381', fontWeight: 700, fontSize: "1.125rem", border: "1px solid #DFE3E8" }}>
                                            {invite.invited_name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, color: "#212B36", marginBottom: "0.125rem" }}>{invite.invited_name}</p>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#637381", fontSize: "0.75rem" }}>
                                                <Mail size={12} /> {invite.invited_email || 'No email provided'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                    <div>
                                        <div className="badge" style={{ background: "#F4F6F8", color: "#212B36", border: "1px solid #DFE3E8", marginBottom: "0.25rem" }}>
                                            <Shield size={12} style={{ marginRight: "0.25rem", color: "#E8572A" }} />
                                            {ROLE_CONFIGS[invite.role as UserRole]?.label || invite.role}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "#637381" }}>
                                            {invite.department || 'Global Operations'}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                    <div className="badge" style={{ background: "white", color: "#212B36", border: "1px solid #DFE3E8", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.1em" }}>
                                        <Zap size={12} style={{ marginRight: "0.25rem", color: "#E8572A" }} /> {invite.code}
                                    </div>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                    <div className={`badge ${expired ? 'badge-rejected' : 'badge-pending'}`}>
                                        <Clock size={12} style={{ marginRight: "0.25rem" }} />
                                        {expired ? 'Expired' : `Expires ${new Date(invite.expires_at).toLocaleDateString()}`}
                                    </div>
                                </td>
                                <td style={{ padding: "1rem", textAlign: "right" }}>
                                    <button 
                                        onClick={() => handleCopyLink(invite.token)}
                                        className="btn btn-ghost btn-icon btn-sm"
                                        title="Copy Magic Link"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    <button 
                                        onClick={() => handleRevoke(invite.id)}
                                        disabled={revokingId === invite.id}
                                        className="btn btn-ghost btn-icon btn-sm"
                                        style={{ color: '#B72136' }}
                                        title="Revoke Invite"
                                    >
                                        {revokingId === invite.id ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </td>
                            </motion.tr>
                        );
                    }) : (
                        <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <td colSpan={5} style={{ padding: "4rem 1rem", textAlign: "center" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", color: "#919EAB" }}>
                                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#F4F6F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Mail size={24} />
                                    </div>
                                    <p style={{ fontWeight: 500 }}>No pending invites found.</p>
                                </div>
                            </td>
                        </motion.tr>
                    )}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    </div>
);
};

export default PendingInvitesTable;
