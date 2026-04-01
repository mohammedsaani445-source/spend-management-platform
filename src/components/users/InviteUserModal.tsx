"use client";

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, UserPlus, Lock, Smartphone, Mail, ArrowRight, ChevronDown, Shield, Zap, QrCode } from 'lucide-react';
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
        const toastId = toast.loading("Synthesizing user identity records...");
        setLoading(true);

        try {
            console.log("[Invite Flow] Initiating identity generation...");
            const idToken = await auth.currentUser?.getIdToken();
            if (!idToken) throw new Error("Authentication token missing. Please re-login.");

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
            
            if (!res.ok) {
                console.error("[Invite Flow] Server rejected request:", data);
                const errorMessage = data.error || "Provisioning failed";
                const detailedError = data.debug ? ` (${data.debug.rawRole})` : "";
                toast.error(`${errorMessage}${detailedError}`, { id: toastId, duration: 5000 });
                throw new Error(errorMessage);
            }

            console.log("[Invite Flow] Success: Token generated");
            const magicLink = `${window.location.origin}/join/${data.token}`;
            const qrCodeDataUrl = await QRCode.toDataURL(magicLink, {
                width: 512,
                margin: 2,
                color: {
                    dark: '#E8572A', 
                    light: '#FFFFFF',
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
            toast.success("Security handshake complete. Identity flow active.", { id: toastId });
        } catch (error: any) {
            console.error("[Invite Flow] Critical catch:", error);
            // Error already handled by toast above if it was a fetch error, 
            // but this catches network errors too.
            if (!toast.hasOwnProperty('id')) {
                toast.error(error.message || "Network error. Please check connection.", { id: toastId });
            }
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, type: 'link' | 'code') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
        toast.success(`Copied ${type === 'link' ? 'Magic Link' : 'Access Code'}`);
    };

    const shareViaWhatsApp = () => {
        const text = `Hi ${formData.name}, you've been invited to join the platform as a ${ROLE_CONFIGS[formData.role]?.label}.\n\nAccess Link: ${result?.magicLink}\nAccess Code: ${result?.code}\n\nNote: Link expires in ${formData.expiresInHours} hours.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="modal-backdrop" style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)' }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    style={{ 
                        maxWidth: 580, 
                        width: "95%", 
                        background: 'var(--surface)', 
                        borderRadius: '24px', 
                        boxShadow: 'var(--shadow-xl)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    {/* Header Strip */}
                    <div style={{ 
                        padding: "1.5rem 2rem", 
                        borderBottom: "1px solid var(--border)", 
                        background: "var(--surface-2)", 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                    }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand)', marginBottom: '4px' }}>
                                Account Provisioning
                            </div>
                            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                {step === 1 ? 'Generate New Invite' : 'Identity Record Active'}
                            </h2>
                        </div>
                        <button 
                            onClick={onClose} 
                            style={{ 
                                width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface)', 
                                border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'flex', 
                                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' 
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ 
                                padding: '2rem', 
                                display: 'grid', 
                                gap: '1.5rem',
                                maxHeight: 'calc(90vh - 160px)',
                                overflowY: 'auto',
                                scrollbarWidth: 'none', // hide for cleaner look
                                msOverflowStyle: 'none'
                             }}>
                                <div>
                                    <label style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'block' }}>
                                        Staff Member Full Name
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Samuel Adewale"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-2)', outline: 'none', fontSize: '0.875rem', fontWeight: 600 }}
                                        onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'block' }}>
                                        Corporate Email Address
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
                                        <input 
                                            type="email" 
                                            required 
                                            placeholder="s.adewale@company.com"
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-2)', outline: 'none', fontSize: '0.875rem', fontWeight: 600 }}
                                            onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'block' }}>
                                            Strategic Role
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
                                        <label style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'block' }}>
                                            Department
                                        </label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="e.g. Operations"
                                            value={formData.department}
                                            onChange={e => setFormData({...formData, department: e.target.value})}
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-2)', outline: 'none', fontSize: '0.875rem', fontWeight: 600 }}
                                            onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'block' }}>
                                        Invite Expiration Period (Hours)
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Zap size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
                                        <select 
                                            value={formData.expiresInHours}
                                            onChange={e => setFormData({...formData, expiresInHours: parseInt(e.target.value)})}
                                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-2)', outline: 'none', fontSize: '0.875rem', fontWeight: 600, appearance: 'none', cursor: 'pointer' }}
                                        >
                                            <option value={24}>24 Hours (1 Day)</option>
                                            <option value={48}>48 Hours (2 Days)</option>
                                            <option value={72}>72 Hours (3 Days)</option>
                                            <option value={168}>168 Hours (7 Days)</option>
                                        </select>
                                        <ChevronDown size={14} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)', pointerEvents: 'none' }} />
                                    </div>
                                </div>

                                <div style={{
                                    padding: '1.25rem',
                                    background: 'var(--brand-soft)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(232, 87, 42, 0.1)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                }}>
                                    <Lock size={20} color="var(--brand)" style={{ marginTop: '0.125rem' }} />
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--brand-dark)', lineHeight: 1.6, fontWeight: 500 }}>
                                        Encryption protocols active. A unique magic join link and one-time access code will be generated for direct sharing with the staff member.
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid var(--border)", background: "var(--surface-2)", display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer' }}>Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    style={{ 
                                        padding: '0.75rem 2rem', borderRadius: '12px', border: 'none', 
                                        background: 'var(--brand)', color: 'white', fontWeight: 900, 
                                        fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', 
                                        alignItems: 'center', gap: '8px', boxShadow: '0 8px 16px rgba(232, 87, 42, 0.2)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 20px rgba(232, 87, 42, 0.3)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(232, 87, 42, 0.2)'; }}
                                >
                                    {loading ? 'Processing...' : <>Generate Identity Flow <ArrowRight size={16} /></>}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ padding: '2rem', display: 'grid', gap: '2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid rgba(0, 171, 85, 0.2)' }}>
                                    <Check size={32} color="var(--success)" />
                                </div>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Invite Distributed</h3>
                                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    Staff record for <strong>{formData.name}</strong> is now live.
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-disabled)', marginBottom: '0.5rem', display: 'block' }}>Magic Activation Link</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input 
                                                type="text" 
                                                readOnly 
                                                value={result?.magicLink} 
                                                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-2)', outline: 'none', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }} 
                                            />
                                            <button 
                                                onClick={() => copyToClipboard(result?.magicLink || '', 'link')}
                                                style={{ width: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', color: 'var(--text-primary)' }}
                                            >
                                                {copied === 'link' ? <Check size={18} color="var(--success)" /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-disabled)', marginBottom: '0.5rem', display: 'block' }}>Secure Access Code</label>
                                        <div style={{
                                            background: 'var(--surface-2)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--brand)', marginBottom: '1rem', textShadow: '0 4px 12px rgba(232, 87, 42, 0.1)' }}>
                                                {result?.code}
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(result?.code || '', 'code')}
                                                style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(232, 87, 42, 0.2)', background: 'var(--brand-soft)', color: 'var(--brand)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                                            >
                                                {copied === 'code' ? <Check size={14} /> : <Zap size={14} />}
                                                {copied === 'code' ? 'COPIED' : 'COPY CODE'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-disabled)', marginBottom: '0.5rem', display: 'block' }}>Instant QR Entry</label>
                                    <div style={{
                                        background: 'white',
                                        border: '1px solid var(--border)',
                                        borderRadius: '16px',
                                        padding: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flex: 1,
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        <img src={result?.qrCodeDataUrl} alt="QR Code" style={{ width: '100%', height: 'auto', maxWidth: '140px', borderRadius: '8px' }} />
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={shareViaWhatsApp}
                                    style={{ flex: 1, height: '48px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#e7f9ee'}
                                >
                                    <Smartphone size={18} style={{ color: '#25D366' }} /> WhatsApp
                                </button>
                                <button onClick={onClose} style={{ flex: 1, height: '48px', borderRadius: '14px', border: 'none', background: 'var(--text-primary)', color: 'white', fontWeight: 900, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    Complete Flow <Check size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </Portal>
    );
};

export default InviteUserModal;
