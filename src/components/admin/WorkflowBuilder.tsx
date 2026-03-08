"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Workflow, WorkflowStep } from "@/types";
import { getWorkflows, saveWorkflow, deleteWorkflow } from "@/lib/workflows";
import { useModal } from "@/context/ModalContext";
import {
    GitMerge, Plus, Pencil, Trash2,
    Settings, ArrowRight, Save, X,
    AlertCircle, FileText, ChevronRight, Layers, CheckCircle2, Users
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

    // Form state for a new/editing step
    const [stepForm, setStepForm] = useState<Partial<WorkflowStep>>({
        name: "",
        approverRole: "APPROVER",
        thresholdMin: 0,
        thresholdMax: undefined
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
            id: "", // Will be generated on save if new
            tenantId: user?.tenantId || "",
            name: "New Approval Workflow",
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
            thresholdMin: stepForm.thresholdMin || 0,
            thresholdMax: stepForm.thresholdMax
        };

        setActiveWorkflow({
            ...activeWorkflow,
            steps: [...activeWorkflow.steps, newStep]
        });

        // Reset form
        setStepForm({
            name: "",
            approverRole: "APPROVER",
            thresholdMin: 0,
            thresholdMax: undefined
        });
    };

    const handleRemoveStep = (stepId: string) => {
        if (!activeWorkflow) return;
        const newSteps = activeWorkflow.steps
            .filter(s => s.id !== stepId);

        setActiveWorkflow({
            ...activeWorkflow,
            steps: newSteps
        });
    };

    const handleSaveWorkflow = async () => {
        if (!user || !activeWorkflow) return;
        if (!activeWorkflow.name) {
            showError("Validation Error", "Workflow name is required.");
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
            `Are you sure you want to delete the "${name}" workflow? This action cannot be undone.`
        );
        if (confirmed) {
            await deleteWorkflow(user.tenantId, id);
            fetchWorkflows();
        }
    };

    if (loading) return <Loader text="Loading approval workflows..." />;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {view === 'LIST' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h3 className={styles.sectionTitle} style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <GitMerge size={22} color="var(--brand)" /> Approval Workflow Engine
                            </h3>
                            <p className={styles.subtitle}>Configure automated routing rules for purchase requests based on value and role.</p>
                        </div>
                        {workflows.length > 0 && (
                            <button className={styles.primaryButton} onClick={handleCreateNew}>
                                <Plus size={18} /> Create Workflow
                            </button>
                        )}
                    </div>

                    {workflows.length === 0 ? (
                        <div className={styles.card} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{ background: '#F3F4F6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <GitMerge size={32} color="#9CA3AF" />
                            </div>
                            <h4 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>No workflows defined</h4>
                            <p className={styles.subtitle} style={{ maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                                Create approval workflows to automate how purchase requests are routed through your organization.
                            </p>
                            <button className={styles.primaryButton} onClick={handleCreateNew} style={{ margin: '0 auto' }}>
                                <Plus size={18} /> Create Workflow
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                            {workflows.map(wf => (
                                <div key={wf.id} className={styles.card} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ fontWeight: 800, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                {wf.name}
                                                {wf.isActive && <span style={{ background: '#ECFDF5', color: '#10B981', fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>Active</span>}
                                            </h4>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, background: '#F9FAFB', borderRadius: '0.5rem', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approval Chain</div>
                                        {wf.steps.length === 0 ? (
                                            <span style={{ fontSize: '0.875rem', fontStyle: 'italic', color: '#9CA3AF' }}>No steps defined</span>
                                        ) : (
                                            wf.steps.map((step, idx) => (
                                                <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                                        {idx + 1}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{step.name} <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>({step.approverRole})</span></div>
                                                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                                            {step.thresholdMax ? `$${(step.thresholdMin || 0).toLocaleString()} - $${step.thresholdMax.toLocaleString()}` : `$${(step.thresholdMin || 0).toLocaleString()}+`}
                                                        </div>
                                                    </div>
                                                    {idx < wf.steps.length - 1 && <ChevronRight size={14} color="#D1D5DB" />}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: 'auto' }}>
                                        <button
                                            onClick={() => { setActiveWorkflow(wf); setView('EDIT'); }}
                                            className={styles.secondaryButton}
                                        >
                                            <Pencil size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWorkflow(wf.id, wf.name)}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '6px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {view === 'EDIT' && activeWorkflow && (
                <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h3 className={styles.sectionTitle} style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Settings size={22} color="var(--brand)" />
                                {activeWorkflow.id ? 'Edit Workflow' : 'Create New Workflow'}
                            </h3>
                            <button onClick={() => setView('LIST')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}>
                                <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to directory
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className={styles.secondaryButton} onClick={() => setView('LIST')}>
                                <X size={18} /> Cancel
                            </button>
                            <button className={styles.primaryButton} onClick={handleSaveWorkflow} disabled={saving}>
                                {saving ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Saving...</span> : <><Save size={18} /> Save Workflow</>}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: '2rem', alignItems: 'flex-start' }}>

                        {/* Left Column: Properties */}
                        <div className={styles.card} style={{ padding: '2rem' }}>
                            <h5 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={18} color="var(--brand)" /> General Properties
                            </h5>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Workflow Name *</label>
                                <input
                                    className={styles.input}
                                    value={activeWorkflow.name}
                                    onChange={e => setActiveWorkflow({ ...activeWorkflow, name: e.target.value })}
                                    placeholder="e.g., IT Hardware Over $500"
                                    autoFocus
                                />
                            </div>



                            <div className={styles.formGroup}>
                                <label className={styles.label}>Workflow Priority (Higher is applied first) *</label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    value={activeWorkflow.priority}
                                    onChange={e => setActiveWorkflow({ ...activeWorkflow, priority: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Workflow Status</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enable or disable routing</div>
                                </div>
                                <label className={styles.toggleSwitch}>
                                    <input
                                        type="checkbox"
                                        checked={activeWorkflow.isActive}
                                        onChange={e => setActiveWorkflow({ ...activeWorkflow, isActive: e.target.checked })}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>
                        </div>

                        {/* Right Column: Steps Builder */}
                        <div className={styles.card} style={{ padding: '2rem' }}>
                            <h5 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Layers size={18} color="var(--brand)" /> Approval Chain
                                </div>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', background: '#F3F4F6', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                                    {activeWorkflow.steps.length} {activeWorkflow.steps.length === 1 ? 'Step' : 'Steps'}
                                </span>
                            </h5>

                            {/* Add Step Form */}
                            <div style={{ border: '1px dashed #D1D5DB', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem', background: '#F8FAFC' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Add New Stage</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label className={styles.label} style={{ fontSize: '0.75rem' }}>Stage Name</label>
                                        <input
                                            className={styles.input}
                                            value={stepForm.name}
                                            onChange={e => setStepForm({ ...stepForm, name: e.target.value })}
                                            placeholder="e.g., Finance Review"
                                        />
                                    </div>
                                    <div>
                                        <label className={styles.label} style={{ fontSize: '0.75rem' }}>Approver Role</label>
                                        <select
                                            className={styles.input}
                                            value={stepForm.approverRole}
                                            onChange={e => setStepForm({ ...stepForm, approverRole: e.target.value })}
                                        >
                                            <option value="APPROVER">Department Approver</option>
                                            <option value="FINANCE">Finance Team</option>
                                            <option value="ADMIN">System Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={styles.label} style={{ fontSize: '0.75rem' }}>Min Amount ($)</label>
                                        <input
                                            className={styles.input}
                                            type="number"
                                            value={stepForm.thresholdMin || ''}
                                            onChange={e => setStepForm({ ...stepForm, thresholdMin: Number(e.target.value) })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className={styles.label} style={{ fontSize: '0.75rem' }}>Max Amount ($)</label>
                                        <input
                                            className={styles.input}
                                            type="number"
                                            value={stepForm.thresholdMax || ''}
                                            onChange={e => setStepForm({ ...stepForm, thresholdMax: e.target.value ? Number(e.target.value) : undefined })}
                                            placeholder="No limit"
                                        />
                                    </div>
                                </div>
                                <button
                                    className={styles.secondaryButton}
                                    style={{ width: '100%', justifyContent: 'center', background: 'white' }}
                                    onClick={handleAddStep}
                                    disabled={!stepForm.name}
                                >
                                    <Plus size={16} /> Append to Chain
                                </button>
                            </div>

                            {/* Steps Visualization */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {activeWorkflow.steps.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px dashed #E5E7EB' }}>
                                        <GitMerge size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                                        <p style={{ margin: 0, fontSize: '0.875rem' }}>No approval steps appended yet.<br />Use the form above to build the chain.</p>
                                    </div>
                                ) : (
                                    activeWorkflow.steps.map((step, index) => (
                                        <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                                            {/* Connecting Line */}
                                            {index > 0 && (
                                                <div style={{ position: 'absolute', top: '-1rem', left: '15px', width: '2px', height: '1.5rem', background: '#E5E7EB', zIndex: 0 }} />
                                            )}

                                            {/* Step Node */}
                                            <div style={{ position: 'relative', zIndex: 1, width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.875rem', marginTop: '0.5rem', boxShadow: '0 0 0 4px white' }}>
                                                {index + 1}
                                            </div>

                                            {/* Step Content */}
                                            <div style={{ flex: 1, marginLeft: '1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{step.name}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                                                            <Users size={12} /> {step.approverRole}
                                                        </span>
                                                        <span style={{ color: '#059669', background: '#ECFDF5', padding: '0.125rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                                                            {step.thresholdMax ? `$${(step.thresholdMin || 0).toLocaleString()} - $${step.thresholdMax.toLocaleString()}` : `$${(step.thresholdMin || 0).toLocaleString()}+`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveStep(step.id)}
                                                    style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#EF4444', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                                    title="Remove Step"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
