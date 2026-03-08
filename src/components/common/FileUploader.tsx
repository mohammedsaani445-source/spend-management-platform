"use client";

import { useState, useRef } from "react";
import { uploadFile } from "@/lib/storage";
import Loader from "@/components/common/Loader";
import { CloudUpload, FileCheck, FileText, X, ShieldCheck } from "lucide-react";

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
            const timestamp = Date.now();
            const storagePath = `${pathPrefix}/${timestamp}_${file.name}`;
            const url = await uploadFile(file, storagePath);
            setFileName(file.name);
            setUploadStage('SUCCESS');
            onUploadComplete(url, file.name);
        } catch (error) {
            setUploadStage('ERROR');
            console.error(error);
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
            ) : (uploadStage === 'SUCCESS' || fileName) ? (
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
                <div style={{ textAlign: 'center', color: 'var(--error)' }}>
                    <CloudUpload size={28} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 700 }}>Upload Failed</div>
                    <button className="btn btn-xs" style={{ marginTop: '0.5rem' }} onClick={handleReset}>Try Again</button>
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
