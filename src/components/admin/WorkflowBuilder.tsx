"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, DB_PREFIX } from "@/lib/firebase";
import { ref, get, set, push, update } from "firebase/database";
import { Workflow, WorkflowStep, UserRole } from "@/types";
import { formatCurrency } from "@/lib/currencies";

export default function WorkflowBuilder() {
    const { user } = useAuth();
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
        setLoading(true);
        try {
            const workflowsRef = ref(db, `${DB_PREFIX}/tenants/${user?.tenantId}/workflows`);
            const snapshot = await get(workflowsRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                setWorkflows(Object.values(data));
            }
        } catch (error) {
            console.error("Error fetching workflows:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        const newWorkflow: Workflow = {
            id: `wf_${Date.now()}`,
            tenantId: user?.tenantId || "",
            name: "New Approval Path",
            entityType: 'REQUISITION',
            steps: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            priority: 10
        };
        setActiveWorkflow(newWorkflow);
        setView('EDIT');
    };

    const addStep = () => {
        if (!activeWorkflow) return;
        const newStep: WorkflowStep = {
            id: `step_${Date.now()}`,
            name: stepForm.name || "Approval Stage",
            approverRole: stepForm.approverRole as UserRole,
            thresholdMin: stepForm.thresholdMin,
            thresholdMax: stepForm.thresholdMax
        };
        setActiveWorkflow({
            ...activeWorkflow,
            steps: [...activeWorkflow.steps, newStep]
        });
        setStepForm({ name: "", approverRole: "APPROVER", thresholdMin: 0, thresholdMax: undefined });
    };

    const removeStep = (id: string) => {
        if (!activeWorkflow) return;
        setActiveWorkflow({
            ...activeWorkflow,
            steps: activeWorkflow.steps.filter(s => s.id !== id)
        });
    };

    const saveWorkflow = async () => {
        if (!activeWorkflow || !user?.tenantId) return;
        setSaving(true);
        try {
            const wfRef = ref(db, `${DB_PREFIX}/tenants/${user.tenantId}/workflows/${activeWorkflow.id}`);
            await set(wfRef, activeWorkflow);
            await fetchWorkflows();
            setView('LIST');
        } catch (error) {
            alert("Failed to save workflow.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Workflow Systems...</div>;

    if (view === 'LIST') {
        return (
            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: 800 }}>Approval Workflow Engine</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Automate and enforce your organization's spend policies.</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleCreateNew}>+ New Workflow</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {workflows.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border)', borderRadius: '16px' }}>
                            No active workflows found. Create one to begin automating approvals.
                        </div>
                    ) : (
                        workflows.map(wf => (
                            <div key={wf.id} onClick={() => { setActiveWorkflow(wf); setView('EDIT'); }} style={{
                                padding: '1.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{wf.name}</div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        <span className="badge">{wf.entityType}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{wf.steps.length} Stages</span>
                                        <span style={{ fontSize: '0.8rem', color: wf.isActive ? 'var(--success)' : 'var(--error)', fontWeight: 700 }}>
                                            {wf.isActive ? '● ACTIVE' : '○ INACTIVE'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ color: 'var(--text-secondary)' }}>➔</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <button onClick={() => setView('LIST')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>← Back to List</button>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: 0, fontWeight: 800 }}>{activeWorkflow?.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Workflow ID: {activeWorkflow?.id}</p>
                </div>
                <button className="btn btn-primary" onClick={saveWorkflow} disabled={saving}>
                    {saving ? 'Saving...' : 'Publish Workflow'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem' }}>
                {/* CONFIGURATION SIDEBAR */}
                <div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Workflow Name</label>
                        <input
                            type="text"
                            value={activeWorkflow?.name}
                            onChange={e => setActiveWorkflow({ ...activeWorkflow!, name: e.target.value })}
                            style={{ width: '100%', marginBottom: '1.5rem' }}
                        />

                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Apply To</label>
                        <select
                            value={activeWorkflow?.entityType}
                            onChange={e => setActiveWorkflow({ ...activeWorkflow!, entityType: e.target.value as any })}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                        >
                            <option value="REQUISITION">Requisitions (Pre-PO)</option>
                            <option value="PO">Purchase Orders</option>
                            <option value="INVOICE">Invoices (AP)</option>
                        </select>
                    </div>

                    <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>➕</span> Add Approval Stage
                        </h4>

                        <div className="form-group">
                            <label>Stage Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Finance Review"
                                value={stepForm.name}
                                onChange={e => setStepForm({ ...stepForm, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Designated Approver Role</label>
                            <select
                                value={stepForm.approverRole}
                                onChange={e => setStepForm({ ...stepForm, approverRole: e.target.value as any })}
                            >
                                <option value="APPROVER">Department Head</option>
                                <option value="FINANCE_MANAGER">Finance Manager</option>
                                <option value="FINANCE">Finance Team</option>
                                <option value="ADMIN">Administrator (CFO/CTO)</option>
                                <option value="SUPERUSER">Executive (CEO)</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Min Threshold ($)</label>
                                <input
                                    type="number"
                                    value={stepForm.thresholdMin}
                                    onChange={e => setStepForm({ ...stepForm, thresholdMin: Number(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Threshold ($)</label>
                                <input
                                    type="number"
                                    placeholder="No Max"
                                    value={stepForm.thresholdMax || ""}
                                    onChange={e => setStepForm({ ...stepForm, thresholdMax: e.target.value ? Number(e.target.value) : undefined })}
                                />
                            </div>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={addStep}>
                            Add to Chain
                        </button>
                    </div>
                </div>

                {/* THE CHAIN VISUALIZER */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '23px', top: '40px', bottom: '40px', width: '2px', background: 'var(--border)', zIndex: 0 }} />

                    {activeWorkflow?.steps.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No stages defined. Add a stage using the sidebar.
                        </div>
                    ) : (
                        activeWorkflow?.steps.map((step, index) => (
                            <div key={step.id} style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem',
                                position: 'relative',
                                zIndex: 1,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '16px',
                                    background: 'var(--brand)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 900,
                                    fontSize: '1.2rem'
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{step.name}</div>
                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                                        <div style={{ color: 'var(--text-secondary)' }}>
                                            Role: <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{step.approverRole}</span>
                                        </div>
                                        Range: <span style={{ fontWeight: 700 }}>
                                            ${step.thresholdMin?.toLocaleString() || '0'} - {step.thresholdMax ? '$' + step.thresholdMax.toLocaleString() : '∞'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeStep(step.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1rem' }}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
