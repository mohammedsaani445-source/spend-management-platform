"use client";

import { useState, useRef } from "react";
import { uploadFile } from "@/lib/storage";
import Loader from "@/components/common/Loader";

interface InvoiceUploadProps {
    onUploadComplete: (url: string, fileName: string) => void;
    currentFileName?: string;
}

export default function InvoiceUpload({ onUploadComplete, currentFileName }: InvoiceUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
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
        setUploading(true);
        try {
            // 1. Upload to Storage
            const timestamp = Date.now();
            const storagePath = `invoices/${timestamp}_${file.name}`;
            const url = await uploadFile(file, storagePath);

            // 2. PRODUCTION REALIZATION: OCR Extraction
            console.log("[Production Realization] Initiating OCR extraction from document...");
            const ocrResponse = await fetch('/api/invoices/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, fileName: file.name })
            });

            const ocrData = await ocrResponse.json();

            setFileName(file.name);

            // Pass the download URL and the extracted OCR data back to parent
            onUploadComplete(url, file.name);

            if (ocrData.success) {
                console.log("[Production Realization] OCR Data Extracted:", ocrData.extracted);
            }
        } catch (error) {
            alert("Upload or processing failed. Please try again.");
            console.error(error);
        } finally {
            setUploading(false);
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
        if (!uploading) inputRef.current?.click();
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFileName("");
        // In a real app, we might want to delete the file from storage here too
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div
            style={{
                width: '100%',
                height: '160px',
                border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                background: dragActive ? 'rgba(0, 171, 85, 0.05)' : 'var(--surface)',
                transition: 'all 0.2s ease',
                cursor: uploading ? 'wait' : 'pointer',
                position: 'relative'
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
                disabled={uploading}
            />

            {uploading ? (
                <Loader text="Uploading secure document..." />
            ) : (fileName || currentFileName) ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📄</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.25rem', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fileName || currentFileName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>
                        ✓ Document Linked
                    </div>
                    <button
                        onClick={removeFile}
                        style={{
                            marginTop: '0.75rem',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'var(--error)',
                            cursor: 'pointer'
                        }}
                    >
                        Remove File
                    </button>
                </div>
            ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📤</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Upload Invoice PDF</div>
                    <div style={{ fontSize: '0.85rem' }}>Drag & drop or Click to browse</div>
                    <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.7 }}>Supports PDF, JPG, PNG</div>
                </div>
            )}
        </div>
    );
}
