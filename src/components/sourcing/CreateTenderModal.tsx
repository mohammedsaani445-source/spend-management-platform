"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createTender } from "@/lib/bidding";
import { X, Calendar, DollarSign, FileText, ShieldCheck, Info } from "lucide-react";
import Portal from "@/components/common/Portal";

interface CreateTenderModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
}

export default function CreateTenderModal({ isOpen, onClose, tenantId }: CreateTenderModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const fd = new FormData(e.currentTarget);
            await createTender(tenantId, {
                title: fd.get('title') as string,
                description: fd.get('description') as string,
                deadline: fd.get('deadline') as string,
                currency: fd.get('currency') as string,
                budget: Number(fd.get('budget')),
                isSealed: fd.get('isSealed') === 'on',
                items: [], // Items can be added later or in a split view
                status: 'OPEN',
                createdBy: user.uid
            }, user);
            
            onClose();
        } catch (error) {
            console.error("Error creating tender:", error);
            alert("Failed to create tender. Please check your permissions.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <div className="modal-backdrop" style={{ animation: "fadeIn 0.2s ease-out" }}>
                <div className="modal" style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: "slideUp 0.3s ease-out", padding: 0, overflow: 'hidden' }}>
                    <div className="modal-header" style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ padding: 10, borderRadius: 12, background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.25rem", color: 'var(--text-primary)' }}>Issue New Strategic Tender</h2>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: 'var(--text-secondary)' }}>Define procurement requirements and invitation criteria.</p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}><X size={24} /></button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                        <div className="modal-body" style={{ display: 'grid', gap: '1.25rem', padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Tender Title</label>
                                <input 
                                    name="title" 
                                    required 
                                    placeholder="e.g. FY26 Infrastructure Upgrade - Phase 1" 
                                    className="form-input"
                                    style={{ borderRadius: '10px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Scope of Work & Specification</label>
                                <textarea 
                                    name="description" 
                                    required 
                                    rows={4} 
                                    placeholder="Provide detailed requirements for vendors..."
                                    className="form-input"
                                    style={{ borderRadius: '12px', minHeight: '100px', paddingTop: '10px' }}
                                ></textarea>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <DollarSign size={14} /> Estimated Budget
                                    </label>
                                    <input 
                                        name="budget" 
                                        type="number" 
                                        required 
                                        placeholder="0.00"
                                        className="form-input"
                                        style={{ borderRadius: '10px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Calendar size={14} /> Submission Deadline
                                    </label>
                                    <input 
                                        name="deadline" 
                                        type="date" 
                                        required 
                                        className="form-input"
                                        style={{ borderRadius: '10px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Base Currency</label>
                                    <select name="currency" className="form-select" style={{ borderRadius: '10px' }}>
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="CAD">CAD - Canadian Dollar</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                                        <input name="isSealed" type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--brand)' }} />
                                        <span>Enforce Sealed Bidding Policy</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--info-bg)', borderRadius: '12px', border: '1px solid var(--info-border)' }}>
                                <Info size={20} color="var(--info)" style={{ flexShrink: 0 }} />
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--info-dark)', lineHeight: 1.4 }}>
                                    Launch this tender as an RFP to invited vendors. All submissions will be encrypted until the deadline.
                                </p>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0 }}>
                            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '160px' }}>
                                {loading ? "Launching Tender..." : "Issue Tender RFP"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}
