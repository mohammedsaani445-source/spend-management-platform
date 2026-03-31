import React, { useState, useEffect } from 'react';
import { X, User, ArrowRight, ChevronDown, Check } from 'lucide-react';
import { ROLE_CONFIGS } from '@/lib/roles_config';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import Portal from '@/components/common/Portal';
import { motion, AnimatePresence } from 'framer-motion';
import RoleSelect from './RoleSelect';

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

// RoleSelect local implementation removed in favor of shared component

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
            <div className="modal-backdrop" style={{ animation: "fadeIn 0.2s ease-out", padding: '1rem' }}>
                <div className="modal" style={{ maxWidth: 500, width: "100%", maxHeight: 'calc(100vh - 2rem)', display: 'flex', flexDirection: 'column', animation: "slideUp 0.3s ease-out", padding: 0, overflow: 'visible', borderRadius: '12px' }}>
                    <div className="modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0, borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                        <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: "1.25rem" }}>
                            <User size={24} color="var(--brand)" /> 
                            Edit User
                        </h2>
                        <button 
                            onClick={onClose} 
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s' }} 
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} 
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'visible' }}>
                        <div className="modal-body" style={{ display: 'grid', gap: '1.25rem', padding: '1.5rem', overflowY: 'visible', flex: 1 }}>
                            <div>
                                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Full Name
                                </label>
                                <input 
                                    type="text" 
                                    required 
                                    className="form-input"
                                    placeholder="e.g. Samuel Adewale"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Email Address (Read-Only)
                                </label>
                                <input 
                                    type="email" 
                                    className="form-input"
                                    value={user.email}
                                    readOnly
                                    disabled
                                    style={{ background: 'var(--surface-hover)', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <RoleSelect
                                        label="Assigned Role"
                                        value={formData.role}
                                        onChange={(val) => setFormData({ ...formData, role: val as UserRole })}
                                        options={Object.entries(ROLE_CONFIGS)
                                            .filter(([, cfg]) => !cfg.label.startsWith('Legacy:'))
                                            .map(([id, cfg]) => ({ label: cfg.label, value: id }))}
                                    />
                                </div>
                                <div>
                                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        Department
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="form-input"
                                        placeholder="e.g. Logistics"
                                        value={formData.department}
                                        onChange={e => setFormData({...formData, department: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer stack-mobile" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0, borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary full-width-mobile" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary full-width-mobile" disabled={loading} style={{ minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {loading ? 'Saving...' : <>Save Changes <Check size={18} /></>}
                            </button>
                        </div>
        <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 640px) {
                .modal-body {
                    padding: 1rem !important;
                    gap: 1rem !important;
                }
            }
        `}} />
                    </form>
                </div>
            </div>
        </Portal>
    );
};

export default EditUserModal;
