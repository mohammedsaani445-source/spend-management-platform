"use client";

import { useState, useRef } from "react";
import { uploadFile } from "@/lib/storage";
import Loader from "@/components/common/Loader";
import { extractInvoiceData } from "@/lib/ocr";
import { CloudUpload, FileCheck, FileText, AlertCircle, X, ShieldCheck, Zap } from "lucide-react";

interface InvoiceUploadProps {
    onUploadComplete: (url: string, fileName: string, aiData?: any) => void;
    currentFileName?: string;
}

export default function InvoiceUpload({ onUploadComplete, currentFileName }: InvoiceUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [uploadStage, setUploadStage] = useState<'IDLE' | 'UPLOADING' | 'ANALYZING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [fileName, setFileName] = useState(currentFileName || "");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const processFile = async (file: File) => {
        setUploadStage('UPLOADING');
        try {
            // 1. Upload to Storage
            const timestamp = Date.now();
            const storagePath = `invoices/${timestamp}_${file.name}`;
            const url = await uploadFile(file, storagePath);

            // 2. AI OCR Extraction
            setUploadStage('ANALYZING');
            console.log("[AI-OCR] Initiating Secure AI OCR extraction...");

            // Extract data using our AI OCR engine
            const aiData = await extractInvoiceData(url);

            setFileName(file.name);
            setUploadStage('SUCCESS');

            // Pass the download URL and the extracted AI data back to parent
            onUploadComplete(url, file.name, aiData);

        } catch (error) {
            setUploadStage('ERROR');
            console.error(error);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        if (uploadStage === 'IDLE' || uploadStage === 'SUCCESS' || uploadStage === 'ERROR') {
            inputRef.current?.click();
        }
    };

    const handleReset = () => {
        setFileName("");
        setUploadStage('IDLE');
        if (inputRef.current) inputRef.current.value = "";
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleReset();
    };

    return (
        <div
            style={{
                width: '100%',
                height: '180px',
                border: `2px dashed ${dragActive ? 'var(--brand)' : 'var(--border)'}`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                background: dragActive ? 'var(--brand-soft)' : 'var(--surface-2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: (uploadStage === 'UPLOADING' || uploadStage === 'ANALYZING') ? 'wait' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: dragActive ? '0 0 0 4px var(--brand-soft)' : 'none'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
        >
            <input
                ref={inputRef}
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,image/*"
                onChange={handleChange}
                disabled={uploadStage === 'UPLOADING' || uploadStage === 'ANALYZING'}
            />

            {(uploadStage === 'UPLOADING' || uploadStage === 'ANALYZING') ? (
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                    <Loader text={uploadStage === 'UPLOADING' ? "Securing document in cloud..." : "Deep AI Analysis in progress..."} />
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand)', fontSize: '0.75rem', fontWeight: 600, justifyContent: 'center' }}>
                        <ShieldCheck size={14} /> ISO 27001 Secure Processing
                    </div>
                </div>
            ) : (uploadStage === 'SUCCESS' || fileName || currentFileName) ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', animation: 'scaleUp 0.3s ease' }}>
                    <div style={{
                        width: '56px', height: '56px', backgroundColor: 'var(--success-bg)', color: 'var(--success)',
                        borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                    }}>
                        <FileCheck size={32} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fileName || currentFileName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--success)', justifyContent: 'center', fontWeight: 600 }}>
                        <Zap size={12} fill="var(--success)" /> AI Verified & Linked
                    </div>
                    <button
                        onClick={removeFile}
                        style={{
                            marginTop: '1rem',
                            padding: '6px 16px',
                            borderRadius: '10px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--error)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Replace Document
                    </button>
                </div>
            ) : uploadStage === 'ERROR' ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--error)' }}>
                    <AlertCircle size={40} style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 700 }}>Upload Failed</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>The AI processing encountered an error.</div>
                    <button className="btn btn-sm" style={{ marginTop: '1rem' }} onClick={handleReset}>Try Again</button>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand)',
                        borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
                        transition: 'transform 0.3s'
                    }}>
                        <CloudUpload size={36} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Upload Business Invoice</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Drag & drop or <span style={{ color: 'var(--brand)', fontWeight: 600 }}>Browse Files</span></div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.75rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <ShieldCheck size={12} /> Encrypted Multi-Part Upload
                    </div>
                </div>
            )}
        </div>
    );
}
