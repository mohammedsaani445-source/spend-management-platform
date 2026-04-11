"use client";

import React from 'react';
import { ApprovalPolicyStep, UserRole } from '@/types';

/* ═══════════════════════════════════════════════════════════════
   ROLE DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */
const ROLES: { value: UserRole; label: string; icon: React.ReactNode }[] = [
    { value: 'dept_head',     label: 'Department Head',      icon: <RoleIcon d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M2 7h20v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" /> },
    { value: 'proc_officer',  label: 'Procurement Officer',  icon: <RoleIcon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 3h6v4H9V3zM12 12v4M10 14h4" /> },
    { value: 'proc_mgr',     label: 'Procurement Manager',  icon: <RoleIcon d="M12 2v3M12 19v3M2 12h3M19 12h3M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0" /> },
    { value: 'finance_mgr',  label: 'Finance Manager',      icon: <RoleIcon d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
    { value: 'ap_officer',   label: 'AP Officer',           icon: <RoleIcon d="M2 4h20v16H2V4zM7 8h10M7 12h4M7 16h6" /> },
    { value: 'auditor',      label: 'Auditor',              icon: <RoleIcon d="M11 11m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0M21 21l-4.35-4.35" /> },
    { value: 'administrator',label: 'CFO / Executive',      icon: <RoleIcon d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12" /> },
    { value: 'warehouse',    label: 'Warehouse Manager',    icon: <RoleIcon d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /> },
    { value: 'asset_mgr',    label: 'Asset Manager',        icon: <RoleIcon d="M2 6h20v12H2V6zM12 12h.01M17 12h.01M7 12h.01" /> },
    { value: 'requester',    label: 'Requester',            icon: <RoleIcon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0" /> },
];

function RoleIcon({ d }: { d: string }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
        </svg>
    );
}

const ROLE_COLORS: Record<string, string> = {
    dept_head: '#0891B2', proc_officer: '#0891B2', proc_mgr: '#7C3AED',
    finance_mgr: '#2563EB', ap_officer: '#D97706', auditor: '#059669',
    administrator: '#E11D48', warehouse: '#0891B2', asset_mgr: '#2563EB',
    requester: '#64748B',
};

/* ═══════════════════════════════════════════════════════════════
   STEP BUILDER COMPONENT
   ═══════════════════════════════════════════════════════════════ */
interface StepBuilderProps {
    steps: ApprovalPolicyStep[];
    onChange: (steps: ApprovalPolicyStep[]) => void;
}

export const StepBuilder: React.FC<StepBuilderProps> = ({ steps, onChange }) => {
    const addStep = () => {
        const newStep: ApprovalPolicyStep = {
            id: Math.random().toString(36).substring(2, 9),
            name: `Step ${steps.length + 1}`,
            role: 'proc_mgr',
            threshold: 0,
            sla_hours: 48,
            isParallel: false,
            isRequired: true,
        };
        onChange([...steps, newStep]);
    };

    const removeStep = (id: string) => onChange(steps.filter(s => s.id !== id));

    const updateStep = (id: string, updates: Partial<ApprovalPolicyStep>) => {
        onChange(steps.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const moveStep = (index: number, direction: 'up' | 'down') => {
        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSteps.length) return;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        onChange(newSteps);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Section Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '2px',
            }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span style={{
                    fontSize: '11px', fontWeight: 700, color: '#64748B',
                    textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                }}>
                    Approval Chain
                </span>
                <span style={{
                    fontSize: '11px', color: '#94A3B8', fontWeight: 500,
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-dm-mono), monospace',
                }}>
                    {steps.length} step{steps.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Empty State */}
            {steps.length === 0 && (
                <div style={{
                    border: '1.5px dashed #CBD5E1',
                    borderRadius: '10px',
                    padding: '28px',
                    textAlign: 'center' as const,
                    color: '#94A3B8',
                    fontSize: '13px',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    Add at least one approver to define the chain
                </div>
            )}

            {/* Step Rows */}
            {steps.map((step, index) => {
                const roleColor = ROLE_COLORS[step.role] || '#64748B';

                return (
                    <div key={step.id} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '14px 16px',
                        backgroundColor: '#FAFAF8',
                        borderRadius: '10px',
                        border: step.isParallel ? `1.5px solid rgba(124,58,237,0.25)` : '1px solid #ECEAE5',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}>
                        {/* Step Number Circle */}
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}CC)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '11px', fontWeight: 700,
                            flexShrink: 0, marginTop: '4px',
                            fontFamily: 'var(--font-dm-mono), monospace',
                            boxShadow: `0 2px 6px ${roleColor}30`,
                        }}>
                            {index + 1}
                        </div>

                        {/* Fields */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Role + SLA row */}
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                                <div style={{ flex: '1 1 200px' }}>
                                    <label style={labelStyle}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Role
                                    </label>
                                    <select
                                        value={step.role}
                                        onChange={e => updateStep(step.id, { role: e.target.value as UserRole })}
                                        style={selectStyle}
                                    >
                                        {ROLES.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: '0 0 110px' }}>
                                    <label style={labelStyle}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
                                            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                                        </svg>
                                        SLA (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={step.sla_hours ? Math.ceil(step.sla_hours / 24) : 1}
                                        onChange={e => updateStep(step.id, { sla_hours: Number(e.target.value) * 24 })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' as const }}>
                                <label style={checkboxLabelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={step.isParallel || false}
                                        onChange={e => updateStep(step.id, { isParallel: e.target.checked })}
                                        style={{ accentColor: '#7C3AED', width: '14px', height: '14px' }}
                                    />
                                    Parallel execution
                                </label>
                                <label style={checkboxLabelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={step.isRequired !== false}
                                        onChange={e => updateStep(step.id, { isRequired: e.target.checked })}
                                        style={{ accentColor: '#E11D48', width: '14px', height: '14px' }}
                                    />
                                    Required
                                </label>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flexShrink: 0, marginTop: '2px' }}>
                            <ActionBtn
                                onClick={() => moveStep(index, 'up')}
                                disabled={index === 0}
                                icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 15l-6-6-6 6" /></svg>}
                            />
                            <ActionBtn
                                onClick={() => moveStep(index, 'down')}
                                disabled={index === steps.length - 1}
                                icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>}
                            />
                            <ActionBtn
                                onClick={() => removeStep(step.id)}
                                variant="danger"
                                icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>}
                            />
                        </div>
                    </div>
                );
            })}

            {/* Add Step Button */}
            <button
                type="button"
                onClick={addStep}
                style={{
                    width: '100%',
                    padding: '14px',
                    border: '1.5px dashed rgba(232, 68, 26, 0.35)',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(232, 68, 26, 0.04)',
                    color: '#E8441A',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center' as const,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'background-color 0.15s, border-color 0.15s',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8441A" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Approval Step
            </button>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   ACTION BUTTON SUB-COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const ActionBtn: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    icon: React.ReactNode;
    variant?: 'default' | 'danger';
}> = ({ onClick, disabled, icon, variant = 'default' }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
            width: '26px', height: '26px', borderRadius: '6px',
            border: variant === 'danger' ? 'none' : '1px solid #E2E8F0',
            backgroundColor: variant === 'danger' ? '#FEF2F2' : 'white',
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.3 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: variant === 'danger' ? '#DC2626' : '#64748B',
            transition: 'opacity 0.15s, background-color 0.15s',
            padding: 0,
        }}
    >
        {icon}
    </button>
);

/* ═══════════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════════ */
const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: 600,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '5px',
    fontFamily: 'var(--font-dm-sans), sans-serif',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1E293B',
    backgroundColor: 'white',
    outline: 'none',
    fontFamily: 'var(--font-dm-sans), sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
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

const checkboxLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#475569',
    cursor: 'pointer',
    fontFamily: 'var(--font-dm-sans), sans-serif',
};
