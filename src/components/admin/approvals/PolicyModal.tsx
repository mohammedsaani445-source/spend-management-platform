"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ApprovalPolicy, ApprovalPolicyModule, ApprovalPolicyStep, Department } from '@/types';
import { StepBuilder } from './StepBuilder';
import { FlowVisualizer } from './FlowVisualizer';
import { CURRENCIES } from '@/lib/currencies';
import { CurrencySelector } from './CurrencySelector';
import CustomSelect from '@/components/ui/CustomSelect';

/* ═══════════════════════════════════════════════════════════════
   POLICY MODAL — Industry-grade, single-column form
   ═══════════════════════════════════════════════════════════════ */

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policy: Partial<ApprovalPolicy>) => Promise<void>;
    policy?: ApprovalPolicy;
    departments: Department[];
}

const MODULES: { value: ApprovalPolicyModule; label: string }[] = [
    { value: 'requisitions', label: 'Requisitions' },
    { value: 'purchase_orders', label: 'Purchase Orders' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'vendors', label: 'Vendors' },
    { value: 'tenders', label: 'Tenders' },
    { value: 'budgets', label: 'Budgets' },
    { value: 'expenses', label: 'Expenses' },
];

const DEPARTMENT_OPTIONS = [
    'All Departments', 'Finance', 'Procurement', 'IT', 'HR', 'Operations', 'Legal', 'Facilities'
];

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, onSave, policy, departments }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState<Partial<ApprovalPolicy>>({
        name: '',
        description: '',
        module: 'requisitions',
        departmentScope: 'All Departments',
        minAmount: 0,
        maxAmount: 999999999,
        autoApprove: false,
        autoApproveLimit: 0,
        currency: 'GHS',
        steps: [],
        isActive: true,
        priority: 50,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (policy) {
            setFormData({
                ...policy,
                departmentScope: policy.departmentScope || 'All Departments',
                minAmount: policy.minAmount || 0,
                maxAmount: policy.maxAmount || 999999999,
                autoApprove: policy.autoApprove || (policy.autoApproveLimit > 0),
            });
        } else if (isOpen) {
            setFormData({
                name: '', description: '', module: 'requisitions',
                departmentScope: 'All Departments', minAmount: 0, maxAmount: 999999999,
                autoApprove: false, autoApproveLimit: 0, currency: 'GHS',
                steps: [], isActive: true, priority: 50,
            });
        }
    }, [policy, isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    const isEdit = !!policy;
    const canSave = (formData.name || '').trim().length > 0;

    const handleSubmit = async () => {
        if (!canSave) return;
        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch {
            // Error handled by parent
        } finally {
            setIsSaving(false);
        }
    };

    return createPortal(
        <div
            ref={overlayRef}
            onClick={e => { if (e.target === overlayRef.current) onClose(); }}
            style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(15,23,42,0.45)',
                backdropFilter: 'blur(4px)',
                animation: 'modalFadeIn 0.2s ease',
            }}
        >
            <style>{`
                @keyframes modalFadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes modalSlideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
            `}</style>

            <div style={{
                backgroundColor: '#FFFFFF',
                width: '100%',
                maxWidth: '620px',
                maxHeight: '92vh',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                margin: '16px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                animation: 'modalSlideUp 0.25s ease',
                position: 'relative',
                zIndex: 11000,
            }}>
                {/* ─── Header ─── */}
                <div style={{
                    padding: '20px 24px 16px',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #E8441A, #DC2626)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <path d="M9 15l2 2 4-4" />
                            </svg>
                        </div>
                        <h2 style={{
                            fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0,
                            letterSpacing: '-0.01em',
                        }}>
                            {isEdit ? 'Edit Approval Policy' : 'Create Approval Policy'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px', height: '32px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            backgroundColor: '#F8FAFC',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#64748B',
                            transition: 'background-color 0.15s',
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* ─── Body ─── */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '24px',
                    display: 'flex', flexDirection: 'column', gap: '18px',
                }}>
                    {/* Field 1: Policy Name */}
                    <FieldGroup label="Policy Name" icon={fieldIcons.tag}>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. High-Value PO Approval"
                            style={inputStyle}
                            autoFocus
                        />
                    </FieldGroup>

                    {/* Field 2: Description */}
                    <FieldGroup label="Description" icon={fieldIcons.info}>
                        <input
                            type="text"
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of when this policy applies"
                            style={inputStyle}
                        />
                    </FieldGroup>

                    {/* Field 3: Applies To */}
                    <CustomSelect
                        label="Applies To"
                        options={MODULES}
                        value={formData.module || 'requisitions'}
                        onChange={val => setFormData({ ...formData, module: val as ApprovalPolicyModule })}
                    />

                    {/* Field 4: Department Scope */}
                    <CustomSelect
                        label="Department Scope"
                        options={DEPARTMENT_OPTIONS.map(d => ({ label: d, value: d }))}
                        value={formData.departmentScope || 'All Departments'}
                        onChange={val => setFormData({ ...formData, departmentScope: val })}
                    />

                    {/* Field 4.5: Currency */}
                    <CurrencySelector
                        label="Currency"
                        value={formData.currency || 'GHS'}
                        onChange={val => setFormData({ ...formData, currency: val })}
                    />

                    {/* Fields 5+6: Min/Max Amount */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <FieldGroup label="Min Amount" icon={fieldIcons.arrowDown} style={{ flex: 1 }}>
                            <div style={{ position: 'relative' }}>
                                <span style={currencyPrefix}>{formData.currency || 'GHS'}</span>
                                <input
                                    type="number"
                                    value={formData.minAmount || 0}
                                    onChange={e => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                                    style={{ ...inputStyle, paddingLeft: '42px' }}
                                />
                            </div>
                            <span style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'var(--font-dm-mono), monospace' }}>
                                0 = no minimum
                            </span>
                        </FieldGroup>
                        <FieldGroup label="Max Amount" icon={fieldIcons.arrowUp} style={{ flex: 1 }}>
                            <div style={{ position: 'relative' }}>
                                <span style={currencyPrefix}>{formData.currency || 'GHS'}</span>
                                <input
                                    type="number"
                                    value={formData.maxAmount === 999999999 ? '' : (formData.maxAmount || '')}
                                    onChange={e => setFormData({ ...formData, maxAmount: e.target.value ? Number(e.target.value) : 999999999 })}
                                    placeholder="No limit"
                                    style={{ ...inputStyle, paddingLeft: '42px' }}
                                />
                            </div>
                        </FieldGroup>
                    </div>

                    {/* Auto-Approve Toggle Block */}
                    <div style={{
                        background: formData.autoApprove
                            ? 'linear-gradient(135deg, rgba(5,150,105,0.06), rgba(5,150,105,0.02))'
                            : '#FAFAF8',
                        border: formData.autoApprove
                            ? '1px solid rgba(5,150,105,0.2)'
                            : '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        transition: 'all 0.2s',
                    }}>
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            cursor: 'pointer', marginBottom: formData.autoApprove ? '10px' : '0',
                        }}>
                            <div style={{
                                width: '38px', height: '22px', borderRadius: '11px',
                                backgroundColor: formData.autoApprove ? '#059669' : '#CBD5E1',
                                position: 'relative', transition: 'background-color 0.2s',
                                cursor: 'pointer', flexShrink: 0,
                            }}
                                onClick={() => setFormData({
                                    ...formData,
                                    autoApprove: !formData.autoApprove,
                                    autoApproveLimit: !formData.autoApprove ? (formData.autoApproveLimit || 1000) : 0,
                                })}
                            >
                                <div style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    backgroundColor: 'white', position: 'absolute',
                                    top: '3px', left: formData.autoApprove ? '19px' : '3px',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                }} />
                            </div>
                            <div>
                                <span style={{
                                    fontSize: '13px', fontWeight: 700,
                                    color: formData.autoApprove ? '#059669' : '#475569',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill={formData.autoApprove ? '#059669' : '#94A3B8'} stroke="none">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                    Enable Auto-Approval
                                </span>
                                <p style={{
                                    fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 0',
                                    lineHeight: 1.3,
                                }}>
                                    Skip approvers if 3-way match passes under threshold
                                </p>
                            </div>
                        </label>

                        {formData.autoApprove && (
                            <div style={{ marginTop: '4px' }}>
                                <FieldGroup label="Auto-Approve Limit (GHS)" icon={fieldIcons.shield}>
                                    <input
                                        type="number"
                                        value={formData.autoApproveLimit || 0}
                                        onChange={e => setFormData({ ...formData, autoApproveLimit: Number(e.target.value) })}
                                        style={inputStyle}
                                    />
                                </FieldGroup>
                            </div>
                        )}
                    </div>

                    {/* Live Flow Preview */}
                    {(formData.steps || []).length > 0 && (
                        <div style={{
                            backgroundColor: '#FAFAF8',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '14px 16px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '11px', fontWeight: 600, color: '#64748B',
                                textTransform: 'uppercase' as const, marginBottom: '8px',
                                letterSpacing: '0.06em',
                                fontFamily: 'var(--font-dm-sans), sans-serif',
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="#64748B" stroke="none" />
                                </svg>
                                Live Flow Preview
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <FlowVisualizer
                                    steps={formData.steps || []}
                                    autoApproveLimit={formData.autoApproveLimit || 0}
                                    autoApprove={formData.autoApprove}
                                    currency={formData.currency || 'GHS'}
                                    compact={true}
                                    module={formData.module}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step Builder */}
                    <StepBuilder
                        steps={formData.steps || []}
                        onChange={steps => setFormData({ ...formData, steps })}
                    />
                </div>

                {/* ─── Footer ─── */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    backgroundColor: '#FAFAF8',
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#64748B',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'var(--font-dm-sans), sans-serif',
                            transition: 'background-color 0.15s',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSave || isSaving}
                        style={{
                            padding: '10px 22px',
                            border: 'none',
                            borderRadius: '8px',
                            background: canSave ? 'linear-gradient(135deg, #E8441A, #DC2626)' : '#CBD5E1',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: canSave ? 'pointer' : 'default',
                            opacity: isSaving ? 0.7 : 1,
                            fontFamily: 'var(--font-dm-sans), sans-serif',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            boxShadow: canSave ? '0 2px 8px rgba(232,68,26,0.25)' : 'none',
                            transition: 'opacity 0.15s, box-shadow 0.15s',
                        }}
                    >
                        {isSaving && (
                            <svg width="14" height="14" viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
                                <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
                                <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        )}
                        {isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Policy')}
                    </button>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>,
        document.body
    );
};

/* ═══════════════════════════════════════════════════════════════
   FIELD GROUP SUB-COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const FieldGroup: React.FC<{
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    style?: React.CSSProperties;
}> = ({ label, icon, children, style }) => (
    <div style={style}>
        <label style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', fontWeight: 600, color: '#64748B',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.06em',
            marginBottom: '6px',
            fontFamily: 'var(--font-dm-sans), sans-serif',
        }}>
            {icon}
            {label}
        </label>
        {children}
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   FIELD ICONS — 10×10 SVGs for form labels
   ═══════════════════════════════════════════════════════════════ */
const iconProps = { width: 11, height: 11, viewBox: "0 0 24 24", fill: "none", stroke: "#94A3B8", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const fieldIcons = {
    tag: <svg {...iconProps}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
    info: <svg {...iconProps}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>,
    layers: <svg {...iconProps}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
    building: <svg {...iconProps}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>,
    arrowDown: <svg {...iconProps}><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>,
    arrowUp: <svg {...iconProps}><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>,
    shield: <svg {...iconProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
};

/* ═══════════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════════ */
const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1E293B',
    backgroundColor: '#FAFAF8',
    outline: 'none',
    fontFamily: 'var(--font-dm-sans), sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
};

const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px',
};

const currencyPrefix: React.CSSProperties = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '11px',
    color: '#94A3B8',
    fontWeight: 600,
    fontFamily: 'var(--font-dm-mono), monospace',
};
