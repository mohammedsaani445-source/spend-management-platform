"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createTender } from "@/lib/bidding";
import { X, Calendar, DollarSign, FileText } from "lucide-react";
import styles from "@/app/dashboard/sourcing/Sourcing.module.css";

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
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitleArea}>
                        <FileText size={24} className={styles.brandIcon} />
                        <div>
                            <h2>Issue New Strategic Tender</h2>
                            <p>Define your procurement requirements and invitation criteria.</p>
                        </div>
                    </div>
                    <button className={styles.iconBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Tender Title</label>
                        <input 
                            name="title" 
                            required 
                            placeholder="e.g. FY26 Infrastructure Upgrade - Phase 1" 
                            className={styles.modalInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Scope of Work & Specification</label>
                        <textarea 
                            name="description" 
                            required 
                            rows={4} 
                            placeholder="Provide detailed requirements for vendors..."
                            className={styles.modalTextarea}
                        ></textarea>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Estimated Budget</label>
                            <div className={styles.inputWithIcon}>
                                <DollarSign size={16} />
                                <input 
                                    name="budget" 
                                    type="number" 
                                    required 
                                    placeholder="0.00"
                                    className={styles.modalInput}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Submission Deadline</label>
                            <div className={styles.inputWithIcon}>
                                <Calendar size={16} />
                                <input 
                                    name="deadline" 
                                    type="date" 
                                    required 
                                    className={styles.modalInput}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Base Currency</label>
                            <select name="currency" className={styles.modalSelect}>
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="CAD">CAD - Canadian Dollar</option>
                            </select>
                        </div>
                        <div className={styles.formGroup} style={{ justifyContent: 'center', paddingTop: '1.5rem' }}>
                            <label className={styles.checkboxLabel}>
                                <input name="isSealed" type="checkbox" defaultChecked />
                                <span>Enforce Sealed Bidding Policy</span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.secondaryBtn} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.primaryBtn} disabled={loading}>
                            {loading ? "Launching Tender..." : "Issue Tender RFP"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
