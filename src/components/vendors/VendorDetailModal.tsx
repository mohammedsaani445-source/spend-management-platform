"use client";

import { useState, useRef } from "react";
import { 
    Star, TrendingUp, AlertTriangle, CheckCircle2, RefreshCcw, 
    X, Clock, ShieldCheck, FileText, History, Building2, 
    Globe, CreditCard, Briefcase, Upload, Trash2, Loader2,
    Eye, ExternalLink, Phone, MapPin, User
} from "lucide-react";
import { calculateVendorScorecard, uploadVendorDocument } from "@/lib/vendors";
import { useAuth } from "@/context/AuthContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Vendor, VendorDocument, VendorDocumentType } from "@/types";

interface VendorDetailModalProps {
    vendor: Vendor;
    onClose: () => void;
    onEdit: (vendor: Vendor) => void;
    onUpdate?: () => void;
    onSendPortalLink?: () => void;
}

type TabType = 'overview' | 'performance' | 'compliance' | 'procurement' | 'history';

export default function VendorDetailModal({ vendor, onClose, onEdit, onUpdate, onSendPortalLink }: VendorDetailModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isCalculating, setIsCalculating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingDocType, setUploadingDocType] = useState<VendorDocumentType | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();
    useScrollLock(true);

    const handleRecalculate = async () => {
        if (!user || isCalculating) return;
        setIsCalculating(true);
        try {
            await calculateVendorScorecard(user.tenantId, vendor.id!);
            if (onUpdate) onUpdate();
        } finally {
            setIsCalculating(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !uploadingDocType) return;

        setIsUploading(true);
        try {
            await uploadVendorDocument(user.tenantId, vendor.id!, file, uploadingDocType);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload document. Please try again.");
        } finally {
            setIsUploading(false);
            setUploadingDocType(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const triggerUpload = (type: VendorDocumentType) => {
        setUploadingDocType(type);
        fileInputRef.current?.click();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
                
                {/* Modal Header */}
                <div className="modal-header" style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: 12, 
                            background: 'var(--brand-soft)', 
                            color: 'var(--brand)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            {vendor.name.charAt(0)}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>{vendor.name}</h2>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: 9999,
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    background: vendor.status === 'ACTIVE' ? 'var(--success-soft)' : 'var(--error-bg)',
                                    color: vendor.status === 'ACTIVE' ? 'var(--success)' : 'var(--error)',
                                    border: `1px solid ${vendor.status === 'ACTIVE' ? 'rgba(0, 171, 85, 0.2)' : 'rgba(183, 33, 54, 0.2)'}`
                                }}>
                                    {vendor.status}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {vendor.category || 'General Partner'} • Created {new Date(vendor.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ padding: '0 2rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', gap: '2rem' }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: <Briefcase size={14} /> },
                        { id: 'performance', label: 'Performance', icon: <TrendingUp size={14} /> },
                        { id: 'compliance', label: 'Compliance', icon: <ShieldCheck size={14} /> },
                        { id: 'procurement', label: 'Procurement', icon: <CreditCard size={14} /> },
                        { id: 'history', label: 'History', icon: <History size={14} /> }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            style={{
                                padding: '1rem 0',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                color: activeTab === tab.id ? 'var(--brand)' : 'var(--text-secondary)',
                                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--brand)' : 'transparent'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s',
                                borderTop: 'none',
                                borderLeft: 'none',
                                borderRight: 'none',
                                background: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="modal-body" style={{ padding: '2rem', maxHeight: '500px', overflowY: 'auto' }}>
                    {activeTab === 'overview' && (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <User size={14} /> Primary Contact
                                    </h3>
                                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface)' }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{vendor.contactName}</p>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{vendor.email}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand)', fontSize: '0.8125rem', fontWeight: 600 }}>
                                            <Phone size={14} /> {vendor.phone || 'No phone'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={14} /> Billing Address
                                    </h3>
                                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface)' }}>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                            {vendor.address || 'No billing address on file.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'var(--brand-soft)', borderRadius: '12px', border: '1px solid var(--brand-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <ShieldCheck size={18} style={{ color: 'var(--brand)' }} />
                                    <div>
                                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-dark)' }}>Identity Verified</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--brand)' }}>This vendor is approved for procurement.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    <Clock size={14} /> Partner since {new Date(vendor.createdAt).getFullYear()}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-disabled)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Overall Performance Score</p>
                                <div style={{ fontSize: '3rem', fontWeight: 900, color: (vendor.scorecard?.overallScore || 0) > 80 ? 'var(--success)' : (vendor.scorecard?.overallScore || 0) > 50 ? 'var(--warning)' : 'var(--error)' }}>
                                    {vendor.scorecard?.overallScore || '--'}
                                </div>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                    Based on {vendor.scorecard?.totalOrders || 0} fulfillments
                                </p>
                                <button 
                                    onClick={handleRecalculate}
                                    disabled={isCalculating}
                                    style={{ 
                                        marginTop: '1rem', 
                                        padding: '0.5rem 1rem', 
                                        borderRadius: '8px', 
                                        border: '1px solid var(--border)', 
                                        background: 'var(--surface)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        margin: '1rem auto 0'
                                    }}
                                >
                                    <RefreshCcw size={14} className={isCalculating ? 'spin' : ''} />
                                    {isCalculating ? 'Calculating...' : 'Recalculate Scores'}
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {[
                                    { label: 'Lead Time', score: vendor.scorecard?.leadTimeScore, icon: <Clock size={16} /> },
                                    { label: 'Quality Control', score: vendor.scorecard?.qualityScore, icon: <ShieldCheck size={16} /> },
                                    { label: 'Invoice Accuracy', score: vendor.scorecard?.invoiceAccuracyScore, icon: <FileText size={16} /> },
                                    { label: 'Reliability', score: vendor.scorecard?.overallScore, icon: <Star size={16} /> },
                                ].map((stat, i) => (
                                    <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <div style={{ color: 'var(--brand)' }}>{stat.icon}</div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{stat.label}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1, height: '6px', background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    width: `${stat.score || 0}%`, 
                                                    height: '100%', 
                                                    background: (stat.score || 0) > 80 ? 'var(--success)' : (stat.score || 0) > 50 ? 'var(--warning)' : 'var(--error)',
                                                    transition: 'width 0.5s ease-out'
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>{stat.score || '--'}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'compliance' && (
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <div style={{ 
                                padding: '1rem', 
                                borderRadius: '12px', 
                                background: vendor.complianceStatus === 'COMPLIANT' ? 'var(--success-soft)' : 'var(--warning-soft)',
                                border: `1px solid ${vendor.complianceStatus === 'COMPLIANT' ? 'var(--success-light)' : 'var(--warning-light)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                {vendor.complianceStatus === 'COMPLIANT' ? (
                                    <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
                                ) : (
                                    <AlertTriangle size={24} style={{ color: 'var(--warning)' }} />
                                )}
                                <div>
                                    <p style={{ fontWeight: 800, fontSize: '0.875rem', color: vendor.complianceStatus === 'COMPLIANT' ? 'var(--success-dark)' : 'var(--warning-dark)' }}>
                                        {vendor.complianceStatus || 'UNVERIFIED'}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {vendor.complianceStatus === 'COMPLIANT' 
                                            ? 'All required documents are active and verified.'
                                            : 'Compliance check is required or documents are expiring.'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05em' }}>Required Documents</h3>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                />
                                {[
                                    { name: 'W-9 Form', type: 'W9' },
                                    { name: 'Insurance Certificate', type: 'INSURANCE' },
                                    { name: 'Mutual NDA', type: 'COMPLIANCE' }
                                ].map((req, i) => {
                                    const doc = vendor.documents?.find(d => d.type === req.type);
                                    const isUploadingThis = uploadingDocType === req.type && isUploading;

                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: doc ? 'var(--brand)' : 'var(--text-disabled)' }}>
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{req.name}</p>
                                                    {doc ? (
                                                        <p style={{ fontSize: '0.6875rem', color: 'var(--success)', fontWeight: 600 }}>Verified • {new Date(doc.id.split('_').pop() || '').toLocaleDateString() === 'Invalid Date' ? 'Active' : 'Uploaded ' + new Date(parseInt(doc.id.split('_').pop() || '0')).toLocaleDateString()}</p>
                                                    ) : (
                                                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>Not provided</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {doc && (
                                                    <a 
                                                        href={doc.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{ 
                                                            padding: '0.375rem', 
                                                            borderRadius: '6px', 
                                                            border: '1px solid var(--border)', 
                                                            color: 'var(--text-secondary)',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Eye size={14} />
                                                    </a>
                                                )}
                                                <button 
                                                    onClick={() => triggerUpload(req.type as VendorDocumentType)}
                                                    disabled={isUploading}
                                                    style={{ 
                                                        color: 'var(--brand)', 
                                                        fontWeight: 700, 
                                                        fontSize: '0.75rem',
                                                        padding: '0.375rem 0.75rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--brand-soft)',
                                                        background: 'var(--brand-soft)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.375rem'
                                                    }}
                                                >
                                                    {isUploadingThis ? <RefreshCcw size={12} className="spin" /> : <Upload size={12} />}
                                                    {doc ? 'Update' : 'Upload'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'procurement' && (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {[
                                { label: 'Tax ID / TIN', value: vendor.taxId || 'Not provided', icon: <FileText size={16} /> },
                                { label: 'Payment Terms', value: vendor.paymentTerms || 'Net 30', icon: <CreditCard size={16} /> },
                                { label: 'Currency', value: 'USD - US Dollar', icon: <Globe size={16} /> },
                                { label: 'Direct Pay', value: vendor.directPayEnabled ? 'Enabled' : 'Disabled', icon: <Building2 size={16} /> },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>{item.label}</p>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</p>
                                        </div>
                                    </div>
                                    <button style={{ color: 'var(--brand)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Update</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--text-disabled)' }}>
                                <History size={24} />
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No History found</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '240px', margin: '0 auto' }}>
                                Transactions and logs will appear here once activity begins.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer" style={{ padding: '1.25rem 2rem' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {onSendPortalLink && (
                            <button 
                                className="btn btn-secondary" 
                                onClick={onSendPortalLink}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <ExternalLink size={14} />
                                Send Portal Link
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={() => onEdit(vendor)} style={{ minWidth: '120px' }}>
                            Edit Vendor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
