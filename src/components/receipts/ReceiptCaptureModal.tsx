import React, { useState, useRef } from 'react';
import {
    X, Camera, Upload, Check, AlertCircle,
    FileText, Zap, ChevronRight, RefreshCcw
} from 'lucide-react';
import { AIProcessingFeedback } from './AIProcessingFeedback';
import { FraudAlert } from '../common/FraudAlert';
import { extractReceiptData, extractInvoiceData } from '@/lib/ocr';
import { suggestGLCode } from '@/lib/categorization';
import { checkDuplicateInvoice, validateVendor, detectSpendAnomaly } from '@/lib/fraud';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useAuth } from '@/context/AuthContext';

interface ReceiptCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
    mode?: 'RECEIPT' | 'INVOICE';
}

export const ReceiptCaptureModal: React.FC<ReceiptCaptureModalProps> = ({ isOpen, onClose, onSuccess, mode = 'RECEIPT' }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'IDLE' | 'PROCESSING' | 'REVIEW' | 'ERROR'>('IDLE');
    const [processingStatus, setProcessingStatus] = useState<'UPLOADING' | 'EXTRACTING' | 'CATEGORIZING' | 'FRAUD_CHECK' | 'FINALIZING' | 'COMPLETED'>('UPLOADING');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Extracted Data
    const [extractedData, setExtractedData] = useState<any>(null);
    const [fraudChecks, setFraudChecks] = useState<any[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    useScrollLock(isOpen);

    if (!isOpen) return null;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        processFile(selectedFile);
    };

    const processFile = async (selectedFile: File) => {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setStep('PROCESSING');

        try {
            // 1. Uploading State
            setProcessingStatus('UPLOADING');
            await new Promise(r => setTimeout(r, 800)); // Simulate upload latency

            // 2. OCR Extraction
            setProcessingStatus('EXTRACTING');
            const data = mode === 'INVOICE'
                ? await extractInvoiceData(URL.createObjectURL(selectedFile), user?.tenantId)
                : await extractReceiptData(URL.createObjectURL(selectedFile), user?.tenantId);
            setExtractedData(data);

            // 3. Categorization
            setProcessingStatus('CATEGORIZING');
            const glResult = await suggestGLCode(user!.tenantId, data.vendorName, data.items?.[0]?.description || data.vendorName);
            data.category = glResult.category;
            data.glCode = glResult.glCode;

            // 4. Fraud Checks
            setProcessingStatus('FRAUD_CHECK');
            const checks = [];

            // Real checks (using what we extracted)
            const vendorRes = await validateVendor(user!.tenantId, data.vendorName);
            const isDuplicate = await checkDuplicateInvoice(user!.tenantId, vendorRes.vendorId || "unknown", data.invoiceNumber || "unknown");

            if (isDuplicate) {
                checks.push({ severity: 'HIGH', reason: "Duplicate Receipt: This invoice number has already been processed for this vendor." });
            }
            if (data.isDuplicate) {
                checks.push({ severity: 'MEDIUM', reason: "AI Flag: Visual markers suggest this might be a photocopy or duplicate." });
            }

            setFraudChecks(checks);
            await new Promise(r => setTimeout(r, 400));

            setProcessingStatus('FINALIZING');
            await new Promise(r => setTimeout(r, 500));

            setStep('REVIEW');
        } catch (error) {
            console.error(error);
            setStep('ERROR');
        }
    };

    const handleReset = () => {
        setStep('IDLE');
        setFile(null);
        setPreviewUrl(null);
        setExtractedData(null);
        setFraudChecks([]);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal" style={{ maxWidth: '500px' }}>
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ padding: '6px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                            <Zap size={18} />
                        </div>
                        <h2 className="modal-title">{mode === 'INVOICE' ? 'AI Invoice Scan' : 'AI Receipt Scan'}</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', opacity: 0.5, display: 'flex', alignItems: 'center' }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {step === 'IDLE' && (
                        <div style={{ padding: '20px 0', textAlign: 'center' }}>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files[0];
                                    if (file) processFile(file);
                                }}
                                style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: '16px',
                                    padding: '40px 24px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: 'var(--surface-2)'
                                }}
                            >
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    backgroundColor: 'var(--surface)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <Camera size={28} color="var(--brand)" />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>{mode === 'INVOICE' ? 'Upload or Scan Invoice' : 'Snap or Upload Receipt'}</h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0' }}>
                                    Drag and drop, or click to use camera.
                                </p>
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', opacity: 0.6 }}>
                                <Check size={16} /> <span style={{ fontSize: '12px', fontWeight: 600 }}>99.8% AI Accuracy</span>
                                <Check size={16} /> <span style={{ fontSize: '12px', fontWeight: 600 }}>Live Fraud Scan</span>
                            </div>
                        </div>
                    )}

                    {step === 'PROCESSING' && (
                        <AIProcessingFeedback status={processingStatus} />
                    )}

                    {step === 'REVIEW' && (
                        <div style={{ padding: '0' }}>
                            {fraudChecks.map((check, i) => (
                                <FraudAlert key={i} severity={check.severity as any} reason={check.reason} />
                            ))}

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', marginTop: fraudChecks.length > 0 ? '1rem' : '0' }}>
                                <div style={{
                                    width: '120px',
                                    height: '160px',
                                    backgroundColor: 'var(--surface-2)',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    <img src={previewUrl!} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)' }}>Vendor</label>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{extractedData?.vendorName}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)' }}>Amount</label>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{extractedData?.currency} {extractedData?.totalAmount}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)' }}>Date</label>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(extractedData?.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '12px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            backgroundColor: 'var(--brand-soft)',
                                            color: 'var(--brand)',
                                            borderRadius: '999px',
                                            fontSize: '11px',
                                            fontWeight: 700
                                        }}>
                                            {extractedData?.category || 'Miscellaneous'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className='btn btn-secondary' style={{ flex: 1 }} onClick={handleReset}>
                                    <RefreshCcw size={16} style={{ marginRight: '8px' }} /> Rescan
                                </button>
                                <button className='btn btn-primary' style={{ flex: 1.5 }} onClick={() => onSuccess(extractedData)}>
                                    Confirm & Record
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'ERROR' && (
                        <div style={{ padding: '40px 0', textAlign: 'center' }}>
                            <div style={{ color: 'var(--error)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                                <AlertCircle size={48} />
                            </div>
                            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Extraction Failed</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>We couldn't read this receipt clearly. Please try a sharper photo.</p>
                            <button className='btn btn-primary' style={{ marginTop: '24px' }} onClick={handleReset}>Try Again</button>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileSelect}
                />
            </div>
        </div>
    );
};
