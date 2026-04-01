import React, { useState, useEffect } from 'react';
import { X, User, ArrowRight, ChevronDown, Check, Shield, Mail, Building } from 'lucide-react';
import { ROLE_CONFIGS } from '@/lib/roles_config';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import Portal from '@/components/common/Portal';
import { motion, AnimatePresence } from 'framer-motion';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        uid: string;
        name: string;
        email: string;
        role: UserRole;
        department: string;
        status: 'active' | 'suspended' | 'pending';
    } | null;
    onUserUpdated?: () => void;
}

const RoleSelect: React.FC<{ value: string; onChange: (val: string) => void; options: { label: string; value: string }[] }> = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find(o => o.value === value) || options[0];

    useEffect(() => {
        const handleClick = () => setIsOpen(false);
        if (isOpen) document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [isOpen]);

    return (
        <div className="relative" onClick={e => e.stopPropagation()} style={{ width: '100%' }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--surface-2)',
                    border: isOpen ? '1px solid var(--brand)' : '1px solid var(--border)',
                    boxShadow: isOpen ? '0 0 0 2px rgba(232, 87, 42, 0.1)' : 'none',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={14} style={{ color: 'var(--brand)' }} />
                    {selected?.label}
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-disabled)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '0.5rem',
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '14px',
                            boxShadow: 'var(--shadow-xl)',
                            zIndex: 100,
                            maxHeight: '260px',
                            overflowY: 'auto',
                            padding: '0.375rem'
                        }}
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    padding: '0.625rem 0.875rem',
                                    background: value === opt.value ? 'var(--brand-soft)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '0.8125rem',
                                    color: value === opt.value ? 'var(--brand)' : 'var(--text-secondary)',
                                    fontWeight: value === opt.value ? 700 : 500,
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s ease',
                                    marginBottom: '2px'
                                }}
                                onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = 'var(--surface-2)'; }}
                                onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {opt.label}
                                {value === opt.value && <Check size={14} color="var(--brand)" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: 'requester' as UserRole,
        department: ''
    });

    // Reset state when opening or when user changes
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                name: user.name || '',
                role: user.role || 'requester',
                department: user.department || ''
            });
        }
    }, [isOpen, user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const idToken = await auth.currentUser?.getIdToken();
            const res = await fetch(`/api/v1/users/${user.uid}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    role: formData.role,
                    department: formData.department,
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update user');

            onUserUpdated?.();
            toast.success("User updated successfully");
            onClose();
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <Portal>
            <AnimatePresence>
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        style={{ 
                            maxWidth: 500, 
                            width: "100%", 
                            position: 'relative',
                            background: 'var(--background)',
                            borderRadius: '24px',
                            boxShadow: 'var(--shadow-xl)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header Strip */}
                        <div style={{ padding: "1.5rem 2rem", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={20} color="var(--brand)" />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                        Edit User
                                    </h2>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                        Update profile and access level
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose} 
                                style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer', transition: 'all 0.15s' }} 
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }} 
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-disabled)'; }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }}>
                                            <User size={16} />
                                        </div>
                                        <input 
                                            type="text" 
                                            required 
                                            className="form-input"
                                            placeholder="e.g. Samuel Adewale"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            style={{ paddingLeft: '2.75rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', height: '44px', fontWeight: 500 }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }}>
                                            <Mail size={16} />
                                        </div>
                                        <input 
                                            type="email" 
                                            className="form-input"
                                            value={user.email}
                                            readOnly
                                            disabled
                                            style={{ paddingLeft: '2.75rem', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', height: '44px', color: 'var(--text-disabled)', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                                            Assignment
                                        </label>
                                        <RoleSelect
                                            value={formData.role}
                                            onChange={(val) => setFormData({ ...formData, role: val as UserRole })}
                                            options={Object.entries(ROLE_CONFIGS)
                                                .filter(([, cfg]) => !cfg.label.startsWith('Legacy:'))
                                                .map(([id, cfg]) => ({ label: cfg.label, value: id }))}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                                            Department
                                        </label>
                                        <div className="relative">
                                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }}>
                                                <Building size={16} />
                                            </div>
                                            <input 
                                                type="text" 
                                                required 
                                                className="form-input"
                                                placeholder="Logistics"
                                                value={formData.department}
                                                onChange={e => setFormData({...formData, department: e.target.value})}
                                                style={{ paddingLeft: '2.75rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', height: '44px', fontWeight: 500 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ padding: "1.25rem 2rem", background: "var(--surface-2)", borderTop: "1px solid var(--border)", display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button 
                                    type="button" 
                                    onClick={onClose}
                                    style={{ padding: '0 1.25rem', height: '44px', borderRadius: '12px', background: 'var(--background)', border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--background)'}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    style={{ padding: '0 1.5rem', height: '44px', borderRadius: '12px', background: 'var(--brand)', border: 'none', fontSize: '0.875rem', fontWeight: 700, color: 'white', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1, transition: 'all 0.15s', boxShadow: '0 4px 12px rgba(232, 87, 42, 0.2)' }}
                                    onMouseEnter={e => { if(!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={e => { if(!loading) e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    {loading ? 'Saving...' : <>Save Changes <ArrowRight size={16} /></>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </AnimatePresence>
        </Portal>
    );
};

export default EditUserModal;

