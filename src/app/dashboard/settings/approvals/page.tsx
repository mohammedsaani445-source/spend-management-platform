"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getApprovalPolicies, upsertApprovalPolicy, deleteApprovalPolicy, togglePolicyStatus } from '@/lib/approvalPolicies';
import { getDepartments } from '@/lib/departments';
import { ApprovalPolicy, ApprovalPolicyModule, Department } from '@/types';
import { FlowVisualizer, MODULE_CONFIG } from '@/components/admin/approvals/FlowVisualizer';
import { PolicyModal } from '@/components/admin/approvals/PolicyModal';
import { toast } from 'sonner';

/* ═══════════════════════════════════════════════════════════════
   SVG ICON LIBRARY — consistent 14-18px stroke icons
   ═══════════════════════════════════════════════════════════════ */
const PageIcons = {
    clipboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>,
    check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    pause: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="10" y1="15" x2="10" y2="9" /><line x1="14" y1="15" x2="14" y2="9" /></svg>,
    lightning: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    flask: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6v4.8L9 18H5.5a2.5 2.5 0 0 1 0-5L9 7.8V3z" /><path d="M15 7.8l3.5 5.2a2.5 2.5 0 0 1-2 4H9" /><line x1="8" y1="3" x2="16" y2="3" /></svg>,
    plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    edit: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    warning: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    dollar: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    building: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" /><path d="M8 10h.01" /></svg>,
    users: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    play: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
};

/* ═══════════════════════════════════════════════════════════════
   FILTER PILLS
   ═══════════════════════════════════════════════════════════════ */
const FILTER_PILLS: { id: ApprovalPolicyModule | 'all'; label: string; color: string }[] = [
    { id: 'all',             label: 'All',             color: '#E8441A' },
    { id: 'requisitions',    label: 'Requisitions',    color: '#0891B2' },
    { id: 'purchase_orders', label: 'Purchase Orders', color: '#7C3AED' },
    { id: 'invoices',        label: 'Invoices',        color: '#059669' },
    { id: 'contracts',       label: 'Contracts',       color: '#2563EB' },
    { id: 'vendors',         label: 'Vendors',         color: '#D97706' },
    { id: 'tenders',         label: 'Tenders',         color: '#E11D48' },
];

/* ═══════════════════════════════════════════════════════════════
   SEED POLICIES
   ═══════════════════════════════════════════════════════════════ */
const SEED_POLICIES: Partial<ApprovalPolicy>[] = [
    {
        id: 'default-requisition-1', module: 'requisitions',
        name: 'Standard Requisition Approval',
        description: 'Default routing for standard purchase requests across all departments.',
        isActive: true, autoApprove: false, autoApproveLimit: 0,
        currency: 'GHS', priority: 10, departmentScope: 'All Departments',
        minAmount: 0, maxAmount: 999999999,
        steps: [
            { id: 'sr1', name: 'Dept Head', role: 'dept_head', sla_hours: 48, isParallel: false, isRequired: true },
            { id: 'sr2', name: 'Proc Officer', role: 'proc_officer', sla_hours: 24, isParallel: false, isRequired: true },
        ],
    },
    {
        id: 'default-po-1', module: 'purchase_orders',
        name: 'High-Value PO Approval',
        description: 'Approval chain for purchase orders exceeding standard thresholds.',
        isActive: true, autoApprove: false, autoApproveLimit: 0,
        currency: 'GHS', priority: 20, departmentScope: 'All Departments',
        minAmount: 10000, maxAmount: 100000,
        steps: [
            { id: 'hp1', name: 'Proc Manager', role: 'proc_mgr', sla_hours: 48, isParallel: false, isRequired: true },
            { id: 'hp2', name: 'Finance Manager', role: 'finance_mgr', sla_hours: 24, isParallel: false, isRequired: true },
        ],
    },
    {
        id: 'default-po-2', module: 'purchase_orders',
        name: 'Executive PO Sign-Off',
        description: 'Three-tier approval for high-value purchase orders above GHS 100,000.',
        isActive: true, autoApprove: false, autoApproveLimit: 0,
        currency: 'GHS', priority: 80, departmentScope: 'All Departments',
        minAmount: 100000, maxAmount: 999999999,
        steps: [
            { id: 'ep1', name: 'Proc Manager', role: 'proc_mgr', sla_hours: 48, isParallel: false, isRequired: true },
            { id: 'ep2', name: 'Finance Manager', role: 'finance_mgr', sla_hours: 48, isParallel: false, isRequired: true },
            { id: 'ep3', name: 'CFO', role: 'administrator', sla_hours: 72, isParallel: false, isRequired: true },
        ],
    },
    {
        id: 'default-invoice-1', module: 'invoices',
        name: 'Invoice Fast-Track',
        description: 'Streamlined invoice processing with auto-approve for amounts under GHS 1,000.',
        isActive: true, autoApprove: true, autoApproveLimit: 1000,
        currency: 'GHS', priority: 30, departmentScope: 'All Departments',
        minAmount: 0, maxAmount: 999999999,
        steps: [
            { id: 'if1', name: 'AP Officer', role: 'ap_officer', sla_hours: 24, isParallel: false, isRequired: true },
        ],
    },
    {
        id: 'default-contract-1', module: 'contracts',
        name: 'Contract Review & Sign',
        description: 'Legal and executive oversight for vendor contracts — currently inactive.',
        isActive: false, autoApprove: false, autoApproveLimit: 0,
        currency: 'GHS', priority: 50, departmentScope: 'All Departments',
        minAmount: 0, maxAmount: 999999999,
        steps: [
            { id: 'cr1', name: 'Proc Manager', role: 'proc_mgr', sla_hours: 72, isParallel: true, isRequired: true },
            { id: 'cr2', name: 'Finance Manager', role: 'finance_mgr', sla_hours: 72, isParallel: true, isRequired: true },
            { id: 'cr3', name: 'CFO', role: 'administrator', sla_hours: 120, isParallel: false, isRequired: true },
        ],
    },
];

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function ApprovalPoliciesPage() {
    const { user } = useAuth();
    const [policies, setPolicies] = useState<ApprovalPolicy[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<ApprovalPolicy | undefined>();
    const [filterModule, setFilterModule] = useState<ApprovalPolicyModule | 'all'>('all');

    // Simulator state
    const [simModule, setSimModule] = useState<ApprovalPolicyModule>('requisitions');
    const [simAmount, setSimAmount] = useState('');
    const [simResults, setSimResults] = useState<ApprovalPolicy[] | null>(null);

    useEffect(() => {
        if (user?.tenantId) loadData();
    }, [user?.tenantId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const existing = await getApprovalPolicies(user!.tenantId);
            const existingIds = new Set(existing.map(p => p.id));

            for (const seed of SEED_POLICIES) {
                if (!existingIds.has(seed.id!)) {
                    await upsertApprovalPolicy(user!.tenantId, seed);
                }
            }

            const [policiesData, deptsData] = await Promise.all([
                getApprovalPolicies(user!.tenantId),
                getDepartments(user!.tenantId),
            ]);

            const seen = new Set<string>();
            const unique = policiesData.filter(p => {
                if (seen.has(p.id)) return false;
                seen.add(p.id); return true;
            });

            setPolicies(unique.sort((a, b) => (b.priority || 0) - (a.priority || 0)));
            setDepartments(deptsData);
        } catch (error) {
            console.error('Error loading policies:', error);
            toast.error('Failed to load approval policies');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePolicy = async (policyData: Partial<ApprovalPolicy>) => {
        try {
            await upsertApprovalPolicy(user!.tenantId, policyData);
            toast.success(policyData.id ? 'Policy updated' : 'Policy created');
            loadData();
        } catch (error) { toast.error('Failed to save policy'); throw error; }
    };

    const handleDeletePolicy = async (id: string) => {
        if (!confirm('Delete this approval policy? This cannot be undone.')) return;
        try {
            await deleteApprovalPolicy(user!.tenantId, id);
            toast.success('Policy deleted');
            loadData();
        } catch { toast.error('Failed to delete policy'); }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await togglePolicyStatus(user!.tenantId, id, !currentStatus);
            toast.success(`Policy ${!currentStatus ? 'activated' : 'deactivated'}`);
            loadData();
        } catch { toast.error('Failed to toggle status'); }
    };

    const runSimulation = () => {
        const matching = policies.filter(p =>
            p.isActive && p.module === simModule
        ).sort((a, b) => (b.priority || 0) - (a.priority || 0));
        setSimResults(matching.length > 0 ? matching : []);
    };

    const filteredPolicies = policies.filter(p =>
        filterModule === 'all' || p.module === filterModule
    );

    const stats = {
        total: policies.length,
        active: policies.filter(p => p.isActive).length,
        inactive: policies.filter(p => !p.isActive).length,
        autoApprove: policies.filter(p => p.autoApprove || p.autoApproveLimit > 0).length,
    };

    /* ─── LOADING STATE ─── */
    if (loading) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '70vh', gap: '16px', fontFamily: 'var(--font-dm-sans), sans-serif',
            }}>
                <div style={{
                    width: '36px', height: '36px', border: '2.5px solid #F1F5F9',
                    borderTopColor: '#E8441A', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                <p style={{ fontSize: '13px', color: '#94A3B8', letterSpacing: '0.01em' }}>Loading policies…</p>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#F7F6F3',
            minHeight: '100vh',
            padding: '28px',
            fontFamily: 'var(--font-dm-sans), sans-serif',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* ═══ ACTION BAR ═══ */}
                <div style={{
                    display: 'flex', justifyContent: 'flex-end',
                    gap: '10px', marginBottom: '22px', flexWrap: 'wrap',
                }}>
                    <button
                        onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 16px',
                            borderRadius: '8px',
                            fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer',
                            border: isSimulatorOpen ? '1.5px solid #E8441A' : '1px solid #E2E8F0',
                            backgroundColor: isSimulatorOpen ? 'rgba(232,68,26,0.06)' : 'white',
                            color: isSimulatorOpen ? '#E8441A' : '#64748B',
                            transition: 'all 0.2s',
                            fontFamily: 'var(--font-dm-sans), sans-serif',
                        }}
                    >
                        {PageIcons.flask}
                        Test Routing
                    </button>
                    <button
                        onClick={() => { setSelectedPolicy(undefined); setIsModalOpen(true); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 18px',
                            borderRadius: '8px',
                            fontSize: '13px', fontWeight: 700,
                            cursor: 'pointer',
                            border: 'none',
                            background: 'linear-gradient(135deg, #E8441A, #DC2626)',
                            color: '#FFFFFF',
                            boxShadow: '0 2px 8px rgba(232,68,26,0.2)',
                            transition: 'box-shadow 0.2s, transform 0.15s',
                            fontFamily: 'var(--font-dm-sans), sans-serif',
                        }}
                    >
                        {PageIcons.plus}
                        New Policy
                    </button>
                </div>

                {/* ═══ STAT CARDS ═══ */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '14px',
                    marginBottom: '22px',
                }}>
                    {[
                        { label: 'Total Policies', icon: PageIcons.clipboard, value: stats.total, color: '#E8441A', sub: 'configured' },
                        { label: 'Active',          icon: PageIcons.check,     value: stats.active, color: '#059669', sub: 'enforcing' },
                        { label: 'Inactive',        icon: PageIcons.pause,     value: stats.inactive, color: '#64748B', sub: 'paused' },
                        { label: 'Auto-Approve',    icon: PageIcons.lightning, value: stats.autoApprove, color: '#D97706', sub: 'enabled' },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #ECEAE5',
                            borderRadius: '12px',
                            padding: '18px 20px',
                            display: 'flex', gap: '14px', alignItems: 'flex-start',
                            transition: 'box-shadow 0.2s',
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: `linear-gradient(135deg, ${stat.color}12, ${stat.color}06)`,
                                border: `1px solid ${stat.color}18`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: stat.color, flexShrink: 0,
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '11px', fontWeight: 600, color: '#94A3B8',
                                    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                                    fontFamily: 'var(--font-dm-sans), sans-serif',
                                }}>
                                    {stat.label}
                                </div>
                                <div style={{
                                    fontSize: '26px', fontWeight: 800, color: stat.color,
                                    fontFamily: 'var(--font-dm-mono), monospace',
                                    lineHeight: 1.15, marginTop: '2px',
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{
                                    fontSize: '11px', color: '#94A3B8',
                                    fontFamily: 'var(--font-dm-mono), monospace',
                                    letterSpacing: '0.02em',
                                }}>
                                    {stat.sub}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ═══ SIMULATOR PANEL ═══ */}
                {isSimulatorOpen && (
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '14px',
                        padding: '22px 24px',
                        marginBottom: '22px',
                        animation: 'slideDown 0.25s ease',
                        border: '1px solid #F97316',
                        boxShadow: '0 12px 24px -4px rgba(234, 88, 12, 0.1)',
                    }}>
                        <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '6px',
                                    background: 'linear-gradient(135deg, #F97316, #EA580C)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {PageIcons.flask}
                                </div>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
                                    Policy Route Simulator
                                </h3>
                            </div>
                            <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 32px', lineHeight: 1.4 }}>
                                Enter a transaction to preview which policies trigger and who approves.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const, alignItems: 'flex-end' }}>
                            <div style={{ flex: '1 1 200px' }}>
                                <label style={simLabelStyle}>Module</label>
                                <select
                                    value={simModule}
                                    onChange={e => setSimModule(e.target.value as ApprovalPolicyModule)}
                                    style={simSelectStyle}
                                >
                                    {FILTER_PILLS.filter(p => p.id !== 'all').map(p => (
                                        <option key={p.id} value={p.id}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: '1 1 200px' }}>
                                <label style={simLabelStyle}>Transaction Amount (GHS)</label>
                                <input
                                    type="number"
                                    value={simAmount}
                                    onChange={e => setSimAmount(e.target.value)}
                                    placeholder="e.g. 50,000"
                                    style={simInputStyle}
                                />
                            </div>
                            <button
                                onClick={runSimulation}
                                style={{
                                    padding: '10px 22px', height: '40px',
                                    borderRadius: '8px', border: 'none',
                                    background: 'linear-gradient(135deg, #F97316, #EA580C)',
                                    color: '#FFFFFF', fontSize: '13px', fontWeight: 700,
                                    cursor: 'pointer', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontFamily: 'var(--font-dm-sans), sans-serif',
                                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                                }}
                            >
                                {PageIcons.play}
                                Run Test
                            </button>
                        </div>

                        {/* Simulator Results */}
                        {simResults !== null && (
                            <div style={{ marginTop: '16px' }}>
                                {simResults.length === 0 ? (
                                    <div style={{
                                        backgroundColor: '#FFF7ED', borderRadius: '10px',
                                        padding: '16px 18px', color: '#C2410C', fontSize: '13px',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        border: '1px solid #FED7AA',
                                    }}>
                                        <span style={{ color: '#EA580C' }}>{PageIcons.warning}</span>
                                        No active policies match this module and amount combination.
                                    </div>
                                ) : (
                                    simResults.map(pol => {
                                        const modConf = MODULE_CONFIG[pol.module] || MODULE_CONFIG.requisitions;
                                        const autoTriggered = (pol.autoApprove || pol.autoApproveLimit > 0) && Number(simAmount) <= pol.autoApproveLimit;
                                        return (
                                            <div key={pol.id} style={{
                                                backgroundColor: '#FAFAF8', borderRadius: '10px',
                                                padding: '16px 18px', marginBottom: '8px',
                                                border: '1px solid #E2E8F0',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' as const }}>
                                                    <div style={{
                                                        width: '8px', height: '8px', borderRadius: '50%',
                                                        backgroundColor: modConf.color,
                                                        boxShadow: `0 0 6px ${modConf.color}60`,
                                                    }} />
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                                                        {pol.name}
                                                    </span>
                                                    {autoTriggered && (
                                                        <span style={{
                                                            padding: '3px 10px', borderRadius: '10px',
                                                            background: 'linear-gradient(135deg, #059669, #047857)',
                                                            color: '#FFFFFF', fontSize: '10px', fontWeight: 700,
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                            letterSpacing: '0.04em',
                                                        }}>
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="none">
                                                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                                            </svg>
                                                            AUTO-APPROVED
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{
                                                    backgroundColor: '#FFFFFF', borderRadius: '8px',
                                                    padding: '4px', overflowX: 'auto',
                                                    border: '1px solid #F1F5F9',
                                                }}>
                                                    <FlowVisualizer
                                                        steps={pol.steps || []}
                                                        autoApproveLimit={pol.autoApproveLimit}
                                                        autoApprove={pol.autoApprove}
                                                        currency={pol.currency}
                                                        compact={true}
                                                        module={pol.module}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ FILTER PILLS ═══ */}
                <div style={{
                    display: 'flex', gap: '8px', marginBottom: '22px',
                    overflowX: 'auto', paddingBottom: '4px',
                }}>
                    {FILTER_PILLS.map(pill => {
                        const isActive = filterModule === pill.id;
                        return (
                            <button
                                key={pill.id}
                                onClick={() => setFilterModule(pill.id as any)}
                                style={{
                                    padding: '7px 16px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    border: isActive ? `1.5px solid ${pill.color}` : '1px solid #E2E8F0',
                                    backgroundColor: isActive ? `${pill.color}0A` : '#FFFFFF',
                                    color: isActive ? pill.color : '#64748B',
                                    whiteSpace: 'nowrap' as const,
                                    flexShrink: 0,
                                    transition: 'all 0.2s',
                                    fontFamily: 'var(--font-dm-sans), sans-serif',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                {pill.label}
                                {pill.id !== 'all' && isActive && (
                                    <span style={{
                                        marginLeft: '6px', fontFamily: 'var(--font-dm-mono), monospace',
                                        fontSize: '10px', opacity: 0.7,
                                    }}>
                                        {policies.filter(p => p.module === pill.id).length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ═══ POLICY CARDS ═══ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filteredPolicies.map(policy => {
                        const modConf = MODULE_CONFIG[policy.module] || MODULE_CONFIG.requisitions;
                        const isInactive = !policy.isActive;
                        const hasAutoApprove = policy.autoApprove || policy.autoApproveLimit > 0;

                        return (
                            <div
                                key={policy.id}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #ECEAE5',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    opacity: isInactive ? 0.65 : 1,
                                    transition: 'opacity 0.2s, box-shadow 0.2s',
                                }}
                            >
                                {/* Card Header */}
                                <div style={{ padding: '18px 22px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Name row */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' as const, marginBottom: '6px' }}>
                                                {/* Module colour dot */}
                                                <div style={{
                                                    width: '10px', height: '10px', borderRadius: '50%',
                                                    backgroundColor: modConf.color, flexShrink: 0,
                                                    boxShadow: `0 0 6px ${modConf.color}30`,
                                                }} />
                                                {/* Policy name */}
                                                <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                                                    {policy.name}
                                                </span>
                                                {/* Module badge */}
                                                <span style={{
                                                    padding: '2px 10px', borderRadius: '10px',
                                                    background: `${modConf.color}0A`,
                                                    border: `1px solid ${modConf.color}20`,
                                                    color: modConf.color,
                                                    fontSize: '11px', fontWeight: 600,
                                                    letterSpacing: '0.02em',
                                                }}>
                                                    {modConf.label}
                                                </span>
                                                {/* Inactive badge */}
                                                {isInactive && (
                                                    <span style={{
                                                        padding: '2px 10px', borderRadius: '10px',
                                                        backgroundColor: '#F1F5F9', color: '#64748B',
                                                        border: '1px solid #E2E8F0',
                                                        fontSize: '11px', fontWeight: 600,
                                                    }}>
                                                        Inactive
                                                    </span>
                                                )}
                                                {/* Auto-approve badge */}
                                                {hasAutoApprove && (
                                                    <span style={{
                                                        padding: '2px 10px', borderRadius: '10px',
                                                        background: 'rgba(5,150,105,0.06)',
                                                        border: '1px solid rgba(5,150,105,0.15)',
                                                        color: '#059669',
                                                        fontSize: '11px', fontWeight: 600,
                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                    }}>
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#059669" stroke="none">
                                                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                                        </svg>
                                                        Auto ≤ GHS {policy.autoApproveLimit.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Description */}
                                            {policy.description && (
                                                <p style={{
                                                    fontSize: '12px', color: '#94A3B8', margin: '0 0 10px 20px',
                                                    lineHeight: 1.5, letterSpacing: '0.01em',
                                                }}>
                                                    {policy.description}
                                                </p>
                                            )}

                                            {/* Chips row */}
                                            <div style={{
                                                display: 'flex', gap: '8px', marginLeft: '20px',
                                                flexWrap: 'wrap' as const, alignItems: 'center',
                                            }}>
                                                <span style={chipStyle}>
                                                    <span style={{ color: '#64748B' }}>{PageIcons.dollar}</span>
                                                    GHS {(policy.minAmount || 0).toLocaleString()} – {policy.maxAmount === 999999999 || !policy.maxAmount ? '∞' : `GHS ${policy.maxAmount.toLocaleString()}`}
                                                </span>
                                                <span style={chipStyle}>
                                                    <span style={{ color: '#64748B' }}>{PageIcons.building}</span>
                                                    {policy.departmentScope || 'All Departments'}
                                                </span>
                                                <span style={chipStyle}>
                                                    <span style={{ color: '#64748B' }}>{PageIcons.users}</span>
                                                    {policy.steps?.length || 0} approver{(policy.steps?.length || 0) !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ─── Right: Toggle + Edit + Delete ─── */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, paddingTop: '2px' }}>
                                            {/* Toggle */}
                                            <div
                                                onClick={() => handleToggleStatus(policy.id, policy.isActive)}
                                                style={{
                                                    width: '40px', height: '22px', borderRadius: '11px',
                                                    backgroundColor: policy.isActive ? '#059669' : '#CBD5E1',
                                                    cursor: 'pointer', position: 'relative',
                                                    transition: 'background-color 0.2s', flexShrink: 0,
                                                }}
                                                title={policy.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                <div style={{
                                                    width: '16px', height: '16px', borderRadius: '50%',
                                                    backgroundColor: '#FFFFFF',
                                                    position: 'absolute', top: '3px',
                                                    left: policy.isActive ? '21px' : '3px',
                                                    transition: 'left 0.2s',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                                }} />
                                            </div>
                                            {/* Edit */}
                                            <button
                                                onClick={() => { setSelectedPolicy(policy); setIsModalOpen(true); }}
                                                title="Edit policy"
                                                style={{
                                                    padding: '7px 14px', borderRadius: '7px',
                                                    border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF',
                                                    color: '#475569', fontSize: '12px', fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                    transition: 'border-color 0.15s',
                                                    fontFamily: 'var(--font-dm-sans), sans-serif',
                                                }}
                                            >
                                                {PageIcons.edit}
                                                Edit
                                            </button>
                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDeletePolicy(policy.id)}
                                                title="Delete policy"
                                                style={{
                                                    width: '32px', height: '32px', borderRadius: '7px',
                                                    border: 'none', backgroundColor: '#FEF2F2',
                                                    color: '#DC2626',
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'background-color 0.15s',
                                                }}
                                            >
                                                {PageIcons.trash}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Flow Diagram — active cards only */}
                                {policy.isActive && (
                                    <div style={{
                                        backgroundColor: '#FAFAF8',
                                        borderTop: '1px solid #F1F5F9',
                                        padding: '10px 22px 14px',
                                        overflowX: 'auto',
                                    }}>
                                        <FlowVisualizer
                                            steps={policy.steps || []}
                                            autoApproveLimit={policy.autoApproveLimit}
                                            autoApprove={policy.autoApprove}
                                            currency={policy.currency}
                                            compact={false}
                                            module={policy.module}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredPolicies.length === 0 && (
                        <div style={{
                            textAlign: 'center' as const, padding: '60px 20px',
                            color: '#94A3B8', fontSize: '14px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                            No policies match the selected filter.
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ MODAL ═══ */}
            <PolicyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePolicy}
                policy={selectedPolicy}
                departments={departments}
            />

            {/* ═══ RESPONSIVE ═══ */}
            <style>{`
                @media (max-width: 640px) {
                    div[style*="gridTemplateColumns: repeat(4"] {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 400px) {
                    div[style*="gridTemplateColumns: repeat(4"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════════ */
const chipStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#94A3B8',
    backgroundColor: '#F8FAFC',
    border: '1px solid #F1F5F9',
    padding: '3px 10px',
    borderRadius: '8px',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: 'var(--font-dm-mono), monospace',
    letterSpacing: '0.01em',
};

const simLabelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 600,
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '5px',
    fontFamily: 'var(--font-dm-sans), sans-serif',
};

const simInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    fontSize: '13px',
    fontFamily: 'var(--font-dm-sans), sans-serif',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
};

const simSelectStyle: React.CSSProperties = {
    ...simInputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px',
};
