"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";
import styles from "@/components/layout/Layout.module.css";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: "danger" | "warning" | "info";
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    type = "warning",
    onConfirm,
    onCancel
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const accentColor = type === "danger" ? "#dc2626" : type === "warning" ? "#f59e0b" : "var(--brand)";
    const lightAccent = type === "danger" ? "#fee2e2" : type === "warning" ? "#fef3c7" : "var(--brand-soft)";

    return (
        <div className="modal-backdrop" style={{ zindex: 9999 }}>
            <div className="modal" style={{ maxWidth: '400px', transform: 'translateY(10vh)' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: lightAccent, display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <AlertCircle size={18} style={{ color: accentColor }} />
                        </div>
                        <h2 className="modal-title" style={{ fontSize: '1.1rem' }}>{title}</h2>
                    </div>
                    <button onClick={onCancel} className="closeButton" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                        {message}
                    </p>
                </div>

                <div className="modal-footer" style={{
                    borderTop: '1px solid var(--border)',
                    padding: '1rem 1.5rem',
                    background: 'var(--surface-2)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem'
                }}>
                    <button
                        type="button"
                        className="btn"
                        onClick={onCancel}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className="btn"
                        onClick={onConfirm}
                        style={{
                            padding: '0.5rem 1.25rem',
                            fontSize: '0.875rem',
                            background: accentColor,
                            color: '#fff',
                            border: 'none',
                            fontWeight: 600
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
