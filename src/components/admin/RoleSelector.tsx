"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Shield,
    ShieldAlert,
    User,
    UserCheck,
    ShoppingBag,
    Target,
    Wallet,
    TrendingUp,
    Receipt,
    Package,
    BarChart3,
    ChevronDown,
    Check
} from 'lucide-react';
import { UserRole } from '@/types';

export interface RoleConfig {
    id: UserRole;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
    administrator: {
        id: 'administrator' as UserRole,
        label: 'Administrator',
        description: 'Ultimate system-level access across all workspaces for maintenance.',
        icon: <ShieldAlert size={16} />,
        color: '#7C3AED',
        bgColor: '#F5F3FF'
    },
    finance_mgr: {
        id: 'finance_mgr' as UserRole,
        label: 'Finance Manager',
        description: 'High-level oversight of spend flow, budget management, and financial reporting.',
        icon: <TrendingUp size={16} />,
        color: '#2563EB',
        bgColor: '#EFF6FF'
    },
    proc_mgr: {
        id: 'proc_mgr' as UserRole,
        label: 'Procurement Manager',
        description: 'Strategic oversight of the procurement lifecycle, vendor relationships, and analytics.',
        icon: <Target size={16} />,
        color: '#9333EA',
        bgColor: '#F5F3FF'
    },
    proc_officer: {
        id: 'proc_officer' as UserRole,
        label: 'Procurement Officer',
        description: 'Core procurement user. Manages requisitions, POs, and vendor interactions.',
        icon: <ShoppingBag size={16} />,
        color: '#0891B2',
        bgColor: '#ECFEFF'
    },
    dept_head: {
        id: 'dept_head' as UserRole,
        label: 'Department Head',
        description: 'Budget owner. Authorized to approve departmental spend and monitor budgets.',
        icon: <UserCheck size={16} />,
        color: '#059669',
        bgColor: '#ECFDF5'
    },
    requester: {
        id: 'requester' as UserRole,
        label: 'Standard Requester',
        description: 'General employee role for creating and tracking personal requisitions.',
        icon: <User size={16} />,
        color: '#6B7280',
        bgColor: '#F3F4F6'
    },
    ap_officer: {
        id: 'ap_officer' as UserRole,
        label: 'AP Officer',
        description: 'Accounts Payable focus. Manages invoices, matching, and payment processing.',
        icon: <Receipt size={16} />,
        color: '#E11D48',
        bgColor: '#FFF1F2'
    },
    auditor: {
        id: 'auditor' as UserRole,
        label: 'Auditor',
        description: 'Read-only access to all transactions, audit trails, and compliance reports.',
        icon: <BarChart3 size={16} />,
        color: '#475569',
        bgColor: '#F8FAFC'
    },
    warehouse: {
        id: 'warehouse' as UserRole,
        label: 'Warehouse / Receiving',
        description: 'Manages physical receipt of goods, inventory tracking, and assets.',
        icon: <Package size={16} />,
        color: '#EA580C',
        bgColor: '#FFF7ED'
    },
    asset_mgr: {
        id: 'asset_mgr' as UserRole,
        label: 'Asset Manager',
        description: 'Specialized focus on fixed asset lifecycle and inventory audits.',
        icon: <Package size={16} />,
        color: '#D97706',
        bgColor: '#FFFBEB'
    },
    // Legacy Support
    WORKSPACE_ADMIN: {
        id: 'WORKSPACE_ADMIN' as UserRole,
        label: 'Workspace Admin',
        description: 'Legacy admin role with full organization visibility.',
        icon: <Shield size={16} />,
        color: '#4F46E5',
        bgColor: '#EEF2FF'
    },
    STANDARD_REQUESTER: {
        id: 'STANDARD_REQUESTER' as UserRole,
        label: 'Legacy Requester',
        description: 'Legacy standard requester (deprecated).',
        icon: <User size={16} />,
        color: '#6B7280',
        bgColor: '#F3F4F6'
    }
};

interface RoleSelectorProps {
    value: UserRole;
    onChange: (value: UserRole) => void;
    label?: string;
    variant?: 'compact' | 'full';
    disabled?: boolean;
}

export default function RoleSelector({ value, onChange, label, variant = 'full', disabled = false }: RoleSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const currentConfig = ROLE_CONFIGS[value] || ROLE_CONFIGS['requester'] || ROLE_CONFIGS['STANDARD_REQUESTER'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => !disabled && setIsOpen(!isOpen);

    if (variant === 'compact') {
        return (
            <div ref={containerRef} style={{ position: 'relative' }}>
                <button
                    onClick={toggleOpen}
                    disabled={disabled}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        background: currentConfig.bgColor,
                        color: currentConfig.color,
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        width: 'fit-content',
                        minWidth: '160px'
                    }}
                >
                    <span style={{ display: 'flex' }}>{currentConfig.icon}</span>
                    <span style={{ color: currentConfig.color }}>{currentConfig.id}</span>
                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </button>

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '0.5rem',
                        width: '280px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #E5E7EB',
                        zIndex: 1000,
                        maxHeight: '400px',
                        overflowY: 'auto',
                        padding: '0.5rem'
                    }}>
                        {Object.values(ROLE_CONFIGS)
                            .filter((config: any) => !['STANDARD_REQUESTER', 'WORKSPACE_ADMIN'].includes(config.id))
                            .map((config: any) => (
                            <button
                                key={config.id}
                                onClick={() => { onChange(config.id); setIsOpen(false); }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: config.id === value ? '#F9FAFB' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.125rem' }}>
                                    <div style={{ color: config.color }}>{config.icon}</div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111827' }}>{config.label}</span>
                                    {config.id === value && <Check size={14} style={{ marginLeft: 'auto', color: '#4F46E5' }} />}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280', paddingLeft: '2rem' }}>{config.description}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {label && <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{label}</label>}

            <button
                type="button"
                onClick={toggleOpen}
                disabled={disabled}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    background: '#FFFFFF',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    width: '100%',
                    position: 'relative'
                }}
            >
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: currentConfig.bgColor,
                    color: currentConfig.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    {currentConfig.icon}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827' }}>{currentConfig.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{currentConfig.id}</div>
                </div>
                <ChevronDown size={18} color="#9CA3AF" />
            </button>

            {isOpen && (
                <div style={{
                    marginTop: '0.25rem',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #E5E7EB',
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '0.5rem'
                }}>
                    <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        System Role Selection
                    </div>
                    {Object.values(ROLE_CONFIGS)
                        .filter((config: any) => !['STANDARD_REQUESTER', 'WORKSPACE_ADMIN'].includes(config.id))
                        .map((config: any) => (
                        <button
                            key={config.id}
                            type="button"
                            onClick={() => { onChange(config.id); setIsOpen(false); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: config.id === value ? '#EEF2FF' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: config.bgColor,
                                color: config.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {config.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: config.id === value ? '#4F46E5' : '#111827' }}>{config.label}</div>
                                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6B7280', lineHeight: 1.4 }}>{config.description}</p>
                            </div>
                            {config.id === value && (
                                <div style={{ background: '#4F46E5', color: 'white', border: '1.5px solid #4F46E5', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={12} strokeWidth={4} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
