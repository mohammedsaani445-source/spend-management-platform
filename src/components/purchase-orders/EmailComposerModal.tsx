"use client";

import { useState, useEffect } from "react";
import { PurchaseOrder } from "@/types";
import { EMAIL_TEMPLATES, EmailTemplate, replaceEmailVariables } from "@/lib/emailTemplates";
import { logCommunication } from "@/lib/communications";
import { useAuth } from "@/context/AuthContext";
import { generatePortalLink } from "@/lib/portal";

interface EmailComposerModalProps {
    po: PurchaseOrder;
    onClose: () => void;
    onSent?: () => void;
}

export default function EmailComposerModal({ po, onClose, onSent }: EmailComposerModalProps) {
    const { user } = useAuth();
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(EMAIL_TEMPLATES[0]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [ccEmails, setCcEmails] = useState("");
    const [bccEmails, setBccEmails] = useState("");
    const [showPreview, setShowPreview] = useState(true);

    const [isCustomEdited, setIsCustomEdited] = useState(false);

    // Update subject and body ONLY when a new template is explicitly clicked.
    // If they typed something manually, don't overwrite it automatically unless they change templates.
    useEffect(() => {
        // Only override if they selected a specific preset (or if custom is completely blank/new)
        if (selectedTemplate.id !== 'custom' || (!subject && !body)) {
            const processedSubject = replaceEmailVariables(selectedTemplate.subject, po, user?.displayName);
            const processedBody = replaceEmailVariables(selectedTemplate.body, po, user?.displayName);
            setSubject(processedSubject);
            setBody(processedBody);
            setIsCustomEdited(false);
        }
    }, [selectedTemplate.id, po, user?.displayName]);

    const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBody(e.target.value);
        if (selectedTemplate.id === 'custom') setIsCustomEdited(true);
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSubject(e.target.value);
        if (selectedTemplate.id === 'custom') setIsCustomEdited(true);
    };

    const handleSend = async () => {
        try {
            // Log the communication
            await logCommunication(po.tenantId, {
                poId: po.id!,
                vendorId: po.vendorId,
                type: 'EMAIL',
                subject,
                body,
                sentBy: user?.uid || 'unknown',
                sentByName: user?.displayName || 'Unknown User',
                sentTo: [po.vendorEmail || 'vendor@example.com'],
                timestamp: new Date(),
                templateUsed: selectedTemplate.id
            });

            // Create mailto link
            const vendorEmail = po.vendorEmail || 'vendor@example.com';
            const mailtoLink = `mailto:${vendorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}${ccEmails ? `&cc=${encodeURIComponent(ccEmails)}` : ''}${bccEmails ? `&bcc=${encodeURIComponent(bccEmails)}` : ''}`;

            // Open email client
            window.location.href = mailtoLink;

            // Callback
            if (onSent) onSent();

            // Close modal after a short delay
            setTimeout(() => onClose(), 500);
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Error logging communication. Please try again.");
        }
    };

    const getCategoryColor = (category: EmailTemplate['category']) => {
        switch (category) {
            case 'standard': return '#3b82f6';
            case 'urgent': return '#ef4444';
            case 'followup': return '#f59e0b';
            case 'custom': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }}>
            <div style={{
                backgroundColor: 'var(--surface)', borderRadius: '16px',
                width: '100%', maxWidth: '1400px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                            Compose Email to Vendor
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            PO #{po.poNumber} • {po.vendorName}
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.5rem'
                    }}>×</button>
                </div>

                {/* Template Selection */}
                <div style={{
                    padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)',
                    backgroundColor: 'var(--background)'
                }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        Email Template
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        {EMAIL_TEMPLATES.map(template => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template)}
                                style={{
                                    padding: '1rem', borderRadius: '8px', textAlign: 'left',
                                    border: selectedTemplate.id === template.id
                                        ? `2px solid ${getCategoryColor(template.category)}`
                                        : '2px solid var(--border)',
                                    backgroundColor: selectedTemplate.id === template.id
                                        ? 'var(--surface)'
                                        : 'var(--background)',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'
                                }}>
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        backgroundColor: getCategoryColor(template.category)
                                    }}></div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{template.name}</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    {template.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content: Editor + Preview */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Editor Panel */}
                    <div style={{
                        flex: showPreview ? 1 : 2, padding: '2rem', overflowY: 'auto',
                        borderRight: showPreview ? '1px solid var(--border)' : 'none'
                    }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                To
                            </label>
                            <input
                                type="email"
                                value={po.vendorEmail || 'vendor@example.com'}
                                readOnly
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
                                    color: 'var(--text-secondary)', cursor: 'not-allowed'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                    CC (optional)
                                </label>
                                <input
                                    type="text"
                                    value={ccEmails}
                                    onChange={(e) => setCcEmails(e.target.value)}
                                    placeholder="email1@example.com, email2@example.com"
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '8px',
                                        border: '1px solid var(--border)', backgroundColor: 'var(--background)'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                    BCC (optional)
                                </label>
                                <input
                                    type="text"
                                    value={bccEmails}
                                    onChange={(e) => setBccEmails(e.target.value)}
                                    placeholder="email1@example.com, email2@example.com"
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '8px',
                                        border: '1px solid var(--border)', backgroundColor: 'var(--background)'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={handleSubjectChange}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
                                    fontWeight: 600
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                Message
                            </label>
                            <textarea
                                value={body}
                                onChange={handleBodyChange}
                                rows={16}
                                style={{
                                    width: '100%', padding: '1rem', borderRadius: '8px',
                                    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
                                    fontFamily: 'monospace', fontSize: '0.9rem', resize: 'vertical'
                                }}
                            />
                            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={async () => {
                                        try {
                                            const link = await generatePortalLink(po.tenantId, po.vendorId);
                                            setBody(prev => prev + `\n\nSecure Portal Link (Expires in 7 days):\n${link}`);
                                        } catch (err: any) {
                                            console.error("Failed to generate link:", err);
                                            alert("Failed to generate secure link. This is likely a permissions issue. Please contact support.");
                                        }
                                    }}
                                    className="btn"
                                    style={{
                                        fontSize: '0.85rem',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'var(--brand-soft)',
                                        borderColor: 'var(--brand)',
                                        color: 'var(--brand)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    🔗 Generate Secure Portal Magic Link
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    {showPreview && (
                        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: 'var(--background)' }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Live Preview</h3>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '6px',
                                        border: '1px solid var(--border)', backgroundColor: 'var(--surface)',
                                        cursor: 'pointer', fontSize: '0.85rem'
                                    }}
                                >
                                    Hide Preview
                                </button>
                            </div>

                            <div style={{
                                backgroundColor: 'white', color: '#000', padding: '2rem',
                                borderRadius: '8px', border: '1px solid var(--border)',
                                fontFamily: 'Arial, sans-serif'
                            }}>
                                <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        <strong>From:</strong> {user?.email || 'your-email@company.com'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        <strong>To:</strong> {po.vendorEmail || 'vendor@example.com'}
                                    </div>
                                    {ccEmails && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            <strong>CC:</strong> {ccEmails}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '1rem', color: 'var(--text-primary)' }}>
                                        {subject}
                                    </div>
                                </div>

                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                    {body}
                                </div>
                            </div>
                        </div>
                    )}

                    {!showPreview && (
                        <button
                            onClick={() => setShowPreview(true)}
                            style={{
                                position: 'absolute', right: '2rem', top: '50%',
                                transform: 'translateY(-50%)', padding: '0.75rem 1.5rem',
                                borderRadius: '8px', border: '1px solid var(--border)',
                                backgroundColor: 'var(--surface)', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.9rem'
                            }}
                        >
                            Show Preview
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem 2rem', borderTop: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: 'var(--background)'
                }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        📎 PO Document will be attached automatically
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={onClose}
                            className="btn"
                            style={{ border: '1px solid var(--border)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            className="btn btn-primary"
                        >
                            Send Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
