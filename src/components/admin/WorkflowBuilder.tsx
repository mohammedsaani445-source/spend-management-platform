"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Workflow, WorkflowStep } from "@/types";
import { getWorkflows, saveWorkflow, deleteWorkflow } from "@/lib/workflows";
import { useModal } from "@/context/ModalContext";
import {
    GitMerge, Plus, Pencil, Trash2,
    Settings, ArrowRight, Save, X,
    AlertCircle, FileText, ChevronRight, Layers, CheckCircle2, Users,
    ArrowDown, ShieldCheck, Zap, Layout, Play, Info
} from "lucide-react";
import styles from "@/app/dashboard/settings/Settings.module.css";
import Loader from "@/components/common/Loader";

export default function WorkflowBuilder() {
    const { user } = useAuth();
    const { showConfirm, showError } = useModal();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState<'LIST' | 'EDIT'>('LIST');

    // Simple Step Form
    const [stepForm, setStepForm] = useState<Partial<WorkflowStep>>({
        name: "",
        approverRole: "APPROVER",
        thresholdMin: 0
    });

    useEffect(() => {
        if (user?.tenantId) fetchWorkflows();
    }, [user]);

    const fetchWorkflows = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getWorkflows(user.tenantId);
            setWorkflows(data);
        } catch (e) {
            console.error("Error fetching workflows:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setActiveWorkflow({
            id: "",
            tenantId: user?.tenantId || "",
            name: "New Approval Route",
            isActive: true,
            priority: 0,
            entityType: 'REQUISITION',
            steps: [],
            createdAt: new Date().toISOString()
        });
        setView('EDIT');
    };

    const handleAddStep = () => {
        if (!activeWorkflow || !stepForm.name) return;
        const newStep: WorkflowStep = {
            id: `step_${Date.now()}`,
            name: stepForm.name!,
            approverRole: stepForm.approverRole as any,
            thresholdMin: stepForm.thresholdMin || 0
        };
        setActiveWorkflow({ ...activeWorkflow, steps: [...(activeWorkflow.steps || []), newStep] });
        setStepForm({ name: "", approverRole: "APPROVER", thresholdMin: 0 });
    };

    const handleRemoveStep = (stepId: string) => {
        if (!activeWorkflow) return;
        setActiveWorkflow({ ...activeWorkflow, steps: (activeWorkflow.steps || []).filter(s => s.id !== stepId) });
    };

    const handleSaveWorkflow = async () => {
        if (!user || !activeWorkflow) return;
        if (!activeWorkflow.name) {
            showError("Missing Information", "Please give your workflow a name.");
            return;
        }
        setSaving(true);
        try {
            await saveWorkflow(user.tenantId, activeWorkflow);
            setView('LIST');
            fetchWorkflows();
        } catch (e) {
            showError("Error", "Failed to save workflow.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteWorkflow = async (id: string, name: string) => {
        if (!user) return;
        const confirmed = await showConfirm(
            "Delete Workflow",
            `Are you sure you want to delete "${name}"? This cannot be undone.`
        );
        if (confirmed) {
            await deleteWorkflow(user.tenantId, id);
            fetchWorkflows();
        }
    };

    if (loading) return <Loader text="Loading approval engine..." />;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {view === 'LIST' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h3 className={styles.sectionTitle} style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <GitMerge size={22} color="var(--brand)" /> Approval Journeys
                            </h3>
                            <p className={styles.subtitle}>Design smooth, automatic approval routes for your organization's spend.</p>
                        </div>
                        <button className={styles.primaryButton} onClick={handleCreateNew}>
                            <Plus size={18} /> New Journey
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {workflows.map(wf => (
                            <div key={wf.id} className={styles.card} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                border: '1px solid #E5E7EB'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>{wf.name}</h4>
                                        <span style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                                            {(wf.steps || []).length} {(wf.steps || []).length === 1 ? 'Stage' : 'Stages'} Approval
                                        </span>
                                    </div>
                                    <div style={{ background: wf.isActive ? '#ECFDF5' : '#F4F6F8', color: wf.isActive ? '#10B981' : '#637381', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '100px', fontWeight: 800 }}>
                                        {wf.isActive ? 'ACTIVE' : 'DRAFT'}
                                    </div>
                                </div>

                                <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', flex: 1 }}>
                                    {(wf.steps || []).length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem', fontStyle: 'italic' }}>No steps configured</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {(wf.steps || []).map((s, idx) => (
                                                <div key={s.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{idx + 1}</div>
                                                    <div style={{ fontSize: '0.85rem' }}>
                                                        <span style={{ fontWeight: 700 }}>{s.name}</span>
                                                        <span style={{ color: '#6B7280', marginLeft: '0.5rem' }}>for ${(s.thresholdMin || 0).toLocaleString()}+</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                    <button onClick={() => { setActiveWorkflow(wf); setView('EDIT'); }} className={styles.secondaryButton} style={{ flex: 1, justifyContent: 'center' }}>
                                        <Pencil size={14} /> Configure
                                    </button>
                                    <button onClick={() => handleDeleteWorkflow(wf.id, wf.name)} style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#EF4444', borderRadius: '8px', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {view === 'EDIT' && activeWorkflow && (
                <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <div>
                            <button onClick={() => setView('LIST')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0, marginBottom: '0.5rem' }}>
                                <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to directory
                            </button>
                            <h3 className={styles.sectionTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Settings size={22} color="var(--brand)" />
                                {activeWorkflow.id ? activeWorkflow.name : 'Design New Journey'}
                            </h3>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className={styles.secondaryButton} onClick={() => setView('LIST')}>Discard</button>
                            <button className={styles.primaryButton} onClick={handleSaveWorkflow} disabled={saving}>
                                {saving ? 'Saving...' : <><Save size={18} /> Publish Workflow</>}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '3rem', alignItems: 'flex-start' }}>
                        {/* Properties Panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className={styles.card} style={{ padding: '1.75rem' }}>
                                <h5 style={{ margin: '0 0 1.25rem 0', fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Info size={18} color="var(--brand)" /> Metadata
                                </h5>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Journey Name</label>
                                    <input className={styles.input} value={activeWorkflow.name} onChange={e => setActiveWorkflow({ ...activeWorkflow, name: e.target.value })} placeholder="e.g. Executive Approval Flow" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Priority Order</label>
                                    <input type="number" className={styles.input} value={activeWorkflow.priority} onChange={e => setActiveWorkflow({ ...activeWorkflow, priority: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#F9FAFB', borderRadius: '10px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Enable Flow</span>
                                    <label className={styles.toggleSwitch}>
                                        <input type="checkbox" checked={activeWorkflow.isActive} onChange={e => setActiveWorkflow({ ...activeWorkflow, isActive: e.target.checked })} />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: '16px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                                <Zap size={40} style={{ position: 'absolute', right: -10, top: -10, opacity: 0.1 }} />
                                <h6 style={{ margin: '0 0 0.5rem 0', fontWeight: 900, color: 'var(--brand)' }}>Quick Tip</h6>
                                <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.5, opacity: 0.8 }}>
                                    Routes are triggered based on the requisition amount. Lower thresholds are checked first.
                                </p>
                            </div>
                        </div>

                        {/* Pipeline Designer */}
                        <div>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Layout size={20} color="var(--brand)" />
                                <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>The Approval Pipeline</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
                                {/* The Pipeline Connector */}
                                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '20px', width: '3px', background: 'linear-gradient(to bottom, var(--brand) 0%, #E5E7EB 100%)', zIndex: 1 }} />

                                {(activeWorkflow.steps || []).map((step, idx) => (
                                    <div key={step.id} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
                                        <div style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '50%',
                                            background: 'white',
                                            border: '3px solid var(--brand)',
                                            color: 'var(--brand)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 900,
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div className={styles.card} style={{ flex: 1, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--brand)' }}>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{step.name}</div>
                                                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#637381' }}>
                                                        <ShieldCheck size={14} /> {step.approverRole}
                                                    </span>
                                                    <span style={{ background: '#ECFDF5', color: '#059669', padding: '0.125rem 0.6rem', borderRadius: '100px', fontWeight: 800 }}>
                                                        Min. Threshold: ${(step.thresholdMin || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveStep(step.id)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Step Component */}
                                <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: '50%',
                                        background: '#F9FAFB',
                                        border: '3px dashed #CBD5E1',
                                        color: '#94A3B8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 900
                                    }}>
                                        +
                                    </div>
                                    <div className={styles.card} style={{ flex: 1, padding: '2rem', border: '2px dashed #E2E8F0', background: '#F8FAFC' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '1.5rem' }}>Append Approval Stage</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                            <div>
                                                <label className={styles.label} style={{ fontSize: '0.7rem' }}>Stage Label</label>
                                                <input className={styles.input} style={{ height: '44px' }} value={stepForm.name} onChange={e => setStepForm({ ...stepForm, name: e.target.value })} placeholder="e.g. Budget Holder" />
                                            </div>
                                            <div>
                                                <label className={styles.label} style={{ fontSize: '0.7rem' }}>Authorized Role</label>
                                                <select className={styles.input} style={{ height: '44px' }} value={stepForm.approverRole} onChange={e => setStepForm({ ...stepForm, approverRole: e.target.value })}>
                                                    <option value="APPROVER">Department Head</option>
                                                    <option value="FINANCE">Finance Lead</option>
                                                    <option value="ADMIN">Managing Director</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={styles.label} style={{ fontSize: '0.7rem' }}>Min Amount ($)</label>
                                                <input type="number" className={styles.input} style={{ height: '44px' }} value={stepForm.thresholdMin} onChange={e => setStepForm({ ...stepForm, thresholdMin: parseInt(e.target.value) || 0 })} />
                                            </div>
                                            <button className={styles.primaryButton} style={{ height: '44px', width: '44px', padding: 0, justifyContent: 'center' }} onClick={handleAddStep} disabled={!stepForm.name}>
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* End Signal */}
                                <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 10, marginTop: '1rem' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div style={{ alignSelf: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#10B981' }}>Approval Journey Complete</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
