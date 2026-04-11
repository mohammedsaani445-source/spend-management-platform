"use client";

import React from 'react';
import { ApprovalPolicyStep, ApprovalPolicyModule } from '@/types';

/* ═══════════════════════════════════════════════════════════════
   SVG ICON LIBRARY — crisp, consistent 16×16 stroke icons
   ═══════════════════════════════════════════════════════════════ */

const Icons = {
    // Module icons
    requisition: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    purchaseOrder: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    invoice: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M7 8h10" /><path d="M7 12h4" /><path d="M7 16h6" />
            <circle cx="17" cy="14" r="2" />
        </svg>
    ),
    contract: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    ),
    vendor: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    tender: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 14l2 2 4-4" />
        </svg>
    ),

    // Role icons
    deptHead: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    ),
    procOfficer: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M12 12v4" /><path d="M10 14h4" />
        </svg>
    ),
    procMgr: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3" /><path d="M12 19v3" /><path d="M2 12h3" /><path d="M19 12h3" />
        </svg>
    ),
    financeMgr: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
    apOfficer: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M7 8h10" /><path d="M7 12h4" /><path d="M7 16h6" />
        </svg>
    ),
    auditor: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    executive: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" />
            <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
        </svg>
    ),
    warehouse: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
    ),
    assetMgr: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M12 12h.01" /><path d="M17 12h.01" /><path d="M7 12h.01" />
        </svg>
    ),
    user: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),

    // Utility icons
    lightning: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke="none">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    checkmark: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
};

/* ═══════════════════════════════════════════════════════════════
   MODULE CONFIG
   ═══════════════════════════════════════════════════════════════ */
const MODULE_CONFIG: Record<string, { color: string; icon: (c: string) => React.ReactNode; label: string }> = {
    requisitions:    { color: '#0891B2', icon: Icons.requisition,   label: 'Requisitions' },
    purchase_orders: { color: '#7C3AED', icon: Icons.purchaseOrder, label: 'Purchase Orders' },
    invoices:        { color: '#059669', icon: Icons.invoice,       label: 'Invoices' },
    contracts:       { color: '#2563EB', icon: Icons.contract,      label: 'Contracts' },
    vendors:         { color: '#D97706', icon: Icons.vendor,        label: 'Vendors' },
    tenders:         { color: '#E11D48', icon: Icons.tender,        label: 'Tenders' },
};

/* ═══════════════════════════════════════════════════════════════
   ROLE CONFIG
   ═══════════════════════════════════════════════════════════════ */
const ROLE_CONFIG: Record<string, { color: string; icon: (c: string) => React.ReactNode; label: string }> = {
    dept_head:    { color: '#0891B2', icon: Icons.deptHead,    label: 'Dept Head' },
    proc_officer: { color: '#0891B2', icon: Icons.procOfficer, label: 'Proc Officer' },
    proc_mgr:     { color: '#7C3AED', icon: Icons.procMgr,    label: 'Proc Manager' },
    finance_mgr:  { color: '#2563EB', icon: Icons.financeMgr, label: 'Finance Mgr' },
    ap_officer:   { color: '#D97706', icon: Icons.apOfficer,  label: 'AP Officer' },
    auditor:      { color: '#059669', icon: Icons.auditor,     label: 'Auditor' },
    administrator:{ color: '#E11D48', icon: Icons.executive,   label: 'CFO / Admin' },
    warehouse:    { color: '#0891B2', icon: Icons.warehouse,   label: 'Warehouse' },
    asset_mgr:    { color: '#2563EB', icon: Icons.assetMgr,    label: 'Asset Mgr' },
    requester:    { color: '#64748B', icon: Icons.user,        label: 'Requester' },
};

/* ═══════════════════════════════════════════════════════════════
   FLOW VISUALIZER COMPONENT
   ═══════════════════════════════════════════════════════════════ */
interface FlowVisualizerProps {
    steps: ApprovalPolicyStep[];
    autoApproveLimit: number;
    autoApprove?: boolean;
    currency: string;
    compact?: boolean;
    module?: ApprovalPolicyModule;
}

export const FlowVisualizer: React.FC<FlowVisualizerProps> = ({
    steps,
    autoApproveLimit,
    autoApprove,
    currency,
    compact = false,
    module = 'requisitions',
}) => {
    const modConf = MODULE_CONFIG[module] || MODULE_CONFIG.requisitions;
    const hasAutoApprove = autoApprove || autoApproveLimit > 0;

    if (steps.length === 0 && !hasAutoApprove) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px', color: '#94A3B8', fontSize: '12px',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                letterSpacing: '0.01em',
            }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
                No approval steps defined
            </div>
        );
    }

    const nodeSize = compact ? 38 : 44;
    const triggerSize = compact ? 36 : 42;
    const connectorWidth = compact ? 36 : 52;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            overflowX: 'auto',
            padding: compact ? '8px 4px' : '14px 8px',
            gap: '0',
            minHeight: compact ? '66px' : '90px',
            scrollbarWidth: 'thin' as any,
        }}>
            {/* ─── Trigger Node ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                    width: `${triggerSize}px`,
                    height: `${triggerSize}px`,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${modConf.color}18, ${modConf.color}08)`,
                    border: `1.5px solid ${modConf.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 2px 8px ${modConf.color}12`,
                    transition: 'transform 0.2s',
                }}>
                    {modConf.icon(modConf.color)}
                </div>
                {!compact && (
                    <span style={{
                        fontSize: '9px',
                        color: '#94A3B8',
                        marginTop: '5px',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        fontFamily: 'var(--font-dm-mono), monospace',
                    }}>
                        Trigger
                    </span>
                )}
            </div>

            {/* ─── Auto-Approve Branch ─── */}
            {hasAutoApprove && (
                <>
                    <Connector width={connectorWidth} color={modConf.color} label="auto" />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                            width: `${nodeSize}px`,
                            height: `${nodeSize}px`,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                            border: '1.5px solid rgba(5,150,105,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(5,150,105,0.08)',
                        }}>
                            {Icons.lightning('#059669')}
                        </div>
                        {!compact && (
                            <>
                                <span style={{ fontSize: '9px', color: '#059669', marginTop: '5px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'var(--font-dm-mono), monospace' }}>
                                    Auto
                                </span>
                                <span style={{ fontSize: '9px', color: '#94A3B8', fontFamily: 'var(--font-dm-mono), monospace' }}>
                                    ≤ {currency} {autoApproveLimit.toLocaleString()}
                                </span>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* ─── Steps ─── */}
            {steps.map((step, index) => {
                const roleConf = ROLE_CONFIG[step.role] || { color: '#64748B', icon: Icons.user, label: step.name };
                const slaDays = step.sla_hours ? Math.ceil(step.sla_hours / 24) : null;

                return (
                    <React.Fragment key={step.id}>
                        <Connector
                            width={connectorWidth}
                            color={step.isParallel ? '#7C3AED' : modConf.color}
                            label={slaDays ? `${slaDays}d` : undefined}
                        />

                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            flexShrink: 0, position: 'relative',
                        }}>
                            {/* Step number badge */}
                            <div style={{
                                position: 'absolute', top: '-3px', right: '-3px', zIndex: 2,
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: `linear-gradient(135deg, ${modConf.color}, ${modConf.color}DD)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '9px', fontWeight: 700, color: 'white',
                                fontFamily: 'var(--font-dm-mono), monospace',
                                boxShadow: `0 1px 4px ${modConf.color}40`,
                                border: '1.5px solid white',
                            }}>
                                {index + 1}
                            </div>

                            {/* Parallel indicator */}
                            {step.isParallel && (
                                <div style={{
                                    position: 'absolute', top: '-3px', left: '-3px', zIndex: 2,
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    backgroundColor: '#7C3AED',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1.5px solid white',
                                }}>
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                        <path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" />
                                    </svg>
                                </div>
                            )}

                            <div style={{
                                width: `${nodeSize}px`,
                                height: `${nodeSize}px`,
                                borderRadius: '10px',
                                background: `linear-gradient(135deg, ${roleConf.color}14, ${roleConf.color}08)`,
                                border: `1.5px solid ${roleConf.color}35`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 2px 8px ${roleConf.color}10`,
                            }}>
                                {roleConf.icon(roleConf.color)}
                            </div>
                            {!compact && (
                                <>
                                    <span style={{
                                        fontSize: '9px', color: roleConf.color, marginTop: '5px',
                                        fontWeight: 700, textAlign: 'center',
                                        maxWidth: '64px', lineHeight: '1.2',
                                        fontFamily: 'var(--font-dm-mono), monospace',
                                        letterSpacing: '0.02em',
                                    }}>
                                        {roleConf.label}
                                    </span>
                                    {slaDays && (
                                        <span style={{
                                            fontSize: '9px', color: '#94A3B8',
                                            fontFamily: 'var(--font-dm-mono), monospace',
                                        }}>
                                            {slaDays}d SLA
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}

            {/* ─── Connector to Approved ─── */}
            <Connector width={connectorWidth} color="#059669" />

            {/* ─── Approved End Node ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                    width: `${triggerSize}px`,
                    height: `${triggerSize}px`,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                    border: '1.5px solid rgba(5,150,105,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(5,150,105,0.12)',
                }}>
                    {Icons.checkmark('#059669')}
                </div>
                {!compact && (
                    <span style={{
                        fontSize: '9px',
                        color: '#059669',
                        marginTop: '5px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        fontFamily: 'var(--font-dm-mono), monospace',
                    }}>
                        Approved
                    </span>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   CONNECTOR — animated dashed line between nodes
   ═══════════════════════════════════════════════════════════════ */
const Connector: React.FC<{ width: number; color: string; label?: string }> = ({ width, color, label }) => (
    <div style={{
        position: 'relative', width: `${width}px`, flexShrink: 0,
        display: 'flex', alignItems: 'center', height: '2px',
    }}>
        <div style={{
            width: '100%', height: '1.5px',
            background: `linear-gradient(90deg, ${color}30, ${color}60, ${color}30)`,
            borderRadius: '1px',
        }} />
        {/* Arrow head */}
        <div style={{
            position: 'absolute', right: '-1px', top: '50%', transform: 'translateY(-50%)',
            width: 0, height: 0,
            borderLeft: `4px solid ${color}50`,
            borderTop: '3px solid transparent',
            borderBottom: '3px solid transparent',
        }} />
        {label && (
            <span style={{
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                fontSize: '8px', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap',
                backgroundColor: 'white', padding: '0 4px',
                fontFamily: 'var(--font-dm-mono), monospace',
                letterSpacing: '0.04em',
                lineHeight: 1,
            }}>
                {label}
            </span>
        )}
    </div>
);

export { MODULE_CONFIG, ROLE_CONFIG, Icons };
