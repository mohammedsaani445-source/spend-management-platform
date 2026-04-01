"use client";

import React, { useState } from 'react';
import { Search, Copy, Shield, Mail, Trash2, Clock, Zap, RefreshCw, Check, MailOpen } from 'lucide-react';
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
        <div style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            boxShadow: 'var(--shadow-sm)' 
        }}>
            {/* ── Toolbar Strip ────────────────────────────────────────────── */}
            <div style={{ 
                padding: '1.25rem 1.5rem', 
                borderBottom: '1px solid var(--border)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'var(--surface-2)',
                gap: '0.75rem'
            }}>
                <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
                    <input 
                        placeholder="Filter pending invites..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            padding: '0.6rem 1rem 0.6rem 2.25rem', 
                            borderRadius: '10px', 
                            background: 'var(--surface)', 
                            border: '1px solid var(--border)', 
                            color: 'var(--text-primary)', 
                            fontSize: '0.8125rem', 
                            width: '100%',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 700 }}>
                    <Clock size={14} style={{ color: 'var(--brand)' }} />
                    {invites.length} Pending Record{invites.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                        <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Invitee</th>
                        <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Role & Unit</th>
                        <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Join Code</th>
                        <th style={{ textAlign: 'center', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                        <th style={{ textAlign: 'right', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence mode="popLayout">
                    {filteredInvites.length > 0 ? filteredInvites.map((invite, i) => {
                        const expired = isExpired(invite.expires_at);
                        const statusColor = expired ? 'var(--error)' : 'var(--warning)';
                        const statusBg = expired ? 'var(--error-bg)' : 'var(--warning-bg)';
                        const statusBorder = expired ? 'rgba(183, 33, 54, 0.2)' : 'rgba(183, 110, 0, 0.2)';

                        return (
                            <motion.tr 
                                key={invite.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: i * 0.03 }}
                                style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                                className="hover:bg-brand-xsoft"
                            >
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ 
                                            width: '40px', 
                                            height: '40px', 
                                            borderRadius: '12px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            background: 'var(--surface-2)', 
                                            color: 'var(--text-secondary)', 
                                            fontWeight: 800, 
                                            fontSize: '1rem',
                                            border: '1px solid var(--border)',
                                            flexShrink: 0
                                        }}>
                                            {invite.invited_name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{invite.invited_name || 'Anonymous Invitee'}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-disabled)', fontSize: '0.7rem', marginTop: '2px' }}>
                                                <Mail size={11} /> {invite.invited_email || 'No email provided'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div>
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            fontWeight: 800, 
                                            color: 'var(--text-secondary)', 
                                            background: 'var(--surface-2)', 
                                            padding: '4px 10px', 
                                            borderRadius: '6px', 
                                            border: '1px solid var(--border)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Shield size={12} style={{ color: 'var(--brand)' }} />
                                            {ROLE_CONFIGS[invite.role as UserRole]?.label || invite.role}
                                        </span>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginTop: '6px', fontWeight: 600 }}>
                                            {invite.department || 'Global Operations'}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '6px',
                                        padding: '4px 12px', 
                                        background: 'var(--surface)', 
                                        color: 'var(--text-primary)', 
                                        border: '1px solid var(--border)', 
                                        borderRadius: '8px',
                                        fontFamily: 'monospace', 
                                        fontWeight: 800, 
                                        letterSpacing: '0.1em',
                                        fontSize: '0.8125rem'
                                    }}>
                                        <Zap size={12} style={{ color: 'var(--brand)' }} />
                                        {invite.code}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        color: statusColor,
                                        background: statusBg,
                                        border: `1px solid ${statusBorder}`
                                    }}>
                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                                        {expired ? 'Expired' : `Exp. ${new Date(invite.expires_at).toLocaleDateString()}`}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button 
                                            onClick={() => handleCopyLink(invite.token)}
                                            style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px', 
                                                border: '1px solid var(--border)', background: 'var(--surface)', 
                                                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', 
                                                justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s'
                                            }}
                                            title="Copy Magic Link"
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        >
                                            <Copy size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleRevoke(invite.id)}
                                            disabled={revokingId === invite.id}
                                            style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                border: '1px solid var(--error-bg)',
                                                background: 'var(--error-bg)',
                                                color: 'var(--error)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                cursor: 'pointer', transition: 'all 0.15s'
                                            }}
                                            title="Revoke Identity Record"
                                        >
                                            {revokingId === invite.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        );
                    }) : (
                        <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <td colSpan={5} style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-disabled)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MailOpen size={24} />
                                    </div>
                                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>No pending activation records found.</p>
                                </div>
                            </td>
                        </motion.tr>
                    )}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
};

export default PendingInvitesTable;
