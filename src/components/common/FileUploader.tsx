"use client";

import { useState, useRef } from "react";
import { uploadFile } from "@/lib/storage";
import Loader from "@/components/common/Loader";

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
        if (onUploadStart) onUploadStart();

        try {
            const timestamp = Date.now();
            const storagePath = `${pathPrefix}/${timestamp}_${file.name}`;
            const url = await uploadFile(file, storagePath);
            setFileName(file.name);
            onUploadComplete(url, file.name);
        } catch (error) {
            alert("Upload failed. Please try again.");
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

    return (
        <div
            style={{
                width: '100%',
                height: '140px',
                border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                background: dragActive ? 'rgba(59, 130, 246, 0.05)' : '#f8fafc',
                transition: 'all 0.2s ease',
                cursor: uploading ? 'wait' : 'pointer',
                position: 'relative',
                padding: '1rem'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                style={{ display: 'none' }}
                accept={accept}
                onChange={handleChange}
                disabled={uploading}
            />

            {uploading ? (
                <div style={{ textAlign: 'center' }}>
                    <Loader text="Uploading secure document..." />
                </div>
            ) : fileName ? (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fileName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                        ✓ Uploaded successfully
                    </div>
                    <button
                        className="btn"
                        style={{ marginTop: '0.75rem', fontSize: '0.7rem', padding: '4px 10px' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setFileName("");
                        }}
                    >
                        Replace File
                    </button>
                </div>
            ) : (
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                        Drag & Drop document
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        or click to browse your files
                    </div>
                </div>
            )}
        </div>
    );
}
