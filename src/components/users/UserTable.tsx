import React, { useState } from 'react';
import { Search, Filter, UserX, UserCheck, Shield, Mail, Edit3, Activity, ChevronDown, Check, Users } from 'lucide-react';
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
                    padding: '0.6rem 1rem 0.6rem 0.75rem',
                    background: 'var(--surface)',
                    border: isOpen ? '1px solid var(--brand)' : '1px solid var(--border)',
                    boxShadow: isOpen ? '0 0 0 2px rgba(232, 87, 42, 0.1)' : 'none',
                    borderRadius: '10px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                    minWidth: '160px',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon size={14} style={{ color: isOpen ? 'var(--brand)' : 'var(--text-disabled)' }} />
                    <span>
                        <span style={{ opacity: 0.6 }}>{labelPrefix}</span>{selectedOption.label}
                    </span>
                </div>
                <ChevronDown size={13} style={{ opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
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
                                        background: value === opt.value ? 'var(--brand-soft)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.8125rem',
                                        color: value === opt.value ? 'var(--brand)' : 'var(--text-secondary)',
                                        fontWeight: value === opt.value ? 700 : 500,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.1s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (value !== opt.value) e.currentTarget.style.background = 'var(--surface-2)';
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

    const getStatusConfig = (status: string) => {
        const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
            active: { label: 'Active', color: 'var(--success)', bg: 'var(--success-soft)', border: 'rgba(0, 171, 85, 0.2)' },
            pending: { label: 'Pending', color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'rgba(183, 110, 0, 0.2)' },
            suspended: { label: 'Suspended', color: 'var(--error)', bg: 'var(--error-bg)', border: 'rgba(183, 33, 54, 0.2)' },
        };
        return map[status] || map.active;
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
                        placeholder="Filter staff directory..." 
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
                <div style={{ display: 'flex', gap: '0.75rem', zIndex: 10 }}>
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
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                        <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Staff Member</th>
                        <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Role & Unit</th>
                        <th style={{ textAlign: 'center', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                        <th style={{ textAlign: 'right', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence mode="popLayout">
                    {filteredUsers.length > 0 ? filteredUsers.map((user, i) => {
                        const statusCfg = getStatusConfig(user.status || 'active');
                        return (
                            <motion.tr 
                                key={user.uid}
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
                                            background: user.status === 'active' ? 'var(--brand-soft)' : 'var(--surface-2)', 
                                            color: user.status === 'active' ? 'var(--brand)' : 'var(--text-secondary)', 
                                            fontWeight: 800, 
                                            fontSize: '1rem',
                                            border: '1px solid var(--border)',
                                            flexShrink: 0
                                        }}>
                                            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{user.displayName || 'No ID assigned'}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-disabled)', fontSize: '0.7rem', marginTop: '2px' }}>
                                                <Mail size={11} /> {user.email}
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
                                            <RoleIcon roleId={user.role} size={12} className="text-[#E8572A]" />
                                            {ROLE_CONFIGS[user.role as UserRole]?.label || user.role}
                                        </span>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginTop: '6px', fontWeight: 600 }}>
                                            {user.department || 'Global Operations'}
                                        </div>
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
                                        color: statusCfg.color,
                                        background: statusCfg.bg,
                                        border: `1px solid ${statusCfg.border}`
                                    }}>
                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                                        {statusCfg.label}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button 
                                            onClick={() => onEdit(user)}
                                            style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px', 
                                                border: '1px solid var(--border)', background: 'var(--surface)', 
                                                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', 
                                                justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s'
                                            }}
                                            title="Edit User"
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => onStatusChange(user.uid, (user.status || 'active') === 'active' ? 'suspended' : 'active')}
                                            style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                border: `1px solid ${(user.status || 'active') === 'active' ? 'var(--error-bg)' : 'rgba(0,171,85,0.2)'}`,
                                                background: (user.status || 'active') === 'active' ? 'var(--error-bg)' : 'var(--success-soft)',
                                                color: (user.status || 'active') === 'active' ? 'var(--error)' : 'var(--success)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                cursor: 'pointer', transition: 'all 0.15s'
                                            }}
                                            title={(user.status || 'active') === 'active' ? 'Suspend Access' : 'Restore Access'}
                                        >
                                            {(user.status || 'active') === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
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
                            <td colSpan={4} style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-disabled)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Users size={24} />
                                    </div>
                                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>No users match your filters.</p>
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

export default UserTable;
