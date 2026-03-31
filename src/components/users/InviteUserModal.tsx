import React, { useState, useEffect } from 'react';
import { X, Copy, Check, UserPlus, Lock, Smartphone, Mail, ArrowRight, ChevronDown } from 'lucide-react';
import { ROLE_CONFIGS } from '@/lib/roles_config';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { auth } from '@/lib/firebase';
import Portal from '@/components/common/Portal';
import { motion, AnimatePresence } from 'framer-motion';

const RoleSelect: React.FC<{ value: string; onChange: (val: string) => void; options: { label: string; value: string }[] }> = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find(o => o.value === value) || options[0];

    useEffect(() => {
        const handleClick = () => setIsOpen(false);
        if (isOpen) document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [isOpen]);

    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.625rem 1rem',
                    background: 'var(--background)',
                    border: isOpen ? '1px solid var(--brand)' : '1px solid var(--border)',
                    boxShadow: isOpen ? '0 0 0 3px rgba(92, 106, 196, 0.1)' : 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                }}
            >
                {selected?.label}
                <ChevronDown size={16} style={{ color: 'var(--text-secondary)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '0.5rem',
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                            zIndex: 100,
                            maxHeight: '220px',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ padding: '0.375rem' }}>
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
                                        padding: '0.5rem 0.75rem',
                                        background: value === opt.value ? 'var(--surface-hover)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        color: value === opt.value ? 'var(--brand)' : 'var(--text-secondary)',
                                        fontWeight: value === opt.value ? 600 : 400,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                                    onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = 'transparent'; }}
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

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInviteCreated?: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onInviteCreated }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'requester' as UserRole,
        department: '',
        expiresInHours: 48
    });
    
    const [result, setResult] = useState<{
        token: string;
        code: string;
        magicLink: string;
        qrCodeDataUrl: string;
    } | null>(null);

    const [copied, setCopied] = useState<'link' | 'code' | null>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setResult(null);
            setFormData({
                name: '',
                email: '',
                role: 'requester',
                department: '',
                expiresInHours: 48
            });
        }
    }, [isOpen]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const idToken = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/v1/invites', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    department: formData.department,
                    expiresInHours: formData.expiresInHours
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create invite');

            const magicLink = `${window.location.origin}/join/${data.token}`;
            const qrCodeDataUrl = await QRCode.toDataURL(magicLink, {
                width: 512,
                margin: 2,
                color: {
                    dark: '#5C6AC4', // Matches var(--brand) typical color
                    light: '#FFFFFF', // White
                },
            });

            setResult({
                token: data.token,
                code: data.code,
                magicLink,
                qrCodeDataUrl
            });
            setStep(2);
            onInviteCreated?.();
            toast.success("User invited successfully");
        } catch (error: any) {
            console.error("Invite error:", error);
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, type: 'link' | 'code') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
        toast.success(`Copied ${type === 'link' ? 'Magic Link' : 'Access Code'} to clipboard`);
    };

    const shareViaWhatsApp = () => {
        const text = `Hi ${formData.name}, you've been invited to join the platform as a ${ROLE_CONFIGS[formData.role]?.label}.\n\nAccess Link: ${result?.magicLink}\nAccess Code: ${result?.code}\n\nNote: Link expires in ${formData.expiresInHours} hours.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="modal-backdrop" style={{ animation: "fadeIn 0.2s ease-out" }}>
                <div className="modal" style={{ maxWidth: 640, width: "95%", maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: "slideUp 0.3s ease-out", padding: 0, overflow: 'visible', borderRadius: '12px' }}>
                    <div className="modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0, borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                        <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: "1.25rem" }}>
                            <UserPlus size={24} color="var(--brand)" /> 
                            {step === 1 ? 'Invite New User' : 'Invite Generated'}
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

                    {step === 1 ? (
                        <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'visible' }}>
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

                                <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            Assigned Role
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

                                <div>
                                    <label className="form-label" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.25rem' }}>
                                        Email Address <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.75rem' }}>(Optional)</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        className="form-input"
                                        placeholder="user@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>

                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--surface-hover)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem',
                                }}>
                                    <Lock size={16} color="var(--text-secondary)" style={{ marginTop: '0.1rem' }} />
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        A secure magic link and access code will be generated. You can share these credentials directly with the user via your preferred communication channel.
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-footer" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0, borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {loading ? 'Processing...' : <>Generate Invite <ArrowRight size={16} /></>}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'visible' }}>
                            <div className="modal-body" style={{ display: 'grid', gap: '1.25rem', padding: '1.5rem', overflowY: 'visible', flex: 1 }}>
                                <div style={{ textAlign: 'center', margin: '0.5rem 0 1rem 0' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                        <Check size={32} color="var(--success)" />
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Credentials are ready for <strong>{formData.name}</strong>
                                    </p>
                                </div>

                                <div>
                                    <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Magic Link</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input 
                                            type="text" 
                                            readOnly 
                                            className="form-input" 
                                            value={result?.magicLink} 
                                            style={{ background: 'var(--background)', color: 'var(--text-secondary)' }} 
                                        />
                                        <button 
                                            onClick={() => copyToClipboard(result?.magicLink || '', 'link')}
                                            className="btn btn-secondary"
                                            style={{ padding: '0 1rem' }}
                                        >
                                            {copied === 'link' ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Code</label>
                                        <div style={{
                                            background: 'var(--surface-hover)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flex: 1,
                                            padding: '1.5rem'
                                        }}>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--brand)', marginBottom: '0.75rem' }}>
                                                {result?.code}
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(result?.code || '', 'code')}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                {copied === 'code' ? <Check size={14} style={{ marginRight: 4 }} /> : <Copy size={14} style={{ marginRight: 4 }} />}
                                                {copied === 'code' ? 'Copied' : 'Copy Code'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QR Code</label>
                                        <div style={{
                                            background: 'var(--surface-hover)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flex: 1,
                                            padding: '0.5rem'
                                        }}>
                                            <img src={result?.qrCodeDataUrl} alt="QR Code" style={{ width: '120px', height: '120px', borderRadius: '4px', mixBlendMode: 'multiply' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-footer" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0, display: 'flex', gap: '0.75rem', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                <button 
                                    onClick={shareViaWhatsApp}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
                                >
                                    <Smartphone size={18} style={{ marginRight: 6 }} /> WhatsApp
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    disabled
                                    style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
                                >
                                    <Mail size={18} style={{ marginRight: 6 }} /> Email Soon
                                </button>
                                <button onClick={onClose} className="btn btn-primary" style={{ flex: 1 }}>Done</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Portal>
    );
};

export default InviteUserModal;

