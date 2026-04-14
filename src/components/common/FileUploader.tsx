"use client";

import { useState, useRef } from "react";
import Loader from "@/components/common/Loader";
import { CloudUpload, FileCheck, FileText, X, ShieldCheck, AlertCircle } from "lucide-react";

interface FileUploaderProps {
    onUploadComplete: (url: string, fileName: string) => void;
    onUploadStart?: () => void;
    accept?: string;
    pathPrefix?: string;
    currentFileName?: string;
}

export default function FileUploader({
    onUploadComplete,
    onUploadStart,
    accept = ".pdf,.doc,.docx,image/*",
    pathPrefix = "uploads",
    currentFileName
}: FileUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [uploadStage, setUploadStage] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [fileName, setFileName] = useState(currentFileName || "");
    const [errorMsg, setErrorMsg] = useState("");

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
        if (onUploadStart) onUploadStart();

        try {
            // 1. Prepare Base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const data = (reader.result as string).split(',')[1];
                    resolve(data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // 2. Server-Side Upload
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    base64Data: base64,
                    fileName: file.name,
                    mimeType: file.type,
                    folder: pathPrefix
                })
            });

            const data = await response.json();

            if (response.ok && data.url) {
                setFileName(file.name);
                setUploadStage('SUCCESS');
                onUploadComplete(data.url, file.name);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error: any) {
            console.error('Upload Error:', error);
            setErrorMsg(error.message || "Something went wrong during upload");
            setUploadStage('ERROR');
        }
    };

    const handleReset = () => {
        setFileName("");
        setErrorMsg("");
        setUploadStage('IDLE');
        if (inputRef.current) inputRef.current.value = "";
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

    return (
        <div
            style={{
                width: '100%',
                height: '140px',
                border: `2px dashed ${dragActive ? 'var(--brand)' : 'var(--border)'}`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                background: dragActive ? 'var(--brand-soft)' : 'var(--surface-2)',
                transition: 'all 0.3s ease',
                cursor: uploadStage === 'UPLOADING' ? 'wait' : 'pointer',
                position: 'relative',
                padding: '1rem',
                overflow: 'hidden'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => uploadStage !== 'UPLOADING' && inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                style={{ display: 'none' }}
                accept={accept}
                onChange={handleChange}
                disabled={uploadStage === 'UPLOADING'}
            />

            {uploadStage === 'UPLOADING' ? (
                <div style={{ textAlign: 'center' }}>
                    <Loader text="Securing document..." />
                </div>
            ) : (uploadStage === 'SUCCESS' && fileName) ? (
                <div style={{ textAlign: 'center', animation: 'scaleUp 0.3s ease' }}>
                    <div style={{
                        width: '48px', height: '48px', backgroundColor: 'var(--success-bg)', color: 'var(--success)',
                        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem'
                    }}>
                        <FileCheck size={24} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fileName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem', fontWeight: 600 }}>
                        ✓ Uploaded successfully
                    </div>
                    <button
                        className="btn btn-sm"
                        style={{ marginTop: '0.75rem', fontSize: '0.7rem', padding: '4px 12px', borderRadius: '8px' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                        }}
                    >
                        Replace File
                    </button>
                </div>
            ) : uploadStage === 'ERROR' ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <AlertCircle color="#ef4444" size={32} style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>
                        {errorMsg.includes("Storage") ? "Storage Infrastructure Error" : "Upload Failed"}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem', maxWidth: '250px', margin: '0.25rem auto 0', lineHeight: 1.4 }}>
                        {errorMsg}
                    </div>
                    <button
                        className="btn btn-xs"
                        style={{ marginTop: '0.75rem', fontSize: '0.7rem' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                        }}
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{
                        width: '52px', height: '52px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand)',
                        borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                    }}>
                        <CloudUpload size={28} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        Drag & Drop document
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        or click to browse
                    </div>
                    <div style={{ fontSize: '0.7rem', marginTop: '0.75rem', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <ShieldCheck size={12} /> Encrypted Upload
                    </div>
                </div>
            )}
        </div>
    );
}
