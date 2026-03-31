import React, { useState } from 'react';
import { Search, Filter, MoreVertical, UserX, UserCheck, Shield, Mail, Edit3, Trash2, Clock, CheckCircle2, AlertCircle, Activity, ChevronRight, Hash, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppUser, UserRole } from '@/types';
import { ROLE_CONFIGS } from '@/lib/roles_config';
import { RoleIcon } from './RoleIcon';

interface UserTableProps {
    users: AppUser[];
    onEdit: (user: AppUser) => void;
    onStatusChange: (uid: string, status: 'active' | 'suspended' | 'pending') => void;
}

interface FilterDropdownProps {
    icon: React.FC<any>;
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    labelPrefix: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ icon: Icon, value, onChange, options, labelPrefix }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(o => o.value === value) || options[0];

    // Close on click outside
    React.useEffect(() => {
        const handleClick = () => setIsOpen(false);
        if (isOpen) document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [isOpen]);

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem 0.5rem 0.75rem',
                    background: 'white',
                    border: isOpen ? '1px solid var(--brand)' : '1px solid var(--border)',
                    boxShadow: isOpen ? '0 0 0 2px rgba(92, 106, 196, 0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                    minWidth: '170px',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon size={16} style={{ color: isOpen ? 'var(--brand)' : 'var(--text-secondary)' }} />
                    <span>
                        <span style={{ opacity: 0.7 }}>{labelPrefix}</span> {selectedOption.label}
                    </span>
                </div>
                <ChevronDown size={14} style={{ opacity: 0.6, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: '0.5rem',
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                            minWidth: '220px',
                            zIndex: 50,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: '300px',
                        }}
                    >
                        <div style={{ overflowY: 'auto', padding: '0.375rem' }}>
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.5rem 0.75rem',
                                        background: value === opt.value ? 'var(--surface-hover)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        color: value === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        fontWeight: value === opt.value ? 600 : 400,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.1s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (value !== opt.value) e.currentTarget.style.background = 'var(--surface-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (value !== opt.value) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    {opt.label}
                                    {value === opt.value && <Check size={14} color="var(--brand)" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onStatusChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                              (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || (user.status || 'active') === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getPersonnelId = (uid: string) => `AX-${uid.substring(0, 4).toUpperCase()}-${uid.substring(uid.length - 4).toUpperCase()}`;

    const getStatusBadge = (status: string) => {
        const config: Record<string, { color: string; border: string; bg: string; icon: any; shadow: string }> = {
            active: { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: CheckCircle2, shadow: 'shadow-emerald-500/20' },
            pending: { color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', icon: Clock, shadow: 'shadow-amber-500/20' },
            suspended: { color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10', icon: AlertCircle, shadow: 'shadow-rose-500/20' }
        };
        const item = config[status] || config.active;
        const Icon = item.icon;

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.bg} ${item.border} ${item.color} ${item.shadow} shadow-sm`}>
                <div className={`w-1 h-1 rounded-full bg-current animate-pulse`} />
                {status}
            </div>
        );
    };


    return (
        <div>
            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", justifyContent: "space-between" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: "2.25rem", background: "white" }}
                    />
                </div>
                
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", zIndex: 10 }}>
                    <FilterDropdown
                        icon={Filter}
                        labelPrefix="Role: "
                        value={roleFilter}
                        onChange={setRoleFilter}
                        options={[
                            { label: 'All', value: 'all' },
                            ...Object.entries(ROLE_CONFIGS)
                                .filter(([, cfg]) => !cfg.label.startsWith('Legacy:'))
                                .map(([id, cfg]) => ({ label: cfg.label, value: id }))
                        ]}
                    />

                    <FilterDropdown
                        icon={Activity}
                        labelPrefix="Status: "
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { label: 'All', value: 'all' },
                            { label: 'Active', value: 'active' },
                            { label: 'Pending', value: 'pending' },
                            { label: 'Suspended', value: 'suspended' },
                        ]}
                    />
                </div>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Staff Member</th>
                            <th>Role & Unit</th>
                            <th>Status</th>
                            <th align="right" style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                        {filteredUsers.length > 0 ? filteredUsers.map((user, i) => (
                            <motion.tr 
                                key={user.uid}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: i * 0.03 }}
                                className="hover:bg-gray-50/50"
                            >
                                <td style={{ padding: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: user.status === 'active' ? '#FFF5F3' : '#F4F6F8', color: user.status === 'active' ? '#E8572A' : '#637381', fontWeight: 700, fontSize: "1.125rem", border: "1px solid #DFE3E8" }}>
                                            {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, color: "#212B36", marginBottom: "0.125rem" }}>{user.displayName || 'No ID assigned'}</p>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#637381", fontSize: "0.75rem" }}>
                                                <Mail size={12} /> {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                    <div>
                                        <div className="badge" style={{ background: "#F4F6F8", color: "#212B36", border: "1px solid #DFE3E8", marginBottom: "0.25rem", display: "flex", alignItems: "center" }}>
                                            <RoleIcon roleId={user.role} size={12} className="mr-1 text-[#E8572A]" />
                                            {ROLE_CONFIGS[user.role as UserRole]?.label || user.role}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "#637381" }}>
                                            {user.department || 'Global Operations'}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                    <div className={`badge ${user.status === 'suspended' ? 'badge-rejected' : user.status === 'pending' ? 'badge-pending' : 'badge-approved' }`}>
                                        {user.status || 'active'}
                                    </div>
                                </td>
                                <td style={{ padding: "1rem", textAlign: "right" }}>
                                    <button 
                                        onClick={() => onEdit(user)}
                                        className="btn btn-ghost btn-icon btn-sm"
                                        title="Edit User"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => onStatusChange(user.uid, (user.status || 'active') === 'active' ? 'suspended' : 'active')}
                                        className="btn btn-ghost btn-icon btn-sm"
                                        style={{ color: (user.status || 'active') === 'active' ? '#B72136' : '#00AB55' }}
                                        title={(user.status || 'active') === 'active' ? 'Suspend Access' : 'Restore Access'}
                                    >
                                        {(user.status || 'active') === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                                    </button>
                                </td>
                            </motion.tr>
                        )) : (
                            <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <td colSpan={4} style={{ padding: "4rem 1rem", textAlign: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", color: "#919EAB" }}>
                                        <Search size={32} />
                                        <p style={{ fontWeight: 500 }}>No users match your filters.</p>
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

export default UserTable;
